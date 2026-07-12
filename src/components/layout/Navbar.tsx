import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-stone-900">
          <span className="text-xl">🌿</span>
          <span className="hidden sm:inline">Krapao Reviews</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/'
                ? 'text-stone-900 bg-stone-100'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
            )}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/restaurants"
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              location.pathname.startsWith('/restaurants')
                ? 'text-stone-900 bg-stone-100'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
            )}
          >
            {t('nav.restaurants')}
          </Link>

          <div className="ml-2 flex rounded-md border border-stone-200 overflow-hidden">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold transition-colors',
                i18n.language === 'en'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-50',
              )}
            >
              EN
            </button>
            <button
              onClick={() => i18n.changeLanguage('th')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold transition-colors',
                i18n.language === 'th'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-50',
              )}
            >
              TH
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
