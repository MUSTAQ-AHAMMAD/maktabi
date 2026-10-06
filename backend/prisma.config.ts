import { defineConfig } from 'prisma/config'

// Prisma 7 no longer auto-loads `.env` when a config file is present, so load it
// here. `.env` is optional — in Docker the vars are already in the environment.
try {
  process.loadEnvFile()
} catch {
  // no local .env file — rely on already-set environment variables
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
