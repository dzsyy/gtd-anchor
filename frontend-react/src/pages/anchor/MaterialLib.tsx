import { useState, useEffect } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { useAnchorStore } from '@/store/anchorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MaterialLib() {
  const { materials, fetchMaterials, createMaterial, deleteMaterial } = useAnchorStore()
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newContent, setNewContent] = useState('')

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    await createMaterial({
      title: newTitle.trim(),
      url: newUrl.trim(),
      content: newContent.trim(),
    })
    setNewTitle('')
    setNewUrl('')
    setNewContent('')
  }

  const handleDelete = async (id: number) => {
    await deleteMaterial(id)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">灵感投喂库</h2>
      <p className="text-gray-500 mb-6">收藏对你有启发的文章、视频、素材</p>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="素材标题"
          />
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="素材链接 (可选)"
          />
          <Input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="简要说明 (可选)"
          />
          <Button onClick={handleAdd} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            添加素材
          </Button>
        </CardContent>
      </Card>

      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="grid md:grid-cols-2 gap-4">
          {materials.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    {item.content && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        查看链接
                      </a>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-gray-400 hover:text-red-500 flex-shrink-0"
                    onClick={() => item.id && handleDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {materials.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">
              投喂库是空的
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
