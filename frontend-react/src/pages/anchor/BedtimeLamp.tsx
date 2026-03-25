import { useState, useEffect } from 'react'
import { Moon, Heart, CheckCircle, Sparkles } from 'lucide-react'
import { useAnchorStore } from '@/store/anchorStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const GENTLE_MESSAGE = '今天的你已经做得很好了，好好休息吧，明天见'

const CHECKLIST = [
  '关闭所有电子设备',
  '整理明天要穿的衣服',
  '检查明天要带的东西',
  '写日记总结今天',
  '做一些简单的伸展',
  '深呼吸放松',
]

const AFFIRMATIONS = [
  '我今天已经很努力了',
  '我的感受是重要的',
  '我值得被爱',
  '明天是新的开始',
  '我允许自己休息',
  '我感谢今天的自己',
]

export function BedtimeLamp() {
  const { todayAchievementCount, fetchTodayStat, achievements, fetchAchievements } = useAnchorStore()
  const [checked, setChecked] = useState<string[]>([])
  const [showAffirmation, setShowAffirmation] = useState(AFFIRMATIONS[0])

  useEffect(() => {
    fetchTodayStat()
    fetchAchievements()
  }, [])

  const toggleCheck = (item: string) => {
    setChecked((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const randomAffirmation = () => {
    const random = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]
    setShowAffirmation(random)
  }

  const todayAchievements = achievements.slice(0, 3)

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Moon className="h-6 w-6 text-indigo-500" />
        睡前小台灯
      </h2>
      <p className="text-gray-500 mb-3 md:mb-6">{GENTLE_MESSAGE}</p>

      <div className="grid gap-6">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              今日肯定语
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center py-4 font-medium text-indigo-700">
              {showAffirmation}
            </p>
            <button
              onClick={randomAffirmation}
              className="text-xs text-indigo-500 hover:underline block mx-auto"
            >
              换一条
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">睡前检查清单</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CHECKLIST.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={checked.includes(item)}
                    onChange={() => toggleCheck(item)}
                    className="rounded"
                  />
                  <span className={checked.includes(item) ? 'line-through text-gray-400' : ''}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              今日小成就
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-2">
              <div className="text-3xl font-bold text-primary">{todayAchievementCount}</div>
              <div className="text-sm text-gray-500">个成果</div>
            </div>
            {todayAchievements.length > 0 && (
              <div className="mt-4 space-y-2">
                {todayAchievements.map((a) => (
                  <div key={a.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {a.content}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
