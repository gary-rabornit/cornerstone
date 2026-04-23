import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { SignedProposalPDF } from '@/lib/pdf/signed-proposal'
import { getCompanyBranding } from '@/lib/companies'
import React from 'react'

// Node runtime — @react-pdf/renderer needs Node APIs (not Edge)
export const runtime = 'nodejs'

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
      deal: true,
      clientAccess: true,
    },
  })

  if (!proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  if (!proposal.clientAccess || proposal.clientAccess.status !== 'SIGNED') {
    return NextResponse.json({ error: 'Proposal has not been signed' }, { status: 400 })
  }

  const branding = getCompanyBranding(proposal.company)

  // Build absolute URL for the logo so @react-pdf can fetch it
  const origin = request.nextUrl.origin
  const rabornLogoUrl = `${origin}${branding.logo}`

  try {
    const buffer = await renderToBuffer(
      React.createElement(SignedProposalPDF, {
        proposal: {
          id: proposal.id,
          title: proposal.title,
          company: proposal.company,
          industry: proposal.industry,
          serviceType: proposal.serviceType,
          sections: proposal.sections,
          pricingItems: proposal.pricingItems,
          pricingMode: proposal.pricingMode,
          pricingTiers: proposal.pricingTiers,
          services: proposal.services,
          repName: proposal.repName,
          repTitle: proposal.repTitle,
          repEmail: proposal.repEmail,
          repPhone: proposal.repPhone,
          version: proposal.version,
          deal: proposal.deal ? {
            companyName: proposal.deal.companyName,
            contactName: proposal.deal.contactName,
            contactEmail: proposal.deal.contactEmail,
            value: proposal.deal.value,
          } : null,
        },
        access: {
          id: proposal.clientAccess.id,
          signedAt: proposal.clientAccess.signedAt,
          signedByName: proposal.clientAccess.signedByName,
          signedByEmail: proposal.clientAccess.signedByEmail,
          signedByTitle: proposal.clientAccess.signedByTitle,
          signedByPhone: proposal.clientAccess.signedByPhone,
          signatureImage: proposal.clientAccess.signatureImage,
          signatureMode: proposal.clientAccess.signatureMode,
          ipAddress: proposal.clientAccess.ipAddress,
          documentHash: proposal.clientAccess.documentHash,
          signedVersion: proposal.clientAccess.signedVersion,
        },
        rabornLogoUrl,
      })
    )

    const safeTitle = proposal.title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const filename = `Signed-${safeTitle}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('Failed to generate signed PDF:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
