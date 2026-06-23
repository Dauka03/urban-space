import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { isStaff, isSuperAdmin } from '@/types'
import { DashboardTab } from './DashboardTab'
import { BookingsTab } from './BookingsTab'
import { CabinetsTab } from './CabinetsTab'
import { LocationsTab } from './LocationsTab'
import { CategoriesTab } from './CategoriesTab'
import { AdminsTab } from './AdminsTab'

// `superOnly` tabs map to endpoints the API restricts to SUPER_ADMIN.
const TABS = [
  { key: 'dashboard', label: 'Дашборд', superOnly: true },
  { key: 'bookings', label: 'Брони', superOnly: false },
  { key: 'cabinets', label: 'Кабинеты', superOnly: false },
  { key: 'locations', label: 'Локации', superOnly: true },
  { key: 'categories', label: 'Категории', superOnly: true },
  { key: 'admins', label: 'Администраторы', superOnly: true },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function Admin() {
  const user = useAuthStore((s) => s.user)
  const isSuper = isSuperAdmin(user?.role)
  const tabs = TABS.filter((t) => isSuper || !t.superOnly)
  // Plain ADMIN lands on "Брони" since the dashboard is SUPER_ADMIN-only.
  const [tab, setTab] = useState<TabKey>(isSuper ? 'dashboard' : 'bookings')

  if (!user) return <Navigate to="/auth" replace />
  if (!isStaff(user.role)) {
    return <div className="p-8 text-center text-text-secondary">Доступ только для администратора</div>
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-text mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${tab === t.key ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary hover:bg-border'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'bookings' && <BookingsTab />}
      {tab === 'cabinets' && <CabinetsTab />}
      {tab === 'locations' && <LocationsTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'admins' && <AdminsTab />}
    </div>
  )
}
