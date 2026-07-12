import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getPlaceDetails, createRestaurant } from '@/api'
import type { PlaceDetails } from '@/types'

interface MapPickerProps {
  language: string
  onPick: (place: PlaceDetails) => void
}

function MapPicker({ language, onPick }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const onPickRef = useRef(onPick)
  const [loading, setLoading] = useState(false)

  // Keep the ref current without re-running the map effect
  useEffect(() => { onPickRef.current = onPick })

  useEffect(() => {
    const mapEl = mapContainerRef.current
    if (!mapEl) return

    let cancelled = false
    let marker: google.maps.Marker | null = null

    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      language,
    })

    importLibrary('maps').then(mapsLib => {
      if (cancelled) return

      const map = new mapsLib.Map(mapEl, {
        center: { lat: 13.7563, lng: 100.5018 },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      map.addListener('click', async (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const placeId = (event as google.maps.IconMouseEvent).placeId
        if (placeId) (event as google.maps.IconMouseEvent).stop()

        if (marker) marker.setMap(null)
        marker = new google.maps.Marker({ position: event.latLng, map })

        if (placeId) {
          setLoading(true)
          try {
            const details = await getPlaceDetails(placeId)
            if (!cancelled) onPickRef.current(details)
          } finally {
            if (!cancelled) setLoading(false)
          }
        } else {
          if (!cancelled) {
            onPickRef.current({
              placeId: '',
              name: '',
              nameTh: '',
              address: '',
              addressTh: '',
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            })
          }
        }
      })
    })

    return () => {
      cancelled = true
      if (marker) marker.setMap(null)
    }
  }, [language])

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
      <p className="text-xs text-stone-500 shrink-0">
        Click a place marker to auto-fill its details, or click anywhere to drop a pin. Click again anywhere to move it.
      </p>
      <div ref={mapContainerRef} className="flex-1 min-h-0 w-full rounded-lg overflow-hidden border border-stone-200" />
      {loading && (
        <p className="text-sm text-stone-400 text-center shrink-0">Loading place details…</p>
      )}
    </div>
  )
}

const inputClass =
  'flex h-9 w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-0'

interface AddRestaurantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}

export function AddRestaurantDialog({ open, onOpenChange, onAdded }: AddRestaurantDialogProps) {
  const { t, i18n } = useTranslation()
  const [preview, setPreview] = useState<PlaceDetails | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const hasApiKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const handleConfirm = async () => {
    if (!preview?.name.trim()) return
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
      placeId: preview.placeId || undefined,
    })
    setSubmitting(false)
    setPreview(null)
    onAdded()
    onOpenChange(false)
  }

  const update = (field: keyof PlaceDetails, value: string) =>
    setPreview(p => p ? { ...p, [field]: value } : p)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t('addRestaurant.title')} className="w-[90vw] max-w-[90vw] h-[90vh]">
        {!hasApiKey ? (
          <p className="text-sm text-stone-500">{t('addRestaurant.noApiKey')}</p>
        ) : (
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            {open && <MapPicker language={i18n.language} onPick={place => {
              if (!place.placeId) {
                // Plain location drop — preserve any name/address already typed
                setPreview(prev => prev ? { ...prev, lat: place.lat, lng: place.lng } : place)
              } else {
                setPreview(place)
              }
            }} />}

            {preview && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputClass}
                    placeholder="Name (English) *"
                    value={preview.name}
                    onChange={e => update('name', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="ชื่อ (ภาษาไทย)"
                    value={preview.nameTh}
                    onChange={e => update('nameTh', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Address (English)"
                    value={preview.address}
                    onChange={e => update('address', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="ที่อยู่ (ภาษาไทย)"
                    value={preview.addressTh}
                    onChange={e => update('addressTh', e.target.value)}
                  />
                </div>
                <p className="text-xs text-stone-400">
                  {preview.lat.toFixed(5)}, {preview.lng.toFixed(5)}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <DialogClose render={<Button variant="outline">{t('addRestaurant.cancel')}</Button>} />
              <Button onClick={handleConfirm} disabled={!preview?.name.trim() || submitting}>
                {t('addRestaurant.confirm')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
