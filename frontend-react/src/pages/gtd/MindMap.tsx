import { useState, useEffect } from 'react'
import { Save, Download, FileText } from 'lucide-react'
import { MarkmapView } from '@/components/MarkmapView'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

// 示例 Markdown
const DEFAULT_MARKDOWN = `# 我的思维导图

## 一级节点 1
- 二级节点 1
  - 三级节点 A
  - 三级节点 B
- 二级节点 2
  - 三级节点 C

## 一级节点 2
- 二级节点 3
  - 三级节点 D

## 一级节点 3
- 二级节点 4
`

export function MindMap() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [savedMaps, setSavedMaps] = useState<{ name: string; content: string }[]>([])

  // 从 localStorage 加载保存的思维导图
  useEffect(() => {
    const saved = localStorage.getItem('mindmaps')
    if (saved) {
      setSavedMaps(JSON.parse(saved))
    }
  }, [])

  // 保存到 localStorage
  const handleSave = () => {
    const name = prompt('请输入思维导图名称：')
    if (!name) return

    const newMap = { name, content: markdown }
    const updated = [...savedMaps, newMap]
    setSavedMaps(updated)
    localStorage.setItem('mindmaps', JSON.stringify(updated))
  }

  // 导出为 HTML
  const handleExport = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mind Map</title>
  <script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.18.12/dist/bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/markmap-view@0.18.12/dist/bundle.js"></script>
  <style>
    html, body, #app { margin: 0; padding: 0; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const markdown = \`${markdown.replace(/`/g, '\\`')}\`;
    const { Markmap } = markmap;
    const { Transformer } = markmap_lib;
    const transformer = new Transformer();
    const options = transformer.getOptions();
    const mm = Markmap.create(document.getElementById('app'), { markdown, ...options });
  </script>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mindmap.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 加载已有思维导图
  const handleLoad = (content: string) => {
    if (confirm('加载新的思维导图将覆盖当前内容，确定吗？')) {
      setMarkdown(content)
    }
  }

  // 删除思维导图
  const handleDelete = (index: number) => {
    if (confirm('确定删除这个思维导图吗？')) {
      const updated = savedMaps.filter((_, i) => i !== index)
      setSavedMaps(updated)
      localStorage.setItem('mindmaps', JSON.stringify(updated))
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* 左侧：Markdown 编辑器 */}
      <div className="w-1/2 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">思维导图</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />保存
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />导出 HTML
            </Button>
          </div>
        </div>
        <p className="text-gray-500 mb-4 text-sm">
          使用 Markdown 语法编辑，自动生成思维导图
        </p>

        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="flex-1 w-full p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="使用 Markdown 语法编写思维导图..."
        />
      </div>

      {/* 中间：思维导图预览 */}
      <div className="w-1/2 bg-white rounded-lg overflow-hidden border">
        <MarkmapView markdown={markdown} className="h-full" />
      </div>

      {/* 右侧：已保存的思维导图 */}
      <div className="w-48 flex-shrink-0">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          已保存
        </h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {savedMaps.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无保存的思维导图
              </div>
            ) : (
              savedMaps.map((map, index) => (
                <Card key={index} className="cursor-pointer hover:border-primary" onClick={() => handleLoad(map.content)}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1">{map.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(index)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
