import { useEffect, useRef, useState } from 'react'
import MindElixir from 'mind-elixir'
import type { Task } from '@/types'
import { NodeLevel } from '@/types'
import { Modal, message } from 'antd'

interface MindmapElixirProps {
  tasks: Task[]
  selectedProjectId: number
  onAddChild?: (parentId: number, title?: string) => void
  onAddSibling?: (siblingId: number, title?: string) => void
  onDelete: (taskId: number) => void
  onToggleComplete?: (taskId: number) => void
  onUpdate?: (taskId: number, data: { title: string }) => void
  onRefresh?: () => void // 刷新数据回调
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
  onRefresh,
}: MindmapElixirProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mindElixirRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; taskId: number | null; title: string }>({
    open: false,
    taskId: null,
    title: '',
  })
  const prevProjectId = useRef<number | null>(null)

  // 用 ref 保存回调，避免闭包问题
  const callbacksRef = useRef({ onAddChild, onAddSibling, onDelete, onToggleComplete, onUpdate, onRefresh })
  callbacksRef.current = { onAddChild, onAddSibling, onDelete, onToggleComplete, onUpdate, onRefresh }

  useEffect(() => {
    if (!containerRef.current) return

    // 只在项目变化时重新初始化，tasks 更新时不重新创建
    if (prevProjectId.current === selectedProjectId && mindElixirRef.current) {
      // 项目没变，tasks 更新了，但保持现有视图
      return
    }
    prevProjectId.current = selectedProjectId

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
        // @ts-expect-error - locale type mismatch
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

      // 不自动居中，保持用户视角

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
      setError(null)

      // 监听节点编辑完成（即时保存）
      me.bus.addListener('operation', async (e: any) => {
        const { name, obj, origin, objs } = e
        const cb = callbacksRef.current

        // 编辑完成
        if (name === 'finishEdit' && obj) {
          // 如果内容为空或等于默认值，不创建新节点
          if (!obj.topic || obj.topic === 'New Node' || obj.topic === '') {
            return
          }
          // origin 是 "New Node" 说明是新节点，需要创建
          if (origin === 'New Node' || origin === '') {
            // 新节点 - 使用 obj.parent.id 获取父节点 taskId
            if (cb.onAddChild && obj.parent) {
              const parentTaskId = obj.parent.id != null ? parseInt(String(obj.parent.id)) : NaN
              if (!isNaN(parentTaskId)) {
                // 检查父节点是否是粉末级别（第四级），如果是则不允许添加
                const parentTask = tasks.find(t => t.id === parentTaskId)
                if (parentTask && (parentTask.nodeLevel ?? 0) >= 3) { // 3 = POWDER
                  // 先显示提示
                  message.warning("粉末动作已经是最后一级啦不能再拆了哦 ✨")
                  // 延迟一下让 alert 关闭，然后刷新数据清除画布上的节点
                  setTimeout(() => {
                    if (cb.onRefresh) {
                      cb.onRefresh()
                    }
                  }, 100)
                  return
                }

                await cb.onAddChild(parentTaskId, obj.topic)
                // 创建成功后聚焦到新节点
                // 延迟一下让数据更新后再聚焦
                setTimeout(() => {
                  try {
                    // 尝试通过节点ID聚焦
                    const nodeId = obj.id
                    if (nodeId && mindElixirRef.current) {
                      // 使用 focusNode 方法聚焦到新节点
                      (mindElixirRef.current as any).focusNode?.(nodeId)
                    }
                  } catch (e) {
                    // 聚焦失败，不做处理
                  }
                }, 100)
              }
            }
          } else {
            // 现有节点编辑 - 使用 obj.id 获取当前节点 taskId
            const taskId = obj.id != null ? parseInt(String(obj.id)) : NaN
            if (cb.onUpdate && !isNaN(taskId)) {
              await cb.onUpdate(taskId, { title: obj.topic })
            }
          }
        }


        // 删除节点 - 显示确认 Modal
        if (name === 'removeNodes' && objs && objs.length > 0) {
          objs.forEach((node: any) => {
            // 使用 node.id 获取 taskId
            const taskId = node.id != null ? parseInt(String(node.id)) : NaN
            if (!isNaN(taskId)) {
              const task = tasks.find(t => t.id === taskId)
              if (task && task.id != null) {
                setDeleteModal({ open: true, taskId: task.id, title: task.title })
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
