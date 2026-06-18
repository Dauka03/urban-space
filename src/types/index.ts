export interface Location {
  id: string
  name: string
  address: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CabinetPhoto {
  id: string
  cabinetId: string
  urlOriginal: string
  urlMedium: string
  urlCompressed: string
  sortOrder: number
  createdAt: string
  deletedAt: string | null
}

export interface CabinetCategory {
  cabinetId: string
  categoryId: string
  createdAt: string
  category: {
    id: string
    name: string
  }
}

export interface Category {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface DashboardAnalytics {
  period: { type: string; from: string; to: string }
  revenue: { total: number; previousTotal: number; change: number; currency: string }
  clients: { total: number; previousTotal: number; change: number }
  bookings: {
    successful: { count: number; previousCount: number; change: number }
    cancelled: { count: number; previousCount: number; change: number }
  }
}

export interface CabinetBooking {
  id: string
  startsAt: string
  endsAt: string
  status: string
  paymentStatus: string
  expiresAt: string
  createdAt: string
  paymentInitiatedAt: string | null
  paidAt: string | null
  confirmedAt: string | null
}

export interface Cabinet {
  id: string
  locationId: string
  name: string
  description: string
  priceDay: string
  priceNight: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  photos: CabinetPhoto[]
  cabinetCategories: CabinetCategory[]
  bookings?: CabinetBooking[]
}

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
  name: string
  surname: string
  role: 'USER' | 'ADMIN'
  createdAt: string
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
