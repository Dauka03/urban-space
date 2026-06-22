import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { bookingsApi, type AdminBooking } from '@/api/bookings'
import { ApiError } from '@/api/client'

const paymentVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  const s = status.toLowerCase()
  if (s.includes('paid') || s.includes('succeed') || s.includes('success')) return 'success'
  if (s.includes('pending') || s.includes('init')) return 'warning'
  if (s.includes('fail') || s.includes('cancel') || s.includes('expire')) return 'error'
  return 'default'
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ru', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

/** Manager widget on the home screen: bookings awaiting confirmation, confirmable in place. */
export function ManagerBookings() {
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

  const pending = bookings.filter((b) => !b.confirmedAt)

  if (loading) return null
  if (error) return null
  if (pending.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-text">Брони на подтверждение</h2>
        <span className="text-sm text-text-secondary">{pending.length}</span>
      </div>

      <div className="flex flex-col gap-3">
        {pending.map((b) => (
          <Card key={b.id}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">
                  {b.user.name} {b.user.surname}
                </p>
                <p className="text-sm text-text-secondary">{b.user.phone}</p>
                <p className="text-sm text-text-secondary mt-1 truncate">
                  {b.cabinet.name} · {b.cabinet.location.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatDateTime(b.startsAt)} — {formatTime(b.endsAt)}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={paymentVariant(b.paymentStatus)}>оплата: {b.paymentStatus}</Badge>
                  {b.totalAmount != null && (
                    <span className="text-sm font-semibold text-text">
                      {Number(b.totalAmount).toLocaleString('ru')} ₸
                    </span>
                  )}
                </div>
              </div>

              <Button size="sm" className="shrink-0" disabled={confirmingId === b.id} onClick={() => handleConfirm(b)}>
                {confirmingId === b.id ? (
                  '...'
                ) : (
                  <>
                    <Check size={14} className="mr-1" /> Подтвердить
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
