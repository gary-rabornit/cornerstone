'use client'

import { useState } from 'react'
import { ProposalRenderer } from './proposal-renderer'
import { SignatureSection } from './signature-section'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'

interface Props {
  token: string
  proposalTitle: string
  proposalVersion: number
  clientCompanyName?: string
  dealValue?: number
  rabornCompany: string

  // Proposal renderer props
  rendererProps: {
    title: string
    company: string
    sections: ProposalSection[]
    pricingItems: PricingItem[]
    pricingMode: string
    pricingTiers: PricingTier[]
    services: ServiceItem[]
    repName: string | null
    repTitle: string | null
    repEmail: string | null
    repPhone: string | null
    clientName: string
    companyName: string
    createdAt: string
    showBranding: boolean
  }
}

export function ClientSigningShell({
  token,
  proposalTitle,
  proposalVersion,
  clientCompanyName,
  dealValue,
  rabornCompany,
  rendererProps,
}: Props) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedPlanLabel, setSelectedPlanLabel] = useState<string | null>(null)
  const [selectedSolutionName, setSelectedSolutionName] = useState<string | null>(null)

  const isRabornPricing = rendererProps.pricingMode === 'raborn'

  const handleSelectPlan = (planId: string, label: string, solutionName: string) => {
    setSelectedPlanId(planId)
    setSelectedPlanLabel(label)
    setSelectedSolutionName(solutionName)
  }

  return (
    <div>
      <ProposalRenderer
        {...rendererProps}
        selectedPlanId={selectedPlanId}
        onSelectPlan={isRabornPricing ? handleSelectPlan : undefined}
      />
      <SignatureSection
        token={token}
        proposalTitle={proposalTitle}
        proposalVersion={proposalVersion}
        clientCompanyName={clientCompanyName}
        dealValue={dealValue}
        rabornCompany={rabornCompany}
        requiresPlanSelection={isRabornPricing}
        selectedPlanId={selectedPlanId}
        selectedPlanLabel={selectedPlanLabel}
        selectedSolutionName={selectedSolutionName}
      />
    </div>
  )
}
