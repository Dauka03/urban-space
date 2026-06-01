import { Link } from 'react-router-dom'
import type { Cabinet } from '@/types'

interface CabinetCardProps {
  cabinet: Cabinet
}

export function CabinetCard({ cabinet }: CabinetCardProps) {
  const cover = cabinet.photos[0]?.urlMedium

  return (
    <Link to={`/spaces/${cabinet.id}`} className="group block">
      <div className="aspect-square rounded-2xl overflow-hidden bg-surface-2 mb-2">
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
      <h3 className="text-sm font-semibold text-text truncate">«{cabinet.name}»</h3>
      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{cabinet.description}</p>
      <p className="text-xs text-text-secondary mt-0.5">
        День: {Number(cabinet.priceDay).toLocaleString()} ₸ ·{' '}
        Ночь: {Number(cabinet.priceNight).toLocaleString()} ₸
      </p>
    </Link>
  )
}
