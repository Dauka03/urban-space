import { Link } from 'react-router-dom'
import type { Cabinet } from '@/types'

interface CabinetCardProps {
  cabinet: Cabinet
}

export function CabinetCard({ cabinet }: CabinetCardProps) {
  const cover = cabinet.photos.slice().sort((a, b) => a.sortOrder - b.sortOrder)[0]?.urlMedium
  const categories = cabinet.cabinetCategories.map((cc) => cc.category.name)

  return (
    <Link
      to={`/spaces/${cabinet.id}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-white"
    >
      <div className="aspect-video bg-surface-2 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={cabinet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-surface-2" />
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-text truncate">«{cabinet.name}»</h3>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {categories.map((cat) => (
              <span key={cat} className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary">
                {cat}
              </span>
            ))}
          </div>
        )}

        {cabinet.description && (
          <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{cabinet.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2.5 text-xs">
          <span className="text-text">
            <span className="text-text-secondary">День </span>
            {Number(cabinet.priceDay).toLocaleString('ru')} ₸
          </span>
          <span className="text-text">
            <span className="text-text-secondary">Ночь </span>
            {Number(cabinet.priceNight).toLocaleString('ru')} ₸
          </span>
        </div>
      </div>
    </Link>
  )
}
