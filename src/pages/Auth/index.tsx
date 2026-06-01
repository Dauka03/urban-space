import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { ApiError } from '@/api/client'

type Step = 'phone' | 'register'

export default function Auth() {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setPhone: savePhone, setMode } = useAuthStore()
  const navigate = useNavigate()

  const fullPhone = `+7${phone}`

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.requestOtp(fullPhone)
      savePhone(fullPhone)
      setMode('login')
      navigate('/auth/otp')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // No account found — switch to registration
        setStep('register')
      } else {
        setError('Не удалось отправить код. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.register(fullPhone, name.trim(), surname.trim())
      savePhone(fullPhone)
      setMode('register')
      navigate('/auth/otp')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Этот номер уже зарегистрирован. Войдите в аккаунт.')
        setStep('phone')
      } else {
        setError('Ошибка при регистрации. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4">
      <div className="w-full max-w-sm">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
          <span className="text-white font-bold">US</span>
        </div>

        {step === 'phone' && (
          <>
            <h1 className="text-2xl font-bold text-text mb-1">Добро пожаловать</h1>
            <p className="text-sm text-text-secondary mb-8">
              Войдите, чтобы бронировать рабочее место
            </p>

            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
              <Input
                label="Номер телефона"
                type="tel"
                placeholder="000 000 00 00"
                prefix={<span className="text-sm">🇰🇿 +7</span>}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
              />
              {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}
              <p className="text-xs text-text-secondary -mt-2">
                По WhatsApp на номер придёт SMS с кодом подтверждения
              </p>
              <Button type="submit" fullWidth disabled={phone.length < 10 || loading}>
                {loading ? 'Отправляем...' : 'Получить код'}
              </Button>
            </form>
          </>
        )}

        {step === 'register' && (
          <>
            <h1 className="text-2xl font-bold text-text mb-1">Создать аккаунт</h1>
            <p className="text-sm text-text-secondary mb-8">
              Номер +7 {phone} не найден. Заполните данные для регистрации.
            </p>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <Input
                label="Имя"
                type="text"
                placeholder="John"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Фамилия"
                type="text"
                placeholder="Doe"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button
                type="submit"
                fullWidth
                disabled={!name.trim() || !surname.trim() || loading}
              >
                {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
              </Button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setError('') }}
                className="text-sm text-primary hover:underline text-center"
              >
                Изменить номер
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
