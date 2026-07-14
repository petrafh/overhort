import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { createToken, requireAuth, type AuthRequest } from './auth.js'
import { sql } from './db.js'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

const asyncRoute = (handler: (req: AuthRequest, res: express.Response) => Promise<void>) =>
  (req: AuthRequest, res: express.Response, next: express.NextFunction) => handler(req, res).catch(next)

app.get('/api/health', asyncRoute(async (_req, res) => {
  const [result] = await sql`select now() as time`
  res.json({ ok: true, database: 'neon', time: result.time })
}))

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const body = credentialsSchema.extend({
    name: z.string().min(2).max(80),
    username: z.string().regex(/^[a-z0-9_]{3,24}$/),
    bio: z.string().max(120).optional().default(''),
  }).parse(req.body)
  const passwordHash = await bcrypt.hash(body.password, 12)
  const rows = await sql`
    insert into users (email, username, name, password_hash, bio)
    values (${body.email.toLowerCase()}, ${body.username}, ${body.name}, ${passwordHash}, ${body.bio})
    returning id, email, username, name, bio, avatar_url
  `
  res.status(201).json({ user: rows[0], token: createToken(String(rows[0].id)) })
}))

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const body = credentialsSchema.parse(req.body)
  const rows = await sql`select id, email, username, name, bio, avatar_url as "avatarUrl", password_hash from users where email = ${body.email.toLowerCase()} limit 1`
  const user = rows[0]
  if (!user || !await bcrypt.compare(body.password, String(user.password_hash))) {
    res.status(401).json({ error: 'Feil e-post eller passord.' })
    return
  }
  const { password_hash: _, ...safeUser } = user
  res.json({ user: safeUser, token: createToken(String(user.id)) })
}))

app.get('/api/me', requireAuth, asyncRoute(async (req, res) => {
  const rows = await sql`
    select id, email, username, name, bio, avatar_url as "avatarUrl"
    from users where id = ${req.userId} limit 1
  `
  if (!rows[0]) {
    res.status(404).json({ error: 'Fant ikke profilen.' })
    return
  }
  res.json(rows[0])
}))

app.patch('/api/me', requireAuth, asyncRoute(async (req, res) => {
  const body = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().email(),
    avatarUrl: z.string().max(600_000).refine(
      (value) => /^data:image\/(jpeg|png|webp);base64,/.test(value),
      'Ugyldig profilbilde.',
    ).optional(),
  }).parse(req.body)
  const hasNewAvatar = body.avatarUrl !== undefined
  const rows = await sql`
    update users
    set name = ${body.name},
      email = ${body.email.toLowerCase()},
      avatar_url = case when ${hasNewAvatar} then ${body.avatarUrl ?? null} else avatar_url end
    where id = ${req.userId}
    returning id, email, username, name, bio, avatar_url as "avatarUrl"
  `
  if (!rows[0]) {
    res.status(404).json({ error: 'Fant ikke profilen.' })
    return
  }
  res.json(rows[0])
}))

app.get('/api/feed', requireAuth, asyncRoute(async (req, res) => {
  const rows = await sql`
    select q.id, q.body as text, q.background_color as color, q.created_at,
      json_build_object('id', subject.id, 'name', subject.name, 'username', subject.username, 'avatarUrl', subject.avatar_url) as subject,
      json_build_object('id', author.id, 'name', author.name, 'username', author.username, 'avatarUrl', author.avatar_url) as "postedBy",
      count(distinct l.user_id)::int as likes,
      count(distinct c.id)::int as comments,
      bool_or(l.user_id = ${req.userId}) as liked
    from quotes q
    join users subject on subject.id = q.subject_id
    join users author on author.id = q.author_id
    left join quote_likes l on l.quote_id = q.id
    left join comments c on c.quote_id = q.id
    where q.subject_id = ${req.userId}
      or exists (
        select 1 from friendships f
        where f.user_low_id = least(${req.userId}::uuid, q.subject_id)
          and f.user_high_id = greatest(${req.userId}::uuid, q.subject_id)
      )
    group by q.id, subject.id, author.id
    order by q.created_at desc
    limit 50
  `
  res.json(rows)
}))

app.get('/api/users/search', requireAuth, asyncRoute(async (req, res) => {
  const query = z.string().trim().min(2).max(40).parse(req.query.query)
  const search = `%${query.toLowerCase()}%`
  const rows = await sql`
    select u.id, u.name, u.username, u.bio, u.avatar_url as "avatarUrl",
      coalesce(sent.id, received.id) as "requestId",
      case
        when f.user_low_id is not null then 'friend'
        when sent.id is not null then 'sent'
        when received.id is not null then 'received'
        else 'none'
      end as "relationshipStatus"
    from users u
    left join friendships f
      on f.user_low_id = least(u.id, ${req.userId}::uuid)
      and f.user_high_id = greatest(u.id, ${req.userId}::uuid)
    left join friend_requests sent
      on sent.sender_id = ${req.userId} and sent.receiver_id = u.id and sent.status = 'pending'
    left join friend_requests received
      on received.sender_id = u.id and received.receiver_id = ${req.userId} and received.status = 'pending'
    where u.id <> ${req.userId}
      and (lower(u.username) like ${search} or lower(u.name) like ${search})
    order by
      case when lower(u.username) = ${query.toLowerCase()} then 0 else 1 end,
      u.username
    limit 12
  `
  res.json(rows)
}))

app.get('/api/friends', requireAuth, asyncRoute(async (req, res) => {
  const rows = await sql`
    select u.id, u.name, u.username, u.bio, u.avatar_url as "avatarUrl",
      (select count(*)::int from friendships own where own.user_low_id = u.id or own.user_high_id = u.id) as "friendCount"
    from friendships f
    join users u on u.id = case when f.user_low_id = ${req.userId} then f.user_high_id else f.user_low_id end
    where f.user_low_id = ${req.userId} or f.user_high_id = ${req.userId}
    order by u.name
  `
  res.json(rows)
}))

app.get('/api/friend-requests', requireAuth, asyncRoute(async (req, res) => {
  const rows = await sql`
    select u.id, u.name, u.username, u.bio, u.avatar_url as "avatarUrl", fr.id as "requestId",
      (select count(*)::int from friendships own where own.user_low_id = u.id or own.user_high_id = u.id) as "friendCount"
    from friend_requests fr
    join users u on u.id = fr.sender_id
    where fr.receiver_id = ${req.userId} and fr.status = 'pending'
    order by fr.created_at desc
  `
  res.json(rows)
}))

app.post('/api/quotes', requireAuth, asyncRoute(async (req, res) => {
  const body = z.object({ subjectId: z.string().uuid(), text: z.string().trim().min(1).max(180), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/) }).parse(req.body)
  const rows = await sql`
    insert into quotes (subject_id, author_id, body, background_color)
    select ${body.subjectId}, ${req.userId}, ${body.text}, ${body.color}
    where exists (
      select 1 from friendships
      where (user_low_id = least(${body.subjectId}::uuid, ${req.userId}::uuid)
        and user_high_id = greatest(${body.subjectId}::uuid, ${req.userId}::uuid))
    )
    returning id, subject_id, author_id, body, background_color, created_at
  `
  if (!rows[0]) {
    res.status(403).json({ error: 'Bare venner kan legge ut sitater på hverandre.' })
    return
  }
  res.status(201).json(rows[0])
}))

app.delete('/api/quotes/:id', requireAuth, asyncRoute(async (req, res) => {
  const rows = await sql`delete from quotes where id = ${req.params.id} and subject_id = ${req.userId} returning id`
  if (!rows[0]) {
    res.status(404).json({ error: 'Sitatet finnes ikke, eller tilhører ikke deg.' })
    return
  }
  res.status(204).end()
}))

app.post('/api/quotes/:id/likes', requireAuth, asyncRoute(async (req, res) => {
  const rows = await sql`
    insert into quote_likes (quote_id, user_id)
    select q.id, ${req.userId} from quotes q
    where q.id = ${req.params.id}
      and (q.subject_id = ${req.userId} or exists (
        select 1 from friendships f
        where f.user_low_id = least(${req.userId}::uuid, q.subject_id)
          and f.user_high_id = greatest(${req.userId}::uuid, q.subject_id)
      ))
    on conflict do nothing returning quote_id
  `
  // Idempotent: manglende rad betyr enten at liken allerede finnes eller at sitatet ikke er synlig.
  void rows
  res.status(204).end()
}))

app.delete('/api/quotes/:id/likes', requireAuth, asyncRoute(async (req, res) => {
  await sql`delete from quote_likes where quote_id = ${req.params.id} and user_id = ${req.userId}`
  res.status(204).end()
}))

app.post('/api/quotes/:id/comments', requireAuth, asyncRoute(async (req, res) => {
  const { text } = z.object({ text: z.string().trim().min(1).max(500) }).parse(req.body)
  const rows = await sql`
    insert into comments (quote_id, author_id, body)
    select q.id, ${req.userId}, ${text} from quotes q
    where q.id = ${req.params.id}
      and (q.subject_id = ${req.userId} or exists (
        select 1 from friendships f
        where f.user_low_id = least(${req.userId}::uuid, q.subject_id)
          and f.user_high_id = greatest(${req.userId}::uuid, q.subject_id)
      ))
    returning *
  `
  if (!rows[0]) {
    res.status(404).json({ error: 'Sitatet finnes ikke eller er ikke synlig for deg.' })
    return
  }
  res.status(201).json(rows[0])
}))

app.post('/api/friend-requests', requireAuth, asyncRoute(async (req, res) => {
  const { toUserId } = z.object({ toUserId: z.string().uuid() }).parse(req.body)
  const rows = await sql`insert into friend_requests (sender_id, receiver_id) values (${req.userId}, ${toUserId}) returning *`
  res.status(201).json(rows[0])
}))

app.patch('/api/friend-requests/:id', requireAuth, asyncRoute(async (req, res) => {
  const { status } = z.object({ status: z.enum(['accepted', 'declined']) }).parse(req.body)
  const rows = await sql`
    with updated as (
      update friend_requests set status = ${status}, responded_at = now()
      where id = ${req.params.id} and receiver_id = ${req.userId} and status = 'pending'
      returning sender_id, receiver_id
    ), friendship as (
      insert into friendships (user_low_id, user_high_id)
      select least(sender_id, receiver_id), greatest(sender_id, receiver_id) from updated where ${status} = 'accepted'
      on conflict do nothing
    )
    select * from updated
  `
  if (!rows[0]) {
    res.status(404).json({ error: 'Venneforespørselen finnes ikke.' })
    return
  }
  res.json({ status })
}))

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: 'Ugyldige data.', details: error.flatten() })
    return
  }
  if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
    res.status(409).json({ error: 'Denne verdien er allerede i bruk.' })
    return
  }
  console.error(error)
  res.status(500).json({ error: 'Noe gikk galt på serveren.' })
})
