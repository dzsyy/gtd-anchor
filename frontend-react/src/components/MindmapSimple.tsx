import { useEffect, useRef, useMemo, useCallback } from 'react'
import MindMap from 'simple-mind-map'
import Export from 'simple-mind-map/src/plugins/Export.js'
import { Dropdown, message } from 'antd'
import { Download, FileJson, FileImage, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Task } from '@/types'
import { NodeLevel } from '@/types'

// 注册导出插件
MindMap.usePlugin(Export)

interface MindmapSimpleProps {
  tasks: Task[]
  selectedProjectId: number
}

export function MindmapSimple({
  tasks,
  selectedProjectId,
}: MindmapSimpleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindMapRef = useRef<any>(null)

  // 构建思维导图数据
  const mindMapData = useMemo(() => {
    const rootTask = tasks.find(t => t.id === selectedProjectId)
    if (!rootTask) return null

    const buildTree = (task: Task, isRoot: boolean): any => {
      const children = tasks
        .filter(t => t.parentId === task.id)
        .map(child => buildTree(child, false))

      // 根据节点级别设置颜色
      let fillColor = '#00c0b8' // 默认根节点色
      if (task.nodeLevel === NodeLevel.POWDER) {
        fillColor = task.isCompleted ? '#9ca3af' : '#f59e0b'
      } else if (task.nodeLevel === NodeLevel.MODULE) {
        fillColor = '#10b981'
      } else if (task.nodeLevel === NodeLevel.MILESTONE) {
        fillColor = '#3b82f6'
      }

      const nodeData: any = {
        data: {
          text: task.title,
          fillColor,
          isCompleted: task.isCompleted,
        },
        children: children.length > 0 ? children : undefined,
      }

      // 非根节点设置为向右生长
      if (!isRoot) {
        nodeData.data.dir = 'right'
      }

      return nodeData
    }

    return buildTree(rootTask, true)
  }, [tasks, selectedProjectId])

  // 初始化 MindMap
  useEffect(() => {
    if (!containerRef.current || !mindMapData) return

    // 检查容器是否有实际的宽高
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      // 等待容器有实际尺寸
      const timeoutId = setTimeout(() => {
        const newRect = container.getBoundingClientRect()
        if (newRect.width > 0 && newRect.height > 0) {
          initMindMap(container, mindMapData)
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }

    initMindMap(container, mindMapData)
  }, [mindMapData])

  const initMindMap = (container: HTMLDivElement, data: any) => {
    // 销毁旧的 MindMap 实例
    if (mindMapRef.current) {
      mindMapRef.current.destroy()
      mindMapRef.current = null
    }

    const mindMap = new MindMap({
      el: container,
      enableFreeDrag: false,
      mousewheelAction: 'zoom',
      mousewheelZoomActionReverse: true,
      layout: 'mindMap',
      data,
      initRootNodePosition: ['left', 'center'],
      isLimitMindMapInCanvas: true,
    } as any)

    mindMapRef.current = mindMap
  }

  useEffect(() => {
    return () => {
      if (mindMapRef.current) {
        mindMapRef.current.destroy()
        mindMapRef.current = null
      }
    }
  }, [])

  // 导出 JSON
  const exportJSON = useCallback(() => {
    if (!mindMapRef.current) return
    try {
      const data = mindMapRef.current.getData(true)
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${tasks.find(t => t.id === selectedProjectId)?.title || '思维导图'}.json`
      link.click()
      URL.revokeObjectURL(url)
      message.success('JSON 导出成功')
    } catch (err) {
      console.error('JSON export error:', err)
      message.error('JSON 导出失败')
    }
  }, [tasks, selectedProjectId])

  // 导出 PNG
  const exportPNG = useCallback(async () => {
    if (!mindMapRef.current) return
    try {
      const mindMap = mindMapRef.current
      // 使用 export 方法，isDownload=true 表示下载
      mindMap.export('png', true, tasks.find(t => t.id === selectedProjectId)?.title || '思维导图')
      message.success('PNG 导出成功')
    } catch (err) {
      console.error('PNG export error:', err)
      message.error('PNG 导出失败')
    }
  }, [tasks, selectedProjectId])

  // 导出 Markdown
  const exportMarkdown = useCallback(() => {
    if (!mindMapRef.current) return
    try {
      const data = mindMapRef.current.getData(true)
      const projectTitle = tasks.find(t => t.id === selectedProjectId)?.title || '思维导图'

      const buildMarkdown = (node: any, level: number = 0): string => {
        if (!node) return ''
        const indent = '  '.repeat(level)
        const checkbox = node.data?.isCompleted ? '[x]' : '[ ]'
        const text = node.data?.text || '未命名'
        let md = `${indent}- ${checkbox} ${text}\n`
        if (node.children && node.children.length > 0) {
          node.children.forEach((child: any) => {
            md += buildMarkdown(child, level + 1)
          })
        }
        return md
      }

      const md = `# ${projectTitle}\n\n${buildMarkdown(data?.root || data)}`
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${projectTitle}.md`
      link.click()
      URL.revokeObjectURL(url)
      message.success('Markdown 导出成功')
    } catch (err) {
      console.error('Markdown export error:', err)
      message.error('Markdown 导出失败')
    }
  }, [tasks, selectedProjectId])

  if (!tasks.find(t => t.id === selectedProjectId)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        选择一个项目开始
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* 导出菜单 */}
      <div className="absolute top-3 right-3 z-10">
        <Dropdown
          menu={{
            items: [
              {
                key: 'json',
                label: <span className="flex items-center gap-2"><FileJson className="h-4 w-4" />导出 JSON</span>,
                onClick: exportJSON,
              },
              {
                key: 'png',
                label: <span className="flex items-center gap-2"><FileImage className="h-4 w-4" />导出 PNG</span>,
                onClick: exportPNG,
              },
              {
                key: 'markdown',
                label: <span className="flex items-center gap-2"><FileText className="h-4 w-4" />导出 Markdown</span>,
                onClick: exportMarkdown,
              },
            ],
          }}
          trigger={['click']}
        >
          <Button size="sm" variant="ghost">
            <Download className="h-4 w-4" />
          </Button>
        </Dropdown>
      </div>

      {/* MindMap 容器 */}
      <div
        id="mindMapContainer"
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  )
}
