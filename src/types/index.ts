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
  // "Additional equipment" gallery shown on the detail screen (Figma: «Доп оборудования»).
  appliancePhotos?: CabinetPhoto[]
  cabinetCategories: CabinetCategory[]
  bookings?: CabinetBooking[]
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

/** Both ADMIN and SUPER_ADMIN can access the admin panel. */
export const isStaff = (role: UserRole | undefined): boolean =>
  role === 'ADMIN' || role === 'SUPER_ADMIN'

/** SUPER_ADMIN has exclusive access to analytics, locations, categories and admin management. */
export const isSuperAdmin = (role: UserRole | undefined): boolean => role === 'SUPER_ADMIN'

export interface User {
  id: string
  phone: string
  name: string
  surname: string
  role: UserRole
  createdAt: string
}

export interface Admin {
  id: string
  phone: string
  name: string
  surname: string
  role: UserRole
  createdAt: string
}

