import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { LOG_ACTION, LOG_EVENT_TYPE, LOG_SEVERITY, writeSecurityLog } from '@/lib/security-log'

export async function POST(request: NextRequest) {
  try {
    const { username, password, name } = await request.json()

    if (!username || !password) {
      await writeSecurityLog({
        request,
        eventType: LOG_EVENT_TYPE.SECURITY,
        action: LOG_ACTION.ACCESS_DENIED,
        severity: LOG_SEVERITY.WARNING,
        description: 'Register request missing username or password',
        statusCode: 400,
        metadata: {
          usernameProvided: Boolean(username),
          passwordProvided: Boolean(password),
        },
      })

      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({ where: { username } })

    if (existingUser) {
      await writeSecurityLog({
        request,
        eventType: LOG_EVENT_TYPE.SECURITY,
        action: LOG_ACTION.REGISTER,
        severity: LOG_SEVERITY.WARNING,
        description: `Registration blocked because username ${username} already exists`,
        statusCode: 409,
        metadata: {
          username,
        },
      })

      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const defaultRole = await db.role.findUnique({ where: { name: 'user' } })

    if (!defaultRole) {
      await writeSecurityLog({
        request,
        eventType: LOG_EVENT_TYPE.SYSTEM,
        action: LOG_ACTION.SYSTEM_ERROR,
        severity: LOG_SEVERITY.CRITICAL,
        description: 'Default role not found during registration',
        statusCode: 500,
        metadata: {
          username,
        },
      })

      return NextResponse.json({ error: 'Default role not found' }, { status: 500 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        username,
        name,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      include: { role: true },
    }) as {
      id: bigint
      username: string
      name: string | null
      password: string
      roleId: bigint
      role: { name: string }
    }

    await writeSecurityLog({
      request,
      userId: user.id,
      eventType: LOG_EVENT_TYPE.USER_ACTION,
      action: LOG_ACTION.REGISTER,
      severity: LOG_SEVERITY.INFO,
      description: `User ${user.username} registered`,
      statusCode: 201,
      metadata: {
        username: user.username,
        role: user.role.name,
      },
    })

    return NextResponse.json({ user: { id: user.id.toString(), username: user.username, name: user.name, role: user.role.name } })
  } catch (error) {
    await writeSecurityLog({
      request,
      eventType: LOG_EVENT_TYPE.SYSTEM,
      action: LOG_ACTION.SYSTEM_ERROR,
      severity: LOG_SEVERITY.CRITICAL,
      description: 'Register handler failed',
      statusCode: 500,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

