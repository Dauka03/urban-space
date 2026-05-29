import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

const OTP_LENGTH = 4

export default function Otp() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const { phone, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    if (value && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setUser({ id: '1', phone })
    setLoading(false)
    navigate('/')
  }

  const isComplete = digits.every(Boolean)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-secondary mb-6 hover:text-text">
          <ChevronLeft size={20} />
          <span className="text-sm">Назад</span>
        </button>

        <h1 className="text-2xl font-bold text-text mb-1">Введите код</h1>
        <p className="text-sm text-text-secondary mb-8">
          Код был отправлен на номер +7 {phone}
        </p>

        <div className="flex gap-3 mb-8">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-full aspect-square text-center text-xl font-semibold rounded-xl border border-border bg-surface focus:border-primary focus:outline-none transition-colors"
            />
          ))}
        </div>

        <Button fullWidth disabled={!isComplete || loading} onClick={handleVerify}>
          {loading ? 'Проверяем...' : 'Продолжить'}
        </Button>

        <p className="text-center text-xs text-text-secondary mt-4">
          Продолжая, вы принимаете{' '}
          <button className="text-primary hover:underline">условия использования</button>
        </p>

        <div className="text-center mt-3">
          <button className="text-sm text-primary hover:underline">Повторить</button>
        </div>
      </div>
    </div>
  )
}
