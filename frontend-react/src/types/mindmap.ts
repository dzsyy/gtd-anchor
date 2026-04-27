import type { Task } from './index'

export interface MindmapNode {
  id: string
  type: 'root' | 'milestone' | 'module' | 'powder'
  position: { x: number; y: number }
  data: MindmapNodeData
}

export interface MindmapNodeData {
  label: string
  task: Task
  onEdit?: (id: string, title: string) => void
  onAdd?: (parentId: string) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string) => void
}

export interface MindmapEdge {
  id: string
  source: string
  target: string
  type?: 'smoothstep'
  style?: { stroke: string; strokeWidth: number }
}

export interface DeleteModalState {
  open: boolean
  taskId: string | null
  title: string
}

export interface ContextMenuState {
  open: boolean
  x: number
  y: number
  nodeId: string | null
}
