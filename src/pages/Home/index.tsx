import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { CabinetCard } from './CabinetCard'
import { ManagerBookings } from './ManagerBookings'
import { ClientBookings } from './ClientBookings'
import { locationsApi } from '@/api/locations'
import { cabinetsApi } from '@/api/cabinets'
import { categoriesApi } from '@/api/categories'
import { useAuthStore } from '@/store/authStore'
import { isStaff } from '@/types'
import type { Location, Cabinet, Category } from '@/types'

const ALL_CATEGORIES_ID = '__all__'

export default function Home() {
  const [search, setSearch] = useState('')
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState(ALL_CATEGORIES_ID)

  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cabinets, setCabinets] = useState<Cabinet[]>([])
  const [loadingCabinets, setLoadingCabinets] = useState(true)

  const user = useAuthStore((s) => s.user)
  const isManager = isStaff(user?.role)

  // Load locations once, then preselect the first address (segment control has no "all" option).
  useEffect(() => {
    locationsApi
      .getAll()
      .then((locs) => {
        const active = locs.filter((l) => l.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
        setLocations(active)
        setActiveLocationId((prev) => prev ?? active[0]?.id ?? null)
      })
      .catch(() => {})
    categoriesApi.getAll().then(setCategories).catch(() => {})
  }, [])

  // Reload cabinets whenever the selected address changes (loading is toggled by the caller).
  useEffect(() => {
    if (!activeLocationId) return
    cabinetsApi
      .getAll(activeLocationId)
      .then(setCabinets)
      .catch(() => setCabinets([]))
      .finally(() => setLoadingCabinets(false))
  }, [activeLocationId])

  const selectLocation = (id: string) => {
    if (id === activeLocationId) return
    setLoadingCabinets(true)
    setActiveLocationId(id)
  }

  const filtered = cabinets.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategoryId === ALL_CATEGORIES_ID ||
      c.cabinetCategories.some((cc) => cc.category.id === activeCategoryId)
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-5">
      <h1 className="text-2xl font-bold text-text mb-4">Найдите рабочее место</h1>

      <div className="mb-4">
        <Input
          placeholder="Поиск"
          prefix={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Manager: bookings awaiting confirmation, right on the home screen */}
      {isManager && <ManagerBookings />}

      {/* Client: their own bookings from the API, tap to open the cabinet (and reschedule). */}
      {!isManager && <ClientBookings />}

      {/* Address switcher (segment control) */}
      {locations.length > 0 && (
        <div className="flex gap-1 p-1 rounded-xl bg-surface-2 mb-3">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => selectLocation(loc.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium truncate transition-colors
                ${activeLocationId === loc.id ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          <button
            onClick={() => setActiveCategoryId(ALL_CATEGORIES_ID)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeCategoryId === ALL_CATEGORIES_ID ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary hover:bg-border'}`}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${activeCategoryId === cat.id ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary hover:bg-border'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Cabinet list */}
      {loadingCabinets ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border overflow-hidden">
              <div className="aspect-video bg-surface-2" />
              <div className="p-3">
                <div className="h-3.5 bg-surface-2 rounded w-2/3 mb-2" />
                <div className="h-3 bg-surface-2 rounded w-full mb-1" />
                <div className="h-3 bg-surface-2 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
              <Search size={28} className="text-text-secondary opacity-50" />
            </div>
            <p className="text-base font-medium text-text mb-1">Кабинеты не найдены</p>
            <p className="text-sm text-text-secondary">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((cabinet) => (
              <CabinetCard key={cabinet.id} cabinet={cabinet} />
            ))}
          </div>
        )}
      )}
    </div>
  )
}
