import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { DashboardTab } from './DashboardTab'
import { BookingsTab } from './BookingsTab'
import { CabinetsTab } from './CabinetsTab'
import { LocationsTab } from './LocationsTab'
import { CategoriesTab } from './CategoriesTab'

const TABS = [
  { key: 'dashboard', label: 'Дашборд' },
  { key: 'bookings', label: 'Брони' },
  { key: 'cabinets', label: 'Кабинеты' },
  { key: 'locations', label: 'Локации' },
  { key: 'categories', label: 'Категории' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function Admin() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<TabKey>('dashboard')

  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'ADMIN') {
    return <div className="p-8 text-center text-text-secondary">Доступ только для администратора</div>
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-text mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {TABS.map((t) => (
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
    </div>
  )
}
