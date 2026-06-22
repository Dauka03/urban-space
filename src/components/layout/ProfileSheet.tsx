import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { isStaff } from '@/types'

interface ProfileSheetProps {
  open: boolean
  onClose: () => void
}

/** Account panel that slides down from the top of the screen (replaces the /profile page nav). */
export function ProfileSheet({ open, onClose }: ProfileSheetProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 left-0 right-0 z-[70] transition-transform duration-300 ease-out
          ${open ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-screen-sm mx-auto bg-white rounded-b-3xl shadow-xl max-h-[92svh] overflow-y-auto">
          <div className="px-4 pt-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">Профиль</h2>
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* User card */}
            <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text truncate">
                  {user ? `${user.name} ${user.surname}` : 'Пользователь'}
                </p>
                <p className="text-sm text-text-secondary truncate">{user?.phone}</p>
              </div>
            </div>

            {isStaff(user?.role) && (
              <button
                onClick={() => go('/admin')}
                className="w-full flex items-center gap-3 rounded-2xl border border-border px-4 py-3 mb-4 text-left hover:bg-surface-2 transition-colors"
              >
                <LayoutDashboard size={18} className="text-primary" />
                <span className="font-medium text-text">Админ-панель</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-error hover:bg-error/5 transition-colors"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>

          {/* Bottom drag handle */}
          <div className="flex justify-center pb-2">
            <span className="h-1 w-10 rounded-full bg-border" />
          </div>
        </div>
      </div>
    </>
  )
}
