import { apiClient, authHeaders } from './client'
import type { Admin } from '@/types'

export interface RequestAdminPayload {
  phone: string
  name: string
  surname?: string
}

export interface ConfirmAdminPayload {
  phone: string
  code: string
}

export const adminsApi = {
  /** SUPER_ADMIN: list all administrators. Throws ApiError(401/403). */
  getAll: () => apiClient.get<Admin[]>('/api/admin', authHeaders()),

  /** SUPER_ADMIN: request an OTP to add a new administrator. Throws ApiError(401/403/409). */
  request: (payload: RequestAdminPayload) =>
    apiClient.post<{ message: string; phone: string }>('/api/admin/request', payload, authHeaders()),

  /** SUPER_ADMIN: confirm the OTP and create the administrator. Throws ApiError(401/403/404). */
  confirm: (payload: ConfirmAdminPayload) =>
    apiClient.post<Admin>('/api/admin/confirm', payload, authHeaders()),

  /** SUPER_ADMIN: remove an administrator. Throws ApiError(401/403/404). */
  remove: (id: string) => apiClient.delete<Admin>(`/api/admin/${id}`, authHeaders()),
}
