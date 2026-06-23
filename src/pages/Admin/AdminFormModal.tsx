import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { adminsApi } from '@/api/admins'
import { ApiError } from '@/api/client'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

// Adding an admin is a two-step OTP flow: request sends a code to the phone,
// confirm verifies it and creates the account.
type Step = 'request' | 'confirm'

export function AdminFormModal({ open, onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>('request')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequest = async () => {
    if (!phone.trim() || !name.trim()) {
      setError('Заполните телефон и имя')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await adminsApi.request({
        phone: phone.trim(),
        name: name.trim(),
        surname: surname.trim() || undefined,
      })
      setStep('confirm')
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 409
          ? 'Администратор с таким телефоном уже существует'
          : 'Не удалось отправить код',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleConfirm = async () => {
    if (!code.trim()) {
      setError('Введите код из СМС')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await adminsApi.confirm({ phone: phone.trim(), code: code.trim() })
      onSaved()
      onClose()
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 404
          ? 'Неверный код или истёк срок действия'
          : 'Не удалось подтвердить код',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={step === 'request' ? 'Новый администратор' : 'Подтверждение по СМС'}
      onClose={onClose}
      footer={
        step === 'request' ? (
          <Button fullWidth disabled={saving} onClick={handleRequest}>
            {saving ? 'Отправляем...' : 'Отправить код'}
          </Button>
        ) : (
          <Button fullWidth disabled={saving} onClick={handleConfirm}>
            {saving ? 'Создаём...' : 'Создать администратора'}
          </Button>
        )
      }
    >
      {step === 'request' ? (
        <>
          <Input
            label="Телефон"
            placeholder="+77001234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Фамилия" value={surname} onChange={(e) => setSurname(e.target.value)} />
        </>
      ) : (
        <>
          <p className="text-sm text-text-secondary">
            Код отправлен на номер {phone.trim()}.
          </p>
          <Input
            label="Код из СМС"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </Modal>
  )
}
