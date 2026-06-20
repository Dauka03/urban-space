import { apiClient, authHeaders, buildQuery } from './client'

export interface CreateBookingPayload {
  cabinetId: string
  /** UTC start datetime in ISO 8601 format */
  startsAt: string
  /** UTC end datetime in ISO 8601 format */
  endsAt: string
}

export interface BookingRecord {
  id: string
  cabinetId: string
  userId: string
  status: string
  paymentStatus: string
  totalAmount: number | null
  startsAt: string
  endsAt: string
  expiresAt: string
  paymentInitiatedAt: string | null
  paidAt: string | null
  createdAt: string
  confirmedAt: string | null
  deletedAt: string | null
}

export interface BookingResponse {
  booking: BookingRecord
  paymentUrl: string
}

/** Booking enriched with user and cabinet info, as returned by the ADMIN endpoints. */
export interface AdminBooking extends BookingRecord {
  user: { id: string; name: string; surname: string; phone: string }
  cabinet: { id: string; name: string; location: { id: string; name: string } }
}

export interface BookingListResponse {
  total: number
  items: AdminBooking[]
}

export type BookingListParams = {
  /** Single calendar day (YYYY-MM-DD) */
  date?: string
  from?: string
  to?: string
  cabinetId?: string
  userId?: string
  status?: string
  order?: string
  skip?: number
  take?: number
}

export const bookingsApi = {
  /**
   * Create a PENDING booking, initiate payment and get the payment link.
   * Requires a USER JWT. Throws ApiError(401/403/404/409).
   */
  create: (payload: CreateBookingPayload) =>
    apiClient.post<BookingResponse>('/api/bookings', payload, authHeaders()),

  /** ADMIN: paginated list of bookings for the dashboard. Throws ApiError(401/403). */
  list: (params: BookingListParams = {}) =>
    apiClient.get<BookingListResponse>(`/api/bookings${buildQuery(params)}`, authHeaders()),

  /** ADMIN: booking details by id. Throws ApiError(401/403/404). */
  getById: (id: string) => apiClient.get<AdminBooking>(`/api/bookings/${id}`, authHeaders()),

  /** ADMIN: confirm a booking after payment. Throws ApiError(401/403/404/409). */
  confirm: (id: string) =>
    apiClient.post<BookingRecord>(`/api/bookings/${id}/confirm`, undefined, authHeaders()),
}
