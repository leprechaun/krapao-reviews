import { useTranslation } from 'react-i18next'
import type { Review } from '@/types'
import { DIMENSIONS, cn, formatScore, scoreColor } from '@/lib/utils'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useTranslation()

  const ratedDims = DIMENSIONS.filter(d => review.scores[d] !== undefined)

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="font-semibold text-stone-900">{review.authorName}</div>
          <div className="text-xs text-stone-400 mt-0.5">{review.visitedAt}</div>
        </div>
        {review.scores.overall !== undefined && (
          <div className={cn('text-xl font-bold tabular-nums', scoreColor(review.scores.overall))}>
            {formatScore(review.scores.overall)}
          </div>
        )}
      </div>

      {review.comment && (
        <p className="text-sm text-stone-700 leading-relaxed mb-3">{review.comment}</p>
      )}

      {ratedDims.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ratedDims.map(dim => (
            <span
              key={dim}
              className="inline-flex items-center gap-1 rounded-full bg-stone-50 border border-stone-100 px-2.5 py-1 text-xs"
            >
              <span className="text-stone-500">{t(`dimensions.${dim}.label`)}</span>
              <span className={cn('font-semibold tabular-nums', scoreColor(review.scores[dim]!))}>
                {formatScore(review.scores[dim]!)}
              </span>
            </span>
          ))}
        </div>
      )}

      {review.purityOffenders !== undefined && review.purityOffenders.length > 0 && (
        <div className="text-xs text-rose-600 mt-1">
          ⚠️ {review.purityOffenders.map(o => t(`review.purity.${o}`)).join(', ')}
        </div>
      )}

      {review.heatRating && (
        <div className="text-xs text-stone-500 mt-1">
          🌶 {t(`review.heat.${review.heatRating.match ?? ''}`)}
          {review.heatRating.specified && (
            <span className="ml-1 text-stone-400">({t('review.heat.yes')})</span>
          )}
        </div>
      )}
    </div>
  )
}
