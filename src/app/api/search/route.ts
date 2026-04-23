import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ deals: [], proposals: [] })
  }

  const [deals, proposals] = await Promise.all([
    prisma.deal.findMany({
      where: {
        OR: [
          { companyName: { contains: q } },
          { contactName: { contains: q } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        value: true,
        stage: true,
      },
      take: 10,
    }),
    prisma.proposal.findMany({
      where: {
        title: { contains: q },
      },
      select: {
        id: true,
        title: true,
        status: true,
        dealId: true,
      },
      take: 10,
    }),
  ])

  return NextResponse.json({ deals, proposals })
}
