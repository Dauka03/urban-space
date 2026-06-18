import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cabinetsApi } from '@/api/cabinets'
import { bookingsApi } from '@/api/bookings'
import { ApiError } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useBookingStore } from '@/store/bookingStore'
import type { Cabinet } from '@/types'

// Bookable hours of the day. Start uses all but the last, end uses any later hour.
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

export default function SpaceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setPending = useBookingStore((s) => s.setPending)

  const [cabinet, setCabinet] = useState<Cabinet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  // Local "HH:00" start-hours of every slot already occupied by a booking on the selected date.
  const bookedHours = (() => {
    const set = new Set<string>()
    if (!selectedDate || !cabinet.bookings) return set
    for (const b of cabinet.bookings) {
      const end = new Date(b.endsAt)
      for (const t = new Date(b.startsAt); t < end; t.setHours(t.getHours() + 1)) {
        const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
        if (key === selectedDate) set.add(`${String(t.getHours()).padStart(2, '0')}:00`)
      }
    }
    return set
  })()

  // A start slot is in the past if its hour on the selected date has already begun.
  const now = new Date()
  const isPast = (h: string) =>
    selectedDate ? new Date(`${selectedDate}T${h}:00`) <= now : false

  const startOptions = HOURS.slice(0, -1).filter((h) => !bookedHours.has(h) && !isPast(h))
  // Allow end hours only up to the first booked slot after the chosen start.
  const endOptions = (() => {
    if (!startTime) return []
    const result: string[] = []
    for (const h of HOURS) {
      if (h <= startTime) continue
      const prevHour = `${String(Number(h.slice(0, 2)) - 1).padStart(2, '0')}:00`
      if (bookedHours.has(prevHour)) break
      result.push(h)
    }
    return result
  })()
  const durationHours = startTime && endTime ? Number(endTime.slice(0, 2)) - Number(startTime.slice(0, 2)) : 0
  const canSubmit = Boolean(selectedDate && startTime && endTime) && !submitting

  const handleSelectStart = (h: string) => {
    setStartTime(h)
    setSubmitError(null)
    // Keep end only if it's still after the new start.
    if (endTime && endTime <= h) setEndTime(null)
  }

  const handleSubmit = async () => {
    if (!selectedDate || !startTime || !endTime) return
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    const startsAt = new Date(`${selectedDate}T${startTime}:00`).toISOString()
    const endsAt = new Date(`${selectedDate}T${endTime}:00`).toISOString()

    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await bookingsApi.create({ cabinetId: cabinet.id, startsAt, endsAt })
      setPending({ cabinet, date: selectedDate, startTime, endTime, startsAt, endsAt, response })
      navigate('/payment')
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          navigate('/auth')
          return
        }
        if (e.status === 409) setSubmitError('Это время уже занято — выберите другой слот')
        else if (e.status === 403) setSubmitError('Бронирование доступно только для пользователей')
        else if (e.status === 404) setSubmitError('Кабинет недоступен для бронирования')
        else setSubmitError('Не удалось создать бронирование. Попробуйте ещё раз')
      } else {
        setSubmitError('Не удалось создать бронирование. Попробуйте ещё раз')
      }
    } finally {
      setSubmitting(false)
    }
  }

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
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
            <p className="text-sm font-medium text-text mb-3">Время начала</p>
            <div className="grid grid-cols-5 gap-2">
              {startOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectStart(t)}
                  className={`py-2 rounded-xl text-sm font-medium transition-colors
                    ${startTime === t ? 'bg-primary text-white' : 'bg-surface-2 text-text hover:bg-border'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
        )}

        {startTime && (
          <Card className="mt-3">
            <p className="text-sm font-medium text-text mb-3">Время окончания</p>
            <div className="grid grid-cols-5 gap-2">
              {endOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setEndTime(t)
                    setSubmitError(null)
                  }}
                  className={`py-2 rounded-xl text-sm font-medium transition-colors
                    ${endTime === t ? 'bg-primary text-white' : 'bg-surface-2 text-text hover:bg-border'}`}
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

          {startTime && endTime && (
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-text-secondary">Выбрано</span>
              <span className="font-medium text-text">
                {startTime}–{endTime} · {durationHours} ч
              </span>
            </div>
          )}

          {submitError && (
            <p className="text-sm text-error mb-3 text-center">{submitError}</p>
          )}

          <Button fullWidth disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? 'Создаём бронь...' : 'Перейти к оплате'}
          </Button>
          {!isAuthenticated && (
            <p className="text-xs text-text-secondary text-center mt-2">
              Для бронирования нужно войти в аккаунт
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
