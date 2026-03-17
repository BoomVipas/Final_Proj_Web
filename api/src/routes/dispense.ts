import { Elysia, t } from 'elysia';

import { supabaseAdmin } from '../db/supabase';
import { requireAuth } from '../middleware/auth';
import { getWeekStartIso } from '../lib/utils';

const dispenseCreateSchema = t.Object({
  resident_id: t.String(),
  meal: t.String(),
  day_of_week: t.Optional(t.String()),
  medications_json: t.Array(t.Any()),
  total_pills: t.Integer({ minimum: 0 }),
  outcome: t.Optional(t.String()),
  mark_week_filled: t.Optional(t.Boolean()),
});

const historyQuerySchema = t.Object({
  date_from: t.Optional(t.String()),
  date_to: t.Optional(t.String()),
  resident_id: t.Optional(t.String()),
  staff_id: t.Optional(t.String()),
  limit: t.Optional(t.String()),
});

export const dispenseRoutes = new Elysia({ prefix: '/dispense' })
  .post(
    '/',
    async (context: any) => {
      const { body, set } = context;
      const authUser = context.authUser ?? null;

      const authError = requireAuth(authUser, set);
      if (authError) {
        return authError;
      }

      const insertPayload = {
        resident_id: body.resident_id,
        meal: body.meal,
        day_of_week: body.day_of_week ?? null,
        medications_json: body.medications_json,
        total_pills: body.total_pills,
        staff_id: authUser.id,
        outcome: body.outcome ?? 'success',
      };

      const { data, error } = await supabaseAdmin
        .from('dispense_events')
        .insert(insertPayload)
        .select('*')
        .single();

      if (error) {
        set.status = 400;
        return {
          success: false,
          error: error.message,
        };
      }

      if (body.mark_week_filled) {
        const weekStart = getWeekStartIso();

        const { error: fillStatusError } = await supabaseAdmin
          .from('weekly_fill_status')
          .upsert(
            {
              resident_id: body.resident_id,
              week_start: weekStart,
              is_filled: true,
              filled_at: new Date().toISOString(),
              filled_by: authUser.id,
            },
            {
              onConflict: 'resident_id,week_start',
            }
          );

        if (fillStatusError) {
          set.status = 500;
          return {
            success: false,
            error: `Dispense saved, but weekly status update failed: ${fillStatusError.message}`,
          };
        }
      }

      set.status = 201;
      return {
        success: true,
        data,
      };
    },
    {
      body: dispenseCreateSchema,
    }
  )
  .get(
    '/history',
    async (context: any) => {
      const { query, set } = context;
      const authUser = context.authUser ?? null;

      const authError = requireAuth(authUser, set);
      if (authError) {
        return authError;
      }

      let request = supabaseAdmin
        .from('dispense_events')
        .select('*')
        .order('dispensed_at', { ascending: false });

      if (query.date_from) {
        request = request.gte('dispensed_at', query.date_from);
      }

      if (query.date_to) {
        request = request.lte('dispensed_at', query.date_to);
      }

      if (query.resident_id) {
        request = request.eq('resident_id', query.resident_id);
      }

      if (query.staff_id) {
        request = request.eq('staff_id', query.staff_id);
      }

      const limit = Number(query.limit ?? 100);
      request = request.limit(Number.isFinite(limit) && limit > 0 ? Math.min(limit, 500) : 100);

      const { data: events, error } = await request;

      if (error) {
        set.status = 500;
        return {
          success: false,
          error: error.message,
        };
      }

      const residentIds = Array.from(
        new Set((events ?? []).map((event) => event.resident_id).filter((id): id is string => Boolean(id)))
      );
      const staffIds = Array.from(
        new Set((events ?? []).map((event) => event.staff_id).filter((id): id is string => Boolean(id)))
      );

      const [residentsResult, usersResult] = await Promise.all([
        residentIds.length > 0
          ? supabaseAdmin.from('residents').select('id, name').in('id', residentIds)
          : Promise.resolve({ data: [], error: null }),
        staffIds.length > 0
          ? supabaseAdmin.from('users').select('id, display_name, email').in('id', staffIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const residentNameMap = new Map(
        (residentsResult.data ?? []).map((resident) => [resident.id, resident.name])
      );
      const userNameMap = new Map(
        (usersResult.data ?? []).map((user) => [user.id, user.display_name ?? user.email ?? user.id])
      );

      return {
        success: true,
        data: (events ?? []).map((event) => ({
          ...event,
          resident_name: event.resident_id ? residentNameMap.get(event.resident_id) ?? null : null,
          staff_name: event.staff_id ? userNameMap.get(event.staff_id) ?? null : null,
        })),
      };
    },
    {
      query: historyQuerySchema,
    }
  );
