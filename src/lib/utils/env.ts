import { z } from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  EMAIL_USER: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

// Explicit references for Next.js static build replacement
const clientEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const _clientEnv = clientSchema.safeParse(clientEnvVars);

if (!_clientEnv.success) {
  console.error('❌ Invalid client environment variables:', _clientEnv.error.format());
  throw new Error('Invalid client environment variables');
}

let serverEnv = {} as z.infer<typeof serverSchema>;

if (typeof window === 'undefined') {
  const _serverEnv = serverSchema.safeParse(process.env);
  if (!_serverEnv.success) {
    console.error('❌ Invalid server environment variables:', _serverEnv.error.format());
    throw new Error('Invalid server environment variables');
  }
  serverEnv = _serverEnv.data;
}

export const env = {
  ...serverEnv,
  ..._clientEnv.data,
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
};

export default env;
