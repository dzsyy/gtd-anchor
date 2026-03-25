import { useState, useEffect } from 'react'
import { Plus, Heart, Trash2 } from 'lucide-react'
import { useAnchorStore } from '@/store/anchorStore'
import { InspirationTag } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const GENTLE_MESSAGE = '我会好好接住你的'

export function EmotionCave() {
  const { inspirations, fetchInspirations, createInspiration, deleteInspiration } = useAnchorStore()
  const [newContent, setNewContent] = useState('')

  useEffect(() => {
    fetchInspirations()
  }, [])

  const handleAdd = async () => {
    if (!newContent.trim()) return
    await createInspiration({
      content: newContent.trim(),
      tag: InspirationTag.EMOTION,
    })
    setNewContent('')
  }

  const handleDelete = async (id: number) => {
    await deleteInspiration(id)
  }

  const emotions = inspirations.filter((i) => i.tag === InspirationTag.EMOTION)

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Heart className="h-6 w-6 text-pink-500" />
        情绪树洞
      </h2>
      <p className="text-gray-500 mb-3 md:mb-6">{GENTLE_MESSAGE}</p>

      <Card className="bg-pink-50 border-pink-200 mb-6">
        <CardContent className="p-4 space-y-4">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="在这里倾诉吧..."
            rows={4}
            className="bg-white"
          />
          <Button onClick={handleAdd} className="w-full bg-pink-500 hover:bg-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            倾诉
          </Button>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-380px)]">
        <div className="space-y-3">
          {emotions.map((item) => (
            <Card key={item.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-sm whitespace-pre-wrap">{item.content}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                    onClick={() => item.id && handleDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {item.createTime?.slice(0, 16) || ''}
                </div>
              </CardContent>
            </Card>
          ))}
          {emotions.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              树洞是空的，倾诉一下吧
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
