import { Elysia, t } from 'elysia';

import { supabaseAdmin } from '../db/supabase';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  toNumber,
  getWeekStartIso,
  calcStockAlert,
  pickHighestAlert,
  MEAL_ORDER,
  MEAL_LABELS,
  type StockRow,
} from '../lib/utils';

type MedicationSummary = {
  id: string;
  medication_id: string;
  medication_name: string | null;
  medication_name_en: string | null;
  form: string | null;
  dosage_unit: string | null;
  dose_amount: number;
  dose_unit: string;
  schedule: string[];
  special_instructions: string | null;
  requires_crushing: boolean;
  stock: {
    quantity: number;
    unit: string | null;
    threshold_warn: number;
    threshold_critical: number;
    daily_consumption: number;
    days_remaining: number | null;
    alert_level: 'normal' | 'warning' | 'critical';
  } | null;
};

const DEFAULT_FLAGS = {
  crush: false,
  liquid: false,
  needs_assistance: false,
};

const loadResidentMedications = async (residentId: string): Promise<MedicationSummary[]> => {
  const { data: rows, error } = await supabaseAdmin
    .from('resident_medications')
    .select(
      'id, resident_id, medication_id, dose_amount, dose_unit, schedule, special_instructions, requires_crushing, is_active, updated_at'
    )
    .eq('resident_id', residentId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error || !rows) {
    throw new Error(error?.message ?? 'Unable to load resident medications');
  }

  const medicationIds = Array.from(
    new Set(rows.map((row) => row.medication_id).filter((id): id is string => Boolean(id)))
  );

  const medicationsById = new Map<string, any>();
  const stockByMedicationId = new Map<string, any>();

  if (medicationIds.length > 0) {
    const [medicationsResult, stockResult] = await Promise.all([
      supabaseAdmin
        .from('medications')
        .select('id, name, name_en, form, dosage_unit')
        .in('id', medicationIds),
      supabaseAdmin
        .from('stock')
        .select(
          'medication_id, quantity, unit, threshold_warn, threshold_critical, daily_consumption, updated_at'
        )
        .in('medication_id', medicationIds),
    ]);

    if (medicationsResult.data) {
      medicationsResult.data.forEach((med) => medicationsById.set(med.id, med));
    }

    if (stockResult.data) {
      stockResult.data.forEach((stock) => stockByMedicationId.set(stock.medication_id, stock));
    }
  }

  return rows.map((row) => {
    const medication = medicationsById.get(row.medication_id) ?? null;
    const stock = stockByMedicationId.get(row.medication_id) ?? null;
    const alert = calcStockAlert(stock);

    return {
      id: row.id,
      medication_id: row.medication_id,
      medication_name: medication?.name ?? null,
      medication_name_en: medication?.name_en ?? null,
      form: medication?.form ?? null,
      dosage_unit: medication?.dosage_unit ?? null,
      dose_amount: toNumber(row.dose_amount, 0),
      dose_unit: row.dose_unit,
      schedule: Array.isArray(row.schedule) ? row.schedule : [],
      special_instructions: row.special_instructions,
      requires_crushing: Boolean(row.requires_crushing),
      stock: stock
        ? {
            quantity: toNumber(stock.quantity, 0),
            unit: stock.unit ?? null,
            threshold_warn: toNumber(stock.threshold_warn, 14),
            threshold_critical: toNumber(stock.threshold_critical, 7),
            daily_consumption: toNumber(stock.daily_consumption, 0),
            days_remaining: alert.daysRemaining,
            alert_level: alert.level,
          }
        : null,
    };
  });
};

const createResidentSchema = t.Object({
  name: t.String({ minLength: 1 }),
  name_en: t.Optional(t.String()),
  room: t.String({ minLength: 1 }),
  ward_id: t.Optional(t.String()),
  photo_url: t.Optional(t.String()),
  allergies: t.Optional(t.Array(t.String())),
  chronic_conditions: t.Optional(t.Array(t.String())),
  flags: t.Optional(
    t.Object({
      crush: t.Boolean(),
      liquid: t.Boolean(),
      needs_assistance: t.Boolean(),
    })
  ),
  doctor_contact: t.Optional(t.String()),
  line_user_id: t.Optional(t.String()),
  is_active: t.Optional(t.Boolean()),
});

const updateResidentSchema = t.Partial(createResidentSchema);

export const residentsRoutes = new Elysia({ prefix: '/residents' })
  .get('/', async (context: any) => {
    const { set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) {
      return authError;
    }

    const weekStart = getWeekStartIso();

    const { data: residents, error } = await supabaseAdmin
      .from('residents')
      .select('id, name, name_en, room, ward_id, photo_url, flags, is_active, created_at')
      .eq('is_active', true)
      .order('room', { ascending: true });

    if (error) {
      set.status = 500;
      return {
        success: false,
        error: error.message,
      };
    }

    if (!residents || residents.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const residentIds = residents.map((resident) => resident.id);
    const wardIds = Array.from(
      new Set(residents.map((resident) => resident.ward_id).filter((id): id is string => Boolean(id)))
    );

    const [wardsResult, weeklyStatusResult, residentMedicationsResult] = await Promise.all([
      wardIds.length > 0
        ? supabaseAdmin.from('wards').select('id, name, floor, room_range').in('id', wardIds)
        : Promise.resolve({ data: [], error: null }),
      supabaseAdmin
        .from('weekly_fill_status')
        .select('resident_id, is_filled, filled_at, week_start')
        .eq('week_start', weekStart)
        .in('resident_id', residentIds),
      supabaseAdmin
        .from('resident_medications')
        .select('resident_id, medication_id, is_active')
        .in('resident_id', residentIds)
        .eq('is_active', true),
    ]);

    if (weeklyStatusResult.error || residentMedicationsResult.error) {
      set.status = 500;
      return {
        success: false,
        error: weeklyStatusResult.error?.message ?? residentMedicationsResult.error?.message,
      };
    }

    const residentMedicationRows = residentMedicationsResult.data ?? [];
    const medicationIds = Array.from(
      new Set(
        residentMedicationRows
          .map((row) => row.medication_id)
          .filter((medicationId): medicationId is string => Boolean(medicationId))
      )
    );

    const [medicationsResult, stockResult] = await Promise.all([
      medicationIds.length > 0
        ? supabaseAdmin
            .from('medications')
            .select('id, name')
            .in('id', medicationIds)
        : Promise.resolve({ data: [], error: null }),
      medicationIds.length > 0
        ? supabaseAdmin
            .from('stock')
            .select('medication_id, quantity, threshold_warn, threshold_critical, daily_consumption')
            .in('medication_id', medicationIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (medicationsResult.error || stockResult.error) {
      set.status = 500;
      return {
        success: false,
        error: medicationsResult.error?.message ?? stockResult.error?.message,
      };
    }

    const wardMap = new Map((wardsResult.data ?? []).map((ward) => [ward.id, ward]));
    const weeklyMap = new Map(
      (weeklyStatusResult.data ?? []).map((status) => [status.resident_id, status])
    );

    const residentMedsMap = new Map<string, string[]>();
    residentMedicationRows.forEach((row) => {
      const list = residentMedsMap.get(row.resident_id) ?? [];
      list.push(row.medication_id);
      residentMedsMap.set(row.resident_id, list);
    });

    const medicationNameMap = new Map(
      (medicationsResult.data ?? []).map((medication) => [medication.id, medication.name])
    );
    const stockMap = new Map(
      (stockResult.data ?? []).map((stock) => [stock.medication_id, stock as StockRow])
    );

    const data = residents.map((resident) => {
      const medicationList = residentMedsMap.get(resident.id) ?? [];

      const perMedicationAlerts = medicationList.map((medicationId) => {
        const stock = stockMap.get(medicationId);
        const alert = calcStockAlert(stock);
        return {
          medicationId,
          name: medicationNameMap.get(medicationId) ?? medicationId,
          level: alert.level,
          daysRemaining: alert.daysRemaining,
        };
      });

      const alertLevel = pickHighestAlert(perMedicationAlerts.map((alert) => alert.level));
      const alerts = perMedicationAlerts
        .filter((alert) => alert.level !== 'normal')
        .map((alert) => ({
          medication_id: alert.medicationId,
          medication_name: alert.name,
          level: alert.level,
          days_remaining: alert.daysRemaining,
        }));

      const weeklyStatus = weeklyMap.get(resident.id);

      return {
        id: resident.id,
        name: resident.name,
        name_en: resident.name_en,
        room: resident.room,
        ward: resident.ward_id ? wardMap.get(resident.ward_id) ?? null : null,
        photo_url: resident.photo_url,
        flags: resident.flags ?? DEFAULT_FLAGS,
        medications_count: medicationList.length,
        weekly_status: {
          week_start: weekStart,
          is_filled: Boolean(weeklyStatus?.is_filled),
          filled_at: weeklyStatus?.filled_at ?? null,
          status: weeklyStatus?.is_filled ? 'done' : 'pending',
        },
        stock_alert_level: alertLevel,
        stock_alerts: alerts,
      };
    });

    return {
      success: true,
      data,
    };
  })
  .get('/:id', async (context: any) => {
    const { params, set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) {
      return authError;
    }

    const { id } = params;
    const weekStart = getWeekStartIso();

    const { data: resident, error } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      set.status = 500;
      return {
        success: false,
        error: error.message,
      };
    }

    if (!resident) {
      set.status = 404;
      return {
        success: false,
        error: 'Resident not found',
      };
    }

    const [wardResult, weeklyResult, medications] = await Promise.all([
      resident.ward_id
        ? supabaseAdmin.from('wards').select('id, name, floor, room_range').eq('id', resident.ward_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabaseAdmin
        .from('weekly_fill_status')
        .select('resident_id, week_start, is_filled, filled_at, filled_by')
        .eq('resident_id', id)
        .eq('week_start', weekStart)
        .maybeSingle(),
      loadResidentMedications(id),
    ]);

    return {
      success: true,
      data: {
        ...resident,
        ward: wardResult.data,
        weekly_status: weeklyResult.data ?? {
          resident_id: id,
          week_start: weekStart,
          is_filled: false,
          filled_at: null,
          filled_by: null,
        },
        medications,
      },
    };
  })
  .post(
    '/',
    async (context: any) => {
      const { body, set } = context;
      const authUser = context.authUser ?? null;

      const roleError = requireRole(authUser, ['admin', 'nurse'], set);
      if (roleError) {
        return roleError;
      }

      const payload = {
        ...body,
        allergies: body.allergies ?? [],
        chronic_conditions: body.chronic_conditions ?? [],
        flags: body.flags ?? DEFAULT_FLAGS,
        is_active: body.is_active ?? true,
      };

      const { data, error } = await supabaseAdmin
        .from('residents')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        set.status = 400;
        return {
          success: false,
          error: error.message,
        };
      }

      set.status = 201;
      return {
        success: true,
        data,
      };
    },
    {
      body: createResidentSchema,
    }
  )
  .patch(
    '/:id',
    async (context: any) => {
      const { params, body, set } = context;
      const authUser = context.authUser ?? null;

      const roleError = requireRole(authUser, ['admin', 'nurse'], set);
      if (roleError) {
        return roleError;
      }

      if (Object.keys(body).length === 0) {
        set.status = 400;
        return {
          success: false,
          error: 'No fields to update',
        };
      }

      const { data, error } = await supabaseAdmin
        .from('residents')
        .update(body)
        .eq('id', params.id)
        .select('*')
        .maybeSingle();

      if (error) {
        set.status = 400;
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data) {
        set.status = 404;
        return {
          success: false,
          error: 'Resident not found',
        };
      }

      return {
        success: true,
        data,
      };
    },
    {
      body: updateResidentSchema,
    }
  )
  .get('/:id/medications', async (context: any) => {
    const { params, set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) {
      return authError;
    }

    const { id } = params;

    const { data: resident, error: residentError } = await supabaseAdmin
      .from('residents')
      .select('id, name')
      .eq('id', id)
      .maybeSingle();

    if (residentError) {
      set.status = 500;
      return {
        success: false,
        error: residentError.message,
      };
    }

    if (!resident) {
      set.status = 404;
      return {
        success: false,
        error: 'Resident not found',
      };
    }

    try {
      const medications = await loadResidentMedications(id);

      return {
        success: true,
        data: {
          resident,
          medications,
        },
      };
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  })
  .get('/:id/weekly-summary', async (context: any) => {
    const { params, set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) {
      return authError;
    }

    const weekStart = getWeekStartIso();

    try {
      const medications = await loadResidentMedications(params.id);
      const groups = new Map<string, any[]>();

      medications.forEach((medication) => {
        medication.schedule.forEach((meal) => {
          const list = groups.get(meal) ?? [];
          list.push(medication);
          groups.set(meal, list);
        });
      });

      const meals = MEAL_ORDER.map((meal) => {
        const items = groups.get(meal) ?? [];
        const totalDose = items.reduce((sum, item) => sum + toNumber(item.dose_amount, 0), 0);

        return {
          meal,
          label: MEAL_LABELS[meal],
          medication_count: items.length,
          total_dose: totalDose,
          items,
        };
      });

      return {
        success: true,
        data: {
          resident_id: params.id,
          week_start: weekStart,
          totals: {
            medication_count: medications.length,
            meal_slots: meals.reduce((sum, meal) => sum + meal.medication_count, 0),
          },
          meals,
        },
      };
    } catch (error) {
      set.status = 500;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  });
