import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { advanceDealStage } from '@/lib/deal-stage'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const dealId = searchParams.get('dealId')
  const isTemplate = searchParams.get('isTemplate')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (dealId) where.dealId = dealId
  if (isTemplate !== null && isTemplate !== undefined) {
    where.isTemplate = isTemplate === 'true'
  }

  const proposals = await prisma.proposal.findMany({
    where,
    include: {
      deal: { select: { id: true, companyName: true, value: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(proposals)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    title, dealId, company, sections, pricingItems,
    pricingMode, pricingTiers, services,
    repName, repTitle, repEmail, repPhone,
    isTemplate, templateName, fromTemplateId,
    clientCompanyName, clientContactName, clientContactEmail, dealValue,
    industry, serviceType,
  } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  let sectionData = sections ? JSON.stringify(sections) : '[]'
  let pricingData = pricingItems ? JSON.stringify(pricingItems) : '[]'

  if (fromTemplateId) {
    const template = await prisma.proposal.findUnique({
      where: { id: fromTemplateId },
    })
    if (template) {
      sectionData = template.sections
      pricingData = template.pricingItems
    }
  }

  // Auto-create a deal if client info is provided and no existing deal is linked
  let resolvedDealId = dealId || null
  if (!resolvedDealId && clientCompanyName && clientContactName) {
    const deal = await prisma.deal.create({
      data: {
        company: company || 'RABORN_MEDIA',
        companyName: clientCompanyName,
        contactName: clientContactName,
        contactEmail: clientContactEmail || null,
        industry: industry || null,
        serviceType: serviceType || null,
        value: parseFloat(dealValue) || 0,
        ownerId: session.user.id!,
        stage: 'LEAD',
      },
    })
    resolvedDealId = deal.id

    await prisma.activity.create({
      data: {
        dealId: deal.id,
        type: 'DEAL_CREATED',
        description: 'Deal auto-created with proposal',
        userId: session.user.id!,
      },
    })
  }

  const proposal = await prisma.proposal.create({
    data: {
      title,
      dealId: resolvedDealId,
      company: company || 'RABORN_MEDIA',
      industry: industry || null,
      serviceType: serviceType || null,
      sections: sectionData,
      pricingItems: pricingData,
      pricingMode: pricingMode || 'line_items',
      pricingTiers: pricingTiers ? JSON.stringify(pricingTiers) : '[]',
      services: services ? JSON.stringify(services) : '[]',
      repName: repName || null,
      repTitle: repTitle || null,
      repEmail: repEmail || null,
      repPhone: repPhone || null,
      isTemplate: isTemplate || false,
      templateName: templateName || null,
      createdById: session.user.id!,
    },
    include: {
      deal: { select: { id: true, companyName: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })

  // Auto-advance deal to "Proposal Created" stage
  if (resolvedDealId) {
    await advanceDealStage(
      resolvedDealId,
      'QUALIFICATION',
      session.user.id!,
      `Proposal "${title}" created — deal moved to Proposal Created`
    )
  }

  return NextResponse.json(proposal, { status: 201 })
}
