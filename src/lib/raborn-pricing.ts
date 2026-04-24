// Raborn IT & Raborn Software Master Pricing
// Source: Raborn IT - Master Pricing Sheet.xlsx (kept in project root)

export type PricingMode = 'monthly_flex' | 'project'
export type SolutionTier = 'focused' | 'recommended' | 'expanded'

/**
 * Monthly Flex pricing: Hours per month → Monthly cost for each commitment term.
 * Discount % auto-calculated vs the 3-month (baseline) rate.
 */
export interface MonthlyFlexRow {
  hours: number
  monthly: { 3: number; 6: number; 12: number; 24: number }   // monthly cost
  discount: { 3: number; 6: number; 12: number; 24: number }   // decimal 0..1
}

export const MONTHLY_FLEX_ROWS: MonthlyFlexRow[] = [
  { hours: 10,  monthly: { 3: 1500,  6: 1500,  12: 1440,  24: 1400  }, discount: { 3: 0,    6: 0,    12: 0.06, 24: 0.10 } },
  { hours: 15,  monthly: { 3: 2250,  6: 2205,  12: 2130,  24: 2085  }, discount: { 3: 0,    6: 0.03, 12: 0.08, 24: 0.11 } },
  { hours: 20,  monthly: { 3: 3000,  6: 2920,  12: 2800,  24: 2760  }, discount: { 3: 0,    6: 0.04, 12: 0.10, 24: 0.12 } },
  { hours: 25,  monthly: { 3: 3750,  6: 3625,  12: 3450,  24: 3400  }, discount: { 3: 0,    6: 0.05, 12: 0.12, 24: 0.14 } },
  { hours: 30,  monthly: { 3: 4380,  6: 4320,  12: 4080,  24: 4020  }, discount: { 3: 0.04, 6: 0.06, 12: 0.14, 24: 0.16 } },
  { hours: 40,  monthly: { 3: 5760,  6: 5680,  12: 5360,  24: 5280  }, discount: { 3: 0.06, 6: 0.08, 12: 0.16, 24: 0.18 } },
  { hours: 50,  monthly: { 3: 7100,  6: 7000,  12: 6500,  24: 6400  }, discount: { 3: 0.08, 6: 0.10, 12: 0.20, 24: 0.22 } },
  { hours: 60,  monthly: { 3: 8400,  6: 8280,  12: 7800,  24: 7680  }, discount: { 3: 0.10, 6: 0.12, 12: 0.20, 24: 0.22 } },
  { hours: 80,  monthly: { 3: 11200, 6: 11040, 12: 10400, 24: 10240 }, discount: { 3: 0.10, 6: 0.12, 12: 0.20, 24: 0.22 } },
  { hours: 100, monthly: { 3: 14000, 6: 13600, 12: 13000, 24: 12800 }, discount: { 3: 0.10, 6: 0.14, 12: 0.20, 24: 0.22 } },
  { hours: 120, monthly: { 3: 16800, 6: 16320, 12: 15600, 24: 15360 }, discount: { 3: 0.10, 6: 0.14, 12: 0.20, 24: 0.22 } },
  { hours: 140, monthly: { 3: 19600, 6: 19040, 12: 18200, 24: 17920 }, discount: { 3: 0.10, 6: 0.14, 12: 0.20, 24: 0.22 } },
  { hours: 160, monthly: { 3: 22400, 6: 21760, 12: 20800, 24: 20480 }, discount: { 3: 0.10, 6: 0.14, 12: 0.20, 24: 0.22 } },
  { hours: 180, monthly: { 3: 25200, 6: 24480, 12: 23400, 24: 23040 }, discount: { 3: 0.10, 6: 0.14, 12: 0.20, 24: 0.22 } },
  { hours: 200, monthly: { 3: 28000, 6: 27200, 12: 26000, 24: 25600 }, discount: { 3: 0,    6: 0.14, 12: 0.20, 24: 0.22 } },
]

export const MONTHLY_FLEX_TERMS = [3, 6, 12, 24] as const
export type MonthlyFlexTerm = typeof MONTHLY_FLEX_TERMS[number]

export const MONTHLY_FLEX_HOUR_OPTIONS = MONTHLY_FLEX_ROWS.map(r => r.hours)

/**
 * Project pricing: monthly hours, total (6 months), monthly cost, total cost, discount.
 */
export interface ProjectRow {
  monthlyHours: number
  totalHours: number
  monthlyCost: number
  totalCost: number
  discount: number
}

export const PROJECT_ROWS: ProjectRow[] = [
  { monthlyHours: 10,    totalHours: 60,    monthlyCost: 1500,    totalCost: 9000,    discount: 0 },
  { monthlyHours: 12.5,  totalHours: 75,    monthlyCost: 1875,    totalCost: 11250,   discount: 0 },
  { monthlyHours: 15,    totalHours: 90,    monthlyCost: 2205,    totalCost: 13230,   discount: 0.03 },
  { monthlyHours: 17.5,  totalHours: 105,   monthlyCost: 2572.5,  totalCost: 15435,   discount: 0.03 },
  { monthlyHours: 20,    totalHours: 120,   monthlyCost: 2920,    totalCost: 17520,   discount: 0.04 },
  { monthlyHours: 22.5,  totalHours: 135,   monthlyCost: 3285,    totalCost: 19710,   discount: 0.04 },
  { monthlyHours: 25,    totalHours: 150,   monthlyCost: 3625,    totalCost: 21750,   discount: 0.05 },
  { monthlyHours: 27.5,  totalHours: 165,   monthlyCost: 3987.5,  totalCost: 23925,   discount: 0.05 },
  { monthlyHours: 30,    totalHours: 180,   monthlyCost: 4320,    totalCost: 25920,   discount: 0.06 },
  { monthlyHours: 35,    totalHours: 210,   monthlyCost: 5040,    totalCost: 30240,   discount: 0.06 },
  { monthlyHours: 40,    totalHours: 240,   monthlyCost: 5680,    totalCost: 34080,   discount: 0.08 },
  { monthlyHours: 45,    totalHours: 270,   monthlyCost: 6390,    totalCost: 38340,   discount: 0.08 },
  { monthlyHours: 50,    totalHours: 300,   monthlyCost: 7000,    totalCost: 42000,   discount: 0.10 },
  { monthlyHours: 55,    totalHours: 330,   monthlyCost: 7700,    totalCost: 46200,   discount: 0.10 },
  { monthlyHours: 60,    totalHours: 360,   monthlyCost: 8280,    totalCost: 49680,   discount: 0.12 },
  { monthlyHours: 70,    totalHours: 420,   monthlyCost: 9660,    totalCost: 57960,   discount: 0.12 },
  { monthlyHours: 80,    totalHours: 480,   monthlyCost: 11040,   totalCost: 66240,   discount: 0.12 },
  { monthlyHours: 90,    totalHours: 540,   monthlyCost: 12420,   totalCost: 74520,   discount: 0.12 },
  { monthlyHours: 100,   totalHours: 600,   monthlyCost: 13600,   totalCost: 81600,   discount: 0.14 },
  { monthlyHours: 110,   totalHours: 660,   monthlyCost: 14960,   totalCost: 89760,   discount: 0.14 },
  { monthlyHours: 120,   totalHours: 720,   monthlyCost: 16320,   totalCost: 97920,   discount: 0.14 },
  { monthlyHours: 130,   totalHours: 780,   monthlyCost: 17680,   totalCost: 106080,  discount: 0.14 },
  { monthlyHours: 140,   totalHours: 840,   monthlyCost: 19040,   totalCost: 114240,  discount: 0.14 },
  { monthlyHours: 150,   totalHours: 900,   monthlyCost: 20400,   totalCost: 122400,  discount: 0.14 },
  { monthlyHours: 160,   totalHours: 960,   monthlyCost: 21760,   totalCost: 130560,  discount: 0.14 },
  { monthlyHours: 170,   totalHours: 1020,  monthlyCost: 23120,   totalCost: 138720,  discount: 0.14 },
  { monthlyHours: 180,   totalHours: 1080,  monthlyCost: 24480,   totalCost: 146880,  discount: 0.14 },
  { monthlyHours: 190,   totalHours: 1140,  monthlyCost: 25840,   totalCost: 155040,  discount: 0.14 },
  { monthlyHours: 200,   totalHours: 1200,  monthlyCost: 27200,   totalCost: 163200,  discount: 0.14 },
]

export const PROJECT_HOUR_OPTIONS = PROJECT_ROWS.map(r => r.monthlyHours)

// ── Lookup helpers ──────────────────────────────────────────────────

export function lookupMonthlyFlex(hours: number): MonthlyFlexRow | null {
  return MONTHLY_FLEX_ROWS.find(r => r.hours === hours) || null
}

export function lookupProject(monthlyHours: number): ProjectRow | null {
  return PROJECT_ROWS.find(r => r.monthlyHours === monthlyHours) || null
}

// ── Solution tier defaults ─────────────────────────────────────────
// Each tier comes with sensible defaults the rep can tweak.

export interface RabornSolution {
  tier: SolutionTier
  name: string
  description: string
  // For monthly_flex
  hours: number      // monthly hours
  term: MonthlyFlexTerm  // commitment term in months (for flex)
  // For project
  projectMonthlyHours: number
  recommended: boolean
  color: string
  accentBg: string
  accentText: string
}

export const DEFAULT_SOLUTIONS: RabornSolution[] = [
  {
    tier: 'focused',
    name: 'Focused Solution',
    description: 'Targeted scope addressing your highest-priority needs.',
    hours: 20,
    term: 6,
    projectMonthlyHours: 15,
    recommended: false,
    color: '#EF4444',
    accentBg: '#FEF2F2',
    accentText: '#B91C1C',
  },
  {
    tier: 'recommended',
    name: 'Recommended Solution',
    description: 'Balanced coverage to deliver meaningful results across your key initiatives.',
    hours: 40,
    term: 12,
    projectMonthlyHours: 25,
    recommended: true,
    color: '#00CFF8',
    accentBg: '#ECFEFF',
    accentText: '#0E7490',
  },
  {
    tier: 'expanded',
    name: 'Expanded Solution',
    description: 'Full-scope engagement with maximum capacity and strategic depth.',
    hours: 80,
    term: 12,
    projectMonthlyHours: 50,
    recommended: false,
    color: '#10B981',
    accentBg: '#F0FDF4',
    accentText: '#15803D',
  },
]

// ── Proposal data shape ────────────────────────────────────────────

export interface RabornPricingData {
  mode: PricingMode
  solutions: RabornSolution[]
}

export const DEFAULT_RABORN_PRICING: RabornPricingData = {
  mode: 'monthly_flex',
  solutions: DEFAULT_SOLUTIONS,
}
