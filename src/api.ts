const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export function getToken() {
  return localStorage.getItem('overhort_token')
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!response.ok) {
    const rawBody = await response.text()
    let message = ''
    try {
      message = (JSON.parse(rawBody) as { error?: string }).error ?? ''
    } catch {
      // Vite returnerer ofte tekst/HTML når den lokale proxyen ikke finner API-serveren.
    }
    if (!message && import.meta.env.DEV && response.status >= 500) {
      message = 'Den lokale API-serveren kjører ikke. Start den med «npm run dev:api» i en ny terminal.'
    }
    throw new Error(message || `API-feil ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
