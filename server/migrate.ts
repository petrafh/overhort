import 'dotenv/config'
import { spawnSync } from 'node:child_process'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL mangler.')

const result = spawnSync('psql', [connectionString, '-v', 'ON_ERROR_STOP=1', '-f', 'database/schema.sql'], {
  cwd: process.cwd(),
  stdio: 'inherit',
})

if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
