import { Link } from 'react-router-dom'
import type { Space } from '@/types'

interface SpaceCardProps {
  space: Space
}

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link to={`/spaces/${space.id}`} className="group block">
      <div className="aspect-square rounded-2xl overflow-hidden bg-surface-2 mb-2">
        {space.images[0] ? (
          <img
            src={space.images[0]}
            alt={space.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-surface-2" />
        )}
      </div>
      <h3 className="text-sm font-semibold text-text truncate">«{space.title}»</h3>
      <p className="text-xs text-text-secondary mt-0.5">
        Длина: {space.area} м² · Неч: {space.pricePerHour.toLocaleString()} тнг ·{' '}
        Деч: {space.pricePerDay.toLocaleString()} тнг
      </p>
      <button className="mt-2 text-xs text-primary font-medium hover:underline">
        Подробнее
      </button>
    </Link>
  )
}
