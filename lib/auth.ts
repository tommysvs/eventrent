import crypto from 'node:crypto'

type SessionPayload = {
  sub: string
  username: string
  role: string
  iat: number
  exp: number
}

const TOKEN_SEPARATOR = '.'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET is required in production')
    }

    return 'dev-auth-secret-change-me'
  }

  return secret
}

export function createSessionToken(data: { sub: string; username: string; role: string }) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    ...data,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }

  const headerPart = base64UrlEncode(JSON.stringify(header))
  const payloadPart = base64UrlEncode(JSON.stringify(payload))
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(`${headerPart}${TOKEN_SEPARATOR}${payloadPart}`)
    .digest('base64url')

  return `${headerPart}${TOKEN_SEPARATOR}${payloadPart}${TOKEN_SEPARATOR}${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [headerPart, payloadPart, signaturePart] = token.split(TOKEN_SEPARATOR)

  if (!headerPart || !payloadPart || !signaturePart) {
    return null
  }

  const expectedSignature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(`${headerPart}${TOKEN_SEPARATOR}${payloadPart}`)
    .digest('base64url')

  const expectedBuffer = Buffer.from(expectedSignature)
  const receivedBuffer = Buffer.from(signaturePart)

  if (expectedBuffer.length !== receivedBuffer.length) {
    return null
  }

  if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return null
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart)) as SessionPayload

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}