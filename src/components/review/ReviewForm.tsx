import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { DimensionKey, ReviewScores, PurityOffender, HeatRating } from '@/types'
import { submitReview } from '@/api'
import { calcOverall, formatScore } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

type SliderDim = 'aromatic' | 'wok' | 'protein' | 'egg'
const SLIDER_DIMS: SliderDim[] = ['aromatic', 'wok', 'protein', 'egg']
const PURITY_OFFENDERS: PurityOffender[] = ['longBeans', 'onions', 'carrots', 'bellPeppers', 'bambooShoots']

interface ReviewFormProps {
  restaurantId: string
}

export function ReviewForm({ restaurantId }: ReviewFormProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [authorName, setAuthorName] = useState('')
  const [comment, setComment] = useState('')
  const [visitedAt, setVisitedAt] = useState('')
  const [sliderTouched, setSliderTouched] = useState<Partial<Record<SliderDim, boolean>>>({})
  const [sliderValues, setSliderValues] = useState<Partial<Record<SliderDim, number>>>({})
  const [heatSpecified, setHeatSpecified] = useState<boolean | null>(null)
  const [heatMatch, setHeatMatch] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [purityChoice, setPurityChoice] = useState<'pure' | 'hasFillers' | null>(null)
  const [purityOffenders, setPurityOffenders] = useState<PurityOffender[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const scores: ReviewScores = {}
  for (const dim of SLIDER_DIMS) {
    if (sliderTouched[dim] && sliderValues[dim] !== undefined) {
      scores[dim] = sliderValues[dim]
    }
  }
  if (purityChoice !== null) {
    scores.purity = purityChoice === 'pure' ? 10 : 3
  }

  const overall = calcOverall(scores)
  if (overall !== null) scores.overall = parseFloat(overall.toFixed(2))

  const handleSliderChange = (dim: SliderDim, value: number) => {
    setSliderTouched(t => ({ ...t, [dim]: true }))
    setSliderValues(v => ({ ...v, [dim]: value }))
  }

  const handleHeatSpecified = (val: boolean) => {
    setHeatSpecified(val)
    setHeatMatch(null)
  }

  const handlePurityChoice = (choice: 'pure' | 'hasFillers') => {
    setPurityChoice(choice)
    if (choice === 'pure') setPurityOffenders([])
  }

  const toggleOffender = (o: PurityOffender) => {
    setPurityOffenders(prev =>
      prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o],
    )
  }

  const handleSubmit = async () => {
    if (!authorName.trim() || !visitedAt) return
    setSubmitting(true)

    const heatRating: HeatRating | undefined = heatSpecified !== null
      ? { specified: heatSpecified, match: heatMatch ?? undefined }
      : undefined

    await submitReview({
      restaurantId,
      authorName: authorName.trim(),
      comment: comment.trim(),
      visitedAt,
      scores,
      purityOffenders: purityChoice === 'pure' ? [] : purityChoice === 'hasFillers' ? purityOffenders : undefined,
      heatRating,
    })

    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => navigate(`/restaurants/${restaurantId}`), 1500)
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-2xl mb-2">🎉</div>
        <div className="font-semibold text-emerald-700">{t('review.success')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Meta */}
      <section className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('review.authorName')} *
          </label>
          <Input
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('review.visitedAt')} *
          </label>
          <Input
            type="date"
            value={visitedAt}
            onChange={e => setVisitedAt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {t('review.comment')}
          </label>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience…"
            rows={3}
          />
        </div>
      </section>

      {/* Slider dimensions */}
      <section className="space-y-6">
        {SLIDER_DIMS.map(dim => (
          <SliderField
            key={dim}
            dim={dim}
            value={sliderValues[dim] ?? 0}
            touched={!!sliderTouched[dim]}
            onChange={val => handleSliderChange(dim, val)}
          />
        ))}
      </section>

      {/* Heat */}
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="font-medium text-stone-900 mb-1">{t('dimensions.heat.label')}</div>
        <div className="text-sm text-stone-500 italic mb-4">{t(i18n.language === 'th' ? 'dimensions.heat.casual' : 'dimensions.heat.casualEn')}</div>

        <div className="mb-4">
          <div className="text-sm font-medium text-stone-700 mb-2">{t('review.heat.specifiedQuestion')}</div>
          <div className="flex gap-2">
            {([true, false] as const).map(val => (
              <button
                key={String(val)}
                onClick={() => handleHeatSpecified(val)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  heatSpecified === val
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50',
                )}
              >
                {val ? t('review.heat.yes') : t('review.heat.no')}
              </button>
            ))}
          </div>
        </div>

        <div className={cn(heatSpecified === null && 'opacity-40 pointer-events-none')}>
          <div className="text-sm font-medium text-stone-700 mb-2">{t('review.heat.howDidItLand')}</div>
          <div className="flex gap-2 flex-wrap">
            {([1, 2, 3, 4, 5] as const).map(n => (
              <button
                key={n}
                onClick={() => setHeatMatch(n)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm border transition-colors text-left',
                  heatMatch === n
                    ? n === 3 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50',
                  n === 3 && heatMatch !== 3 && 'border-emerald-300',
                )}
              >
                <span className="font-bold mr-1">{n}</span>
                <span className="text-xs">{t(`review.heat.${n}`)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Purity */}
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="font-medium text-stone-900 mb-1">{t('dimensions.purity.label')}</div>
        <div className="text-sm text-stone-500 italic mb-4">{t(i18n.language === 'th' ? 'dimensions.purity.casual' : 'dimensions.purity.casualEn')}</div>

        <div className="flex gap-2 mb-4">
          {(['pure', 'hasFillers'] as const).map(choice => (
            <button
              key={choice}
              onClick={() => handlePurityChoice(choice)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                purityChoice === choice
                  ? choice === 'pure'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50',
              )}
            >
              {t(`review.purity.${choice}`)}
            </button>
          ))}
        </div>

        {purityChoice === 'hasFillers' && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-stone-700 mb-2">
              {t('review.purity.offenders')}
            </div>
            {PURITY_OFFENDERS.map(o => (
              <Checkbox
                key={o}
                checked={purityOffenders.includes(o)}
                onCheckedChange={() => toggleOffender(o)}
              >
                <span className="text-sm text-stone-700">{t(`review.purity.${o}`)}</span>
              </Checkbox>
            ))}
          </div>
        )}
      </section>

      {/* Live overall */}
      <div className="rounded-xl bg-stone-900 text-white p-5 flex items-center justify-between">
        <span className="font-medium">{t('review.overall')}</span>
        <span className="text-3xl font-bold tabular-nums">
          {overall !== null ? formatScore(overall) : t('review.notRated')}
        </span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!authorName.trim() || !visitedAt || submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? t('review.submitting') : t('review.submit')}
      </Button>
    </div>
  )
}

function SliderField({
  dim,
  value,
  touched,
  onChange,
}: {
  dim: DimensionKey
  value: number
  touched: boolean
  onChange: (val: number) => void
}) {
  const { t, i18n } = useTranslation()
  const isWokHei = dim === 'wok' && touched && value >= 9
  const casualKey = i18n.language === 'th' ? 'casual' : 'casualEn'

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="font-medium text-stone-900">{t(`dimensions.${dim}.label`)}</div>
          <div className="text-sm text-stone-500 italic">{t(`dimensions.${dim}.${casualKey}`)}</div>
        </div>
        <div className={cn(
          'text-2xl font-bold tabular-nums transition-all',
          !touched && 'text-stone-300',
          touched && value >= 8 && 'text-emerald-600',
          touched && value >= 6 && value < 8 && 'text-amber-500',
          touched && value < 6 && 'text-rose-500',
        )}>
          {touched ? value.toFixed(1) : '—'}
        </div>
      </div>

      <div className={cn('mt-4', !touched && 'opacity-50')}>
        <Slider
          value={touched ? value : 5}
          onChange={onChange}
          min={0}
          max={10}
          step={0.5}
        />
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>0</span>
          <span>10</span>
        </div>
      </div>

      {isWokHei && (
        <div className="mt-3 text-sm text-amber-600 font-medium">
          ✨ {t('restaurant.wokHei')} — {t('restaurant.wokHeiEn')}
        </div>
      )}
    </div>
  )
}
