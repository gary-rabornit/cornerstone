import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, email } = body

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  // Check if email is taken by another user
  if (email.trim() !== session.user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: email.trim() },
    })
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        email: email.trim(),
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Failed to update profile:', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
