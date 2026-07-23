import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth'
import { LOG_ACTION, LOG_EVENT_TYPE, LOG_SEVERITY, writeSecurityLog } from '@/lib/security-log'

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get('eventrent_session')?.value
  const sessionPayload = sessionToken ? verifySessionToken(sessionToken) : null

  await writeSecurityLog({
    request,
    userId: sessionPayload ? BigInt(sessionPayload.sub) : null,
    eventType: LOG_EVENT_TYPE.USER_ACTION,
    action: LOG_ACTION.LOGOUT,
    severity: LOG_SEVERITY.INFO,
    description: sessionPayload ? `User ${sessionPayload.username} logged out` : 'Session logged out',
    statusCode: 200,
    sessionToken,
    metadata: sessionPayload
      ? {
          username: sessionPayload.username,
          role: sessionPayload.role,
        }
      : undefined,
  })

  const response = NextResponse.json({ ok: true })

  response.cookies.set({
    name: 'eventrent_session',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}