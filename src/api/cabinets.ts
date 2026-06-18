import { apiClient, authHeaders } from './client'
import type { Cabinet, CabinetPhoto } from '@/types'

export interface CreateCabinetPayload {
  locationId: string
  name: string
  priceDay: number
  priceNight: number
  /** Category ids to attach to the cabinet */
  categoryIds?: string[]
  description?: string
  sortOrder?: number
  isActive?: boolean
}

export type UpdateCabinetPayload = Partial<CreateCabinetPayload>

export const cabinetsApi = {
  /**
   * Get all cabinets. Pass locationId to filter by location via x-location-id header.
   * Omit locationId to get cabinets across all locations.
   */
  getAll: (locationId?: string) =>
    apiClient.get<Cabinet[]>(
      '/api/cabinets',
      locationId ? { 'x-location-id': locationId } : undefined
    ),

  getById: (id: string) => apiClient.get<Cabinet>(`/api/cabinets/${id}`),

  /** ADMIN: create a cabinet. Throws ApiError(401/403). */
  create: (payload: CreateCabinetPayload) =>
    apiClient.post<Cabinet>('/api/cabinets', payload, authHeaders()),

  /** ADMIN: update a cabinet. Throws ApiError(401/403). */
  update: (id: string, payload: UpdateCabinetPayload) =>
    apiClient.patch<Cabinet>(`/api/cabinets/${id}`, payload, authHeaders()),

  /** ADMIN: soft-delete a cabinet. Throws ApiError(401/403). */
  remove: (id: string) => apiClient.delete<void>(`/api/cabinets/${id}`, authHeaders()),

  getPhotos: (id: string) => apiClient.get<CabinetPhoto[]>(`/api/cabinets/${id}/photos`),

  /** ADMIN: upload one or more photos (multipart field `photos`). Throws ApiError(401/403). */
  addPhotos: (id: string, files: File[]) => {
    const form = new FormData()
    files.forEach((file) => form.append('photos', file))
    return apiClient.post<CabinetPhoto[]>(`/api/cabinets/${id}/photos`, form, authHeaders())
  },

  /** ADMIN: delete a single photo. Throws ApiError(401/403). */
  removePhoto: (id: string, photoId: string) =>
    apiClient.delete<void>(`/api/cabinets/${id}/photos/${photoId}`, authHeaders()),

  /**
   * ADMIN: reorder photos. `photoIds` is the full list in the desired order.
   * NOTE: the request DTO is not exposed in the OpenAPI spec — verify the field
   * name against the backend if this 400s.
   */
  reorderPhotos: (id: string, photoIds: string[]) =>
    apiClient.patch<CabinetPhoto[]>(`/api/cabinets/${id}/photos/reorder`, { photoIds }, authHeaders()),
}
