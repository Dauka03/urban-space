import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminsApi } from '@/api/admins'
import { AdminFormModal } from './AdminFormModal'
import type { Admin } from '@/types'

export function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = () => {
    adminsApi
      .getAll()
      .then(setAdmins)
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Удалить администратора «${admin.name} ${admin.surname}»?`)) return
    try {
      await adminsApi.remove(admin.id)
      load()
    } catch {
      alert('Не удалось удалить администратора')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">Администраторы</h2>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={16} className="mr-1" /> Добавить
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Загрузка...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <Card key={admin.id}>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-text">
                    {admin.name} {admin.surname}
                  </p>
                  <p className="text-sm text-text-secondary">{admin.phone}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-text-secondary bg-surface-2 rounded-full px-2.5 py-1">
                  {admin.role === 'SUPER_ADMIN' ? 'Супер-админ' : 'Админ'}
                </span>
                {admin.role !== 'SUPER_ADMIN' && (
                  <button
                    onClick={() => handleDelete(admin)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-2"
                  >
                    <Trash2 size={16} className="text-error" />
                  </button>
                )}
              </div>
            </Card>
          ))}
          {admins.length === 0 && <p className="text-sm text-text-secondary">Администраторов пока нет</p>}
        </div>
      )}

      {creating && (
        <AdminFormModal
          open
          onClose={() => setCreating(false)}
          onSaved={load}
        />
      )}
    </div>
  )
}
