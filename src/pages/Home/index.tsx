import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { SpaceCard } from './SpaceCard'
import { MOCK_SPACES } from './mockData'

const FILTERS = ['Все', 'Новинки', 'Переговорки', 'Бюджет', 'Кабинеты', 'Массаж']

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('Все')
  const [search, setSearch] = useState('')

  const filtered = MOCK_SPACES.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-text mb-4">Найдите рабочее место</h1>

      <div className="mb-4">
        <Input
          placeholder="Поиск"
          prefix={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeFilter === f
                ? 'bg-primary text-white'
                : 'bg-surface-2 text-text-secondary hover:bg-border'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  )
}
