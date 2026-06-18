import { apiClient, authHeaders } from './client'
import type { Location } from '@/types'

export interface CreateLocationPayload {
  name: string
  address: string
  isActive?: boolean
  sortOrder?: number
}

export type UpdateLocationPayload = Partial<CreateLocationPayload>

export const locationsApi = {
  /** Get all locations sorted by sortOrder */
  getAll: () => apiClient.get<Location[]>('/api/locations'),

  /** ADMIN: create a location. Throws ApiError(401/403). */
  create: (payload: CreateLocationPayload) =>
    apiClient.post<Location>('/api/locations', payload, authHeaders()),

  /** ADMIN: update a location. Throws ApiError(401/403). */
  update: (id: string, payload: UpdateLocationPayload) =>
    apiClient.patch<Location>(`/api/locations/${id}`, payload, authHeaders()),

  /** ADMIN: soft-delete a location. Throws ApiError(401/403). */
  remove: (id: string) => apiClient.delete<void>(`/api/locations/${id}`, authHeaders()),
}
