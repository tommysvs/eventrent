import crypto from 'node:crypto'

import { pgPool } from '@/lib/pg'

export const LOG_EVENT_TYPE = {
  USER_ACTION: 'USER_ACTION',
  SECURITY: 'SECURITY',
  SYSTEM: 'SYSTEM',
} as const

export const LOG_SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const

export const LOG_ACTION = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  FAILED_LOGIN: 'FAILED_LOGIN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
} as const

type LogEventType = (typeof LOG_EVENT_TYPE)[keyof typeof LOG_EVENT_TYPE]
type LogSeverity = (typeof LOG_SEVERITY)[keyof typeof LOG_SEVERITY]
type LogAction = (typeof LOG_ACTION)[keyof typeof LOG_ACTION]

type SecurityLogInput = {
  userId?: bigint | null
  eventType: LogEventType
  action: LogAction
  severity?: LogSeverity
  description?: string | null
  endpoint?: string | null
  method?: string | null
  statusCode?: number | null
  sessionToken?: string | null
  metadata?: unknown
  request?: Request
}

function getSessionId(sessionToken?: string | null) {
  if (!sessionToken) {
    return null
  }

  return crypto.createHash('sha256').update(sessionToken).digest('hex')
}

function getIpAddress(request?: Request) {
  if (!request) {
    return null
  }

  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? null
  }

  return request.headers.get('x-real-ip') ?? null
}

function getCookieValue(request: Request | undefined, name: string) {
  if (!request) {
    return null
  }

  const cookieHeader = request.headers.get('cookie')

  if (!cookieHeader) {
    return null
  }

  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]+)`))

  return match ? decodeURIComponent(match[1]) : null
}

function toDatabaseEnumValue(value: LogEventType | LogAction | LogSeverity) {
  return value.toLowerCase()
}

export async function writeSecurityLog(input: SecurityLogInput) {
  const endpoint = input.endpoint ?? (input.request ? new URL(input.request.url).pathname : null)
  const method = input.method ?? input.request?.method ?? null
  const userAgent = input.request?.headers.get('user-agent') ?? null
  const sessionToken = input.sessionToken ?? getCookieValue(input.request, 'eventrent_session')
  const metadataValue = input.metadata === undefined ? null : JSON.stringify(input.metadata)

  try {
    await pgPool.query(
      `
        INSERT INTO logs (
          user_id,
          event_type,
          action,
          severity,
          description,
          ip_address,
          user_agent,
          endpoint,
          method,
          status_code,
          session_id,
          metadata
        ) VALUES (
          $1,
          $2::log_event_type,
          $3::log_action,
          $4::log_severity,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12::jsonb
        )
      `,
      [
        input.userId?.toString() ?? null,
        toDatabaseEnumValue(input.eventType),
        toDatabaseEnumValue(input.action),
        toDatabaseEnumValue(input.severity ?? LOG_SEVERITY.INFO),
        input.description ?? null,
        getIpAddress(input.request),
        userAgent,
        endpoint,
        method,
        input.statusCode ?? null,
        getSessionId(sessionToken),
        metadataValue,
      ],
    )
  } catch (error) {
    console.error('Failed to persist security log', error)
  }
}