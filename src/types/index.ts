import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export interface ProposalSection {
  id: string
  type: 'cover' | 'table_of_contents' | 'services_overview' | 'scope' | 'services_detail' | 'pricing' | 'terms' | 'signature'
  title: string
  content: string
  order: number
}

export interface PricingItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ServiceItem {
  id: string
  name: string
  icon: string
  enabled: boolean
}

export interface PricingTier {
  id: string
  name: string
  description: string
  hours: number
  monthlyCost: number
  months: number
  discount: number
  totalCost: number
  recommended?: boolean
}

export interface DealWithRelations {
  id: string
  companyName: string
  contactName: string
  contactEmail: string | null
  value: number
  stage: string
  stageEnteredAt: string
  ownerId: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  proposals: {
    id: string
    title: string
    status: string
  }[]
  _count?: {
    proposals: number
  }
}
