import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export function Header() {
  const { isAuthenticated } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">US</span>
          </div>
          <span className="font-semibold text-text">Urbanspace</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/profile" className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center">
              <User size={18} className="text-text-secondary" />
            </Link>
          ) : (
            <Link to="/auth" className="text-sm font-medium text-primary hover:underline">
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
