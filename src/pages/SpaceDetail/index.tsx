import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cabinetsApi } from '@/api/cabinets'
import type { Cabinet } from '@/types'

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

export default function SpaceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cabinet, setCabinet] = useState<Cabinet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    cabinetsApi
      .getById(id)
      .then(setCabinet)
      .catch(() => setError('Не удалось загрузить кабинет'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-text-secondary">Загрузка...</div>
  if (error || !cabinet) return <div className="p-8 text-center text-text-secondary">{error ?? 'Кабинет не найден'}</div>

  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  const photos = cabinet.photos.slice().sort((a, b) => a.sortOrder - b.sortOrder)
  const categories = cabinet.cabinetCategories.map((cc) => cc.category.name)

  return (
    <div className="max-w-screen-sm mx-auto">
      <div className="relative">
        <div className="aspect-video bg-surface-2">
          {photos[photoIndex] && (
            <img
              src={photos[photoIndex].urlMedium}
              alt={cabinet.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-1">«{cabinet.name}»</h1>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.map((cat) => (
              <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
                {cat}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-text-secondary mb-6">{cabinet.description}</p>

        <Card>
          <p className="text-sm font-medium text-text mb-3">Выберите дату аренды</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((d) => {
              const key = d.toISOString().split('T')[0]
              const label = d.toLocaleDateString('ru', { day: '2-digit', month: 'short' })
              const isSelected = selectedDate === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                    ${isSelected ? 'bg-primary text-white' : 'bg-surface-2 text-text hover:bg-border'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </Card>

        {selectedDate && (
          <Card className="mt-3">
            <p className="text-sm font-medium text-text mb-3">Выберите время</p>
            <div className="grid grid-cols-5 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 rounded-xl text-sm font-medium transition-colors
                    ${selectedTime === t ? 'bg-primary text-white' : 'bg-surface-2 text-text hover:bg-border'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-sm">День</span>
            <span className="text-sm font-semibold text-text">{Number(cabinet.priceDay).toLocaleString()} ₸</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary text-sm">Ночь</span>
            <span className="text-sm font-semibold text-text">{Number(cabinet.priceNight).toLocaleString()} ₸</span>
          </div>
          <Button
            fullWidth
            disabled={!selectedDate || !selectedTime}
            onClick={() => navigate('/payment')}
          >
            Перейти к оплате
          </Button>
        </div>
      </div>
    </div>
  )
}
