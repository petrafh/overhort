import serverless from 'serverless-http'
import type { Handler, HandlerResponse } from '@netlify/functions'

let expressHandler: ReturnType<typeof serverless> | undefined

export const handler: Handler = async (event, context) => {
  try {
    if (!expressHandler) {
      const { app } = await import('../../server/index.js')
      expressHandler = serverless(app)
    }
    return await expressHandler(event, context) as HandlerResponse
  } catch (error) {
    console.error('Kunne ikke starte Overhørt API:', error)
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API-et mangler databasekonfigurasjon. Sjekk miljøvariablene i Netlify.' }),
    }
  }
}
