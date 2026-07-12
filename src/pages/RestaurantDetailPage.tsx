import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getRestaurant, getReviewsForRestaurant } from '@/api'
import type { Restaurant, Review } from '@/types'
import { ScoreCard } from '@/components/restaurant/ScoreCard'
import { ReviewCard } from '@/components/restaurant/ReviewCard'
import { Button } from '@/components/ui/button'

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const isTh = i18n.language === 'th'

  useEffect(() => {
    if (!id) return
    Promise.all([getRestaurant(id), getReviewsForRestaurant(id)]).then(([r, rv]) => {
      if (r) setRestaurant(r)
      setReviews(rv)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16 text-stone-400">Loading…</div>
  if (!restaurant) return <div className="mx-auto max-w-3xl px-4 py-16 text-stone-400">Restaurant not found.</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/restaurants" className="text-sm text-stone-500 hover:text-stone-700 mb-6 block">
        ← {t('nav.restaurants')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-1">
          {isTh ? restaurant.nameTh : restaurant.name}
        </h1>
        <div className="text-stone-500 mb-1">
          {isTh ? restaurant.addressTh : restaurant.address}
        </div>
        <div className="text-sm text-stone-400">
          {isTh ? restaurant.districtTh : restaurant.district}
        </div>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-6 mb-8">
        <ScoreCard score={restaurant.krapaoScore} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-stone-900">{t('restaurant.reviews')}</h2>
          <Link to={`/restaurants/${restaurant.id}/review`}>
            <Button size="sm">{t('restaurant.writeReview')}</Button>
          </Link>
        </div>

        {reviews.length === 0 ? (
          <p className="text-stone-500">{t('restaurant.noReviews')}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
