import { useNavigate } from 'react-router-dom'
import { LogOut, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

const PLANS = [
  { id: 'basic', name: 'Базовый', hours: 15, price: 27000 },
  { id: 'semi', name: 'Полугодовой', hours: 50, price: 42500, popular: true },
  { id: 'annual', name: 'Годовой', hours: 120, price: 56000 },
]

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text">Мой профиль</h1>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-error transition-colors">
          <LogOut size={16} />
          <span>Выйти</span>
        </button>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-text">
              {user ? `${user.name} ${user.surname}` : 'Пользователь'}
            </p>
            <p className="text-sm text-text-secondary">{user?.phone}</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={18} className="text-primary" />
        <h2 className="font-semibold text-text">Абонементы</h2>
      </div>

      <div className="flex flex-col gap-3">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.popular ? 'border-primary' : ''}>
            <div className="flex items-center justify-between">
              <div>
                {plan.popular && (
                  <span className="text-xs font-medium text-primary mb-1 block">Популярный</span>
                )}
                <p className="font-semibold text-text">{plan.name}</p>
                <p className="text-sm text-text-secondary">{plan.hours} часов</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-text">{plan.price.toLocaleString()} ₸</p>
                <Button size="sm" variant={plan.popular ? 'primary' : 'outline'} className="mt-2">
                  Купить
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
