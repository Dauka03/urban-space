import { apiClient, authHeaders, buildQuery } from './client'
import type { DashboardAnalytics } from '@/types'

export type DashboardParams = {
  /** e.g. 'day' | 'week' | 'month' — period to aggregate over */
  period?: string
  from?: string
  to?: string
  cabinetId?: string
}

export const analyticsApi = {
  /** ADMIN: dashboard analytics (revenue, clients, bookings). Throws ApiError(401/403). */
  getDashboard: (params: DashboardParams = {}) =>
    apiClient.get<DashboardAnalytics>(`/api/analytics/dashboard${buildQuery(params)}`, authHeaders()),
}
