import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { renderToBuffer } from '@react-pdf/renderer'
import { CertificatePDF } from '@/lib/pdf/certificate'
import { getCompanyBranding } from '@/lib/companies'
import React from 'react'

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

  if (!proposal.clientAccess) {
    return NextResponse.json({ error: 'Proposal has not been sent to a client' }, { status: 400 })
  }

  const branding = getCompanyBranding(proposal.company)
  const origin = request.nextUrl.origin
  const rabornLogoUrl = `${origin}${branding.logo}`

  try {
    const buffer = await renderToBuffer(
      React.createElement(CertificatePDF, {
        proposal: {
          id: proposal.id,
          title: proposal.title,
          company: proposal.company,
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
          status: proposal.clientAccess.status,
          signedAt: proposal.clientAccess.signedAt,
          signedByName: proposal.clientAccess.signedByName,
          signedByEmail: proposal.clientAccess.signedByEmail,
          signedByTitle: proposal.clientAccess.signedByTitle,
          signedByPhone: proposal.clientAccess.signedByPhone,
          signatureImage: proposal.clientAccess.signatureImage,
          signatureMode: proposal.clientAccess.signatureMode,
          ipAddress: proposal.clientAccess.ipAddress,
          userAgent: proposal.clientAccess.userAgent,
          documentHash: proposal.clientAccess.documentHash,
          signedVersion: proposal.clientAccess.signedVersion,
          consentedAt: proposal.clientAccess.consentedAt,
          auditTrail: proposal.clientAccess.auditTrail,
          viewCount: proposal.clientAccess.viewCount,
          viewedAt: proposal.clientAccess.viewedAt,
          createdAt: proposal.clientAccess.createdAt,
        },
        rabornLogoUrl,
      })
    )

    const safeTitle = proposal.title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const filename = `Certificate-${safeTitle}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('Failed to generate certificate PDF:', err)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}
