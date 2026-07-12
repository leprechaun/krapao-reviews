import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { searchRestaurants } from '@/api'
import type { Restaurant } from '@/types'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Input } from '@/components/ui/input'

export function RestaurantsPage() {
  const { t } = useTranslation()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [query, setQuery] = useState('')
  const [minScore, setMinScore] = useState('')

  const load = useCallback(async () => {
    const results = await searchRestaurants({
      query: query || undefined,
      minScore: minScore ? parseFloat(minScore) : undefined,
    })
    setRestaurants(results)
  }, [query, minScore])

  useEffect(() => { load() }, [load])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">{t('restaurants.title')}</h1>

      <div className="flex gap-3 mb-8 flex-col sm:flex-row">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('restaurants.search')}
          className="sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-stone-600 whitespace-nowrap">{t('restaurants.minScore')}</label>
          <Input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={minScore}
            onChange={e => setMinScore(e.target.value)}
            className="w-24"
            placeholder="0"
          />
        </div>
      </div>

      {restaurants.length === 0 ? (
        <p className="text-stone-500">{t('restaurants.noResults')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map(r => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  )
}
