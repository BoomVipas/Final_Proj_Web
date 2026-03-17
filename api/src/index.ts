import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';

import { env } from './lib/env';
import { authPlugin } from './middleware/auth';
import { dispenseRoutes } from './routes/dispense';
import { medicationsRoutes } from './routes/medications';
import { residentsRoutes } from './routes/residents';
import { stockRoutes } from './routes/stock';
import { wardsRoutes } from './routes/wards';

export const app = new Elysia()
  .use(cors())
  .get('/health', () => ({
    success: true,
    service: 'medcare-api',
    timestamp: new Date().toISOString(),
  }))
  .use(authPlugin)
  .onBeforeHandle((context: any) => {
    const { path, set } = context;
    const authUser = context.authUser ?? null;

    if (path === '/health') {
      return;
    }

    if (!authUser) {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
  })
  .get('/auth/me', (context: any) => ({
    success: true,
    data: context.authUser ?? null,
  }))
  .use(wardsRoutes)
  .use(residentsRoutes)
  .use(medicationsRoutes)
  .use(dispenseRoutes)
  .use(stockRoutes)
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Invalid payload',
      };
    }

    const currentStatus =
      typeof set.status === 'number' ? set.status : Number.NaN;

    if (!Number.isFinite(currentStatus) || currentStatus < 400) {
      set.status = 500;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    return {
      success: false,
      error: errorMessage,
    };
  })
  .listen(env.PORT);

console.log(`MedCare API running at http://${app.server?.hostname}:${app.server?.port}`);
