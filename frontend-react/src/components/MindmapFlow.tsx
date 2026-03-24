import { useCallback, useMemo, useEffect, useState } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react'
import type { Node, Edge, Connection } from '@xyflow/system'
import '@xyflow/react/dist/style.css'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Task } from '@/types'
import { NodeLevel } from '@/types'

interface MindmapFlowProps {
  tasks: Task[]
  selectedProjectId: number
  onAddChild: (parentId: number) => void
  onDelete: (taskId: number) => void
  onToggleComplete: (taskId: number) => void
}

// 自定义节点组件
const RootNode = ({ data }: { data: any }) => (
  <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold shadow-lg min-w-[140px] text-center">
    <div className="text-lg">{data.label}</div>
    <div className="flex gap-1 justify-center mt-2 opacity-80">
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-white hover:bg-white/20"
        onClick={(e) => { e.stopPropagation(); data.onAdd() }}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  </div>
)

const MilestoneNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 bg-gradient-to-r from-sky-100 to-sky-200 border-2 border-sky-500 rounded-lg min-w-[120px] text-center">
    <div className="text-sm font-medium text-sky-700">{data.label}</div>
    <div className="flex gap-1 justify-center mt-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 text-sky-600 hover:bg-sky-200"
        onClick={(e) => { e.stopPropagation(); data.onAdd() }}
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 text-red-400 hover:bg-red-100"
        onClick={(e) => { e.stopPropagation(); data.onDelete() }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  </div>
)

const ModuleNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500 rounded-lg min-w-[100px] text-center">
    <div className="text-sm font-medium text-green-700">{data.label}</div>
    <div className="flex gap-1 justify-center mt-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 text-green-600 hover:bg-green-200"
        onClick={(e) => { e.stopPropagation(); data.onAdd() }}
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 text-red-400 hover:bg-red-100"
        onClick={(e) => { e.stopPropagation(); data.onDelete() }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  </div>
)

const PowderNode = ({ data }: { data: any }) => (
  <div
    className={`px-3 py-1.5 border-2 rounded-lg min-w-[80px] text-center cursor-pointer transition-all ${
      data.task?.isCompleted
        ? 'bg-gray-100 border-gray-300 opacity-60'
        : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-400'
    }`}
    onClick={(e) => { e.stopPropagation(); data.onToggle() }}
  >
    <div className={`text-xs font-medium ${data.task?.isCompleted ? 'text-gray-400 line-through' : 'text-amber-700'}`}>
      {data.label}
    </div>
    {!data.task?.isCompleted && (
      <div className="flex gap-1 justify-center mt-0.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-4 w-4 p-0 text-red-400 hover:bg-red-100"
          onClick={(e) => { e.stopPropagation(); data.onDelete() }}
        >
          <Trash2 className="h-2 w-2" />
        </Button>
      </div>
    )}
  </div>
)

const nodeTypes = {
  root: RootNode,
  milestone: MilestoneNode,
  module: ModuleNode,
  powder: PowderNode,
}

function MindmapFlowInner({ tasks, selectedProjectId, onAddChild, onDelete, onToggleComplete }: MindmapFlowProps) {
  // 构建节点和边
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const rootTask = tasks.find(t => t.id === selectedProjectId)
    if (!rootTask) return { initialNodes: [], initialEdges: [] }

    // 根节点位置
    nodes.push({
      id: String(rootTask.id),
      type: 'root',
      position: { x: 50, y: 200 },
      data: {
        label: rootTask.title,
        task: rootTask,
        onAdd: () => onAddChild(rootTask.id!),
        onDelete: () => onDelete(rootTask.id!),
      },
    })

    // 递归计算位置
    const calculatePositions = (parentId: number, parentX: number, parentY: number, level: number) => {
      const children = tasks.filter(t => t.parentId === parentId)
      if (children.length === 0) return

      const xGap = level === 1 ? 200 : 160

      if (level === 1) {
        // 里程碑/模块从右边出来
        const yGap = 120
        const totalHeight = children.length * yGap
        let startY = parentY - totalHeight / 2

        children.forEach((child, index) => {
          const y = startY + index * yGap
          const nodeType = child.nodeLevel === NodeLevel.POWDER ? 'powder' : (child.nodeLevel === NodeLevel.MODULE ? 'module' : 'milestone')

          nodes.push({
            id: String(child.id),
            type: nodeType,
            position: { x: parentX + xGap, y },
            data: {
              label: child.title,
              task: child,
              onAdd: () => onAddChild(child.id!),
              onDelete: () => onDelete(child.id!),
              onToggle: () => onToggleComplete(child.id!),
            },
          })

          edges.push({
            id: `e-${parentId}-${child.id}`,
            source: String(parentId),
            target: String(child.id),
            type: 'smoothstep',
            style: { stroke: level === 1 ? '#0ea5e9' : '#22c55e', strokeWidth: 2 },
          })

          calculatePositions(child.id!, parentX + xGap, y, level + 1)
        })
      } else if (level === 2) {
        // 模块下的粉末从下边展开
        const xGap = 120
        const totalWidth = children.length * xGap
        let startX = parentX

        children.forEach((child, index) => {
          const x = startX + index * xGap
          const y = parentY + 100

          nodes.push({
            id: String(child.id),
            type: 'powder',
            position: { x, y },
            data: {
              label: child.title,
              task: child,
              onToggle: () => onToggleComplete(child.id!),
              onDelete: () => onDelete(child.id!),
            },
          })

          edges.push({
            id: `e-${parentId}-${child.id}`,
            source: String(parentId),
            target: String(child.id),
            type: 'smoothstep',
            style: { stroke: '#f59e0b', strokeWidth: 2 },
          })
        })
      }
    }

    calculatePositions(selectedProjectId, 50, 200, 1)

    return { initialNodes: nodes, initialEdges: edges }
  }, [tasks, selectedProjectId, onAddChild, onDelete, onToggleComplete])

  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)

  // 当tasks变化时更新节点
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges])

  if (!tasks.find(t => t.id === selectedProjectId)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        选择一个项目开始
      </div>
    )
  }

  return (
    <div className="w-full h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}

export function MindmapFlow(props: MindmapFlowProps) {
  return (
    <ReactFlowProvider>
      <MindmapFlowInner {...props} />
    </ReactFlowProvider>
  )
}
