import { useEffect, useState } from 'react'
import { TrendingUp, Users, LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { analyticsApi } from '@/api/analytics'
import { bookingsApi, type AdminBooking } from '@/api/bookings'
import { ApiError } from '@/api/client'
import type { DashboardAnalytics } from '@/types'

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${Math.round(change)}%`

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

export function DashboardTab() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      analyticsApi.getDashboard(),
      bookingsApi.list({ date: todayKey(), order: 'asc', take: 50 }),
    ])
      .then(([dashboard, list]) => {
        setAnalytics(dashboard)
        setBookings(list.items)
      })
      .catch((e) => {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setError('Доступ только для администратора')
        } else {
          setError('Не удалось загрузить данные дашборда')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-center text-text-secondary">Загрузка...</div>
  if (error) return <div className="p-8 text-center text-text-secondary">{error}</div>

  const stats = analytics
    ? [
        {
          label: 'Выручка',
          value: `${analytics.revenue.total.toLocaleString()} ${analytics.revenue.currency ?? '₸'}`,
          growth: formatChange(analytics.revenue.change),
          icon: TrendingUp,
        },
        {
          label: 'Клиенты',
          value: analytics.clients.total.toLocaleString(),
          growth: formatChange(analytics.clients.change),
          icon: Users,
        },
        {
          label: 'Брони',
          value: analytics.bookings.successful.count.toLocaleString(),
          growth: formatChange(analytics.bookings.successful.change),
          icon: LayoutGrid,
        },
      ]
    : []

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{s.label}</p>
                <p className="text-xl font-bold text-text">{s.value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                <s.icon size={18} className="text-primary" />
              </div>
            </div>
            <p className={`text-xs mt-2 font-medium ${s.growth.startsWith('-') ? 'text-error' : 'text-success'}`}>
              {s.growth}
            </p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-semibold text-text mb-3">Записи на сегодня</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-text-secondary">На сегодня записей нет</p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-primary w-12 shrink-0">{formatTime(b.startsAt)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-text">
                      {b.user.name} {b.user.surname} · {b.cabinet.name}
                    </p>
                    <p className="text-sm text-text-secondary">{b.cabinet.location.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">{b.user.phone}</p>
                    <p className="text-xs text-text-secondary">{b.status}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
