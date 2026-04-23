/* eslint-disable @next/next/no-img-element */
import { COMPANIES, type CompanyKey } from '@/lib/companies'

/**
 * Renders a company logo at a visually balanced size.
 *
 * Raborn IT's logo is ultra-wide (5:1), so at the same height it looks much
 * larger than the other two. We compensate by rendering it slightly shorter.
 */

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Heights in pixels: [raborn-media, raborn-it, raborn-software]
const SIZE_MAP: Record<Size, [number, number, number]> = {
  xs: [29, 16, 22],
  sm: [37, 20, 30],
  md: [49, 27, 40],
  lg: [61, 33, 49],
  xl: [84, 44, 69],
}

interface CompanyLogoProps {
  companyKey: CompanyKey | string
  size?: Size
  className?: string
}

export function CompanyLogo({ companyKey, size = 'md', className = '' }: CompanyLogoProps) {
  const co = COMPANIES[companyKey as CompanyKey]
  if (!co) return null

  const [mediaH, itH, softwareH] = SIZE_MAP[size]
  const h = co.key === 'RABORN_MEDIA' ? mediaH : co.key === 'RABORN_IT' ? itH : softwareH

  return (
    <img
      src={co.logo}
      alt={co.name}
      className={className}
      style={{
        height: `${h}px`,
        width: 'auto',
        objectFit: 'contain',
      }}
    />
  )
}
