const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  PORT: parsePort(process.env.PORT, 4000),
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET ?? '',
};

if (!env.SUPABASE_JWT_SECRET) {
  // Auth routes will return a clear startup error if JWT secret is missing.
  console.warn('Warning: SUPABASE_JWT_SECRET is not set. JWT auth verification will fail.');
}
