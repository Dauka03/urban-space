import { apiClient, authHeaders, buildQuery } from './client'
import type { DashboardAnalytics } from '@/types'

/** Aggregation window. `custom` requires `from`/`to` (ISO dates). */
export type DashboardPeriod = 'day' | 'month' | 'year' | 'custom'

export type DashboardParams = {
  period?: DashboardPeriod
  /** ISO date, used with period=custom */
  from?: string
  /** ISO date, used with period=custom */
  to?: string
  cabinetId?: string
}

export const analyticsApi = {
  /** ADMIN: dashboard analytics (revenue, clients, bookings). Throws ApiError(401/403). */
  getDashboard: (params: DashboardParams = {}) =>
    apiClient.get<DashboardAnalytics>(`/api/analytics/dashboard${buildQuery(params)}`, authHeaders()),
}
