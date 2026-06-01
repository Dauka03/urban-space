import { apiClient } from './client'
import type { Location } from '@/types'

export const locationsApi = {
  /** Get all locations sorted by sortOrder */
  getAll: () => apiClient.get<Location[]>('/api/locations'),
}
