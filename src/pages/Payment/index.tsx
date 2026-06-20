import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useBookingStore } from '@/store/bookingStore'

const BANKS = [
  { id: 'halyk', name: 'Halyk Bank', emoji: '🟢' },
  { id: 'kaspi', name: 'Kaspi Bank', emoji: '🔴' },
]

export default function Payment() {
  const navigate = useNavigate()
  const pending = useBookingStore((s) => s.pending)
  const reset = useBookingStore((s) => s.reset)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)

  if (!pending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4 text-center">
        <p className="text-text-secondary mb-6">Нет активного бронирования</p>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </div>
    )
  }

  const { cabinet, date, slots } = pending
  const amount = slots.reduce((sum, s) => sum + (s.response.booking.totalAmount ?? 0), 0)
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('ru', { day: '2-digit', month: 'long' })
  // Each range was created as its own booking; pay them via the first link the API returned.
  const paymentUrl = slots.map((s) => s.response.paymentUrl).find(Boolean)

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

      <h1 className="text-xl font-bold text-text mb-1">Способ оплаты</h1>

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

      <p className="text-2xl font-bold text-text mb-6">{amount.toLocaleString()} ₸</p>

      <Card padding={false} className="overflow-hidden mb-4">
        {BANKS.map((bank, i) => (
          <button
            key={bank.id}
            onClick={() => setSelectedBank(bank.id)}
            className={`w-full flex items-center justify-between px-4 py-4 transition-colors hover:bg-surface
              ${i > 0 ? 'border-t border-border' : ''}
              ${selectedBank === bank.id ? 'bg-primary-light' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{bank.emoji}</span>
              <span className="font-medium text-text">{bank.name}</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selectedBank === bank.id ? 'border-primary' : 'border-border'}`}>
              {selectedBank === bank.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
          </button>
        ))}
      </Card>

      <Button fullWidth disabled={!selectedBank || loading} onClick={handlePay}>
        {loading ? 'Обработка...' : 'Перейти к оплате'}
      </Button>

      <p className="text-xs text-text-secondary text-center mt-3">
        Платёж защищён. После оплаты вы получите подтверждение бронирования.
      </p>
    </div>
  )
}
