/** Booking lifecycle statuses returned by the API (enum BookingStatus). */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED'

type BadgeVariant = 'success' | 'warning' | 'error' | 'default'

const META: Record<BookingStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Ожидает подтверждения', variant: 'warning' },
  CONFIRMED: { label: 'Подтверждена', variant: 'success' },
  EXPIRED: { label: 'Истекла', variant: 'error' },
  CANCELLED: { label: 'Отменена', variant: 'error' },
}

const FALLBACK = { label: 'Неизвестно', variant: 'default' as BadgeVariant }

/** Human-readable Russian label for a booking status. */
export const bookingStatusLabel = (status: string): string =>
  META[status as BookingStatus]?.label ?? FALLBACK.label

/** Badge variant matching a booking status. */
export const bookingStatusVariant = (status: string): BadgeVariant =>
  META[status as BookingStatus]?.variant ?? FALLBACK.variant

/** Only PENDING bookings can be confirmed by an admin. */
export const isConfirmable = (status: string): boolean => status === 'PENDING'
