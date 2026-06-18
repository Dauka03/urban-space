import { apiClient, authHeaders } from './client'
import type { Category } from '@/types'

export interface CreateCategoryPayload {
  name: string
}

export const categoriesApi = {
  /** Get all categories. */
  getAll: () => apiClient.get<Category[]>('/api/categories'),

  /** ADMIN: create a category. Throws ApiError(401/403). */
  create: (payload: CreateCategoryPayload) =>
    apiClient.post<Category>('/api/categories', payload, authHeaders()),

  /** ADMIN: soft-delete a category. Throws ApiError(401/403). */
  remove: (id: string) => apiClient.delete<void>(`/api/categories/${id}`, authHeaders()),
}
