import { apiClient } from './client'
import type { Cabinet } from '@/types'

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

  getById: (id: string) =>
    apiClient.get<Cabinet>(`/api/cabinets/${id}`),
}
