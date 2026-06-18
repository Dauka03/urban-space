import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { locationsApi } from '@/api/locations'
import type { Location } from '@/types'

interface Props {
  open: boolean
  /** Existing location to edit, or null to create a new one. */
  location: Location | null
  onClose: () => void
  onSaved: () => void
}

export function LocationFormModal({ open, location, onClose, onSaved }: Props) {
  const [name, setName] = useState(location?.name ?? '')
  const [address, setAddress] = useState(location?.address ?? '')
  const [sortOrder, setSortOrder] = useState(String(location?.sortOrder ?? 0))
  const [isActive, setIsActive] = useState(location?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      setError('Заполните название и адрес')
      return
    }
    setSaving(true)
    setError(null)
    const payload = { name: name.trim(), address: address.trim(), sortOrder: Number(sortOrder) || 0, isActive }
    try {
      if (location) await locationsApi.update(location.id, payload)
      else await locationsApi.create(payload)
      onSaved()
      onClose()
    } catch {
      setError('Не удалось сохранить локацию')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={location ? 'Редактировать локацию' : 'Новая локация'}
      onClose={onClose}
      footer={
        <Button fullWidth disabled={saving} onClick={handleSubmit}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
      }
    >
      <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} />
      <Input
        label="Порядок"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-text">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Активна
      </label>
      {error && <p className="text-sm text-error">{error}</p>}
    </Modal>
  )
}
