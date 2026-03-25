import { useState, useEffect } from 'react'
import { Plus, Trash2, FolderKanban } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnchorStore } from '@/store/anchorStore'
import { useTaskStore } from '@/store/taskStore'
import { InspirationTag, type Inspiration } from '@/types'
import { message } from 'antd'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

export function InspirationBox() {
  const navigate = useNavigate()
  const {
    inspirations,
    fetchInspirations,
    createInspiration,
    deleteInspiration,
    inspirationToProject,
  } = useAnchorStore()
  const { fetchAllTasks } = useTaskStore()
  const [newContent, setNewContent] = useState('')
  const [newTag, setNewTag] = useState<InspirationTag>(InspirationTag.FIVE_MIN)
  const [filterTag, setFilterTag] = useState<string>('all')

  useEffect(() => {
    fetchInspirations()
  }, [])

  const handleAdd = async () => {
    if (!newContent.trim()) return
    await createInspiration({
      content: newContent.trim(),
      tag: newTag,
    })
    setNewContent('')
  }

  const handleDelete = async (id: number) => {
    await deleteInspiration(id)
  }

  // 将灵感转为项目，并跳转到项目列表（思维导图）
  const handleToProject = async (inspiration: Inspiration) => {
    const task = await inspirationToProject(inspiration)
    await fetchAllTasks()
    message.success('已转为项目，开始拆解吧 ✨')
    // 跳转到项目列表页面，并选中刚创建的项目
    navigate(`/projects?projectId=${task.id}`)
  }

  const filteredInspirations = filterTag === 'all'
    ? inspirations
    : inspirations.filter((i) => i.tag === filterTag)

  const groupedByTag = {
    [InspirationTag.FIVE_MIN]: filteredInspirations.filter((i) => i.tag === InspirationTag.FIVE_MIN),
    [InspirationTag.THIRTY_MIN]: filteredInspirations.filter((i) => i.tag === InspirationTag.THIRTY_MIN),
    [InspirationTag.LONG_TERM]: filteredInspirations.filter((i) => i.tag === InspirationTag.LONG_TERM),
    [InspirationTag.EMOTION]: filteredInspirations.filter((i) => i.tag === InspirationTag.EMOTION),
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">灵感信箱</h2>
      <p className="text-gray-500 mb-3 md:mb-6">你的灵感收集箱</p>

      <div className="flex gap-2 mb-6">
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="记录灵感..."
          className="flex-1"
          rows={2}
        />
        <div className="space-y-2">
          <Select value={newTag} onValueChange={(v) => setNewTag(v as InspirationTag)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={InspirationTag.FIVE_MIN}>5分钟小事</SelectItem>
              <SelectItem value={InspirationTag.THIRTY_MIN}>30分钟兴趣</SelectItem>
              <SelectItem value={InspirationTag.LONG_TERM}>长期储备</SelectItem>
              <SelectItem value={InspirationTag.EMOTION}>情绪树洞</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilterTag}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value={InspirationTag.FIVE_MIN}>5分钟</TabsTrigger>
          <TabsTrigger value={InspirationTag.THIRTY_MIN}>30分钟</TabsTrigger>
          <TabsTrigger value={InspirationTag.LONG_TERM}>长期</TabsTrigger>
          <TabsTrigger value={InspirationTag.EMOTION}>情绪</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[calc(100vh-240px)] md:h-[calc(100vh-340px)]">
            <div className="space-y-4">
              {Object.entries(groupedByTag).map(([tag, items]) =>
                items.length > 0 ? (
                  <div key={tag}>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{tag}</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-3 flex items-start gap-3">
                            <span className="flex-1 text-sm">{item.content}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-blue-400 hover:text-blue-500"
                              onClick={() => handleToProject(item)}
                              title="转为项目"
                            >
                              <FolderKanban className="h-3 w-3" />
                            </Button>
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
                ) : null
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
