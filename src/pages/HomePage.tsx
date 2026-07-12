import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getFeaturedRestaurants, searchRestaurants } from '@/api'
import type { Restaurant } from '@/types'
import { RestaurantMap } from '@/components/map/RestaurantMap'
import { AddRestaurantDialog } from '@/components/map/AddRestaurantDialog'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const { t } = useTranslation()
  const [featured, setFeatured] = useState<Restaurant[]>([])
  const [all, setAll] = useState<Restaurant[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadData = async () => {
    const [f, a] = await Promise.all([getFeaturedRestaurants(), searchRestaurants({})])
    setFeatured(f)
    setAll(a)
  }

  useEffect(() => { loadData() }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-stone-900 text-white py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="text-stone-400 text-lg mb-8">{t('home.hero.subtitle')}</p>
          <Link to="/restaurants">
            <Button variant="brand" size="lg">
              {t('home.hero.cta')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-stone-900">Bangkok</h2>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            + {t('home.map.addBtn')}
          </Button>
        </div>
        <RestaurantMap restaurants={all} className="h-[400px]" />
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-xl font-semibold text-stone-900 mb-4">{t('home.featured')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(r => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>

      <AddRestaurantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdded={loadData}
      />
    </div>
  )
}
