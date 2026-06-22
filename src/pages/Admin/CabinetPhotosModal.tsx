import { useRef, useState } from 'react'
import { Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cabinetsApi } from '@/api/cabinets'
import type { Cabinet, CabinetPhoto } from '@/types'

interface Props {
  open: boolean
  cabinet: Cabinet
  onClose: () => void
  onChanged: () => void
}

const MAX_PHOTOS = 5

/** CRUD operations for one photo collection (cabinet photos OR appliance photos). */
interface PhotoApi {
  add: (id: string, files: File[]) => Promise<CabinetPhoto[]>
  get: (id: string) => Promise<CabinetPhoto[]>
  remove: (id: string, photoId: string) => Promise<void>
  reorder: (id: string, photoIds: string[]) => Promise<CabinetPhoto[]>
}

function PhotoSection({
  title,
  cabinetId,
  initial,
  api,
  onChanged,
}: {
  title: string
  cabinetId: string
  initial: CabinetPhoto[]
  api: PhotoApi
  onChanged: () => void
}) {
  const [photos, setPhotos] = useState<CabinetPhoto[]>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const remaining = MAX_PHOTOS - photos.length

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const picked = Array.from(files).slice(0, remaining)
    if (picked.length === 0) {
      setError(`Максимум ${MAX_PHOTOS} фото`)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.add(cabinetId, picked)
      const fresh = await api.get(cabinetId)
      setPhotos(fresh.slice().sort((a, b) => a.sortOrder - b.sortOrder))
      onChanged()
    } catch {
      setError('Не удалось загрузить фото')
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const handleDelete = async (photo: CabinetPhoto) => {
    setBusy(true)
    setError(null)
    try {
      await api.remove(cabinetId, photo.id)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      onChanged()
    } catch {
      setError('Не удалось удалить фото')
    } finally {
      setBusy(false)
    }
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= photos.length) return
    const next = photos.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    setPhotos(next)
    setBusy(true)
    setError(null)
    try {
      await api.reorder(cabinetId, next.map((p) => p.id))
      onChanged()
    } catch {
      setError('Не удалось изменить порядок')
      setPhotos(photos)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text">{title}</p>
        <span className="text-xs text-text-tertiary">
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <Button
        variant="outline"
        fullWidth
        size="sm"
        disabled={busy || remaining <= 0}
        onClick={() => fileInput.current?.click()}
      >
        <Upload size={16} className="mr-2" /> {remaining <= 0 ? 'Лимит достигнут' : 'Добавить'}
      </Button>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-surface-2">
            <img src={photo.urlCompressed || photo.urlMedium} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => handleDelete(photo)}
              disabled={busy}
              className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
            >
              <Trash2 size={14} className="text-error" />
            </button>
            <div className="absolute bottom-1 left-1 right-1 flex justify-between">
              <button
                onClick={() => move(i, -1)}
                disabled={busy || i === 0}
                className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={busy || i === photos.length - 1}
                className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <p className="col-span-3 text-sm text-text-secondary py-4 text-center">Фото пока нет</p>
        )}
      </div>
    </div>
  )
}

const photosApi: PhotoApi = {
  add: cabinetsApi.addPhotos,
  get: cabinetsApi.getPhotos,
  remove: cabinetsApi.removePhoto,
  reorder: cabinetsApi.reorderPhotos,
}
const appliancesApi: PhotoApi = {
  add: cabinetsApi.addAppliancePhotos,
  get: cabinetsApi.getAppliancePhotos,
  remove: cabinetsApi.removeAppliancePhoto,
  reorder: cabinetsApi.reorderAppliancePhotos,
}

export function CabinetPhotosModal({ open, cabinet, onClose, onChanged }: Props) {
  const sortByOrder = (arr: CabinetPhoto[]) => arr.slice().sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Modal open={open} title={`Фото · ${cabinet.name}`} onClose={onClose}>
      <PhotoSection
        title="Фото кабинета"
        cabinetId={cabinet.id}
        initial={sortByOrder(cabinet.photos)}
        api={photosApi}
        onChanged={onChanged}
      />
      <div className="h-px bg-border" />
      <PhotoSection
        title="Доп оборудование"
        cabinetId={cabinet.id}
        initial={sortByOrder(cabinet.appliancePhotos ?? [])}
        api={appliancesApi}
        onChanged={onChanged}
      />
    </Modal>
  )
}
