import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cabinetsApi } from '@/api/cabinets'
import type { Cabinet, Category, Location } from '@/types'

interface Props {
  open: boolean
  /** Existing cabinet to edit, or null to create. */
  cabinet: Cabinet | null
  locations: Location[]
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

export function CabinetFormModal({ open, cabinet, locations, categories, onClose, onSaved }: Props) {
  const [name, setName] = useState(cabinet?.name ?? '')
  const [locationId, setLocationId] = useState(cabinet?.locationId ?? locations[0]?.id ?? '')
  const [priceDay, setPriceDay] = useState(cabinet?.priceDay ?? '')
  const [priceNight, setPriceNight] = useState(cabinet?.priceNight ?? '')
  const [description, setDescription] = useState(cabinet?.description ?? '')
  const [categoryIds, setCategoryIds] = useState<string[]>(
    cabinet?.cabinetCategories.map((cc) => cc.category.id) ?? []
  )
  const [isActive, setIsActive] = useState(cabinet?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleCategory = (id: string) =>
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleSubmit = async () => {
    if (!name.trim() || !locationId || !priceDay || !priceNight) {
      setError('Заполните название, локацию и цены')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      name: name.trim(),
      locationId,
      priceDay: Number(priceDay),
      priceNight: Number(priceNight),
      description: description.trim() || undefined,
      categoryIds,
      isActive,
    }
    try {
      if (cabinet) await cabinetsApi.update(cabinet.id, payload)
      else await cabinetsApi.create(payload)
      onSaved()
      onClose()
    } catch {
      setError('Не удалось сохранить кабинет')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={cabinet ? 'Редактировать кабинет' : 'Новый кабинет'}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={saving} onClick={handleSubmit}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
      }
    >
      <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Локация</label>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="h-12 px-4 rounded-xl border border-border bg-white text-base text-text outline-none focus:border-primary"
        >
          <option value="" disabled>
            Выберите локацию
          </option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Цена день (₸)" type="number" value={priceDay} onChange={(e) => setPriceDay(e.target.value)} />
        <Input label="Цена ночь (₸)" type="number" value={priceNight} onChange={(e) => setPriceNight(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-text-secondary">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="px-4 py-3 rounded-xl border border-border bg-white text-base text-text outline-none focus:border-primary resize-none"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary">Категории</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = categoryIds.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${active ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary hover:bg-border'}`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-text">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Активен
      </label>

      {error && <p className="text-sm text-error">{error}</p>}
    </Modal>
  )
}
