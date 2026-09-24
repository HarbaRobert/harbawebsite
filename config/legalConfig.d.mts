export interface LegalConfig {
  legalEntityName: string | null
  companyNumber: string | null
  registeredAddress: string | null
  contactEmail: string
  icoRegistrationNumber: string | null
  hostingProvider: string
  hostingRegion: string
  emailProcessorName: string | null
}

export const legalConfig: LegalConfig

export interface LegalPageStatus {
  complete: boolean
  missingFields: (keyof LegalConfig)[]
}

export function getLegalPageStatus(routePath: string): LegalPageStatus
export function isLegalRoute(routePath: string): boolean
