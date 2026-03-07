import { createServerFn } from '@tanstack/react-start'

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/'

export interface LastfmSession {
  key: string
  name: string
  subscriber?: number
}

interface LastfmSessionResponse {
  session?: {
    key?: string
    name?: string
    subscriber?: number
  }
  message?: string
  error?: number
}

async function createMd5(value: string) {
  const { createHash } = await import('node:crypto')
  return createHash('md5').update(value).digest('hex')
}

function resolveLastfmCredentials() {
  const apiKey = process.env.LASTFM_API_KEY
  const apiSharedSecret = process.env.LASTFM_API_SHARED_SECRET

  if (!apiKey || !apiSharedSecret) {
    throw new Error(
      'Missing LASTFM_API_KEY or LASTFM_API_SHARED_SECRET in the server environment.',
    )
  }

  return { apiKey, apiSharedSecret }
}

export async function fetchLastfmSession(token: string): Promise<LastfmSession> {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    throw new Error('Missing Last.fm token.')
  }

  const { apiKey, apiSharedSecret } = resolveLastfmCredentials()
  const apiSig = await createMd5(
    `api_key${apiKey}methodauth.getSessiontoken${normalizedToken}${apiSharedSecret}`,
  )

  const params = new URLSearchParams({
    method: 'auth.getSession',
    format: 'json',
    api_key: apiKey,
    api_sig: apiSig,
    token: normalizedToken,
  })

  const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Last.fm request failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as LastfmSessionResponse
  const session = payload.session

  if (!session?.key || !session.name) {
    throw new Error(payload.message || 'Last.fm did not return a session.')
  }

  return {
    key: session.key,
    name: session.name,
    subscriber: session.subscriber,
  }
}

export const getLastfmSession = createServerFn({ method: 'GET' })
  .inputValidator((input: { token?: string } | undefined) => ({
    token: typeof input?.token === 'string' ? input.token : '',
  }))
  .handler(async ({ data }) => fetchLastfmSession(data.token))
