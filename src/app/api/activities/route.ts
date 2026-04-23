import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dealId = searchParams.get('dealId')

  const where = dealId ? { dealId } : {}

  const activities = await prisma.activity.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      deal: { select: { id: true, companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(activities)
}
