import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { useAnchorStore } from '@/store/anchorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const GENTLE_MESSAGE = '你已经很棒了，哪怕今天什么都没做，也值得被接纳'

export function AchievementBox() {
  const {
    achievements,
    fetchAchievements,
    createAchievement,
    deleteAchievement,
    todayAchievementCount,
    fetchTodayStat,
  } = useAnchorStore()
  const [newContent, setNewContent] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetchAchievements()
    fetchTodayStat()
  }, [])

  const handleAdd = async () => {
    if (!newContent.trim()) return
    await createAchievement({
      content: newContent.trim(),
      tag: newTag || '今日成就',
    })
    setNewContent('')
    setNewTag('')
  }

  const handleDelete = async (id: number) => {
    await deleteAchievement(id)
  }

  const groupedByTag = achievements.reduce((acc, item) => {
    const tag = item.tag || '未分类'
    if (!acc[tag]) acc[tag] = []
    acc[tag].push(item)
    return acc
  }, {} as Record<string, typeof achievements>)

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">成果收集箱</h2>
      <p className="text-gray-500 mb-6">{GENTLE_MESSAGE}</p>

      <div className="bg-primary/10 rounded-lg p-4 mb-6 text-center">
        <div className="text-3xl font-bold text-primary">{todayAchievementCount}</div>
        <div className="text-sm text-gray-600">今日成果</div>
      </div>

      <div className="flex gap-2 mb-6">
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="记录你的成果..."
          className="flex-1"
          rows={2}
        />
        <div className="space-y-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="标签"
            className="w-24"
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-420px)]">
        <div className="space-y-4">
          {Object.entries(groupedByTag).map(([tag, items]) => (
            <div key={tag}>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {tag} ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-3 flex items-start gap-3">
                      <span className="flex-1 text-sm">{item.content}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-400 hover:text-red-500"
                        onClick={() => item.id && handleDelete(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          {achievements.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              还没有成果记录
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
