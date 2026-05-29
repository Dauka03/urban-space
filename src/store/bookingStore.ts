import { create } from 'zustand'
import type { Booking, Space } from '@/types'

interface BookingState {
  selectedSpace: Space | null
  selectedDate: string | null
  selectedTimeSlot: { start: string; end: string } | null
  currentBooking: Booking | null
  setSelectedSpace: (space: Space) => void
  setSelectedDate: (date: string) => void
  setSelectedTimeSlot: (slot: { start: string; end: string }) => void
  setCurrentBooking: (booking: Booking) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>()((set) => ({
  selectedSpace: null,
  selectedDate: null,
  selectedTimeSlot: null,
  currentBooking: null,
  setSelectedSpace: (space) => set({ selectedSpace: space }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  reset: () => set({ selectedSpace: null, selectedDate: null, selectedTimeSlot: null, currentBooking: null }),
}))
