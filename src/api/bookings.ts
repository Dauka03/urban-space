import { apiClient, authHeaders, buildQuery } from './client'

/** A single time slot of a booking. */
export interface BookingSlotInput {
  /** UTC start datetime in ISO 8601 format */
  startsAt: string
  /** UTC end datetime in ISO 8601 format */
  endsAt: string
}

export interface CreateBookingPayload {
  cabinetId: string
  /** One or more slots for the same cabinet — covered by a single payment/confirmation. */
  slots: BookingSlotInput[]
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

/** A persisted slot of a booking, with the day/night hour breakdown computed by the API. */
export interface BookingSlotRecord {
  id: string
  bookingId: string
  startsAt: string
  endsAt: string
  /** Total price for this slot (day + night). */
  amount: number
  /** Hours within the daytime window (07:00–20:30 Almaty). */
  dayHours: number
  /** Hours within the nighttime window. */
  nightHours: number
  createdAt: string
}

/** Booking enriched with user, cabinet and slots, as returned by the list/detail endpoints. */
export interface AdminBooking extends BookingRecord {
  user: { id: string; name: string | null; surname: string | null; phone: string }
  cabinet: {
    id: string
    name: string
    priceDay?: number
    priceNight?: number
    location: { id: string; name: string }
  }
  slots?: BookingSlotRecord[]
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

  /**
   * Paginated list of bookings. USER sees only their own bookings (userId is ignored);
   * ADMIN/SUPER_ADMIN see all and may filter by userId/cabinetId. Defaults to today.
   * Throws ApiError(401/403).
   */
  list: (params: BookingListParams = {}) =>
    apiClient.get<BookingListResponse>(`/api/bookings${buildQuery(params)}`, authHeaders()),

  /** Booking details by id. USER may view only their own; ADMIN any. Throws ApiError(401/403/404). */
  getById: (id: string) => apiClient.get<AdminBooking>(`/api/bookings/${id}`, authHeaders()),

  /** ADMIN: confirm a booking after payment. Throws ApiError(401/403/404/409). */
  confirm: (id: string) =>
    apiClient.post<BookingRecord>(`/api/bookings/${id}/confirm`, undefined, authHeaders()),

  /**
   * USER: reschedule own CONFIRMED booking. The new slots must keep the same total
   * daytime (07:00–20:30) and nighttime hours as the original (else 422); new slots must
   * not overlap existing reservations (else 409). Throws ApiError(401/403/404/409/422).
   */
  reschedule: (id: string, slots: BookingSlotInput[]) =>
    apiClient.patch<BookingRecord>(`/api/bookings/${id}/reschedule`, { slots }, authHeaders()),
}
