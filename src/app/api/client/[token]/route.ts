import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const clientAccess = await prisma.clientAccess.findUnique({
    where: { token },
    include: {
      proposal: {
        include: {
          deal: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
              value: true,
            },
          },
        },
      },
    },
  })

  if (!clientAccess) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Update viewedAt on first view, always increment viewCount
  const updateData: Record<string, unknown> = {
    viewCount: clientAccess.viewCount + 1,
  }
  if (!clientAccess.viewedAt) {
    updateData.viewedAt = new Date()
  }

  await prisma.clientAccess.update({
    where: { id: clientAccess.id },
    data: updateData,
  })

  const proposal = clientAccess.proposal

  return NextResponse.json({
    proposal: {
      id: proposal.id,
      title: proposal.title,
      sections: JSON.parse(proposal.sections),
      pricingItems: JSON.parse(proposal.pricingItems),
      version: proposal.version,
      expiresAt: proposal.expiresAt,
    },
    deal: proposal.deal,
    status: clientAccess.status,
    signedAt: clientAccess.signedAt,
  })
}
