export type CompanyKey = 'RABORN_MEDIA' | 'RABORN_IT' | 'RABORN_SOFTWARE'

export interface CompanyBranding {
  key: CompanyKey
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  gradientFrom: string
  gradientTo: string
}

export const COMPANIES: Record<CompanyKey, CompanyBranding> = {
  RABORN_MEDIA: {
    key: 'RABORN_MEDIA',
    name: 'Raborn Media',
    logo: '/logos/raborn-media.png',
    primaryColor: '#003964',
    secondaryColor: '#0077A2',
    accentColor: '#00CFF8',
    gradientFrom: '#003964',
    gradientTo: '#0077A2',
  },
  RABORN_IT: {
    key: 'RABORN_IT',
    name: 'Raborn IT',
    logo: '/logos/raborn-it.png',
    primaryColor: '#003A4D',
    secondaryColor: '#00566E',
    accentColor: '#3CC68A',
    gradientFrom: '#003A4D',
    gradientTo: '#00566E',
  },
  RABORN_SOFTWARE: {
    key: 'RABORN_SOFTWARE',
    name: 'Raborn Software',
    logo: '/logos/raborn-software.png',
    primaryColor: '#272D5B',
    secondaryColor: '#5A5FAD',
    accentColor: '#00EABF',
    gradientFrom: '#272D5B',
    gradientTo: '#5A5FAD',
  },
}

export const COMPANY_OPTIONS = Object.values(COMPANIES)

export function getCompanyBranding(key: string): CompanyBranding {
  return COMPANIES[key as CompanyKey] || COMPANIES.RABORN_MEDIA
}
