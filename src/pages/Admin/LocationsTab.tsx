import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { locationsApi } from '@/api/locations'
import { LocationFormModal } from './LocationFormModal'
import type { Location } from '@/types'

export function LocationsTab() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Location | null>(null)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    locationsApi
      .getAll()
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (loc: Location) => {
    if (!confirm(`Удалить локацию «${loc.name}»?`)) return
    try {
      await locationsApi.remove(loc.id)
      load()
    } catch {
      alert('Не удалось удалить локацию')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">Локации</h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={16} className="mr-1" /> Добавить
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Загрузка...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-text">{loc.name}</p>
                  <p className="text-sm text-text-secondary">{loc.address}</p>
                </div>
                <button onClick={() => setEditing(loc)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-2">
                  <Pencil size={16} className="text-text-secondary" />
                </button>
                <button onClick={() => handleDelete(loc)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-2">
                  <Trash2 size={16} className="text-error" />
                </button>
              </div>
            </Card>
          ))}
          {locations.length === 0 && <p className="text-sm text-text-secondary">Локаций пока нет</p>}
        </div>
      )}

      {(creating || editing) && (
        <LocationFormModal
          key={editing?.id ?? 'new'}
          open
          location={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={load}
        />
      )}
    </div>
  )
}
