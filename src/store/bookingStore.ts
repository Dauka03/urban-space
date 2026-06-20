import { create } from 'zustand'
import type { Cabinet } from '@/types'
import type { BookingResponse } from '@/api/bookings'

/** A single confirmed time range with its created booking. */
export interface PendingSlot {
  /** HH:mm */
  startTime: string
  /** HH:mm */
  endTime: string
  /** ISO UTC */
  startsAt: string
  /** ISO UTC */
  endsAt: string
  response: BookingResponse
}

export interface PendingBooking {
  cabinet: Cabinet
  /** YYYY-MM-DD */
  date: string
  /** One or more booked ranges — each is a separate booking request. */
  slots: PendingSlot[]
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
