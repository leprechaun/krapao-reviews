import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))
const RestaurantsPage = lazy(() => import('@/pages/RestaurantsPage').then(m => ({ default: m.RestaurantsPage })))
const RestaurantDetailPage = lazy(() => import('@/pages/RestaurantDetailPage').then(m => ({ default: m.RestaurantDetailPage })))
const ReviewPage = lazy(() => import('@/pages/ReviewPage').then(m => ({ default: m.ReviewPage })))

function Spinner() {
  return <div className="flex items-center justify-center py-20 text-stone-400">Loading…</div>
}

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/restaurants/:id/review" element={<ReviewPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}
