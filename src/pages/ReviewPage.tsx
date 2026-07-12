import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getRestaurant } from '@/api'
import type { Restaurant } from '@/types'
import { ReviewForm } from '@/components/review/ReviewForm'

export function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const isTh = i18n.language === 'th'

  useEffect(() => {
    if (!id) return
    getRestaurant(id).then(r => { if (r) setRestaurant(r) })
  }, [id])

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to={`/restaurants/${id}`} className="text-sm text-stone-500 hover:text-stone-700 mb-6 block">
        ← {restaurant ? (isTh ? restaurant.nameTh : restaurant.name) : '…'}
      </Link>

      <h1 className="text-2xl font-bold text-stone-900 mb-8">{t('review.title')}</h1>

      {id && <ReviewForm restaurantId={id} />}
    </div>
  )
}
