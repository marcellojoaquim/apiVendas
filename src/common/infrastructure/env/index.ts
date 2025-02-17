import { AppError } from '@/common/domain/errors/app-error'
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  API_url: z.string().default('http://localhost:3333'),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  throw new AppError('Invalid enviroment viriables')
}

export const env = _env.data
