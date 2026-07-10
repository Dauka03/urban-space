import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { bookingsApi, type AdminBooking } from '@/api/bookings'
import { ApiError } from '@/api/client'
import { bookingStatusLabel, bookingStatusVariant, isConfirmable } from '@/lib/bookingStatus'

const FILTERS = [
  { key: 'pending', label: 'Ожидают подтверждения' },
  { key: 'all', label: 'Все' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const paymentVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  const s = status.toLowerCase()
  if (s.includes('paid') || s.includes('succeed') || s.includes('success')) return 'success'
  if (s.includes('pending') || s.includes('init')) return 'warning'
  if (s.includes('fail') || s.includes('cancel') || s.includes('expire')) return 'error'
  return 'default'
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ru', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function BookingsTab() {
  const [filter, setFilter] = useState<FilterKey>('pending')
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const load = () => {
    bookingsApi
      .list({ order: 'desc', take: 100 })
      .then((res) => setBookings(res.items))
      .catch((e) => {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) setError('Доступ только для администратора')
        else setError('Не удалось загрузить брони')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleConfirm = async (booking: AdminBooking) => {
    setConfirmingId(booking.id)
    try {
      await bookingsApi.confirm(booking.id)
      load()
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        alert('Бронь нельзя подтвердить в текущем статусе (например, оплата ещё не прошла)')
      } else {
        alert('Не удалось подтвердить бронь')
      }
    } finally {
      setConfirmingId(null)
    }
  }

  const visible = filter === 'pending' ? bookings.filter((b) => isConfirmable(b.status)) : bookings

  if (loading) return <p className="text-sm text-text-secondary">Загрузка...</p>
  if (error) return <p className="text-sm text-text-secondary">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-semibold text-text">Брони</h2>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${filter === f.key ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary hover:bg-border'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {visible.map((b) => (
          <Card key={b.id}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text">
                  {b.user.name} {b.user.surname}
                </p>
                <p className="text-sm text-text-secondary">{b.user.phone}</p>
                <p className="text-sm text-text-secondary mt-1">
                  {b.cabinet.name} · {b.cabinet.location.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatDateTime(b.startsAt)} — {new Date(b.endsAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={bookingStatusVariant(b.status)}>{bookingStatusLabel(b.status)}</Badge>
                  <Badge variant={paymentVariant(b.paymentStatus)}>оплата: {b.paymentStatus}</Badge>
                  {b.totalAmount != null && (
                    <span className="text-sm font-semibold text-text">{Number(b.totalAmount).toLocaleString()} ₸</span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {isConfirmable(b.status) ? (
                  <Button size="sm" disabled={confirmingId === b.id} onClick={() => handleConfirm(b)}>
                    {confirmingId === b.id ? '...' : 'Подтвердить'}
                  </Button>
                ) : b.status === 'CONFIRMED' ? (
                  <Badge variant="success">
                    <Check size={12} className="mr-1" /> Подтверждена
                  </Badge>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
        {visible.length === 0 && <p className="text-sm text-text-secondary">Броней нет</p>}
      </div>
    </div>
  )
}
