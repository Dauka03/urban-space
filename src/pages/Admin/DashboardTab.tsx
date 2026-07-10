import { useEffect, useState } from 'react'
import { TrendingUp, Users, LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { analyticsApi, type DashboardParams, type DashboardPeriod } from '@/api/analytics'
import { bookingsApi, type AdminBooking } from '@/api/bookings'
import { cabinetsApi } from '@/api/cabinets'
import { ApiError } from '@/api/client'
import type { Cabinet, DashboardAnalytics } from '@/types'

const PERIODS: { key: DashboardPeriod; label: string }[] = [
  { key: 'day', label: 'День' },
  { key: 'month', label: 'Месяц' },
  { key: 'year', label: 'Год' },
  { key: 'custom', label: 'Период' },
]

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${Math.round(change)}%`

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

const controlClass =
  'px-3 py-2 rounded-xl bg-surface-2 text-sm text-text border border-border focus:outline-none focus:border-primary'

export function DashboardTab() {
  const [period, setPeriod] = useState<DashboardPeriod>('month')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [cabinetId, setCabinetId] = useState('')

  const [cabinets, setCabinets] = useState<Cabinet[]>([])
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cabinet list for the filter dropdown (across all locations) — loaded once.
  useEffect(() => {
    cabinetsApi
      .getAll()
      .then(setCabinets)
      .catch(() => setCabinets([]))
  }, [])

  // Custom range only takes effect once both ends are set; otherwise we skip the from/to params.
  const customReady = period !== 'custom' || (!!from && !!to)

  // `setLoading(true)` is triggered by the filter change handlers (below), not here,
  // to avoid a synchronous setState inside the effect. `ignore` drops out-of-order
  // responses when filters change faster than requests resolve.
  useEffect(() => {
    if (!customReady) return
    let ignore = false

    const params: DashboardParams = { period }
    if (period === 'custom') {
      params.from = from
      params.to = to
    }
    if (cabinetId) params.cabinetId = cabinetId

    Promise.all([
      analyticsApi.getDashboard(params),
      bookingsApi.list({ date: todayKey(), order: 'asc', take: 50, ...(cabinetId && { cabinetId }) }),
    ])
      .then(([dashboard, list]) => {
        if (ignore) return
        setAnalytics(dashboard)
        setBookings(list.items)
        setError(null)
      })
      .catch((e) => {
        if (ignore) return
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setError('Доступ только для администратора')
        } else {
          setError('Не удалось загрузить данные дашборда')
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [period, from, to, cabinetId, customReady])

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
      {/* Filters — map to the /api/analytics/dashboard query params */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => { setLoading(true); setPeriod(p.key) }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${period === p.key ? 'bg-primary text-white' : 'bg-surface-2 text-text-secondary hover:bg-border'}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {period === 'custom' && (
            <>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => { setLoading(true); setFrom(e.target.value) }}
                className={controlClass}
              />
              <span className="text-text-secondary">—</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => { setLoading(true); setTo(e.target.value) }}
                className={controlClass}
              />
            </>
          )}

          <select
            value={cabinetId}
            onChange={(e) => { setLoading(true); setCabinetId(e.target.value) }}
            className={`${controlClass} max-w-[220px]`}
          >
            <option value="">Все кабинеты</option>
            {cabinets.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!customReady ? (
        <p className="p-8 text-center text-text-secondary">Выберите даты начала и конца периода</p>
      ) : loading ? (
        <div className="p-8 text-center text-text-secondary">Загрузка...</div>
      ) : error ? (
        <div className="p-8 text-center text-text-secondary">{error}</div>
      ) : (
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
      )}
    </>
  )
}
