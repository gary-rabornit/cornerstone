import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { compare, hash } from 'bcryptjs'

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isValid = await compare(currentPassword, user.hashedPassword)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
    }

    const hashedPassword = await hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword },
    })

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('Failed to change password:', err)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
