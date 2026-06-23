import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useBookingStore } from '@/store/bookingStore'

const TIMER_SECONDS = 5 * 60

export default function Payment() {
  const navigate = useNavigate()
  const pending = useBookingStore((s) => s.pending)
  const reset = useBookingStore((s) => s.reset)
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!pending || paid) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [pending, paid])

  const expired = secondsLeft === 0 && !paid
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  const progress = secondsLeft / TIMER_SECONDS
  const isUrgent = secondsLeft <= 60

  if (!pending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4 text-center">
        <p className="text-text-secondary mb-6">Нет активного бронирования</p>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </div>
    )
  }

  const { cabinet, date, slots, booking, paymentUrl } = pending
  const amount = booking.totalAmount ?? 0
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('ru', { day: '2-digit', month: 'long' })

  const handlePay = async () => {
    setLoading(true)
    // The API has already initiated payment and returned a payment link.
    // Hand the user off to the bank's payment page.
    await new Promise((r) => setTimeout(r, 800))
    if (paymentUrl) {
      window.location.href = paymentUrl
      return
    }
    setLoading(false)
    setPaid(true)
  }

  if (expired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4 text-center">
        <Clock size={64} className="text-text-tertiary mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Время вышло</h2>
        <p className="text-sm text-text-secondary mb-6">Бронь была удержана 5 минут. Попробуйте забронировать снова.</p>
        <Button
          onClick={() => {
            reset()
            navigate(-1 as never)
          }}
        >
          Вернуться
        </Button>
      </div>
    )
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4 text-center">
        <CheckCircle2 size={64} className="text-success mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Оплачено!</h2>
        <p className="text-sm text-text-secondary mb-6">Бронирование подтверждено</p>
        <Button
          onClick={() => {
            reset()
            navigate('/')
          }}
        >
          На главную
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-secondary mb-6 hover:text-text">
        <ChevronLeft size={20} />
        <span className="text-sm">Назад</span>
      </button>

      <h1 className="text-xl font-bold text-text mb-4">Оплата</h1>

      {/* Countdown timer */}
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 transition-colors ${isUrgent ? 'bg-red-50' : 'bg-surface-2'}`}>
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="3"
              className={isUrgent ? 'text-red-100' : 'text-border'} />
            <circle cx="20" cy="20" r="17" fill="none" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 17}`}
              strokeDashoffset={`${2 * Math.PI * 17 * (1 - progress)}`}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${isUrgent ? 'stroke-red-500' : 'stroke-primary'}`} />
          </svg>
          <Clock size={14} className={`absolute inset-0 m-auto ${isUrgent ? 'text-red-500' : 'text-primary'}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold tabular-nums ${isUrgent ? 'text-red-600' : 'text-text'}`}>
            {minutes}:{seconds}
          </p>
          <p className={`text-xs ${isUrgent ? 'text-red-400' : 'text-text-secondary'}`}>
            {isUrgent ? 'Осталось меньше минуты!' : 'Бронь удерживается за вами'}
          </p>
        </div>
      </div>

      <Card className="my-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-text-secondary">Кабинет</span>
          <span className="text-sm font-medium text-text">«{cabinet.name}»</span>
        </div>
        <div className="flex items-start justify-between">
          <span className="text-sm text-text-secondary">Дата и время</span>
          <span className="text-sm font-medium text-text text-right">
            {dateLabel}, {slots.map((s) => `${s.startTime}–${s.endTime}`).join(', ')}
          </span>
        </div>
      </Card>

      <div className="flex items-baseline justify-between mb-6">
        <span className="text-sm text-text-secondary">Сумма к оплате</span>
        <span className="text-2xl font-bold text-text">{amount.toLocaleString('ru')} ₸</span>
      </div>

      <Card className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#FF4B3A] flex items-center justify-center text-white font-bold shrink-0">
          K
        </div>
        <div className="min-w-0">
          <p className="font-medium text-text">Kaspi</p>
          <p className="text-xs text-text-secondary">Оплата по QR в приложении Kaspi.kz</p>
        </div>
      </Card>

      <Button fullWidth disabled={loading} onClick={handlePay}>
        {loading ? 'Переходим к оплате...' : 'Оплатить через Kaspi'}
      </Button>

      <p className="text-xs text-text-secondary text-center mt-3">
        Вы перейдёте на страницу Kaspi с QR-кодом. После оплаты менеджер подтвердит бронь.
      </p>
    </div>
  )
}
