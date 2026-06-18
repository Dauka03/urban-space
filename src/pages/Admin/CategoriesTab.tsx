import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { categoriesApi } from '@/api/categories'
import type { Category } from '@/types'

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  const load = () => {
    setLoading(true)
    categoriesApi
      .getAll()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleAdd = async () => {
    if (!name.trim()) return
    setAdding(true)
    try {
      await categoriesApi.create({ name: name.trim() })
      setName('')
      load()
    } catch {
      alert('Не удалось создать категорию')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Удалить категорию «${cat.name}»?`)) return
    try {
      await categoriesApi.remove(cat.id)
      load()
    } catch {
      alert('Не удалось удалить категорию')
    }
  }

  return (
    <div>
      <h2 className="font-semibold text-text mb-4">Категории</h2>

      <div className="flex items-end gap-2 mb-4">
        <div className="flex-1">
          <Input
            label="Новая категория"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Например, Массаж"
          />
        </div>
        <Button disabled={adding || !name.trim()} onClick={handleAdd}>
          <Plus size={16} className="mr-1" /> Добавить
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Загрузка...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <div className="flex items-center gap-3">
                <p className="flex-1 font-medium text-text">{cat.name}</p>
                <button onClick={() => handleDelete(cat)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-2">
                  <Trash2 size={16} className="text-error" />
                </button>
              </div>
            </Card>
          ))}
          {categories.length === 0 && <p className="text-sm text-text-secondary">Категорий пока нет</p>}
        </div>
      )}
    </div>
  )
}
