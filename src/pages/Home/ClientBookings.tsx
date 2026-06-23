import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { bookingsApi, type AdminBooking } from '@/api/bookings'
import { bookingStatusLabel, bookingStatusVariant } from '@/lib/bookingStatus'

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

/** Day/night tariff of a booking, inferred from its slots' hour breakdown. */
const tariffOf = (b: AdminBooking) => {
  const day = (b.slots ?? []).reduce((s, x) => s + x.dayHours, 0)
  const night = (b.slots ?? []).reduce((s, x) => s + x.nightHours, 0)
  const isNight = night > 0 && day === 0
  return {
    label: isNight ? 'Ночной' : 'Дневной',
    price: isNight ? b.cabinet.priceNight : b.cabinet.priceDay,
  }
}

/** Home-screen list of the signed-in client's own bookings (GET /api/bookings). */
export function ClientBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const to = new Date()
    to.setDate(to.getDate() + 365)
    bookingsApi
      .list({ from: dateKey(today), to: dateKey(to), order: 'asc', take: 100 })
      // Only active bookings — hide expired/cancelled ones.
      .then((res) => setBookings(res.items.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || bookings.length === 0) return null

  return (
    <div className="mb-4 flex flex-col gap-3">
      {bookings.map((b) => {
        const tariff = tariffOf(b)
        // Reschedule is allowed only for confirmed bookings; pass the id so the cabinet page knows.
        const to =
          b.status === 'CONFIRMED' ? `/spaces/${b.cabinet.id}?rescheduleId=${b.id}` : `/spaces/${b.cabinet.id}`
        return (
          <Link
            key={b.id}
            to={to}
            className="block rounded-2xl border border-border bg-white p-4 hover:bg-surface-2 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-text">Моя бронь</p>
              <div className="flex items-center gap-2">
                {b.status !== 'CONFIRMED' && (
                  <Badge variant={bookingStatusVariant(b.status)}>{bookingStatusLabel(b.status)}</Badge>
                )}
                <ChevronRight size={18} className="text-text-secondary" />
              </div>
            </div>

            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-text truncate">«{b.cabinet.name}»</span>
              <span className="text-sm shrink-0 ml-2">
                <span className="text-primary font-medium">{tariff.label}</span>
                {tariff.price != null && (
                  <span className="text-text-secondary"> {Number(tariff.price).toLocaleString('ru')}/ час</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                Дата <span className="text-text">{formatDate(b.startsAt)}</span>
              </span>
              <span className="text-text-secondary">
                Время <span className="text-text">{formatTime(b.startsAt)}</span>
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
