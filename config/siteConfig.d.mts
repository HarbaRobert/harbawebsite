export const SITE_NAME: string
export const DEFAULT_SITE_URL: string

export function getSiteUrl(): string
export function getMarketingSiteUrl(): string

export interface PublicRouteConfig {
  path: string
  title: string
  description: string
  breadcrumbLabel: string
}

export interface DraftRouteConfig {
  path: string
  title: string
}

export const PUBLIC_ROUTES: PublicRouteConfig[]
export const DRAFT_ROUTES: DraftRouteConfig[]

export function findPublicRoute(pathname: string): PublicRouteConfig | null
export function findDraftRoute(pathname: string): DraftRouteConfig | null
export function getRouteRobots(pathname: string): 'index, follow' | 'noindex, follow'
export function getIndexableRoutes(): PublicRouteConfig[]
