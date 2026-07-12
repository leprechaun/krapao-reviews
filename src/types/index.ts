export type DimensionKey = 'aromatic' | 'wok' | 'heat' | 'purity' | 'protein' | 'egg'

export interface KrapaoScore {
  overall: number
  aromatic: number
  wok: number
  heat: number
  purity: number
  protein: number
  egg: number
}

export interface Restaurant {
  id: string
  name: string
  nameTh: string
  address: string
  addressTh: string
  district: string
  districtTh: string
  lat: number
  lng: number
  placeId?: string
  krapaoScore: KrapaoScore
  reviewCount: number
}

export type PurityOffender = 'longBeans' | 'onions' | 'carrots' | 'bellPeppers' | 'bambooShoots'

export interface HeatRating {
  specified: boolean
  match?: 1 | 2 | 3 | 4 | 5
}

export type ReviewScores = Partial<Record<DimensionKey, number>> & { overall?: number }

export interface Review {
  id: string
  restaurantId: string
  authorName: string
  comment: string
  visitedAt: string
  scores: ReviewScores
  purityOffenders?: PurityOffender[]
  heatRating?: HeatRating
}

export interface CreateReviewPayload {
  restaurantId: string
  authorName: string
  comment: string
  visitedAt: string
  scores: ReviewScores
  purityOffenders?: PurityOffender[]
  heatRating?: HeatRating
}

export interface CreateRestaurantPayload {
  name: string
  nameTh: string
  address: string
  addressTh: string
  district: string
  districtTh: string
  lat: number
  lng: number
  placeId?: string
}

export interface PlaceDetails {
  placeId: string
  name: string
  nameTh: string
  address: string
  addressTh: string
  lat: number
  lng: number
}
