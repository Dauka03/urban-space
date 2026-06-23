import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cabinetsApi } from '@/api/cabinets'
import { bookingsApi, type AdminBooking } from '@/api/bookings'
import { ApiError } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useBookingStore } from '@/store/bookingStore'
import type { Cabinet } from '@/types'

// Slots use "absolute minutes from midnight of the selected date" so the night window can cross
// midnight (e.g. 21:00 = 1260 … 06:30 next day = 1830). The last point of each window is end-only.
type Tariff = 'day' | 'night'
const SLOT_WINDOWS: Record<Tariff, { from: number; to: number }> = {
  day: { from: 7 * 60, to: 20 * 60 + 30 }, // 07:00 – 20:30
  night: { from: 21 * 60, to: 24 * 60 + 6 * 60 + 30 }, // 21:00 – 06:30 (next day)
}
const buildSlots = (tariff: Tariff) => {
  const { from, to } = SLOT_WINDOWS[tariff]
  const out: number[] = []
  for (let m = from; m <= to; m += 30) out.push(m)
  return out
}
// Display "HH:MM" for an absolute-minute value, wrapping past midnight.
const labelOf = (abs: number) => {
  const m = ((abs % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const mondayOf = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)) // 0 = Monday
  return x
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
// "ДД.ММ" for a YYYY-MM-DD date key.
const shortDate = (key: string) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })

// Static FAQ content provided by the product team.
type FaqItem = { q: string; intro?: string; bullets?: string[] }
const FAQ: FaqItem[] = [
  {
    q: 'Где вы находитесь?',
    intro: 'У нас две локации в Алматы (обе на цокольных этажах):',
    bullets: ['мкр. Мамыр-7, 17А (возле ТРЦ «Спутник»)', 'ул. Амангельды, 55 (возле кинотеатра «Целинный»)'],
  },
  {
    q: 'Есть ли на месте администратор и как попасть внутрь?',
    intro:
      'Для вашего комфорта и приватности администратора на месте нет — мы курируем работу удаленно с помощью видеонаблюдения. На входе висит ключница с кодовым замком. Если дверь закрыта (особенно при ранних записях до 10:00 или поздних после 21:00), просто напишите нашему онлайн-администратору, и он отправит вам код и инструкцию.',
  },
  {
    q: 'Подойдут ли мне ваши кабинеты?',
    intro: 'Мы предлагаем два формата рабочих мест:',
    bullets: [
      'Кабинеты с кушеткой: идеально для массажа, косметологии, наращивания ресниц и даже психологических консультаций.',
      'Парикмахерские кабинеты: для стрижек, окрашивания, кератина, ботокса и уходовых процедур. (Обратите внимание: столов и досок для офисной или онлайн-работы у нас нет, пространство оборудовано именно для бьюти-сферы).',
    ],
  },
  {
    q: 'Что есть внутри кабинетов?',
    bullets: [
      'С кушеткой: кушетка, стул мастера, тележка-помощник, зеркало с подсветкой, раковина (горячая/холодная вода), вешалка и урна. Все кабинеты с кушеткой закрываются изнутри на ключ.',
      'Парикмахерские: парикмахерское кресло, кресло-мойка, тележка, зеркало с подсветкой, вешалка и урна.',
    ],
  },
  {
    q: 'Как обстоят дела с освещением?',
    intro: 'Освещение везде отличное!',
    bullets: [
      'На ул. Амангельды: в кабинетах есть напольная лампа-лупа или кольцевая лампа.',
      'В мкр. Мамыр-7: установлена лампа-лупа с удобным креплением к кушетке.',
    ],
  },
  {
    q: 'Выдаете ли вы расходники?',
    intro: 'Да, мы предоставляем одноразовые простыни для всех видов кабинетов.',
  },
  {
    q: 'Есть ли душ, кондиционер и окна?',
    bullets: [
      'Вода: полноценного душа нет, но в кабинетах установлены раковины с горячей и холодной водой.',
      'Климат: на локациях работают общие кондиционеры. Благодаря тому, что мы находимся на цокольном этаже, в помещениях всегда поддерживается приятная температура.',
      'Окна: есть не во всех кабинетах. Если для вас это важно, уточните этот момент у администратора при записи.',
    ],
  },
  {
    q: 'Можно ли делать огненный массаж, кератин, ботокс или сложные косметологические процедуры?',
    intro:
      'Да, мы рады всем мастерам! Ответственность за безопасность проведения процедур полностью лежит на мастере. Важно: во время огненного массажа или испарений от кератина/ботокса иногда может сработать пожарная сигнализация. Пожалуйста, отнеситесь к этому с пониманием и просто напишите нам в чат — мы подскажем, что делать.',
  },
  {
    q: 'Насколько заранее нужно бронировать кабинет?',
    intro:
      'Желательно делать это как можно раньше. Но если кабинет нужен вам срочно (даже за 30–60 минут до начала), напишите нам — мы проверим свободные места.',
  },
  {
    q: 'Как происходит оплата?',
    intro: 'Мы работаем только по безналичному расчету и 100% предоплате.',
    bullets: [
      'Вы называете номер телефона, и мы выставляем вам счет в приложении Kaspi (напрямую на ТОО «URBANS SPACE»).',
      'Бронь фиксируется только после поступления оплаты. Без предоплаты мы не можем гарантировать, что кабинет будет за вами. (Пожалуйста, не занимайте кабинеты без оплаты — это является нарушением правил и может привести к ограничению вашего доступа к нашим локациям).',
    ],
  },
  {
    q: 'Можно ли отменить или перенести запись?',
    intro:
      'Отмена записи и возврат средств не предусмотрены. Однако мы с радостью перенесем вашу бронь на другую точную дату и время, если вы предупредите нас минимум за 24 часа.',
  },
]

export default function SpaceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  // When opened from "Моя бронь", carries the booking id to reschedule instead of creating a new one.
  const rescheduleId = searchParams.get('rescheduleId')
  const isReschedule = !!rescheduleId
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setPending = useBookingStore((s) => s.setPending)

  const [cabinet, setCabinet] = useState<Cabinet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()))
  const [tariff, setTariff] = useState<Tariff>('day')
  // Confirmed booking ranges for the day (absolute minutes), plus the in-progress start.
  const [ranges, setRanges] = useState<{ start: number; end: number }[]>([])
  const [pendingStart, setPendingStart] = useState<number | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // The booking being rescheduled — used to default the calendar to its date and highlight its slots.
  const [rescheduleBooking, setRescheduleBooking] = useState<AdminBooking | null>(null)

  useEffect(() => {
    if (!id) return
    cabinetsApi
      .getById(id)
      .then(setCabinet)
      .catch(() => setError('Не удалось загрузить кабинет'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!rescheduleId) return
    bookingsApi
      .getById(rescheduleId)
      .then((b) => {
        setRescheduleBooking(b)
        // Open the calendar on the date/tariff/week the client originally booked.
        const start = new Date(b.startsAt)
        setSelectedDate(dateKey(start))
        setWeekStart(mondayOf(start))
        const night = (b.slots ?? []).reduce((s, x) => s + x.nightHours, 0)
        const day = (b.slots ?? []).reduce((s, x) => s + x.dayHours, 0)
        if (night > 0 && day === 0) setTariff('night')
      })
      .catch(() => setRescheduleBooking(null))
  }, [rescheduleId])

  if (loading) return <div className="p-8 text-center text-text-secondary">Загрузка...</div>
  if (error || !cabinet) return <div className="p-8 text-center text-text-secondary">{error ?? 'Кабинет не найден'}</div>

  const photos = cabinet.photos.slice().sort((a, b) => a.sortOrder - b.sortOrder)
  const equipment = (cabinet.appliancePhotos ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)

  const todayMidnight = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const canGoPrevWeek = weekStart > mondayOf(todayMidnight)
  const monthLabel = cap(weekDays[3].toLocaleDateString('ru', { month: 'long', year: 'numeric' }))

  const slots = buildSlots(tariff)
  const lastSlot = slots[slots.length - 1]

  const resetSelection = () => {
    setRanges([])
    setPendingStart(null)
    setSubmitError(null)
  }

  const selectDate = (key: string) => {
    if (key === selectedDate) return
    setSelectedDate(key)
    resetSelection()
  }

  const selectTariff = (t: Tariff) => {
    if (t === tariff) return
    setTariff(t)
    resetSelection()
  }

  // Real Date for an absolute-minute offset from midnight of the selected date (rolls past midnight).
  const slotDate = (abs: number) => {
    const d = new Date(`${selectedDate}T00:00:00`)
    d.setMinutes(d.getMinutes() + abs)
    return d
  }

  // 30-min slots (as absolute minutes) already occupied by a booking inside the current window.
  const bookedSlots = (() => {
    const set = new Set<number>()
    if (!selectedDate || !cabinet.bookings) return set
    const nextDayKey = dateKey(slotDate(1440))
    for (const b of cabinet.bookings) {
      const end = new Date(b.endsAt)
      const t = new Date(b.startsAt)
      t.setMinutes(t.getMinutes() < 30 ? 0 : 30, 0, 0) // align to the 30-min slot boundary
      for (; t < end; t.setMinutes(t.getMinutes() + 30)) {
        const mins = t.getHours() * 60 + t.getMinutes()
        const key = dateKey(t)
        if (key === selectedDate) set.add(mins)
        else if (key === nextDayKey) set.add(mins + 1440) // after-midnight part of the night window
      }
    }
    return set
  })()

  // 30-min slots already taken by one of the ranges the user has confirmed.
  const selectedSlots = (() => {
    const set = new Set<number>()
    for (const r of ranges) for (let m = r.start; m < r.end; m += 30) set.add(m)
    return set
  })()

  // 30-min slots (as absolute minutes) belonging to the booking being rescheduled — highlighted
  // on its original date so the client can see what they currently have.
  const originalSlots = (() => {
    const set = new Set<number>()
    if (!selectedDate || !rescheduleBooking) return set
    const nextDayKey = dateKey(slotDate(1440))
    const parts = rescheduleBooking.slots?.length
      ? rescheduleBooking.slots
      : [{ startsAt: rescheduleBooking.startsAt, endsAt: rescheduleBooking.endsAt }]
    for (const s of parts) {
      const end = new Date(s.endsAt)
      const t = new Date(s.startsAt)
      t.setMinutes(t.getMinutes() < 30 ? 0 : 30, 0, 0)
      for (; t < end; t.setMinutes(t.getMinutes() + 30)) {
        const mins = t.getHours() * 60 + t.getMinutes()
        const key = dateKey(t)
        if (key === selectedDate) set.add(mins)
        else if (key === nextDayKey) set.add(mins + 1440)
      }
    }
    return set
  })()

  const now = new Date()
  const isPast = (abs: number) => (selectedDate ? slotDate(abs) <= now : false)
  // A 30-min interval starting at `abs` is unavailable if it's booked, already chosen, or in the past.
  const isBlocked = (abs: number) => bookedSlots.has(abs) || selectedSlots.has(abs) || isPast(abs)
  // A slot can start a range if it isn't the final point and its own interval is free.
  const canStart = (abs: number) => abs !== lastSlot && !isBlocked(abs)

  const startMin = pendingStart
  const choosingEnd = pendingStart !== null
  // Furthest end reachable from the in-progress start before hitting a busy/chosen/past slot.
  const maxEndMin = (() => {
    if (startMin === null) return null
    let m = startMin
    while (m < lastSlot && !isBlocked(m)) m += 30
    return m
  })()
  const isValidEnd = (abs: number) =>
    startMin !== null && maxEndMin !== null && abs > startMin && abs <= maxEndMin

  const totalMin = ranges.reduce((sum, r) => sum + (r.end - r.start), 0)
  const fmtDuration = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    return [h ? `${h} ч` : '', m ? `${m} мин` : ''].filter(Boolean).join(' ')
  }
  const pricePerHour = Number(tariff === 'night' ? cabinet.priceNight : cabinet.priceDay)
  const totalCost = Math.round((totalMin / 60) * pricePerHour)
  const canSubmit = ranges.length > 0 && !submitting

  // Multi-range picker: 1st click sets a start, a 2nd valid click confirms the range and starts over.
  const handleSlotClick = (abs: number) => {
    setSubmitError(null)
    if (choosingEnd && isValidEnd(abs)) {
      setRanges((prev) => [...prev, { start: pendingStart!, end: abs }].sort((a, b) => a.start - b.start))
      setPendingStart(null)
      return
    }
    if (abs === pendingStart) {
      setPendingStart(null)
      return
    }
    if (canStart(abs)) setPendingStart(abs)
  }
  // During end-selection, allow valid ends and any fresh start; otherwise only valid starts.
  const slotDisabled = (abs: number) =>
    choosingEnd ? !(isValidEnd(abs) || canStart(abs)) : !canStart(abs)

  const handleSubmit = async () => {
    if (!selectedDate || ranges.length === 0) return
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: location.pathname } })
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    // One request carries all selected ranges as slots; a single payment covers them.
    const bookedRanges = ranges.map((r) => ({
      startTime: labelOf(r.start),
      endTime: labelOf(r.end),
      startsAt: slotDate(r.start).toISOString(),
      endsAt: slotDate(r.end).toISOString(),
    }))
    const slotPayload = bookedRanges.map((s) => ({ startsAt: s.startsAt, endsAt: s.endsAt }))
    try {
      if (isReschedule) {
        // Reschedule keeps the same total day/night hours — the API enforces it (422 otherwise).
        await bookingsApi.reschedule(rescheduleId, slotPayload)
        navigate('/')
        return
      }
      const response = await bookingsApi.create({ cabinetId: cabinet.id, slots: slotPayload })
      setPending({
        cabinet,
        date: selectedDate,
        slots: bookedRanges,
        booking: response.booking,
        paymentUrl: response.paymentUrl,
      })
      navigate('/payment')
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          navigate('/auth', { state: { returnTo: location.pathname } })
          return
        }
        if (isReschedule && e.status === 422)
          setSubmitError('Сохраните тот же суммарный объём дневных и ночных часов, что и в брони')
        else if (e.status === 409)
          setSubmitError(
            isReschedule
              ? 'Выбранное время пересекается с другой бронью — измените выбор'
              : 'Одно из выбранных времён уже занято — измените выбор',
          )
        else if (e.status === 403) setSubmitError('Действие доступно только для пользователей')
        else if (e.status === 404)
          setSubmitError(isReschedule ? 'Бронь не найдена' : 'Кабинет недоступен для бронирования')
        else setSubmitError(isReschedule ? 'Не удалось перенести бронь. Попробуйте ещё раз' : 'Не удалось создать бронирование. Попробуйте ещё раз')
      } else {
        setSubmitError(isReschedule ? 'Не удалось перенести бронь. Попробуйте ещё раз' : 'Не удалось создать бронирование. Попробуйте ещё раз')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-screen-sm mx-auto pb-28">
      {/* Page header: back + cabinet name */}
      <div className="sticky top-14 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="h-14 px-2 flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            aria-label="Назад"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-2"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold text-text truncate">
            {isReschedule ? 'Перенос брони' : cabinet.name}
          </h1>
        </div>
      </div>

      {/* Photo */}
      <div className="px-4 pt-4">
        <div className="relative">
          <div className="aspect-video rounded-2xl overflow-hidden bg-surface-2">
            {photos[photoIndex] && (
              <img src={photos[photoIndex].urlMedium} alt={cabinet.name} className="w-full h-full object-cover" />
            )}
          </div>
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  aria-label={`Фото ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        {/* Prices */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 rounded-2xl bg-surface-2 px-4 py-3">
            <p className="text-xs text-text-secondary mb-0.5">Дневное</p>
            <p className="text-sm font-semibold text-text">
              {Number(cabinet.priceDay).toLocaleString('ru')} ₸<span className="text-text-secondary font-normal">/час</span>
            </p>
          </div>
          <div className="flex-1 rounded-2xl bg-surface-2 px-4 py-3">
            <p className="text-xs text-text-secondary mb-0.5">Ночное</p>
            <p className="text-sm font-semibold text-text">
              {Number(cabinet.priceNight).toLocaleString('ru')} ₸<span className="text-text-secondary font-normal">/час</span>
            </p>
          </div>
        </div>

        {/* Description */}
        {cabinet.description && (
          <p className="text-sm text-text-secondary leading-relaxed mt-4">{cabinet.description}</p>
        )}

        {/* Calendar (week strip) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                if (!canGoPrevWeek) return
                const d = new Date(weekStart)
                d.setDate(d.getDate() - 7)
                setWeekStart(d)
              }}
              disabled={!canGoPrevWeek}
              aria-label="Предыдущая неделя"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text disabled:text-text-tertiary hover:bg-surface-2 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-text">{monthLabel}</span>
            <button
              onClick={() => {
                const d = new Date(weekStart)
                d.setDate(d.getDate() + 7)
                setWeekStart(d)
              }}
              aria-label="Следующая неделя"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text hover:bg-surface-2"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-xs text-text-secondary py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d) => {
              const key = dateKey(d)
              const past = d < todayMidnight
              const isSelected = selectedDate === key
              return (
                <button
                  key={key}
                  disabled={past}
                  onClick={() => selectDate(key)}
                  className="h-11 flex items-center justify-center disabled:cursor-not-allowed"
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${
                        isSelected
                          ? 'bg-primary text-white'
                          : past
                            ? 'text-text-tertiary'
                            : 'text-text hover:bg-surface-2'
                      }`}
                  >
                    {d.getDate()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tariff segment control */}
        <div className="mt-6 grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-2">
          {(['day', 'night'] as Tariff[]).map((t) => (
            <button
              key={t}
              onClick={() => selectTariff(t)}
              className={`py-2 rounded-lg text-sm font-medium transition-colors
                ${tariff === t ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
            >
              {t === 'day' ? 'Дневное' : 'Ночное'}
            </button>
          ))}
        </div>

        {/* Time slots */}
        {selectedDate ? (
          <div className="mt-5">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-sm font-medium text-text">Время аренды</p>
              {(ranges.length > 0 || pendingStart) && (
                <button type="button" onClick={resetSelection} className="text-xs text-text-secondary hover:text-text">
                  Сбросить всё
                </button>
              )}
            </div>
            <p className="text-xs text-text-secondary mb-3">
              {pendingStart !== null
                ? `Начало ${labelOf(pendingStart)} — выберите время окончания`
                : ranges.length > 0
                  ? 'Можно добавить ещё один промежуток'
                  : 'Выберите время начала'}
            </p>

            {isReschedule && originalSlots.size > 0 && (
              <p className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
                <span className="inline-block w-3 h-3 rounded bg-warning/15 border border-warning" />
                Ваша текущая бронь
              </p>
            )}

            {ranges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {ranges.map((r) => (
                  <span
                    key={r.start}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-primary-light text-primary pl-2.5 pr-1.5 py-1 rounded-full"
                  >
                    {selectedDate && <span className="opacity-70">{shortDate(selectedDate)}</span>}
                    {labelOf(r.start)}–{labelOf(r.end)}
                    <button
                      type="button"
                      aria-label={`Убрать ${labelOf(r.start)}–${labelOf(r.end)}`}
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
              {slots.map((abs) => {
                const edge = abs === pendingStart || ranges.some((r) => r.start === abs || r.end === abs)
                const inRange = ranges.some((r) => abs > r.start && abs < r.end)
                // The slot belongs to the booking being rescheduled — mark it so the client sees their current time.
                const isOriginal = originalSlots.has(abs)
                const unavailable = bookedSlots.has(abs) || isPast(abs)
                const disabled = slotDisabled(abs)
                return (
                  <button
                    key={abs}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSlotClick(abs)}
                    className={`py-2 rounded-xl text-sm font-medium border transition-colors
                      ${
                        edge
                          ? 'bg-primary text-white border-primary'
                          : inRange
                            ? 'bg-primary-light text-primary border-primary-light'
                            : isOriginal
                              ? 'bg-warning/15 text-warning border-warning font-semibold cursor-not-allowed'
                              : unavailable
                                ? 'bg-surface-2 text-text-tertiary line-through border-transparent cursor-not-allowed'
                                : disabled
                                  ? 'bg-surface-2 text-text-tertiary border-transparent cursor-not-allowed'
                                  : 'bg-white text-primary border-primary/30 hover:bg-primary-light'
                      }`}
                  >
                    {labelOf(abs)}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-text-secondary">Выберите дату, чтобы увидеть доступное время</p>
        )}

        {/* Additional equipment */}
        {equipment.length > 0 && (
          <div className="mt-7">
            <h2 className="text-base font-semibold text-text mb-3">Доп оборудования</h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
              {equipment.map((p) => (
                <div key={p.id} className="shrink-0 w-40 aspect-square rounded-2xl overflow-hidden bg-surface-2">
                  <img src={p.urlMedium} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-7">
          <h2 className="text-base font-semibold text-text mb-3">Часто задаваемые вопросы</h2>
          <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
            {FAQ.map((item, i) => {
              const open = openFaq === i
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-surface-2"
                  >
                    <span className="text-sm text-text">{item.q}</span>
                    <Plus
                      size={18}
                      className={`shrink-0 text-text-secondary transition-transform ${open ? 'rotate-45' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed space-y-2">
                      {item.intro && <p>{item.intro}</p>}
                      {item.bullets && (
                        <ul className="list-disc pl-5 space-y-1">
                          {item.bullets.map((b, j) => (
                            <li key={j}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sticky booking bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur">
        <div className="max-w-screen-sm mx-auto px-4 py-3">
          {ranges.length > 0 && (
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-text-secondary">
                {fmtDuration(totalMin)} · {tariff === 'night' ? 'ночной' : 'дневной'} тариф
              </span>
              <span className="font-semibold text-text">{totalCost.toLocaleString('ru')} ₸</span>
            </div>
          )}
          {isReschedule && (
            <p className="text-xs text-text-secondary mb-2 text-center">
              Выберите новые дату и время — сохраните тот же суммарный объём дневных и ночных часов
            </p>
          )}
          {submitError && <p className="text-sm text-error mb-2 text-center">{submitError}</p>}
          <Button fullWidth disabled={!canSubmit} onClick={handleSubmit}>
            {submitting
              ? isReschedule
                ? 'Переносим...'
                : 'Создаём бронь...'
              : isReschedule
                ? 'Перенести'
                : 'Забронировать'}
          </Button>
          {!isAuthenticated && (
            <p className="text-xs text-text-secondary text-center mt-2">Для бронирования нужно войти в аккаунт</p>
          )}
        </div>
      </div>
    </div>
  )
}
