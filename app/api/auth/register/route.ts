import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { username, password, name } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { username } })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const defaultRole = await prisma.role.findUnique({ where: { name: 'user' } })

    if (!defaultRole) {
      return NextResponse.json({ error: 'Default role not found' }, { status: 500 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        name,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
      include: { role: true },
    })

    return NextResponse.json({ user: { id: user.id.toString(), username: user.username, name: user.name, role: user.role.name } })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
