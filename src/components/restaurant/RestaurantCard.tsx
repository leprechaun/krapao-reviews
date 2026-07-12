import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Restaurant } from '@/types'
import { cn, formatScore, scoreColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { t, i18n } = useTranslation()
  const isTh = i18n.language === 'th'

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">
            {isTh ? restaurant.nameTh : restaurant.name}
          </h3>
          <div className="text-sm text-stone-500 mt-0.5">
            {isTh ? restaurant.districtTh : restaurant.district}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn('text-2xl font-bold tabular-nums', scoreColor(restaurant.krapaoScore.overall))}>
            {formatScore(restaurant.krapaoScore.overall)}
          </div>
          <div className="text-xs text-stone-400">/10</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="default">
          {t('restaurants.reviewCount', { count: restaurant.reviewCount })}
        </Badge>
        {restaurant.krapaoScore.wok >= 9 && (
          <Badge variant="brand">✨ {t('restaurant.wokHei')}</Badge>
        )}
      </div>
    </Link>
  )
}
