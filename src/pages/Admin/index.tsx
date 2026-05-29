import { TrendingUp, Users, LayoutGrid } from 'lucide-react'
import { Card } from '@/components/ui/Card'

const STATS = [
  { label: 'Выручка', value: '2 184 500 ₸', growth: '+15%', icon: TrendingUp },
  { label: 'Клиенты', value: '284', growth: '+15%', icon: Users },
  { label: 'Кабинеты', value: '18', growth: '+10%', icon: LayoutGrid },
]

const SCHEDULE = [
  { time: '11:00', client: 'Алена Юсупова', cabinet: '№4', master: 'Маникюр + покрытие', masterName: 'Олег П.' },
  { time: '12:00', client: 'Денис Сатпаев', cabinet: '№2', master: 'Стрижка', masterName: 'Мария К.' },
  { time: '14:30', client: 'Камила Ахметова', cabinet: '№1', master: 'Маникюр', masterName: 'Олена Д.' },
]

export default function Admin() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-text mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((s) => (
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
            <p className="text-xs text-success mt-2 font-medium">{s.growth}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-semibold text-text mb-3">Записи на сегодня</h2>
        <div className="flex flex-col gap-3">
          {SCHEDULE.map((entry, i) => (
            <Card key={i}>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-primary w-12 shrink-0">{entry.time}</span>
                <div className="flex-1">
                  <p className="font-medium text-text">{entry.client} · {entry.cabinet}</p>
                  <p className="text-sm text-text-secondary">{entry.master}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">{entry.masterName}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
