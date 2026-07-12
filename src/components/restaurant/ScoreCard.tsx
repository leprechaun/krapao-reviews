import { useTranslation } from 'react-i18next'
import type { KrapaoScore } from '@/types'
import { DIMENSIONS, cn, formatScore, scoreColor } from '@/lib/utils'

interface ScoreCardProps {
  score: KrapaoScore
  compact?: boolean
}

export function ScoreCard({ score, compact }: ScoreCardProps) {
  const { t } = useTranslation()

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={cn('text-2xl font-bold tabular-nums', scoreColor(score.overall))}>
          {formatScore(score.overall)}
        </span>
        <span className="text-stone-400 text-sm">/10</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2 mb-4">
        <span className={cn('text-4xl font-bold tabular-nums', scoreColor(score.overall))}>
          {formatScore(score.overall)}
        </span>
        <span className="text-stone-400">/10</span>
        <span className="ml-1 text-stone-500 text-sm">{t('restaurant.overallScore')}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DIMENSIONS.map(dim => (
          <DimensionRow key={dim} dim={dim} value={score[dim]} />
        ))}
      </div>
    </div>
  )
}

function DimensionRow({ dim, value }: { dim: string; value: number }) {
  const { t, i18n } = useTranslation()
  const isWokHei = dim === 'wok' && value >= 9
  const casualKey = i18n.language === 'th' ? 'casual' : 'casualEn'

  return (
    <div className="rounded-lg border border-stone-100 bg-white p-3">
      <div className="text-xs text-stone-500 font-medium mb-1">
        {t(`dimensions.${dim}.label`)}
      </div>
      <div className="text-xs text-stone-400 italic mb-2">
        {t(`dimensions.${dim}.${casualKey}`)}
      </div>
      <div className={cn('text-xl font-bold tabular-nums', scoreColor(value))}>
        {formatScore(value)}
      </div>
      {isWokHei && (
        <div className="mt-1.5 text-xs text-amber-600 font-medium">
          ✨ {t('restaurant.wokHei')}
        </div>
      )}
    </div>
  )
}
