import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react'
import type { Node, Edge, NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Task } from '@/types'
import { NodeLevel } from '@/types'

interface MindmapFlowProps {
  tasks: Task[]
  selectedProjectId: number
}

// 节点颜色配置
const getNodeColor = (nodeLevel: number | undefined, isCompleted: boolean | undefined): string => {
  if (nodeLevel === NodeLevel.ROOT) return '#00c0b8'
  if (nodeLevel === NodeLevel.MILESTONE) return '#3b82f6'
  if (nodeLevel === NodeLevel.MODULE) return '#10b981'
  if (nodeLevel === NodeLevel.POWDER) return isCompleted ? '#9ca3af' : '#f59e0b'
  return '#00c0b8'
}

// 自定义节点组件
function MindmapNode({ data }: { data: any }) {
  const isRoot = data.nodeLevel === NodeLevel.ROOT
  const isCompleted = data.task?.isCompleted

  return (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-md border-2 min-w-[100px] text-center
        ${isRoot ? 'text-white font-bold text-lg' : 'text-sm'}
        ${isCompleted && data.nodeLevel === NodeLevel.POWDER ? 'opacity-60 line-through' : ''}
      `}
      style={{
        backgroundColor: getNodeColor(data.nodeLevel, isCompleted),
        borderColor: getNodeColor(data.nodeLevel, isCompleted),
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  mindmapNode: MindmapNode,
}

// 使用 dagre 计算布局
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 75,
        y: nodeWithPosition.y - 25,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export function MindmapFlow({ tasks, selectedProjectId }: MindmapFlowProps) {

  // 构建节点和边
  const { initialNodes, initialEdges } = useMemo(() => {
    const rootTask = tasks.find((t) => t.id === selectedProjectId)
    if (!rootTask) return { initialNodes: [], initialEdges: [] }

    const nodes: Node[] = []
    const edges: Edge[] = []

    // 添加所有节点
    tasks.forEach((task) => {
      if (task.id === selectedProjectId) {
        nodes.push({
          id: String(task.id),
          type: 'mindmapNode',
          position: { x: 0, y: 0 },
          data: { label: task.title, nodeLevel: task.nodeLevel, task },
        })
      } else if (task.parentId === selectedProjectId) {
        nodes.push({
          id: String(task.id),
          type: 'mindmapNode',
          position: { x: 0, y: 0 },
          data: { label: task.title, nodeLevel: task.nodeLevel, task },
        })
        edges.push({
          id: `e${task.parentId}-${task.id}`,
          source: String(task.parentId),
          target: String(task.id),
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        })
      }
    })

    // 递归添加子节点
    const addChildren = (parentId: number) => {
      const children = tasks.filter((t) => t.parentId === parentId && t.id !== selectedProjectId)
      children.forEach((child) => {
        nodes.push({
          id: String(child.id),
          type: 'mindmapNode',
          position: { x: 0, y: 0 },
          data: { label: child.title, nodeLevel: child.nodeLevel, task: child },
        })
        edges.push({
          id: `e${child.parentId}-${child.id}`,
          source: String(child.parentId),
          target: String(child.id),
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        })
        addChildren(child.id!)
      })
    }

    addChildren(selectedProjectId)

    // 计算布局
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'LR')

    return { initialNodes: layoutedNodes, initialEdges: layoutedEdges }
  }, [tasks, selectedProjectId])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // 导出 PNG
  const handleExportPNG = useCallback(() => {
    const flowContainer = document.querySelector('.react-flow') as HTMLElement
    if (!flowContainer) return

    import('html-to-image').then((htmlToImage) => {
      htmlToImage.toPng(flowContainer, {
        backgroundColor: '#ffffff',
        quality: 1,
      }).then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `mindmap-${selectedProjectId}.png`
        link.href = dataUrl
        link.click()
      })
    })
  }, [selectedProjectId])

  if (!tasks.find((t) => t.id === selectedProjectId)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        选择一个项目开始
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {/* 导出按钮 */}
      <div className="absolute top-3 right-3 z-10">
        <Button size="sm" variant="ghost" onClick={handleExportPNG}>
          <Download className="h-4 w-4 mr-1" />
          导出 PNG
        </Button>
      </div>

      {/* 思维导图 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  )
}
