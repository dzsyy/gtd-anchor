import { useState } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronRight } from 'lucide-react'
import type { Task } from '@/types'
import { NodeLevel } from '@/types'
import { Button } from '@/components/ui/button'
import './MindmapTree.css'

interface MindmapTreeProps {
  tasks: Task[]
  selectedProjectId: number
  onAddChild: (parentId: number) => void
  onDelete: (taskId: number) => void
  onToggleComplete: (taskId: number) => void
}

function getLevelName(level: number | null): string {
  switch (level) {
    case NodeLevel.ROOT: return '项目'
    case NodeLevel.MILESTONE: return '里程碑'
    case NodeLevel.MODULE: return '模块'
    case NodeLevel.POWDER: return '粉末'
    default: return ''
  }
}

function getLevelClass(level: number | null): string {
  switch (level) {
    case NodeLevel.ROOT: return 'root'
    case NodeLevel.MILESTONE: return 'milestone'
    case NodeLevel.MODULE: return 'module'
    case NodeLevel.POWDER: return 'powder'
    default: return 'root'
  }
}

interface TreeNodeProps {
  task: Task
  tasks: Task[]
  level: number
  onAddChild: (parentId: number) => void
  onDelete: (taskId: number) => void
  onToggleComplete: (taskId: number) => void
}

function TreeNode({ task, tasks, level, onAddChild, onDelete, onToggleComplete }: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState(false)
  const children = tasks.filter(t => t.parentId === task.id)
  const hasChildren = children.length > 0
  const levelClass = getLevelClass(task.nodeLevel)

  // 根据层级添加class
  const getNodeClass = () => {
    if (level === 0) return 'mindmap-node root-node'
    if (task.nodeLevel === NodeLevel.MILESTONE) return 'mindmap-node milestone-node'
    if (task.nodeLevel === NodeLevel.MODULE) return 'mindmap-node module-node'
    if (task.nodeLevel === NodeLevel.POWDER) return 'mindmap-node powder-node'
    return 'mindmap-node'
  }

  return (
    <div className={getNodeClass()}>
      <div className={`mindmap-content ${levelClass} ${task.isCompleted ? 'completed' : ''}`}>
        {/* 粉末节点复选框 */}
        {task.nodeLevel === NodeLevel.POWDER && (
          <div
            className={`mindmap-checkbox ${task.isCompleted ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete(task.id!)
            }}
          >
            {task.isCompleted && <Check className="h-3 w-3 text-white" />}
          </div>
        )}

        {/* 层级标签 - 非根节点显示 */}
        {level > 0 && task.nodeLevel !== NodeLevel.POWDER && (
          <span className={`mindmap-label ${levelClass}-label`}>
            {getLevelName(task.nodeLevel)}
          </span>
        )}

        {/* 标题 */}
        <span className="mindmap-title">{task.title}</span>

        {/* 操作按钮 */}
        <div className="mindmap-actions">
          {(task.nodeLevel === null || task.nodeLevel < NodeLevel.POWDER) && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onAddChild(task.id!)
              }}
              title="添加子节点"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id!)
            }}
            title="删除节点"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* 折叠按钮 */}
        {hasChildren && (
          <button
            className="mindmap-collapse-btn"
            onClick={(e) => {
              e.stopPropagation()
              setCollapsed(!collapsed)
            }}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* 子节点 - 横向排列 */}
      {hasChildren && !collapsed && (
        <div className="mindmap-children">
          {children.map(child => (
            <TreeNode
              key={child.id}
              task={child}
              tasks={tasks}
              level={level + 1}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MindmapTree({ tasks, selectedProjectId, onAddChild, onDelete, onToggleComplete }: MindmapTreeProps) {
  const rootTasks = tasks.filter(t => t.parentId === selectedProjectId)

  if (rootTasks.length === 0) {
    return (
      <div className="mindmap-empty">
        还没有里程碑哦，点击"添加里程碑"开始拆解
      </div>
    )
  }

  return (
    <div className="mindmap-container">
      <div className="mindmap-tree">
        {rootTasks.map(task => (
          <TreeNode
            key={task.id}
            task={task}
            tasks={tasks}
            level={0}
            onAddChild={onAddChild}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </div>
  )
}
