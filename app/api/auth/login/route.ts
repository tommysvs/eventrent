import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSessionToken } from '@/lib/auth'
import { LOG_ACTION, LOG_EVENT_TYPE, LOG_SEVERITY, writeSecurityLog } from '@/lib/security-log'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      await writeSecurityLog({
        request,
        eventType: LOG_EVENT_TYPE.SECURITY,
        action: LOG_ACTION.ACCESS_DENIED,
        severity: LOG_SEVERITY.WARNING,
        description: 'Login request missing username or password',
        statusCode: 400,
        metadata: {
          usernameProvided: Boolean(username),
          passwordProvided: Boolean(password),
        },
      })

      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { username },
      include: { role: true },
    }) as {
      id: bigint
      username: string
      name: string | null
      password: string
      roleId: bigint
      role: { name: string }
    } | null

    if (!user) {
      await writeSecurityLog({
        request,
        eventType: LOG_EVENT_TYPE.SECURITY,
        action: LOG_ACTION.FAILED_LOGIN,
        severity: LOG_SEVERITY.WARNING,
        description: `Invalid login attempt for username ${username}`,
        statusCode: 401,
        metadata: {
          username,
        },
      })

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      await writeSecurityLog({
        request,
        userId: user.id,
        eventType: LOG_EVENT_TYPE.SECURITY,
        action: LOG_ACTION.FAILED_LOGIN,
        severity: LOG_SEVERITY.WARNING,
        description: `Invalid password for username ${username}`,
        statusCode: 401,
        metadata: {
          username,
        },
      })

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = createSessionToken({
      sub: user.id.toString(),
      username: user.username,
      name: user.name ?? undefined,
      role: user.role.name,
    })

    const response = NextResponse.json({
      user: { id: user.id.toString(), username: user.username, name: user.name, role: user.role.name },
    })

    await writeSecurityLog({
      request,
      userId: user.id,
      eventType: LOG_EVENT_TYPE.USER_ACTION,
      action: LOG_ACTION.LOGIN,
      severity: LOG_SEVERITY.INFO,
      description: `User ${user.username} logged in`,
      statusCode: 200,
      sessionToken: token,
      metadata: {
        username: user.username,
        role: user.role.name,
      },
    })

    response.cookies.set({
      name: 'eventrent_session',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    await writeSecurityLog({
      request,
      eventType: LOG_EVENT_TYPE.SYSTEM,
      action: LOG_ACTION.SYSTEM_ERROR,
      severity: LOG_SEVERITY.CRITICAL,
      description: 'Login handler failed',
      statusCode: 500,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

