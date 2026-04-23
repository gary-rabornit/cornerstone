import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      proposals: {
        select: { id: true, title: true, status: true, createdAt: true, version: true },
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  return NextResponse.json(deal)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.deal.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const data: Record<string, unknown> = { ...body }

  if (body.stage && body.stage !== existing.stage) {
    data.stageEnteredAt = new Date()

    await prisma.activity.create({
      data: {
        dealId: id,
        type: 'STAGE_CHANGE',
        description: `Deal moved to ${body.stage}`,
        userId: session.user.id!,
        metadata: JSON.stringify({ from: existing.stage, to: body.stage }),
      },
    })
  }

  const deal = await prisma.deal.update({
    where: { id },
    data,
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })

  return NextResponse.json(deal)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  await prisma.deal.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
