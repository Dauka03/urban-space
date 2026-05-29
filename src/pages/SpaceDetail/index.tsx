import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MOCK_SPACES } from '@/pages/Home/mockData'

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

export default function SpaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const space = MOCK_SPACES.find((s) => s.id === id)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  if (!space) return <div className="p-4">Кабинет не найден</div>

  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  return (
    <div className="max-w-screen-sm mx-auto">
      <div className="relative">
        <div className="aspect-video bg-surface-2">
          {space.images[0] && (
            <img src={space.images[0]} alt={space.title} className="w-full h-full object-cover" />
          )}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-text mb-1">«{space.title}»</h1>
        <div className="flex items-center gap-1 text-text-secondary text-sm mb-3">
          <MapPin size={14} />
          <span>{space.address}</span>
        </div>
        <p className="text-sm text-text-secondary mb-6">{space.description}</p>

        <Card>
          <p className="text-sm font-medium text-text mb-3">Выберите дату аренды</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((d) => {
              const key = d.toISOString().split('T')[0]
              const label = d.toLocaleDateString('ru', { day: '2-digit', month: 'short' })
              const isSelected = selectedDate === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                    ${isSelected ? 'bg-primary text-white' : 'bg-surface-2 text-text hover:bg-border'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </Card>

        {selectedDate && (
          <Card className="mt-3">
            <p className="text-sm font-medium text-text mb-3">Выберите время</p>
            <div className="grid grid-cols-5 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 rounded-xl text-sm font-medium transition-colors
                    ${selectedTime === t ? 'bg-primary text-white' : 'bg-surface-2 text-text hover:bg-border'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary text-sm">Стоимость</span>
            <span className="text-lg font-bold text-text">{space.pricePerHour.toLocaleString()} ₸/час</span>
          </div>
          <Button
            fullWidth
            disabled={!selectedDate || !selectedTime}
            onClick={() => navigate('/payment')}
          >
            Перейти к оплате
          </Button>
        </div>
      </div>
    </div>
  )
}
