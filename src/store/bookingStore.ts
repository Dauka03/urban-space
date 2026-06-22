import { create } from 'zustand'
import type { Cabinet } from '@/types'
import type { BookingRecord } from '@/api/bookings'

/** A single confirmed time range within the booking. */
export interface PendingSlot {
  /** HH:mm */
  startTime: string
  /** HH:mm */
  endTime: string
  /** ISO UTC */
  startsAt: string
  /** ISO UTC */
  endsAt: string
}

export interface PendingBooking {
  cabinet: Cabinet
  /** YYYY-MM-DD */
  date: string
  /** One or more booked ranges — all part of a single booking. */
  slots: PendingSlot[]
  /** The created booking (one request covers all slots). */
  booking: BookingRecord
  /** Payment link returned by the API. */
  paymentUrl: string
}

interface BookingState {
  pending: PendingBooking | null
  setPending: (booking: PendingBooking) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>()((set) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
  reset: () => set({ pending: null }),
}))
