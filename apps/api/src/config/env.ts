import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  PUBLIC_BASE_URL: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET deve ter ao menos 16 caracteres'),
  ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  ADMIN_PASSWORD: z.string().min(6).default('troque-esta-senha'),
  PAYMENT_PROVIDER: z.string().default('mock'),
  PAYMENT_ENVIRONMENT: z.string().default('sandbox'),
  PAYMENT_API_KEY: z.string().default(''),
  PAYMENT_WEBHOOK_SECRET: z.string().default(''),
  // Diretório (relativo a este app) onde foto e assinatura de cadastros são gravados.
  STORAGE_DIR: z.string().default('uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;