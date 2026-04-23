import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { SignedProposalPDF } from '@/lib/pdf/signed-proposal'
import { getCompanyBranding } from '@/lib/companies'
import React from 'react'

// Public endpoint — clients can download their signed copy using their token
// Only returns the PDF if the proposal has been SIGNED via this exact token.
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const clientAccess = await prisma.clientAccess.findUnique({
    where: { token },
    include: {
      proposal: {
        include: { deal: true },
      },
    },
  })

  if (!clientAccess) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (clientAccess.status !== 'SIGNED') {
    return NextResponse.json({ error: 'This proposal has not been signed' }, { status: 400 })
  }

  const proposal = clientAccess.proposal
  const branding = getCompanyBranding(proposal.company)
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
          id: clientAccess.id,
          signedAt: clientAccess.signedAt,
          signedByName: clientAccess.signedByName,
          signedByEmail: clientAccess.signedByEmail,
          signedByTitle: clientAccess.signedByTitle,
          signedByPhone: clientAccess.signedByPhone,
          signatureImage: clientAccess.signatureImage,
          signatureMode: clientAccess.signatureMode,
          ipAddress: clientAccess.ipAddress,
          documentHash: clientAccess.documentHash,
          signedVersion: clientAccess.signedVersion,
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
