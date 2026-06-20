import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cabinetsApi } from '@/api/cabinets'
import { bookingsApi } from '@/api/bookings'
import { ApiError } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useBookingStore } from '@/store/bookingStore'
import type { Cabinet } from '@/types'

// Bookable window in 30-min steps. The final point (19:00) is end-only — you can't start there.
const SLOTS = (() => {
  const out: string[] = []
  for (let m = 9 * 60; m <= 19 * 60; m += 30) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return out
})()
const LAST_SLOT = SLOTS[SLOTS.length - 1]
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const fmtMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export default function SpaceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setPending = useBookingStore((s) => s.setPending)

  const [cabinet, setCabinet] = useState<Cabinet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  // Confirmed booking ranges for the day, plus the in-progress start awaiting an end.
  const [ranges, setRanges] = useState<{ start: string; end: string }[]>([])
  const [pendingStart, setPendingStart] = useState<string | null>(null)
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

  // 30-min slots already occupied by a booking on the selected date (interval-start keys "HH:MM").
  const bookedSlots = (() => {
    const set = new Set<string>()
    if (!selectedDate || !cabinet.bookings) return set
    for (const b of cabinet.bookings) {
      const end = new Date(b.endsAt)
      const t = new Date(b.startsAt)
      t.setMinutes(t.getMinutes() < 30 ? 0 : 30, 0, 0) // align to the 30-min slot boundary
      for (; t < end; t.setMinutes(t.getMinutes() + 30)) {
        const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
        if (key === selectedDate)
          set.add(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`)
      }
    }
    return set
  })()

  // 30-min slots already taken by one of the ranges the user has confirmed for this day.
  const selectedSlots = (() => {
    const set = new Set<string>()
    for (const r of ranges) for (let m = toMin(r.start); m < toMin(r.end); m += 30) set.add(fmtMin(m))
    return set
  })()

  const now = new Date()
  const isPast = (t: string) => (selectedDate ? new Date(`${selectedDate}T${t}:00`) <= now : false)
  // A 30-min interval starting at `t` is unavailable if it's booked, already chosen, or in the past.
  const isBlocked = (t: string) => bookedSlots.has(t) || selectedSlots.has(t) || isPast(t)
  // A slot can start a range if it isn't the final point and its own interval is free.
  const canStart = (t: string) => t !== LAST_SLOT && !isBlocked(t)

  const startMin = pendingStart ? toMin(pendingStart) : null
  const choosingEnd = pendingStart !== null
  // Furthest end reachable from the in-progress start before hitting a busy/chosen/past slot.
  const maxEndMin = (() => {
    if (startMin === null) return null
    let m = startMin
    while (m < toMin(LAST_SLOT) && !isBlocked(fmtMin(m))) m += 30
    return m
  })()
  const isValidEnd = (t: string) =>
    startMin !== null && maxEndMin !== null && toMin(t) > startMin && toMin(t) <= maxEndMin

  const totalMin = ranges.reduce((sum, r) => sum + (toMin(r.end) - toMin(r.start)), 0)
  const fmtDuration = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    return [h ? `${h} ч` : '', m ? `${m} мин` : ''].filter(Boolean).join(' ')
  }
  const canSubmit = ranges.length > 0 && !submitting

  // Multi-range picker: 1st click sets a start, a 2nd valid click confirms the range and starts over.
  const handleSlotClick = (t: string) => {
    setSubmitError(null)
    if (choosingEnd && isValidEnd(t)) {
      setRanges((prev) => [...prev, { start: pendingStart!, end: t }].sort((a, b) => toMin(a.start) - toMin(b.start)))
      setPendingStart(null)
      return
    }
    if (t === pendingStart) {
      setPendingStart(null)
      return
    }
    if (canStart(t)) setPendingStart(t)
  }
  // During end-selection, allow valid ends and any fresh start; otherwise only valid starts.
  const slotDisabled = (t: string) =>
    choosingEnd ? !(isValidEnd(t) || canStart(t)) : !canStart(t)

  const resetSelection = () => {
    setRanges([])
    setPendingStart(null)
    setSubmitError(null)
  }

  const handleSubmit = async () => {
    if (!selectedDate || ranges.length === 0) return
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      // One booking request per selected range; collect them for the payment step.
      const slots = []
      for (const r of ranges) {
        const startsAt = new Date(`${selectedDate}T${r.start}:00`).toISOString()
        const endsAt = new Date(`${selectedDate}T${r.end}:00`).toISOString()
        const response = await bookingsApi.create({ cabinetId: cabinet.id, startsAt, endsAt })
        slots.push({ startTime: r.start, endTime: r.end, startsAt, endsAt, response })
      }
      setPending({ cabinet, date: selectedDate, slots })
      navigate('/payment')
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          navigate('/auth')
          return
        }
        if (e.status === 409) setSubmitError('Одно из выбранных времён уже занято — измените выбор')
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
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-sm font-medium text-text">Время аренды</p>
              {(ranges.length > 0 || pendingStart) && (
                <button
                  type="button"
                  onClick={resetSelection}
                  className="text-xs text-text-secondary hover:text-text"
                >
                  Сбросить всё
                </button>
              )}
            </div>
            <p className="text-xs text-text-secondary mb-3">
              {pendingStart
                ? `Начало ${pendingStart} — выберите время окончания`
                : ranges.length > 0
                  ? 'Можно добавить ещё один промежуток'
                  : 'Выберите время начала'}
            </p>

            {ranges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {ranges.map((r) => (
                  <span
                    key={r.start}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-primary/15 text-primary pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    {r.start}–{r.end}
                    <button
                      type="button"
                      aria-label={`Убрать ${r.start}–${r.end}`}
                      onClick={() => setRanges((prev) => prev.filter((x) => x.start !== r.start))}
                      className="rounded-full hover:bg-primary/20 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {SLOTS.map((t) => {
                const m = toMin(t)
                const edge =
                  t === pendingStart || ranges.some((r) => r.start === t || r.end === t)
                const inRange = ranges.some((r) => m > toMin(r.start) && m < toMin(r.end))
                const unavailable = bookedSlots.has(t) || isPast(t)
                const disabled = slotDisabled(t)
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSlotClick(t)}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors
                      ${
                        edge
                          ? 'bg-primary text-white'
                          : inRange
                            ? 'bg-primary/15 text-primary'
                            : unavailable
                              ? 'bg-surface-2 text-text-secondary/40 line-through cursor-not-allowed'
                              : disabled
                                ? 'bg-surface-2 text-text-secondary/40 cursor-not-allowed'
                                : 'bg-surface-2 text-text hover:bg-border'
                      }`}
                  >
                    {t}
                  </button>
                )
              })}
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

          {ranges.length > 0 && (
            <div className="flex items-start justify-between mb-4 text-sm">
              <span className="text-text-secondary">Выбрано</span>
              <span className="font-medium text-text text-right">
                {ranges.map((r) => `${r.start}–${r.end}`).join(', ')}
                {totalMin ? ` · ${fmtDuration(totalMin)}` : ''}
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
