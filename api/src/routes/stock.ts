import { Elysia, t } from 'elysia';

import { supabaseAdmin } from '../db/supabase';
import { requireAuth, requireRole } from '../middleware/auth';
import { toNumber } from '../lib/utils';

const patchStockSchema = t.Object({
  quantity: t.Optional(t.Number()),
  unit: t.Optional(t.String()),
  threshold_warn: t.Optional(t.Integer({ minimum: 1 })),
  threshold_critical: t.Optional(t.Integer({ minimum: 1 })),
  daily_consumption: t.Optional(t.Number({ minimum: 0 })),
});

export const stockRoutes = new Elysia({ prefix: '/stock' })
  .get('/', async (context: any) => {
    const { set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) {
      return authError;
    }

    const { data: stockRows, error } = await supabaseAdmin
      .from('stock')
      .select(
        'id, medication_id, quantity, unit, threshold_warn, threshold_critical, daily_consumption, updated_at'
      )
      .order('updated_at', { ascending: false });

    if (error) {
      set.status = 500;
      return {
        success: false,
        error: error.message,
      };
    }

    const medicationIds = Array.from(
      new Set((stockRows ?? []).map((row) => row.medication_id).filter((id): id is string => Boolean(id)))
    );

    const { data: medications, error: medicationError } =
      medicationIds.length > 0
        ? await supabaseAdmin.from('medications').select('id, name, name_en').in('id', medicationIds)
        : { data: [], error: null };

    if (medicationError) {
      set.status = 500;
      return {
        success: false,
        error: medicationError.message,
      };
    }

    const medicationMap = new Map((medications ?? []).map((medication) => [medication.id, medication]));

    const data = (stockRows ?? []).map((row) => {
      const quantity = toNumber(row.quantity, 0);
      const dailyConsumption = toNumber(row.daily_consumption, 0);
      const thresholdWarn = toNumber(row.threshold_warn, 14);
      const thresholdCritical = toNumber(row.threshold_critical, 7);

      const daysRemaining = dailyConsumption > 0 ? quantity / dailyConsumption : null;

      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (daysRemaining !== null) {
        if (daysRemaining <= thresholdCritical) {
          status = 'critical';
        } else if (daysRemaining <= thresholdWarn) {
          status = 'warning';
        }
      } else if (quantity <= 0) {
        status = 'critical';
      }

      const medication = medicationMap.get(row.medication_id);

      return {
        ...row,
        quantity,
        daily_consumption: dailyConsumption,
        threshold_warn: thresholdWarn,
        threshold_critical: thresholdCritical,
        days_remaining: daysRemaining,
        status,
        medication_name: medication?.name ?? null,
        medication_name_en: medication?.name_en ?? null,
      };
    });

    return {
      success: true,
      data,
    };
  })
  .patch(
    '/:id',
    async (context: any) => {
      const { params, body, set } = context;
      const authUser = context.authUser ?? null;

      const roleError = requireRole(authUser, ['admin', 'nurse', 'caregiver'], set);
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
        .from('stock')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
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
          error: 'Stock record not found',
        };
      }

      return { success: true, data };
    },
    { body: patchStockSchema }
  )

  /**
   * PATCH /stock/by-medication/:medicationId
   * More ergonomic: update stock using medication_id instead of stock row id.
   * Used by web app stock replenishment UI.
   */
  .patch(
    '/by-medication/:medicationId',
    async (context: any) => {
      const { params, body, set } = context;
      const authUser = context.authUser ?? null;

      const roleError = requireRole(authUser, ['admin', 'nurse', 'caregiver'], set);
      if (roleError) return roleError;

      if (Object.keys(body).length === 0) {
        set.status = 400;
        return { success: false, error: 'No fields to update' };
      }

      const { data, error } = await supabaseAdmin
        .from('stock')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('medication_id', params.medicationId)
        .select('*')
        .maybeSingle();

      if (error) { set.status = 400; return { success: false, error: error.message }; }
      if (!data) { set.status = 404; return { success: false, error: 'Stock record not found for this medication' }; }

      return { success: true, data };
    },
    { body: patchStockSchema }
  );
