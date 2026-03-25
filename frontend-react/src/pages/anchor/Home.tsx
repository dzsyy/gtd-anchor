import { useState, useEffect } from 'react'
import { Plus, Sparkles, Trophy } from 'lucide-react'
import { useAnchorStore } from '@/store/anchorStore'
import { InspirationTag } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const GENTLE_MESSAGES = {
  home: '灵感已锚定，不会丢啦',
  achievement: '你已经很棒了，哪怕今天什么都没做，也值得被接纳',
}

export function Home() {
  const { todayAchievementCount, fetchTodayStat, createInspiration, createAchievement } =
    useAnchorStore()
  const [inspirationContent, setInspirationContent] = useState('')
  const [inspirationTag, setInspirationTag] = useState<InspirationTag>(InspirationTag.FIVE_MIN)
  const [achievementContent, setAchievementContent] = useState('')
  const [achievementTag, setAchievementTag] = useState('')

  useEffect(() => {
    fetchTodayStat()
  }, [])

  const handleAddInspiration = async () => {
    if (!inspirationContent.trim()) return
    await createInspiration({
      content: inspirationContent.trim(),
      tag: inspirationTag,
    })
    setInspirationContent('')
  }

  const handleAddAchievement = async () => {
    if (!achievementContent.trim()) return
    await createAchievement({
      content: achievementContent.trim(),
      tag: achievementTag || '今日成就',
    })
    setAchievementContent('')
    fetchTodayStat()
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">锚点首页</h2>
      <p className="text-gray-500 mb-3 md:mb-6">{GENTLE_MESSAGES.home}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              灵感捕捉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inspirationContent}
              onChange={(e) => setInspirationContent(e.target.value)}
              placeholder="记录你的灵感..."
              rows={3}
            />
            <Select
              value={inspirationTag}
              onValueChange={(v) => setInspirationTag(v as InspirationTag)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InspirationTag.FIVE_MIN}>5分钟小事库</SelectItem>
                <SelectItem value={InspirationTag.THIRTY_MIN}>30分钟兴趣库</SelectItem>
                <SelectItem value={InspirationTag.LONG_TERM}>长期灵感储备库</SelectItem>
                <SelectItem value={InspirationTag.EMOTION}>情绪树洞库</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddInspiration} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              记录灵感
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              今日成果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={achievementContent}
              onChange={(e) => setAchievementContent(e.target.value)}
              placeholder="记录你今天的成就..."
              rows={3}
            />
            <Input
              value={achievementTag}
              onChange={(e) => setAchievementTag(e.target.value)}
              placeholder="标签 (如: 读书/编程)"
            />
            <Button onClick={handleAddAchievement} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              记录成果
            </Button>
            <div className="text-center text-sm text-gray-500">
              今日成果数: <span className="font-bold text-primary text-lg">{todayAchievementCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
