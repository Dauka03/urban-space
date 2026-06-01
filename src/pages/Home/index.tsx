import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { CabinetCard } from './CabinetCard'
import { locationsApi } from '@/api/locations'
import { cabinetsApi } from '@/api/cabinets'
import type { Location, Cabinet } from '@/types'

const FILTERS = ['Все', 'Новинки', 'Переговорки', 'Бюджет', 'Кабинеты', 'Массаж']

const ALL_LOCATIONS_ID = '__all__'

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('Все')
  const [search, setSearch] = useState('')
  const [activeLocationId, setActiveLocationId] = useState(ALL_LOCATIONS_ID)

  const [locations, setLocations] = useState<Location[]>([])
  const [cabinets, setCabinets] = useState<Cabinet[]>([])
  const [loadingCabinets, setLoadingCabinets] = useState(true)

  useEffect(() => {
    locationsApi.getAll().then(setLocations).catch(() => {})
  }, [])

  useEffect(() => {
    setLoadingCabinets(true)
    const locationId = activeLocationId === ALL_LOCATIONS_ID ? undefined : activeLocationId
    cabinetsApi
      .getAll(locationId)
      .then(setCabinets)
      .catch(() => setCabinets([]))
      .finally(() => setLoadingCabinets(false))
  }, [activeLocationId])

  const filtered = cabinets.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-text mb-4">Найдите рабочее место</h1>

      <div className="mb-4">
        <Input
          placeholder="Поиск"
          prefix={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {locations.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <button
            onClick={() => setActiveLocationId(ALL_LOCATIONS_ID)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeLocationId === ALL_LOCATIONS_ID
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-secondary hover:bg-border'
              }`}
          >
            Все локации
          </button>
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveLocationId(loc.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${activeLocationId === loc.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-2 text-text-secondary hover:bg-border'
                }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeFilter === f
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-secondary hover:bg-border'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loadingCabinets ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-2xl bg-surface-2 mb-2" />
              <div className="h-3.5 bg-surface-2 rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-surface-2 rounded w-full mb-1" />
              <div className="h-3 bg-surface-2 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((cabinet) => (
            <CabinetCard key={cabinet.id} cabinet={cabinet} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-text-secondary text-sm py-12">
              Кабинеты не найдены
            </p>
          )}
        </div>
      )}
    </div>
  )
}
