import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { advanceDealStage } from '@/lib/deal-stage'
import { sendEmail } from '@/lib/email'
import { signedConfirmationToClientEmail, signedNotificationToInternalEmail } from '@/lib/email-signing'
import { getCompanyBranding } from '@/lib/companies'
import { createHash } from 'crypto'

interface AuditEvent {
  timestamp: string
  event: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIp) return realIp.trim()
  return 'unknown'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await request.json()
  const {
    signedByName,
    signedByEmail,
    signedByTitle,
    signedByPhone,
    signatureImage,
    signatureMode,
    consentedToElectronicSig,
    selectedPlanId,
    selectedPlanLabel,
    selectedSolutionName,
    status,
  } = body

  if (!status || !['SIGNED', 'DECLINED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // For SIGNED status, enforce consent and required signer fields
  if (status === 'SIGNED') {
    if (!consentedToElectronicSig) {
      return NextResponse.json(
        { error: 'Electronic signature consent is required' },
        { status: 400 }
      )
    }
    if (!signedByName || !signedByEmail || !signedByTitle || !signedByPhone) {
      return NextResponse.json(
        { error: 'Name, email, title, and phone number are all required to sign' },
        { status: 400 }
      )
    }
  }

  const clientAccess = await prisma.clientAccess.findUnique({
    where: { token },
    include: {
      proposal: {
        include: { deal: true },
      },
    },
  })

  // Server-side enforcement: if the proposal uses Raborn pricing,
  // the client MUST select one of the 6 options before signing.
  if (status === 'SIGNED' && clientAccess?.proposal.pricingMode === 'raborn' && !selectedPlanId) {
    return NextResponse.json(
      { error: 'You must select one of the pricing options before signing.' },
      { status: 400 }
    )
  }

  if (!clientAccess) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (clientAccess.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'This proposal has already been responded to' },
      { status: 400 }
    )
  }

  const proposal = clientAccess.proposal
  const ipAddress = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const signedAt = new Date()

  // Build the document snapshot — the exact content the signer agreed to
  const documentSnapshot = {
    proposalId: proposal.id,
    title: proposal.title,
    version: proposal.version,
    company: proposal.company,
    sections: proposal.sections,
    pricingItems: proposal.pricingItems,
    pricingMode: proposal.pricingMode,
    pricingTiers: proposal.pricingTiers,
    services: proposal.services,
    industry: proposal.industry,
    serviceType: proposal.serviceType,
    repName: proposal.repName,
    repTitle: proposal.repTitle,
    repEmail: proposal.repEmail,
    repPhone: proposal.repPhone,
    deal: proposal.deal ? {
      companyName: proposal.deal.companyName,
      contactName: proposal.deal.contactName,
      contactEmail: proposal.deal.contactEmail,
      value: proposal.deal.value,
    } : null,
    snapshotAt: signedAt.toISOString(),
  }

  const documentSnapshotJson = JSON.stringify(documentSnapshot)
  const documentHash = createHash('sha256').update(documentSnapshotJson).digest('hex')

  // Build the audit trail — preserves existing events and appends new ones
  let existingAudit: AuditEvent[] = []
  try {
    existingAudit = JSON.parse(clientAccess.auditTrail || '[]')
  } catch {
    existingAudit = []
  }

  const newEvents: AuditEvent[] = []

  if (status === 'SIGNED') {
    newEvents.push({
      timestamp: signedAt.toISOString(),
      event: 'CONSENT_GIVEN',
      details: {
        consentText: 'Signer consented to electronic signature under E-SIGN Act and UETA',
      },
      ipAddress,
      userAgent,
    })
    if (selectedPlanId) {
      newEvents.push({
        timestamp: signedAt.toISOString(),
        event: 'PLAN_SELECTED',
        details: {
          selectedPlanId,
          selectedPlanLabel,
          selectedSolutionName,
        },
        ipAddress,
        userAgent,
      })
    }
    newEvents.push({
      timestamp: signedAt.toISOString(),
      event: 'SIGNATURE_CAPTURED',
      details: {
        signedByName,
        signedByEmail,
        signedByTitle: signedByTitle || null,
        signedByPhone: signedByPhone || null,
        signatureMode: signatureMode || 'unknown',
        documentVersion: proposal.version,
        documentHash,
        selectedPlanId: selectedPlanId || null,
        selectedPlanLabel: selectedPlanLabel || null,
        selectedSolutionName: selectedSolutionName || null,
      },
      ipAddress,
      userAgent,
    })
    newEvents.push({
      timestamp: signedAt.toISOString(),
      event: 'DOCUMENT_SNAPSHOT_CREATED',
      details: {
        hashAlgorithm: 'SHA-256',
        hash: documentHash,
      },
      ipAddress,
      userAgent,
    })
  } else {
    newEvents.push({
      timestamp: signedAt.toISOString(),
      event: 'PROPOSAL_DECLINED',
      details: {
        declinedByName: signedByName,
        declinedByEmail: signedByEmail,
      },
      ipAddress,
      userAgent,
    })
  }

  const fullAuditTrail = [...existingAudit, ...newEvents]

  // Update ClientAccess with all compliance data
  const updated = await prisma.clientAccess.update({
    where: { id: clientAccess.id },
    data: {
      status,
      signedByName: signedByName || null,
      signedByEmail: signedByEmail || null,
      signedByTitle: signedByTitle || null,
      signedByPhone: signedByPhone || null,
      signatureImage: signatureImage || null,
      signatureMode: signatureMode || null,
      signedAt,
      selectedPlanId: selectedPlanId || null,
      selectedPlanLabel: selectedPlanLabel && selectedSolutionName
        ? `${selectedSolutionName} · ${selectedPlanLabel}`
        : selectedPlanLabel || null,
      ...(status === 'SIGNED' && {
        consentedToElectronicSig: true,
        consentedAt: signedAt,
        ipAddress,
        userAgent,
        documentSnapshot: documentSnapshotJson,
        documentHash,
        signedVersion: proposal.version,
      }),
      auditTrail: JSON.stringify(fullAuditTrail),
    },
  })

  const proposalStatus = status === 'SIGNED' ? 'SIGNED' : 'DECLINED'
  await prisma.proposal.update({
    where: { id: clientAccess.proposalId },
    data: { status: proposalStatus },
  })

  const actionLabel = status === 'SIGNED' ? 'signed' : 'declined'

  await createNotification({
    userId: proposal.createdById,
    type: `PROPOSAL_${status}`,
    message: `${signedByName || 'Client'} ${actionLabel} proposal "${proposal.title}"`,
    relatedId: proposal.id,
    relatedType: 'proposal',
  })

  if (proposal.dealId) {
    await prisma.activity.create({
      data: {
        dealId: proposal.dealId,
        type: `PROPOSAL_${status}`,
        description: `${signedByName || 'Client'} ${actionLabel} proposal "${proposal.title}"`,
        userId: proposal.createdById,
      },
    })

    const targetStage = status === 'SIGNED' ? 'CLOSED_WON' : 'CLOSED_LOST'
    const stageDesc = status === 'SIGNED'
      ? `Client signed proposal "${proposal.title}" — deal closed won`
      : `Client declined proposal "${proposal.title}" — deal closed lost`
    await advanceDealStage(proposal.dealId, targetStage, proposal.createdById, stageDesc)
  }

  // ─── Signing confirmation emails ───────────────────────────────
  if (status === 'SIGNED' && signedByEmail) {
    const referenceId = updated.id.slice(0, 12).toUpperCase()
    const signedAtFormatted = signedAt.toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    })
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const signedPdfUrl = `${APP_URL}/api/client/${token}/signed-pdf`
    const auditTrailUrl = `${APP_URL}/proposals/${proposal.id}/audit-trail`
    const rabornCompanyName = getCompanyBranding(proposal.company).name

    // 1) Confirmation email to the signer (client)
    const clientEmail = signedConfirmationToClientEmail({
      signerName: signedByName || 'there',
      proposalTitle: proposal.title,
      clientCompanyName: proposal.deal?.companyName,
      signedAt: signedAtFormatted,
      referenceId,
      rabornCompany: rabornCompanyName,
      signedPdfUrl,
    })
    sendEmail({ to: signedByEmail, subject: clientEmail.subject, html: clientEmail.html }).catch(() => {})

    // 2) Notification email to the internal proposal creator
    const creator = await prisma.user.findUnique({
      where: { id: proposal.createdById },
      select: { name: true, email: true },
    })
    if (creator?.email) {
      const internalEmail = signedNotificationToInternalEmail({
        recipientName: creator.name || 'there',
        signerName: signedByName || 'The client',
        signerEmail: signedByEmail,
        signerTitle: signedByTitle,
        proposalTitle: proposal.title,
        clientCompanyName: proposal.deal?.companyName,
        signedAt: signedAtFormatted,
        referenceId,
        auditTrailUrl,
      })
      sendEmail({ to: creator.email, subject: internalEmail.subject, html: internalEmail.html }).catch(() => {})
    }
  }

  return NextResponse.json({
    success: true,
    signedAt: updated.signedAt?.toISOString(),
    referenceId: updated.id.slice(0, 12).toUpperCase(),
    documentHash,
  })
}
