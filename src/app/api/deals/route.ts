import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const stage = searchParams.get('stage')

  const where = stage ? { stage } : {}

  const deals = await prisma.deal.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(deals)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { company, companyName, contactName, contactEmail, contactPhone, companyWebsite, commissionApplicable, commissionRecipient, coCommissionApplicable, coCommissionRecipient, value, ownerId, stage } = body

  if (!companyName || !contactName || value === undefined || !ownerId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const deal = await prisma.deal.create({
      data: {
        company: company || 'RABORN_MEDIA',
        companyName,
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        companyWebsite: companyWebsite || null,
        commissionApplicable: commissionApplicable || false,
        commissionRecipient: commissionRecipient || null,
        coCommissionApplicable: coCommissionApplicable || false,
        coCommissionRecipient: coCommissionRecipient || null,
        value,
        ownerId,
        stage: stage || 'LEAD',
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
      },
    })

    await prisma.activity.create({
      data: {
        dealId: deal.id,
        type: 'DEAL_CREATED',
        description: 'Deal created',
        userId: session.user.id!,
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (err) {
    console.error('Failed to create deal:', err)
    return NextResponse.json({ error: 'Failed to create deal. Please sign out and sign back in.' }, { status: 500 })
  }
}
