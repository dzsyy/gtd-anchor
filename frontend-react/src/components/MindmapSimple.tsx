import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import MindMap from 'simple-mind-map'
import Export from 'simple-mind-map/src/plugins/Export.js'
import { Dropdown, message, Modal, Input, Form } from 'antd'
import { Download, FileJson, FileImage, FileText, Plus, Trash2, Edit3, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Task } from '@/types'
import { NodeLevel } from '@/types'

// 注册导出插件
MindMap.usePlugin(Export)

interface MindmapSimpleProps {
  tasks: Task[]
  selectedProjectId: number
  onAddChild?: (parentId: number, nodeLevel: NodeLevel) => void
  onUpdateTask?: (taskId: number, title: string) => void
  onDeleteTask?: (taskId: number) => void
  onToggleComplete?: (taskId: number) => void
}

export function MindmapSimple({
  tasks,
  selectedProjectId,
  onAddChild,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
}: MindmapSimpleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindMapRef = useRef<any>(null)
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; nodeId: string | null; task: Task | null }>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
    task: null,
  })
  const [editModal, setEditModal] = useState<{ visible: boolean; taskId: number | null; title: string }>({
    visible: false,
    taskId: null,
    title: '',
  })
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; taskId: number | null; title: string }>({
    visible: false,
    taskId: null,
    title: '',
  })
  const [form] = Form.useForm()

  // 获取任务的节点级别
  const getNodeLevel = (taskId: number): NodeLevel | null => {
    const task = tasks.find(t => t.id === taskId)
    return task?.nodeLevel ?? null
  }

  // 检查是否可以添加子节点（限制4级）
  const canAddChild = (taskId: number): boolean => {
    const level = getNodeLevel(taskId)
    return level !== null && level < NodeLevel.POWDER
  }

  // 检查是否是叶子节点（可以切换完成状态）
  const isLeafNode = (taskId: number): boolean => {
    const task = tasks.find(t => t.id === taskId)
    return task?.nodeLevel === NodeLevel.POWDER
  }

  // 获取右键菜单操作
  const handleContextMenu = useCallback((e: MouseEvent, nodeId: string) => {
    console.log('DEBUG handleContextMenu:', { nodeId })
    e.preventDefault()
    e.stopPropagation()

    // nodeId 就是 task id（数字）
    const taskId = parseInt(nodeId)
    console.log('DEBUG parsed taskId:', taskId, 'valid:', !isNaN(taskId))
    const task = tasks.find(t => t.id === taskId)
    console.log('DEBUG found task:', task?.id, task?.title)

    if (!task) return

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodeId,
      task,
    })
  }, [tasks])

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  // 添加子节点
  const handleAddChild = useCallback(() => {
    console.log('DEBUG handleAddChild called, task:', contextMenu.task?.id, contextMenu.task?.title)
    if (!contextMenu.task || !onAddChild) return
    console.log('DEBUG calling onAddChild with:', contextMenu.task.id!, contextMenu.task.nodeLevel)
    onAddChild(contextMenu.task.id!, contextMenu.task.nodeLevel as NodeLevel)
    closeContextMenu()
  }, [contextMenu.task, onAddChild, closeContextMenu])

  // 编辑节点
  const handleEditNode = useCallback(() => {
    if (!contextMenu.task) return
    setEditModal({
      visible: true,
      taskId: contextMenu.task.id!,
      title: contextMenu.task.title,
    })
    closeContextMenu()
  }, [contextMenu.task, closeContextMenu])

  // 删除节点
  const handleDeleteNode = useCallback(() => {
    if (!contextMenu.task) return
    setDeleteModal({
      visible: true,
      taskId: contextMenu.task.id!,
      title: contextMenu.task.title,
    })
    closeContextMenu()
  }, [contextMenu.task, closeContextMenu])

  // 切换完成状态
  const handleToggleComplete = useCallback(() => {
    if (!contextMenu.task || !onToggleComplete) return
    onToggleComplete(contextMenu.task.id!)
    closeContextMenu()
  }, [contextMenu.task, onToggleComplete, closeContextMenu])

  // 提交编辑
  const handleEditSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      if (editModal.taskId && onUpdateTask) {
        onUpdateTask(editModal.taskId, values.title)
        setEditModal({ visible: false, taskId: null, title: '' })
        form.resetFields()
      }
    } catch (err) {
      // 表单验证失败
    }
  }, [editModal.taskId, onUpdateTask, form])

  // 提交删除
  const handleDeleteSubmit = useCallback(() => {
    if (deleteModal.taskId && onDeleteTask) {
      onDeleteTask(deleteModal.taskId)
      setDeleteModal({ visible: false, taskId: null, title: '' })
    }
  }, [deleteModal.taskId, onDeleteTask])

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handleClick = () => closeContextMenu()
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu.visible, closeContextMenu])

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

    console.log('DEBUG MindMap instance type:', mindMap.constructor.name)
    console.log('DEBUG MindMap has on method:', typeof mindMap.on)
    console.log('DEBUG MindMap has emit method:', typeof mindMap.emit)

    // 测试 general contextmenu 事件
    mindMap.on('contextmenu', () => {
      console.log('DEBUG general contextmenu event fired')
    })

    // 添加右键菜单事件 (注意事件名是 node_contextmenu)
    mindMap.on('node_contextmenu', (e: MouseEvent, node: any) => {
      console.log('DEBUG node_contextmenu:', {
        nodeId: node?.id,
        nodeUid: node?.uid,
        nodeDataId: node?.nodeData?.id,
        nodeData: node?.nodeData,
        hasNodeData: !!node?.nodeData
      })
      // node.id 可能是 uid，需要从 nodeData.id 获取原始 task id
      const taskId = node?.nodeData?.id || node?.id
      handleContextMenu(e, String(taskId))
    })

    // 双击编辑节点 (注意事件名是 node_dblclick)
    mindMap.on('node_dblclick', (node: any) => {
      const taskId = parseInt(node.id)
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        setEditModal({
          visible: true,
          taskId: task.id!,
          title: task.title,
        })
      }
    })

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

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.task && canAddChild(contextMenu.task.id!) && (
            <button
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100"
              onClick={handleAddChild}
            >
              <Plus className="h-4 w-4" />
              添加子节点
            </button>
          )}
          {contextMenu.task && (
            <button
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100"
              onClick={handleEditNode}
            >
              <Edit3 className="h-4 w-4" />
              编辑
            </button>
          )}
          {contextMenu.task && isLeafNode(contextMenu.task.id!) && (
            <button
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100"
              onClick={handleToggleComplete}
            >
              <Check className="h-4 w-4" />
              {contextMenu.task.isCompleted ? '标记未完成' : '标记完成'}
            </button>
          )}
          {contextMenu.task && (
            <button
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-red-50"
              onClick={handleDeleteNode}
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          )}
        </div>
      )}

      {/* 编辑弹窗 */}
      <Modal
        title="编辑节点"
        open={editModal.visible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModal({ visible: false, taskId: null, title: '' })
          form.resetFields()
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ title: editModal.title }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={deleteModal.visible}
        onOk={handleDeleteSubmit}
        onCancel={() => {
          setDeleteModal({ visible: false, taskId: null, title: '' })
        }}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除节点「{deleteModal.title}」吗？</p>
        <p className="text-red-500 text-sm mt-2">注意：其所有子节点也会被删除</p>
      </Modal>

      {/* MindMap 容器 */}
      <div
        id="mindMapContainer"
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  )
}
