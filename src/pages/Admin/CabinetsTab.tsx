import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Image } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cabinetsApi } from '@/api/cabinets'
import { locationsApi } from '@/api/locations'
import { categoriesApi } from '@/api/categories'
import { CabinetFormModal } from './CabinetFormModal'
import { CabinetPhotosModal } from './CabinetPhotosModal'
import type { Cabinet, Category, Location } from '@/types'

export function CabinetsTab() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Cabinet | null>(null)
  const [creating, setCreating] = useState(false)
  const [photosFor, setPhotosFor] = useState<Cabinet | null>(null)

  const loadCabinets = () => {
    setLoading(true)
    cabinetsApi
      .getAll()
      .then(setCabinets)
      .catch(() => setCabinets([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCabinets()
    locationsApi.getAll().then(setLocations).catch(() => {})
    categoriesApi.getAll().then(setCategories).catch(() => {})
  }, [])

  const handleDelete = async (cabinet: Cabinet) => {
    if (!confirm(`Удалить кабинет «${cabinet.name}»?`)) return
    try {
      await cabinetsApi.remove(cabinet.id)
      loadCabinets()
    } catch {
      alert('Не удалось удалить кабинет')
    }
  }

  const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? ''

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">Кабинеты</h2>
        <Button size="sm" disabled={locations.length === 0} onClick={() => setCreating(true)}>
          <Plus size={16} className="mr-1" /> Добавить
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Загрузка...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {cabinets.map((cabinet) => (
            <Card key={cabinet.id}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text truncate">{cabinet.name}</p>
                  <p className="text-sm text-text-secondary">
                    {locationName(cabinet.locationId)} · {Number(cabinet.priceDay).toLocaleString()} ₸
                  </p>
                </div>
                <button onClick={() => setPhotosFor(cabinet)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-2">
                  <Image size={16} className="text-text-secondary" />
                </button>
                <button onClick={() => setEditing(cabinet)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-2">
                  <Pencil size={16} className="text-text-secondary" />
                </button>
                <button onClick={() => handleDelete(cabinet)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-2">
                  <Trash2 size={16} className="text-error" />
                </button>
              </div>
            </Card>
          ))}
          {cabinets.length === 0 && <p className="text-sm text-text-secondary">Кабинетов пока нет</p>}
        </div>
      )}

      {(creating || editing) && (
        <CabinetFormModal
          key={editing?.id ?? 'new'}
          open
          cabinet={editing}
          locations={locations}
          categories={categories}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={loadCabinets}
        />
      )}

      {photosFor && (
        <CabinetPhotosModal
          open
          cabinet={photosFor}
          onClose={() => setPhotosFor(null)}
          onChanged={loadCabinets}
        />
      )}
    </div>
  )
}
