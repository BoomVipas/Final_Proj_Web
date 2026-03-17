import { Elysia, t } from 'elysia';

import { supabaseAdmin } from '../db/supabase';
import { requireAuth, requireRole } from '../middleware/auth';

const addMedicationSchema = t.Object({
  medication_id: t.String({ minLength: 1 }),
  dose_amount: t.Number({ minimum: 0.5 }),
  dose_unit: t.Optional(t.String()),
  schedule: t.Array(t.String(), { minItems: 1 }),
  special_instructions: t.Optional(t.String()),
  requires_crushing: t.Optional(t.Boolean()),
});

const updateMedicationSchema = t.Partial(addMedicationSchema);

export const medicationsRoutes = new Elysia({ prefix: '/residents/:residentId/medications' })
  /**
   * GET /residents/:residentId/medications
   * All active medications for a resident.
   * Alias that redirects to the inline handler in residents.ts via shared helper.
   * We keep a lightweight version here for the medications tab in web app.
   */
  .get('/', async (context: any) => {
    const { params, set } = context;
    const authUser = context.authUser ?? null;

    const authError = requireAuth(authUser, set);
    if (authError) return authError;

    // Verify resident exists
    const { data: resident, error: residentError } = await supabaseAdmin
      .from('residents')
      .select('id, name')
      .eq('id', params.residentId)
      .maybeSingle();

    if (residentError) { set.status = 500; return { success: false, error: residentError.message }; }
    if (!resident) { set.status = 404; return { success: false, error: 'Resident not found' }; }

    const { data, error } = await supabaseAdmin
      .from('resident_medications')
      .select(`
        id, dose_amount, dose_unit, schedule,
        special_instructions, requires_crushing, is_active, updated_at,
        medication_id,
        medications ( id, name, name_en, form, dosage_unit, notes )
      `)
      .eq('resident_id', params.residentId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      set.status = 500;
      return { success: false, error: error.message };
    }

    return { success: true, data: { resident, medications: data ?? [] } };
  })

  /**
   * POST /residents/:residentId/medications
   * Add a medication to a resident's schedule.
   * Role: admin or nurse only.
   */
  .post(
    '/',
    async (context: any) => {
      const { params, body, set } = context;
      const authUser = context.authUser ?? null;

      const roleError = requireRole(authUser, ['admin', 'nurse'], set);
      if (roleError) return roleError;

      // Verify resident exists
      const { data: resident } = await supabaseAdmin
        .from('residents')
        .select('id')
        .eq('id', params.residentId)
        .maybeSingle();

      if (!resident) {
        set.status = 404;
        return { success: false, error: 'Resident not found' };
      }

      // Verify medication exists
      const { data: medication } = await supabaseAdmin
        .from('medications')
        .select('id, name')
        .eq('id', body.medication_id)
        .maybeSingle();

      if (!medication) {
        set.status = 404;
        return { success: false, error: 'Medication not found' };
      }

      const { data, error } = await supabaseAdmin
        .from('resident_medications')
        .insert({
          resident_id: params.residentId,
          medication_id: body.medication_id,
          dose_amount: body.dose_amount,
          dose_unit: body.dose_unit ?? 'เม็ด',
          schedule: body.schedule,
          special_instructions: body.special_instructions ?? null,
          requires_crushing: body.requires_crushing ?? false,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        set.status = 400;
        return { success: false, error: error.message };
      }

      set.status = 201;
      return { success: true, data };
    },
    { body: addMedicationSchema }
  )

  /**
   * PATCH /residents/:residentId/medications/:medId
   * Update dose, schedule, or instructions for a resident medication.
   * Role: admin or nurse only.
   */
  .patch(
    '/:medId',
    async (context: any) => {
      const { params, body, set } = context;
      const authUser = context.authUser ?? null;

      const roleError = requireRole(authUser, ['admin', 'nurse'], set);
      if (roleError) return roleError;

      if (Object.keys(body).length === 0) {
        set.status = 400;
        return { success: false, error: 'No fields to update' };
      }

      const { data, error } = await supabaseAdmin
        .from('resident_medications')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', params.medId)
        .eq('resident_id', params.residentId)
        .select('*')
        .maybeSingle();

      if (error) { set.status = 400; return { success: false, error: error.message }; }
      if (!data) { set.status = 404; return { success: false, error: 'Medication schedule not found' }; }

      return { success: true, data };
    },
    { body: updateMedicationSchema }
  )

  /**
   * DELETE /residents/:residentId/medications/:medId
   * Soft-delete: sets is_active=false. Does NOT remove from DB.
   * Role: admin or nurse only.
   */
  .delete('/:medId', async (context: any) => {
    const { params, set } = context;
    const authUser = context.authUser ?? null;

    const roleError = requireRole(authUser, ['admin', 'nurse'], set);
    if (roleError) return roleError;

    const { data, error } = await supabaseAdmin
      .from('resident_medications')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', params.medId)
      .eq('resident_id', params.residentId)
      .select('id')
      .maybeSingle();

    if (error) { set.status = 400; return { success: false, error: error.message }; }
    if (!data) { set.status = 404; return { success: false, error: 'Medication schedule not found' }; }

    return { success: true, message: 'Medication removed from schedule' };
  });
