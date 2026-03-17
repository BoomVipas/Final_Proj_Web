import { bearer } from '@elysiajs/bearer';
import { jwt } from '@elysiajs/jwt';
import { Elysia } from 'elysia';

import { supabaseAdmin } from '../db/supabase';
import { env } from '../lib/env';

export type AppRole = 'admin' | 'nurse' | 'caregiver' | 'family';

export type AuthUser = {
  id: string;
  email?: string;
  role: AppRole;
};

type MutableSet = {
  status?: number | string;
};

const APP_ROLES = new Set<AppRole>(['admin', 'nurse', 'caregiver', 'family']);

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as Record<string, unknown>;
};

const normalizeRole = (value: unknown): AppRole | null => {
  if (typeof value !== 'string') {
    return null;
  }
  if (APP_ROLES.has(value as AppRole)) {
    return value as AppRole;
  }
  return null;
};

export const authPlugin = new Elysia({ name: 'auth-plugin' })
  .use(bearer())
  .use(
    jwt({
      name: 'authJwt',
      secret: env.SUPABASE_JWT_SECRET || 'missing-supabase-jwt-secret',
    })
  )
  .derive(async ({ bearer, authJwt }) => {
    if (!bearer) {
      return { authUser: null as AuthUser | null };
    }

    try {
      const payload = await authJwt.verify(bearer);
      const payloadRecord = toRecord(payload);

      if (!payloadRecord) {
        return { authUser: null as AuthUser | null };
      }

      const userId = typeof payloadRecord.sub === 'string' ? payloadRecord.sub : null;
      if (!userId) {
        return { authUser: null as AuthUser | null };
      }

      const tokenRole =
        normalizeRole(payloadRecord.role) ??
        normalizeRole(payloadRecord.user_role) ??
        normalizeRole(payloadRecord.app_role);

      const tokenEmail =
        typeof payloadRecord.email === 'string' ? payloadRecord.email : undefined;

      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('id, email, role')
        .eq('id', userId)
        .maybeSingle();

      const role = normalizeRole(dbUser?.role) ?? tokenRole ?? 'caregiver';
      const email = dbUser?.email ?? tokenEmail;

      return {
        authUser: {
          id: userId,
          role,
          email,
        } as AuthUser,
      };
    } catch {
      return { authUser: null as AuthUser | null };
    }
  });

export const requireAuth = (authUser: AuthUser | null, set: MutableSet) => {
  if (authUser) {
    return null;
  }

  (set as MutableSet).status = 401;
  return {
    success: false,
    error: 'Unauthorized',
  };
};

export const requireRole = (
  authUser: AuthUser | null,
  allowedRoles: AppRole[],
  set: MutableSet
) => {
  const authError = requireAuth(authUser, set);
  if (authError) {
    return authError;
  }

  if (!authUser || allowedRoles.includes(authUser.role)) {
    return null;
  }

  (set as MutableSet).status = 403;
  return {
    success: false,
    error: 'Forbidden',
  };
};
