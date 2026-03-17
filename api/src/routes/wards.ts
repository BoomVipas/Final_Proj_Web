import { Elysia } from 'elysia';

import { supabaseAdmin } from '../db/supabase';
import { requireAuth } from '../middleware/auth';
import { getWeekStartIso, pickHighestAlert, calcStockAlert, StockRow } from '../lib/utils';

export const wardsRoutes = new Elysia({ prefix: '/wards' })
  /**
   * GET /wards
   * Returns all wards with:
   * - patient count
   * - how many have been filled this week
   * - highest stock alert across all patients in the ward
   *
   * Used by touchscreen Step 1 — Select Ward.
   */
  .get('/', async (context: any) => {
    const { set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) return authError;

    const weekStart = getWeekStartIso();

    // 1. Fetch all wards
    const { data: wards, error: wardsError } = await supabaseAdmin
      .from('wards')
      .select('id, name, floor, room_range, caregiver_name, created_at')
      .order('name', { ascending: true });

    if (wardsError) {
      set.status = 500;
      return { success: false, error: wardsError.message };
    }

    if (!wards || wards.length === 0) {
      return { success: true, data: [] };
    }

    const wardIds = wards.map((w) => w.id);

    // 2. Fetch residents grouped by ward
    const { data: residents, error: residentsError } = await supabaseAdmin
      .from('residents')
      .select('id, ward_id')
      .in('ward_id', wardIds)
      .eq('is_active', true);

    if (residentsError) {
      set.status = 500;
      return { success: false, error: residentsError.message };
    }

    const residentIds = (residents ?? []).map((r) => r.id);

    // 3. Fetch weekly fill statuses for this week
    const { data: fillStatuses } = residentIds.length > 0
      ? await supabaseAdmin
          .from('weekly_fill_status')
          .select('resident_id, is_filled')
          .eq('week_start', weekStart)
          .in('resident_id', residentIds)
      : { data: [] };

    // 4. Fetch stock alerts for all resident medications in these wards
    const { data: residentMeds } = residentIds.length > 0
      ? await supabaseAdmin
          .from('resident_medications')
          .select('resident_id, medication_id')
          .in('resident_id', residentIds)
          .eq('is_active', true)
      : { data: [] };

    const medicationIds = Array.from(
      new Set((residentMeds ?? []).map((rm) => rm.medication_id).filter(Boolean))
    );

    const { data: stockRows } = medicationIds.length > 0
      ? await supabaseAdmin
          .from('stock')
          .select('medication_id, quantity, threshold_warn, threshold_critical, daily_consumption')
          .in('medication_id', medicationIds)
      : { data: [] };

    // Build lookup maps
    const fillMap = new Map<string, boolean>(
      (fillStatuses ?? []).map((s) => [s.resident_id, Boolean(s.is_filled)])
    );

    const stockMap = new Map<string, StockRow>(
      (stockRows ?? []).map((s) => [s.medication_id, s as StockRow])
    );

    // Map resident → medication_ids for alert calculation
    const residentMedMap = new Map<string, string[]>();
    (residentMeds ?? []).forEach((rm) => {
      const list = residentMedMap.get(rm.resident_id) ?? [];
      list.push(rm.medication_id);
      residentMedMap.set(rm.resident_id, list);
    });

    // Map ward_id → residents
    const wardResidentMap = new Map<string, typeof residents>()
    ;(residents ?? []).forEach((r) => {
      const list = wardResidentMap.get(r.ward_id ?? '') ?? [];
      list.push(r);
      wardResidentMap.set(r.ward_id ?? '', list);
    });

    // Compose final ward objects
    const data = wards.map((ward) => {
      const wardResidents = wardResidentMap.get(ward.id) ?? [];
      const totalPatients = wardResidents.length;
      const filledCount = wardResidents.filter((r) => fillMap.get(r.id) === true).length;

      // Highest stock alert across all meds for all residents in this ward
      const alertLevels = wardResidents.flatMap((r) => {
        const medIds = residentMedMap.get(r.id) ?? [];
        return medIds.map((medId) => calcStockAlert(stockMap.get(medId)).level);
      });

      const stockAlertLevel = pickHighestAlert(alertLevels);

      return {
        id: ward.id,
        name: ward.name,
        floor: ward.floor,
        room_range: ward.room_range,
        caregiver_name: ward.caregiver_name,
        total_patients: totalPatients,
        filled_count: filledCount,
        pending_count: totalPatients - filledCount,
        fill_status: filledCount === totalPatients && totalPatients > 0 ? 'done' : 'pending',
        stock_alert_level: stockAlertLevel,
        week_start: weekStart,
      };
    });

    return { success: true, data };
  })

  /**
   * GET /wards/:id/patients
   * Returns all active residents in a ward with their weekly fill status.
   * Used by touchscreen Step 2 — Select Patient.
   */
  .get('/:id/patients', async (context: any) => {
    const { params, set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) return authError;

    const weekStart = getWeekStartIso();

    // Verify ward exists
    const { data: ward, error: wardError } = await supabaseAdmin
      .from('wards')
      .select('id, name, floor, room_range, caregiver_name')
      .eq('id', params.id)
      .maybeSingle();

    if (wardError) {
      set.status = 500;
      return { success: false, error: wardError.message };
    }
    if (!ward) {
      set.status = 404;
      return { success: false, error: 'Ward not found' };
    }

    const { data: residents, error: residentsError } = await supabaseAdmin
      .from('residents')
      .select('id, name, name_en, room, photo_url, flags')
      .eq('ward_id', params.id)
      .eq('is_active', true)
      .order('room', { ascending: true });

    if (residentsError) {
      set.status = 500;
      return { success: false, error: residentsError.message };
    }

    const residentIds = (residents ?? []).map((r) => r.id);

    const [weeklyResult, medCountResult] = await Promise.all([
      residentIds.length > 0
        ? supabaseAdmin
            .from('weekly_fill_status')
            .select('resident_id, is_filled, filled_at')
            .eq('week_start', weekStart)
            .in('resident_id', residentIds)
        : Promise.resolve({ data: [] }),
      residentIds.length > 0
        ? supabaseAdmin
            .from('resident_medications')
            .select('resident_id')
            .in('resident_id', residentIds)
            .eq('is_active', true)
        : Promise.resolve({ data: [] }),
    ]);

    const fillMap = new Map(
      (weeklyResult.data ?? []).map((s) => [s.resident_id, s])
    );

    const medCountMap = new Map<string, number>();
    (medCountResult.data ?? []).forEach((row) => {
      medCountMap.set(row.resident_id, (medCountMap.get(row.resident_id) ?? 0) + 1);
    });

    const data = (residents ?? []).map((r) => {
      const fillStatus = fillMap.get(r.id);
      return {
        id: r.id,
        name: r.name,
        name_en: r.name_en,
        room: r.room,
        photo_url: r.photo_url,
        flags: r.flags,
        medications_count: medCountMap.get(r.id) ?? 0,
        weekly_status: {
          is_filled: Boolean(fillStatus?.is_filled),
          filled_at: fillStatus?.filled_at ?? null,
          status: fillStatus?.is_filled ? 'done' : 'pending',
        },
      };
    });

    return {
      success: true,
      data: {
        ward,
        patients: data,
        total: data.length,
        filled: data.filter((p) => p.weekly_status.is_filled).length,
        pending: data.filter((p) => !p.weekly_status.is_filled).length,
        week_start: weekStart,
      },
    };
  });
