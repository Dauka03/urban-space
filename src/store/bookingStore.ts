import { create } from 'zustand'
import type { Cabinet } from '@/types'
import type { BookingResponse } from '@/api/bookings'

export interface PendingBooking {
  cabinet: Cabinet
  /** YYYY-MM-DD */
  date: string
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
