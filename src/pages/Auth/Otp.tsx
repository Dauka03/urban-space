import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { ApiError } from '@/api/client'
import type { User } from '@/types'

const OTP_LENGTH = 6

export default function Otp() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const phone = useAuthStore((s) => s.phone)
  const mode = useAuthStore((s) => s.mode)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo

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
    setError('')
    setLoading(true)
    const code = digits.join('')

    try {
      const res =
        mode === 'register'
          ? await authApi.confirmRegister(phone, code)
          : await authApi.verifyOtp(phone, code)

      const user: User = {
        ...res.user,
        role: res.user.role as User['role'],
      }

      setAuth(res.accessToken, user)
      navigate(returnTo ?? '/')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Неверный или истёкший код. Попробуйте ещё раз.')
        setDigits(Array(OTP_LENGTH).fill(''))
        inputs.current[0]?.focus()
      } else {
        setError('Что-то пошло не так. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setDigits(Array(OTP_LENGTH).fill(''))
    inputs.current[0]?.focus()

    try {
      if (mode === 'login') {
        await authApi.requestOtp(phone)
      }
      // For register mode, re-sending would require name/surname — redirect back to auth
    } catch {
      setError('Не удалось повторно отправить код.')
    }
  }

  const isComplete = digits.every(Boolean)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-text-secondary mb-6 hover:text-text"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Назад</span>
        </button>

        <h1 className="text-2xl font-bold text-text mb-1">Введите код</h1>
        <p className="text-sm text-text-secondary mb-8">
          Код был отправлен на номер {phone}
        </p>

        <div className="flex gap-2 mb-4">
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

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <Button fullWidth disabled={!isComplete || loading} onClick={handleVerify}>
          {loading ? 'Проверяем...' : 'Продолжить'}
        </Button>

        <p className="text-center text-xs text-text-secondary mt-4">
          Продолжая, вы принимаете{' '}
          <button className="text-primary hover:underline">условия использования</button>
        </p>

        <div className="text-center mt-3">
          <button onClick={handleResend} className="text-sm text-primary hover:underline">
            Отправить повторно
          </button>
        </div>
      </div>
    </div>
  )
}
