export const PIPELINE_STAGES = [
  'LEAD',
  'QUALIFICATION',
  'PENDING_APPROVAL',
  'APPROVED',
  'PROPOSAL_SENT',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const

export const PROPOSAL_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
  'SIGNED',
  'DECLINED',
] as const

export const USER_ROLES = ['ADMIN', 'MANAGER', 'SALES_REP'] as const

export const ASSET_TYPES = ['IMAGE', 'DOCUMENT', 'TEXT_BLOCK'] as const

export const APPROVAL_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CHANGES_REQUESTED',
] as const

export const STAGE_COLORS: Record<string, string> = {
  LEAD: '#94a3b8',
  QUALIFICATION: '#003964',
  PENDING_APPROVAL: '#f59e0b',
  APPROVED: '#8b5cf6',
  PROPOSAL_SENT: '#625AED',
  CLOSED_WON: '#22c55e',
  CLOSED_LOST: '#ef4444',
}
