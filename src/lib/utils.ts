import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    LEAD: 'bg-gray-100 text-gray-700',
    QUALIFICATION: 'bg-blue-100 text-blue-700',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-violet-100 text-violet-700',
    PROPOSAL_SENT: 'bg-purple-100 text-purple-700',
    CLOSED_WON: 'bg-green-100 text-green-700',
    CLOSED_LOST: 'bg-red-100 text-red-700',
  }
  return colors[stage] || 'bg-gray-100 text-gray-700'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    SENT: 'bg-purple-100 text-purple-700',
    SIGNED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getStageName(stage: string): string {
  const names: Record<string, string> = {
    LEAD: 'Lead',
    QUALIFICATION: 'Proposal Created',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    PROPOSAL_SENT: 'Proposal Sent',
    CLOSED_WON: 'Deal Won',
    CLOSED_LOST: 'Deal Lost',
  }
  return names[stage] || stage
}

export function getStatusName(status: string): string {
  const names: Record<string, string> = {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    SENT: 'Sent',
    SIGNED: 'Signed',
    DECLINED: 'Declined',
  }
  return names[status] || status
}
