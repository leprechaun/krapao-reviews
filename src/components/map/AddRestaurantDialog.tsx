import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { autocompletePlaces, getPlaceDetails, createRestaurant } from '@/api'
import type { PlaceSuggestion, PlaceDetails } from '@/types'

interface AddRestaurantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}

export function AddRestaurantDialog({ open, onOpenChange, onAdded }: AddRestaurantDialogProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [preview, setPreview] = useState<PlaceDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasApiKey = !!import.meta.env.VITE_GOOGLE_PLACES_API_KEY

  const handleQuery = useCallback((value: string) => {
    setQuery(value)
    setPreview(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (value.trim().length < 2) { setSuggestions([]); return }
      setLoading(true)
      const results = await autocompletePlaces(value)
      setSuggestions(results)
      setLoading(false)
    }, 300)
  }, [])

  const selectSuggestion = async (s: PlaceSuggestion) => {
    setSuggestions([])
    setQuery(s.description)
    setLoading(true)
    const details = await getPlaceDetails(s.placeId)
    setPreview(details)
    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!preview) return
    setSubmitting(true)
    await createRestaurant({
      name: preview.name,
      nameTh: preview.nameTh,
      address: preview.address,
      addressTh: preview.addressTh,
      district: '',
      districtTh: '',
      lat: preview.lat,
      lng: preview.lng,
    })
    setSubmitting(false)
    setQuery('')
    setPreview(null)
    onAdded()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('addRestaurant.title')}>
        {!hasApiKey ? (
          <p className="text-sm text-stone-500">{t('addRestaurant.noApiKey')}</p>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={query}
                onChange={e => handleQuery(e.target.value)}
                placeholder={t('addRestaurant.searchPlaceholder')}
                autoFocus
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                  …
                </div>
              )}
              {suggestions.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-stone-200 bg-white shadow-lg overflow-hidden">
                  {suggestions.map(s => (
                    <li key={s.placeId}>
                      <button
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors"
                      >
                        {s.description}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {preview && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2">
                <div className="font-semibold text-stone-900">{preview.name}</div>
                <div className="text-sm text-stone-600">{preview.nameTh}</div>
                <div className="text-xs text-stone-500">{preview.address}</div>
                <div className="text-xs text-stone-400">{preview.addressTh}</div>
                <div className="text-xs text-stone-400">
                  {t('addRestaurant.coordinates')}: {preview.lat.toFixed(5)}, {preview.lng.toFixed(5)}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button variant="outline">{t('addRestaurant.cancel')}</Button>} />
              <Button
                onClick={handleConfirm}
                disabled={!preview || submitting}
              >
                {t('addRestaurant.confirm')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
