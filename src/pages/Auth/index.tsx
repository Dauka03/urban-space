import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'

export default function Auth() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const { setPhone: savePhone } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 10) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    savePhone(phone)
    setLoading(false)
    navigate('/auth/otp')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100svh-56px)] px-4">
      <div className="w-full max-w-sm">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
          <span className="text-white font-bold">US</span>
        </div>

        <h1 className="text-2xl font-bold text-text mb-1">Добро пожаловать</h1>
        <p className="text-sm text-text-secondary mb-8">
          Войдите, чтобы бронировать рабочее место
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Номер телефона"
            type="tel"
            placeholder="000 000 00 00"
            prefix={<span className="text-sm">🇰🇿 +7</span>}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
          />
          <p className="text-xs text-text-secondary -mt-2">
            По WhatsApp на номер придёт SMS с кодом подтверждения
          </p>
          <Button type="submit" fullWidth disabled={phone.length < 10 || loading}>
            {loading ? 'Отправляем...' : 'Получить код'}
          </Button>
        </form>
      </div>
    </div>
  )
}
