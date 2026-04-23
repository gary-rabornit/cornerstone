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

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      deal: { select: { id: true, companyName: true, contactName: true, value: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      approvals: {
        include: {
          approver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      clientAccess: true,
    },
  })

  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

  return NextResponse.json(proposal)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.proposal.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (body.title !== undefined) data.title = body.title
  if (body.company !== undefined) data.company = body.company
  if (body.status !== undefined) data.status = body.status
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
  if (body.sections !== undefined) data.sections = typeof body.sections === 'string' ? body.sections : JSON.stringify(body.sections)
  if (body.pricingItems !== undefined) data.pricingItems = typeof body.pricingItems === 'string' ? body.pricingItems : JSON.stringify(body.pricingItems)
  if (body.pricingMode !== undefined) data.pricingMode = body.pricingMode
  if (body.pricingTiers !== undefined) data.pricingTiers = typeof body.pricingTiers === 'string' ? body.pricingTiers : JSON.stringify(body.pricingTiers)
  if (body.services !== undefined) data.services = typeof body.services === 'string' ? body.services : JSON.stringify(body.services)
  if (body.repName !== undefined) data.repName = body.repName
  if (body.repTitle !== undefined) data.repTitle = body.repTitle
  if (body.repEmail !== undefined) data.repEmail = body.repEmail
  if (body.repPhone !== undefined) data.repPhone = body.repPhone
  if (body.isTemplate !== undefined) data.isTemplate = body.isTemplate
  if (body.templateName !== undefined) data.templateName = body.templateName

  // Increment version on significant changes (sections or pricing)
  if (body.sections !== undefined || body.pricingItems !== undefined || body.pricingTiers !== undefined) {
    data.version = existing.version + 1
  }

  const proposal = await prisma.proposal.update({
    where: { id },
    data,
    include: {
      deal: { select: { id: true, companyName: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(proposal)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({ where: { id } })
  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

  if (proposal.status !== 'DRAFT') {
    return NextResponse.json(
      { error: 'Only DRAFT proposals can be deleted' },
      { status: 400 }
    )
  }

  await prisma.proposal.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
