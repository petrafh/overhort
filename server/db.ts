import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

if (!connectionString) throw new Error('DATABASE_URL mangler.')

export const sql = neon(connectionString)
