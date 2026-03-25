import { useState, useEffect } from 'react'
import { Plus, Trash2, Check, Puzzle } from 'lucide-react'
import { useAnchorStore } from '@/store/anchorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const GENTLE_MESSAGE = '没关系哦，拼图是一块一块拼起来的'

const SKILL_DOMAINS = [
  'Java基础',
  'Spring Boot',
  '数据结构',
  '算法',
  'MySQL',
  'Redis',
  '计算机网络',
  '操作系统',
]

export function SkillPuzzle() {
  const { skills, fetchSkills, createSkill, deleteSkill, masterSkill } = useAnchorStore()
  const [newSkill, setNewSkill] = useState('')
  const [newDomain, setNewDomain] = useState(SKILL_DOMAINS[0])
  const [newTip, setNewTip] = useState('')

  useEffect(() => {
    fetchSkills()
  }, [])

  const handleAdd = async () => {
    if (!newSkill.trim()) return
    await createSkill({
      particleName: newSkill.trim(),
      skillDomain: newDomain,
      particleTip: newTip,
    })
    setNewSkill('')
    setNewTip('')
  }

  const handleMaster = async (id: number) => {
    await masterSkill(id)
  }

  const handleDelete = async (id: number) => {
    await deleteSkill(id)
  }

  const mastered = skills.filter((s) => s.isMastered)
  const unmastered = skills.filter((s) => !s.isMastered)

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">技能拼图</h2>
      <p className="text-gray-500 mb-3 md:mb-6">{GENTLE_MESSAGE}</p>

      <div className="flex gap-2 mb-6">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="技能颗粒名称"
          className="flex-1"
        />
        <select
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="border rounded px-3 text-sm"
        >
          {SKILL_DOMAINS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <Input
          value={newTip}
          onChange={(e) => setNewTip(e.target.value)}
          placeholder="掌握提示"
          className="w-40"
        />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Puzzle className="h-4 w-4" />
            待掌握 ({unmastered.length})
          </h3>
          <ScrollArea className="h-[calc(100vh-220px)] md:h-[calc(100vh-320px)]">
            <div className="space-y-2">
              {unmastered.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{skill.particleName}</div>
                      <div className="text-xs text-gray-500">{skill.skillDomain}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => skill.id && handleMaster(skill.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      掌握
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-400"
                      onClick={() => skill.id && handleDelete(skill.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {unmastered.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  暂无待掌握技能
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            已掌握 ({mastered.length})
          </h3>
          <ScrollArea className="h-[calc(100vh-220px)] md:h-[calc(100vh-320px)]">
            <div className="space-y-2">
              {mastered.map((skill) => (
                <Card key={skill.id} className="bg-green-50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm line-through text-gray-500">
                        {skill.particleName}
                      </div>
                      <div className="text-xs text-gray-500">{skill.skillDomain}</div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-400"
                      onClick={() => skill.id && handleDelete(skill.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {mastered.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  暂无已掌握技能
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
