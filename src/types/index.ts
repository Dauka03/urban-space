export interface Space {
  id: string
  title: string
  description: string
  address: string
  pricePerHour: number
  pricePerDay: number
  area: number
  capacity: number
  images: string[]
  type: 'office' | 'meeting_room' | 'coworking'
  tags: string[]
  rating: number
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface Booking {
  id: string
  spaceId: string
  date: string
  startTime: string
  endTime: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface Subscription {
  id: string
  type: 'basic' | 'semi_annual' | 'annual'
  hoursTotal: number
  hoursUsed: number
  expiresAt: string
  price: number
}

export interface User {
  id: string
  phone: string
  name?: string
  subscription?: Subscription
}

export interface AdminStats {
  revenue: number
  clients: number
  cabinets: number
  revenueGrowth: number
  clientsGrowth: number
}

export interface ScheduleEntry {
  id: string
  clientName: string
  cabinet: string
  time: string
  master: string
  duration: number
}
