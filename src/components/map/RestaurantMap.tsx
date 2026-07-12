import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Restaurant } from '@/types'
import { formatScore, scoreColor, cn } from '@/lib/utils'

// Fix default leaflet marker icon broken by bundlers
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface RestaurantMapProps {
  restaurants: Restaurant[]
  className?: string
}

export function RestaurantMap({ restaurants, className }: RestaurantMapProps) {
  const { t, i18n } = useTranslation()
  const isTh = i18n.language === 'th'

  return (
    <div className={cn('rounded-xl overflow-hidden border border-stone-200', className)}>
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={12}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={markerIcon}>
            <Popup>
              <div className="min-w-[160px]">
                <div className="font-semibold text-stone-900 mb-1">
                  {isTh ? r.nameTh : r.name}
                </div>
                <div className={cn('text-lg font-bold tabular-nums mb-2', scoreColor(r.krapaoScore.overall))}>
                  {formatScore(r.krapaoScore.overall)}<span className="text-stone-400 text-sm font-normal">/10</span>
                </div>
                <Link
                  to={`/restaurants/${r.id}`}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  {t('restaurant.reviews')} →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
