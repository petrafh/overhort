import 'dotenv/config'

const { sql } = await import('./db.js')
const [result] = await sql`
  select
    to_regclass('public.users') is not null as users_table,
    to_regclass('public.friend_requests') is not null as friend_requests_table,
    to_regclass('public.quotes') is not null as quotes_table
`

console.log(JSON.stringify(result))
