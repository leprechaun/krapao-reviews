import type {
  Restaurant,
  Review,
  CreateReviewPayload,
  CreateRestaurantPayload,
  PlaceDetails,
  KrapaoScore,
} from '@/types'
import { restaurantStore, reviewStore } from './store'
import { heatMatchToScore, DIMENSIONS } from '@/lib/utils'

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

// ── Restaurants ──────────────────────────────────────────────────────────────

export async function searchRestaurants(params: {
  query?: string
  minScore?: number
}): Promise<Restaurant[]> {
  await delay()
  let results = [...restaurantStore]
  if (params.query) {
    const q = params.query.toLowerCase()
    results = results.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.nameTh.includes(params.query!) ||
        r.district.toLowerCase().includes(q) ||
        r.districtTh.includes(params.query!),
    )
  }
  if (params.minScore !== undefined) {
    results = results.filter(r => r.krapaoScore.overall >= params.minScore!)
  }
  return results
}

export async function getRestaurant(id: string): Promise<Restaurant | undefined> {
  await delay()
  return restaurantStore.find(r => r.id === id)
}

export async function getFeaturedRestaurants(): Promise<Restaurant[]> {
  await delay()
  return restaurantStore.slice(0, 3)
}

export async function createRestaurant(data: CreateRestaurantPayload): Promise<Restaurant> {
  await delay()
  const restaurant: Restaurant = {
    id: String(Date.now()),
    ...data,
    placeId: data.placeId || undefined,
    krapaoScore: { overall: 0, aromatic: 0, wok: 0, heat: 0, purity: 0, protein: 0, egg: 0 },
    reviewCount: 0,
  }
  restaurantStore.push(restaurant)
  return restaurant
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviewsForRestaurant(restaurantId: string): Promise<Review[]> {
  await delay()
  return reviewStore.filter(r => r.restaurantId === restaurantId)
}

export async function submitReview(payload: CreateReviewPayload): Promise<Review> {
  await delay()
  const review: Review = { id: `r${Date.now()}`, ...payload }
  reviewStore.push(review)
  _recomputeScore(payload.restaurantId)
  return review
}

function _recomputeScore(restaurantId: string) {
  const restaurant = restaurantStore.find(r => r.id === restaurantId)
  if (!restaurant) return
  const reviews = reviewStore.filter(r => r.restaurantId === restaurantId)
  if (reviews.length === 0) return

  const agg: Partial<KrapaoScore> = {}
  for (const dim of DIMENSIONS) {
    const vals = reviews.map(r => r.scores[dim]).filter((v): v is number => v !== undefined)
    if (vals.length > 0) {
      agg[dim] = vals.reduce((a, b) => a + b, 0) / vals.length
    }
  }

  // heat from heatRating
  const heatVals = reviews
    .filter(r => r.heatRating?.match !== undefined)
    .map(r => heatMatchToScore(r.heatRating!.match!))
  if (heatVals.length > 0) {
    agg.heat = heatVals.reduce((a, b) => a + b, 0) / heatVals.length
  }

  const dimVals = DIMENSIONS.map(d => agg[d]).filter((v): v is number => v !== undefined)
  const overall = dimVals.length > 0 ? dimVals.reduce((a, b) => a + b, 0) / dimVals.length : 0

  restaurant.krapaoScore = {
    overall,
    aromatic: agg.aromatic ?? 0,
    wok: agg.wok ?? 0,
    heat: agg.heat ?? 0,
    purity: agg.purity ?? 0,
    protein: agg.protein ?? 0,
    egg: agg.egg ?? 0,
  }
  restaurant.reviewCount = reviews.length
}

// ── Google Places ─────────────────────────────────────────────────────────────

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

  const fetchLang = async (lang: string) => {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,formattedAddress,location`,
      {
        headers: {
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'displayName,formattedAddress,location',
          'Accept-Language': lang,
        },
      },
    )
    if (!res.ok) throw new Error('Places fetch failed')
    return res.json() as Promise<{
      displayName?: { text?: string }
      formattedAddress?: string
      location?: { latitude?: number; longitude?: number }
    }>
  }

  const [en, th] = await Promise.all([fetchLang('en'), fetchLang('th')])

  return {
    placeId,
    name: en.displayName?.text ?? '',
    nameTh: th.displayName?.text ?? '',
    address: en.formattedAddress ?? '',
    addressTh: th.formattedAddress ?? '',
    lat: en.location?.latitude ?? 0,
    lng: en.location?.longitude ?? 0,
  }
}
