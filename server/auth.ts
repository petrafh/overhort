import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET må være satt og inneholde minst 32 tegn.')
  }
  return secret
}

export function createToken(userId: string) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '30d' })
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    res.status(401).json({ error: 'Du må logge inn.' })
    return
  }

  try {
    const payload = jwt.verify(token, getJwtSecret())
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('Ugyldig token')
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Økten er ugyldig eller utløpt.' })
  }
}
