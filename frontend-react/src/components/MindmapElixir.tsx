import { useEffect, useRef, useState, useCallback } from 'react'
import MindElixir from 'mind-elixir'
import type { Task } from '@/types'
import { NodeLevel } from '@/types'
import { Modal } from 'antd'

interface MindmapElixirProps {
  tasks: Task[]
  selectedProjectId: number
  onAddChild?: (parentId: number, title?: string) => void
  onAddSibling?: (siblingId: number, title?: string) => void
  onDelete: (taskId: number) => void
  onToggleComplete?: (taskId: number) => void
  onUpdate?: (taskId: number, data: { title: string }) => void
}

// 将任务转换为 mind-elixir 格式
function convertToMindElixirData(tasks: Task[], selectedProjectId: number) {
  const rootTask = tasks.find(t => t.id === selectedProjectId)
  if (!rootTask) return null

  const buildNode = (task: Task): any => {
    const children = tasks.filter(t => t.parentId === task.id)

    const node: any = {
      id: String(task.id),
      topic: task.title,
      expanded: true,
      taskId: task.id,  // 存储原始 task ID
    }

    if (task.nodeLevel === NodeLevel.POWDER) {
      node.style = {
        background: task.isCompleted ? '#e5e7eb' : '#fef3c7',
        color: task.isCompleted ? '#9ca3af' : '#b45309',
      }
    } else if (task.nodeLevel === NodeLevel.MODULE) {
      node.style = {
        background: '#dcfce7',
        color: '#15803d',
      }
    } else if (task.nodeLevel === NodeLevel.MILESTONE) {
      node.style = {
        background: '#e0f2fe',
        color: '#0369a1',
      }
    }

    if (children.length > 0) {
      node.children = children.map(buildNode)
    }

    return node
  }

  return buildNode(rootTask)
}

export function MindmapElixir({
  tasks,
  selectedProjectId,
  onAddChild,
  onAddSibling,
  onDelete,
  onToggleComplete,
  onUpdate,
}: MindmapElixirProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindElixirRef = useRef<MindElixir | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; taskId: number | null; title: string }>({
    open: false,
    taskId: null,
    title: '',
  })
  const [initialized, setInitialized] = useState(false)

  // 用 ref 保存回调，避免闭包问题
  const callbacksRef = useRef({ onAddChild, onAddSibling, onDelete, onToggleComplete, onUpdate })
  callbacksRef.current = { onAddChild, onAddSibling, onDelete, onToggleComplete, onUpdate }

  useEffect(() => {
    if (!containerRef.current) return

    const nodeData = convertToMindElixirData(tasks, selectedProjectId)
    if (!nodeData) {
      setError('No root task found')
      return
    }

    try {
      // 如果已经初始化过，先销毁
      if (mindElixirRef.current) {
        mindElixirRef.current.destroy()
      }

      // 直接用对象，不用stringify
      const data = {
        nodeData,
      }


      // 深拷贝数据避免引用问题
      const dataClone = JSON.parse(JSON.stringify(data))

      const me = new MindElixir({
        el: containerRef.current,
        direction: 1,
        locale: 'zh',
        draggable: true,
        zoomable: true,
        editable: true,
        showNodeEmoji: false,
        showTheme: true,
        enableUndoRedo: false,
        allowUndo: false,
        newTopicName: '',
        overflowHidden: false,
      })

      // 用 init 方法传入数据
      const err = me.init(dataClone)
      if (err) {
        console.error('MindElixir init returned error:', err)
        setError(String(err))
        return
      }

      // 初始化完成后居中显示
      me.toCenter()

      // 替换右键菜单为中文（使用 MutationObserver 监听菜单出现）
      const menuTextMap: Record<string, string> = {
        'Add child': '添加子节点',
        'Add parent': '添加父节点',
        'Add sibling': '添加同级节点',
        'Remove node': '删除节点',
        'Focus Mode': '聚焦模式',
        'Cancel Focus Mode': '取消聚焦',
        'Move up': '上移',
        'Move down': '下移',
        'Summary': '摘要',
        'Link': '链接',
        'Bidirectional Link': '双向链接',
      }
      const replaceMenuText = () => {
        const menuContainer = containerRef.current?.querySelector('.menu-list')
        if (menuContainer) {
          const items = menuContainer.querySelectorAll('li span:first-child')
          items.forEach((item) => {
            const text = item.textContent?.trim()
            if (text && menuTextMap[text]) {
              item.textContent = menuTextMap[text]
            }
          })
        }
      }
      // 监听菜单出现
      const observer = new MutationObserver(() => {
        replaceMenuText()
      })
      if (containerRef.current) {
        observer.observe(containerRef.current, { childList: true, subtree: true })
      }

      mindElixirRef.current = me
      setInitialized(true)
      setError(null)

      // 监听节点编辑完成（即时保存）
      me.bus.addListener('operation', async (e: any) => {
        const { name, obj, origin, objs } = e
        const cb = callbacksRef.current


        // 通过 topic 在 tasks 数组里找对应的 task
        const findTaskByTopic = (topic: string) => {
          return tasks.find(t => t.title === topic)
        }

        // 编辑完成
        if (name === 'finishEdit' && obj) {
          // 如果内容为空或等于默认值，不创建新节点
          if (!obj.topic || obj.topic === 'New Node' || obj.topic === '') {
            return
          }
          // origin 是 "New Node" 说明是新节点，需要创建
          if (origin === 'New Node' || origin === '') {
            // 新节点 - 需要创建
            if (cb.onAddChild && obj.parent) {
              const parentTopic = obj.parent.topic
              const parentTask = findTaskByTopic(parentTopic)
              if (parentTask?.id) {
                await cb.onAddChild(parentTask.id, obj.topic)
              }
            }
          } else {
            // 现有节点编辑 - 查找并更新
            const task = findTaskByTopic(origin)
            if (cb.onUpdate && task?.id) {
              await cb.onUpdate(task.id, { title: obj.topic })
            }
          }
        }

        // 插入子节点 (addChild 事件)
        if ((name === 'addChild' || name === 'insertChild') && obj && cb.onAddChild && obj.parent) {
          const parentTopic = obj.parent.topic
          const parentTask = findTaskByTopic(parentTopic)
          if (parentTask?.id) {
            await cb.onAddChild(parentTask.id, obj.topic)
          }
        }

        // 插入同级节点
        if (name === 'insertSibling' && obj && cb.onAddSibling && obj.parent) {
          const parentTopic = obj.parent.topic
          const parentTask = findTaskByTopic(parentTopic)
          if (parentTask?.id) {
            await cb.onAddSibling(parentTask.id, obj.topic)
          }
        }

        // 删除节点 - 显示确认 Modal
        if (name === 'removeNodes' && objs && objs.length > 0) {
          objs.forEach((node: any) => {
            const topic = node.topic
            if (topic) {
              const task = tasks.find(t => t.title === topic)
              if (task?.id) {
                // 显示删除确认 Modal，而不是直接删除
                setDeleteModal({ open: true, taskId: task.id, title: topic })
              }
            }
          })
        }
      })

    } catch (err: any) {
      console.error('MindElixir init error:', err, err.stack)
      setError(err.message || String(err))
    }

    return () => {
      if (mindElixirRef.current) {
        mindElixirRef.current.destroy()
        mindElixirRef.current = null
      }
    }
  }, [tasks, selectedProjectId])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 p-4">
        <div className="text-center">
          <p>加载失败</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!tasks.find(t => t.id === selectedProjectId)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        选择一个项目开始
      </div>
    )
  }

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />
      <Modal
        title="删除确认"
        open={deleteModal.open}
        onOk={() => {
          if (deleteModal.taskId) {
            callbacksRef.current.onDelete(deleteModal.taskId)
          }
          setDeleteModal({ open: false, taskId: null, title: '' })
        }}
        onCancel={() => setDeleteModal({ open: false, taskId: null, title: '' })}
        okText="删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        getContainer={document.body}
      >
        <p>确定要删除节点「{deleteModal.title}」吗？</p>
        <p className="text-gray-500 text-sm">此操作不可恢复</p>
      </Modal>
    </>
  )
}
