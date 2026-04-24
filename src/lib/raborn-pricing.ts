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
// Each tier has exactly 2 options the client picks from.

export interface RabornSolutionOption {
  id: string          // stable ID — used by client to select this plan
  label: string       // e.g., "Option A"
  hours: number       // for monthly_flex
  term: MonthlyFlexTerm
  projectMonthlyHours: number  // for project
}

export interface RabornSolution {
  tier: SolutionTier
  name: string
  description: string
  options: RabornSolutionOption[]   // always length 2
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
    recommended: false,
    color: '#EF4444',
    accentBg: '#FEF2F2',
    accentText: '#B91C1C',
    options: [
      { id: 'focused-a', label: 'Option A', hours: 20, term: 6,  projectMonthlyHours: 15 },
      { id: 'focused-b', label: 'Option B', hours: 25, term: 12, projectMonthlyHours: 20 },
    ],
  },
  {
    tier: 'recommended',
    name: 'Balanced Solution',
    description: 'Balanced coverage to deliver meaningful results across your key initiatives.',
    recommended: true,
    color: '#00CFF8',
    accentBg: '#ECFEFF',
    accentText: '#0E7490',
    options: [
      { id: 'balanced-a', label: 'Option A', hours: 40, term: 12, projectMonthlyHours: 25 },
      { id: 'balanced-b', label: 'Option B', hours: 50, term: 24, projectMonthlyHours: 30 },
    ],
  },
  {
    tier: 'expanded',
    name: 'Expanded Solution',
    description: 'Full-scope engagement with maximum capacity and strategic depth.',
    recommended: false,
    color: '#10B981',
    accentBg: '#F0FDF4',
    accentText: '#15803D',
    options: [
      { id: 'expanded-a', label: 'Option A', hours: 80,  term: 12, projectMonthlyHours: 50 },
      { id: 'expanded-b', label: 'Option B', hours: 100, term: 24, projectMonthlyHours: 60 },
    ],
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

// ── Migration helper for legacy single-option format ───────────────

interface LegacySolution {
  tier?: SolutionTier
  name?: string
  description?: string
  hours?: number
  term?: MonthlyFlexTerm
  projectMonthlyHours?: number
  options?: RabornSolutionOption[]
  recommended?: boolean
  color?: string
  accentBg?: string
  accentText?: string
}

/**
 * Migrates a solution object to the new 2-option format. If the solution already has
 * an `options` array, returns it as-is. Otherwise, builds `options` from legacy fields.
 */
export function migrateSolution(raw: LegacySolution, idx: number): RabornSolution {
  const defaults = DEFAULT_SOLUTIONS[idx] ?? DEFAULT_SOLUTIONS[0]

  // Already migrated
  if (Array.isArray(raw.options) && raw.options.length >= 2) {
    return {
      tier: raw.tier ?? defaults.tier,
      name: raw.name ?? defaults.name,
      description: raw.description ?? defaults.description,
      options: raw.options.slice(0, 2) as RabornSolutionOption[],
      recommended: raw.recommended ?? defaults.recommended,
      color: raw.color ?? defaults.color,
      accentBg: raw.accentBg ?? defaults.accentBg,
      accentText: raw.accentText ?? defaults.accentText,
    }
  }

  // Legacy format → build 2 options, first from the saved values, second from defaults
  const tier = raw.tier ?? defaults.tier
  const firstOption: RabornSolutionOption = {
    id: `${tier}-a`,
    label: 'Option A',
    hours: raw.hours ?? defaults.options[0].hours,
    term: raw.term ?? defaults.options[0].term,
    projectMonthlyHours: raw.projectMonthlyHours ?? defaults.options[0].projectMonthlyHours,
  }
  const secondOption: RabornSolutionOption = {
    id: `${tier}-b`,
    label: 'Option B',
    hours: defaults.options[1].hours,
    term: defaults.options[1].term,
    projectMonthlyHours: defaults.options[1].projectMonthlyHours,
  }

  return {
    tier,
    name: raw.name ?? defaults.name,
    description: raw.description ?? defaults.description,
    options: [firstOption, secondOption],
    recommended: raw.recommended ?? defaults.recommended,
    color: raw.color ?? defaults.color,
    accentBg: raw.accentBg ?? defaults.accentBg,
    accentText: raw.accentText ?? defaults.accentText,
  }
}

/**
 * Migrates a full RabornPricingData blob. Safe to call on both old and new data.
 */
export function migrateRabornPricing(raw: unknown): RabornPricingData {
  if (!raw || typeof raw !== 'object') return DEFAULT_RABORN_PRICING
  const obj = raw as { mode?: PricingMode; solutions?: LegacySolution[] }
  const mode: PricingMode = obj.mode === 'project' ? 'project' : 'monthly_flex'
  const solutions = Array.isArray(obj.solutions) && obj.solutions.length > 0
    ? obj.solutions.map((s, i) => migrateSolution(s, i))
    : DEFAULT_SOLUTIONS
  return { mode, solutions }
}

// ── Pricing calculation helpers ──────────────────────────────────

export interface OptionPricing {
  monthlyCost: number
  discount: number
  totalCost: number
  savings: number
  agreementLabel: string
  hoursLabel: string
}

export function calculateOptionPricing(
  option: RabornSolutionOption,
  mode: PricingMode
): OptionPricing {
  if (mode === 'monthly_flex') {
    const row = lookupMonthlyFlex(option.hours)
    const monthlyCost = row?.monthly[option.term] ?? 0
    const discount = row?.discount[option.term] ?? 0
    const totalCost = monthlyCost * option.term
    const fullPrice = (row?.monthly[3] ?? 0) * option.term
    const savings = Math.max(0, fullPrice - totalCost)
    return {
      monthlyCost,
      discount,
      totalCost,
      savings,
      agreementLabel: `${option.term}-Month Agreement`,
      hoursLabel: `${option.hours} Hours / month`,
    }
  } else {
    const row = lookupProject(option.projectMonthlyHours)
    const monthlyCost = row?.monthlyCost ?? 0
    const discount = row?.discount ?? 0
    const totalCost = row?.totalCost ?? 0
    const fullPrice = row ? (row.monthlyCost / Math.max(1 - row.discount, 0.0001)) * 6 : 0
    const savings = Math.max(0, fullPrice - totalCost)
    return {
      monthlyCost,
      discount,
      totalCost,
      savings,
      agreementLabel: '6-Month Agreement',
      hoursLabel: `${row?.totalHours ?? 0} Total Hours`,
    }
  }
}
