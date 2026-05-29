import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const BANKS = [
  { id: 'halyk', name: 'Halyk Bank', emoji: '🟢' },
  { id: 'kaspi', name: 'Kaspi Bank', emoji: '🔴' },
]

const AMOUNT = 600

export default function Payment() {
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const navigate = useNavigate()

  const handlePay = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setPaid(true)
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4 text-center">
        <CheckCircle2 size={64} className="text-success mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Оплачено!</h2>
        <p className="text-sm text-text-secondary mb-6">Бронирование подтверждено</p>
        <Button onClick={() => navigate('/')}>На главную</Button>
      </div>
    )
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-secondary mb-6 hover:text-text">
        <ChevronLeft size={20} />
        <span className="text-sm">Payment</span>
      </button>

      <h1 className="text-xl font-bold text-text mb-1">Способ оплаты</h1>
      <p className="text-2xl font-bold text-text mt-2 mb-6">{AMOUNT.toLocaleString()} ₸</p>

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
