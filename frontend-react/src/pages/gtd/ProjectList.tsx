import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { message, Dropdown } from 'antd'
import { Plus, Folder, Trash2, Check, ChevronRight, Sparkles, Download, FileJson, FileImage, FileText, RotateCcw, MoreVertical } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, NodeLevel, type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MindmapElixir } from '@/components/MindmapElixir'
import { TaskInputDialog } from '@/components/TaskInputDialog'

// 温柔引导提示
const GUIDE_MESSAGES: Record<number, string> = {
  [NodeLevel.ROOT]: "只定一个你真正想完成的终点就好哦，不用想过程、不用想细节，我们后面会一步步把它拆成你抬脚就能走的小石子✨",
  [NodeLevel.MILESTONE]: "我们先把这3个里程碑拆完、做完好不好？太多的阶段会让你的大脑过载哦，先聚焦最核心的3步就够啦✨",
  [NodeLevel.MODULE]: "不用想具体怎么做哦，只要把这个里程碑，拆成几个独立的小模块就好，拆完我们再把每个模块，变成你5分钟就能做完的小事✨",
  [NodeLevel.POWDER]: "记得哦，这个节点要小到5分钟就能做完，你的潜意识才会愿意动起来✨",
}

// 粉末节点验证提示
const POWDER_CHECK_TIPS = [
  "这个节点是不是还是有点难？试着把它拆得更小一点吧，小到5分钟就能做完，你的潜意识就不会抗拒啦✨",
  "一个节点只做一件事哦，看看有没有'和'、'并'、'同时'这些词，有的话要拆成两个节点",
  "这个节点要5分钟内能做完才行，试着想想打开电脑就能直接动手，不用准备",
]

// 验证粉末节点是否符合5分钟标准
function validatePowderNode(title: string): { valid: boolean; tip: string } {
  if (title.length > 30) {
    return { valid: false, tip: POWDER_CHECK_TIPS[0] }
  }

  const multiActionWords = ['和', '并', '同时', '以及', '还有']
  if (multiActionWords.some(word => title.includes(word))) {
    return { valid: false, tip: POWDER_CHECK_TIPS[1] }
  }

  return { valid: true, tip: '' }
}

// 获取节点层级名称
function getLevelName(level: NodeLevel): string {
  switch (level) {
    case NodeLevel.ROOT: return '项目'
    case NodeLevel.MILESTONE: return '里程碑'
    case NodeLevel.MODULE: return '模块'
    case NodeLevel.POWDER: return '粉末动作'
  }
}

// 获取所有子任务
function getAllDescendants(tasks: Task[], parentId: number): Task[] {
  const children = tasks.filter(t => t.parentId === parentId)
  let descendants: Task[] = [...children]
  for (const child of children) {
    descendants = [...descendants, ...getAllDescendants(tasks, child.id!)]
  }
  return descendants
}

export function ProjectList() {
  const { fetchTasksByStatus, createTask, updateTask, deleteTask, batchUpdateTasks } = useTaskStore()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState<Task[]>([])
  const [allProjectTasks, setAllProjectTasks] = useState<Task[]>([])
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [selectedProject, setSelectedProject] = useState<Task | null>(null)
  const [guideMessage, setGuideMessage] = useState(GUIDE_MESSAGES[NodeLevel.ROOT])

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogParentId, setDialogParentId] = useState<number | null>(null)
  const [dialogParentLevel, setDialogParentLevel] = useState<NodeLevel | null>(null)

  const loadProjects = async () => {
    const data = await fetchTasksByStatus(TaskStatus.PROJECT)
    // 只显示根节点、里程碑、模块，用于项目列表显示
    const nonPowderTasks = data.filter(t => t.nodeLevel !== NodeLevel.POWDER)
    // 只显示 isProject=true 的根节点（真正的项目）
    const rootTasks = nonPowderTasks.filter(t => t.isProject === true && (t.nodeLevel === NodeLevel.ROOT || t.nodeLevel === null))
    setProjects(rootTasks)
    // 保留所有任务（包括粉末节点），用于选择项目后的详情显示
    setAllProjectTasks(data)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // 处理 URL 中的 projectId 参数，自动选中项目
  useEffect(() => {
    const projectId = searchParams.get('projectId')
    if (projectId && projects.length > 0) {
      const targetProject = projects.find(p => p.id === Number(projectId))
      if (targetProject) {
        selectProject(targetProject)
      }
    }
  }, [searchParams, projects])

  const handleAddProject = async () => {
    if (!newProjectTitle.trim()) return

    const existingRoots = projects.filter(p => !p.isCompleted)
    if (existingRoots.length >= 1) {
      alert("我们先把手头的这个项目完成或归档好不好？一次只专注一个目标，效率更高哦✨")
      return
    }

    await createTask({
      title: newProjectTitle.trim(),
      status: TaskStatus.PROJECT,
      isProject: true,
      nodeLevel: NodeLevel.ROOT,
    })
    setNewProjectTitle('')
    loadProjects()
  }

  const selectProject = async (project: Task) => {
    setSelectedProject(project)
    setGuideMessage(GUIDE_MESSAGES[NodeLevel.MILESTONE])
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    // 保留所有任务（包括粉末节点）
    setAllProjectTasks(allTasks)
  }

  // 检查父节点下的子节点数量
  const getChildCount = (parentId: number): number => {
    return allProjectTasks.filter(t => t.parentId === parentId).length
  }

  // 获取父节点的层级
  const getParentLevel = (parentId: number): NodeLevel => {
    const parent = allProjectTasks.find(t => t.id === parentId)
    return parent?.nodeLevel ?? NodeLevel.ROOT
  }

  // 打开添加子节点对话框
  const openAddChildDialog = (parentId: number) => {
    const parentLevel = getParentLevel(parentId)
    const childCount = getChildCount(parentId)

    // 不允许添加第五级节点
    if (parentLevel >= NodeLevel.POWDER) {
      message.warning("粉末动作已经是最后一级啦不能再拆了哦 ✨")
      return
    }

    if (parentLevel === NodeLevel.ROOT && childCount >= 3) {
      alert(GUIDE_MESSAGES[NodeLevel.MILESTONE])
      return
    }

    if (parentLevel === NodeLevel.MILESTONE && childCount >= 5) {
      alert("这个里程碑下已经有5个模块啦，先把每个模块拆成粉末动作好不好？✨")
      return
    }

    if (parentLevel >= NodeLevel.MODULE) {
      setGuideMessage(GUIDE_MESSAGES[NodeLevel.POWDER])
    }

    setDialogParentId(parentId)
    setDialogParentLevel(parentLevel)
    setDialogOpen(true)
  }

  // 确认添加子节点
  const handleConfirmAddChild = async (title: string) => {
    if (!dialogParentId || dialogParentLevel === null) return

    if (dialogParentLevel === NodeLevel.MODULE) {
      const validation = validatePowderNode(title)
      if (!validation.valid) {
        alert(validation.tip)
        return
      }

      await createTask({
        title: title,
        status: TaskStatus.PROJECT,
        parentId: dialogParentId,
        nodeLevel: NodeLevel.POWDER,
      })
    } else {
      const nextLevel = (dialogParentLevel + 1) as NodeLevel
      await createTask({
        title: title,
        status: TaskStatus.PROJECT,
        parentId: dialogParentId,
        nodeLevel: nextLevel,
      })
    }

    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
    setDialogOpen(false)
  }

  // 添加子节点（兼容旧调用）
  const handleAddChild = (parentId: number) => {
    openAddChildDialog(parentId)
  }

  // 思维导图内联添加子节点（即时保存）
  const handleInlineAddChild = async (parentId: number, title?: string) => {
    if (!title) {
      openAddChildDialog(parentId)
      return
    }
    const parentTask = allProjectTasks.find(t => t.id === parentId)
    if (!parentTask) return
    const parentLevel = parentTask.nodeLevel ?? NodeLevel.ROOT

    // 不允许添加第五级节点
    if (parentLevel >= NodeLevel.POWDER) {
      message.warning("粉末动作已经是最后一级啦不能再拆了哦 ✨")
      return
    }

    let nodeLevel: 1 | 2 | 3 = NodeLevel.POWDER as 1 | 2 | 3
    if (parentLevel === NodeLevel.ROOT) nodeLevel = NodeLevel.MILESTONE as 1 | 2 | 3
    else if (parentLevel === NodeLevel.MILESTONE) nodeLevel = NodeLevel.MODULE as 1 | 2 | 3

    await createTask({
      title,
      parentId,
      nodeLevel: nodeLevel as any,
      status: TaskStatus.PROJECT,
    })
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 思维导图内联添加同级节点（即时保存）
  const handleInlineAddSibling = async (siblingId: number, title?: string) => {
    if (!title) return
    const siblingTask = allProjectTasks.find(t => t.id === siblingId)
    if (!siblingTask || !siblingTask.parentId) return

    await createTask({
      title,
      parentId: siblingTask.parentId,
      nodeLevel: siblingTask.nodeLevel,
      status: TaskStatus.PROJECT,
    })
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 思维导图内联更新节点（即时保存）
  const handleInlineUpdate = async (taskId: number, data: { title: string }) => {
    await updateTask(taskId, data)
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 刷新思维导图数据
  const handleRefresh = async () => {
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 导出思维导图
  const handleExport = async (type: 'json' | 'png' | 'markdown') => {
    const projectTitle = selectedProject?.title || '思维导图'

    if (type === 'json') {
      // 导出 JSON - 从 mind-elixir 获取数据
      // 通过 children 递归构建 mind-elixir 格式数据
      const buildNodeData = (taskId: number): any => {
        const task = allProjectTasks.find(t => t.id === taskId)
        if (!task) return null
        const children = allProjectTasks.filter(t => t.parentId === taskId)
        const node: any = {
          id: String(task.id),
          topic: task.title,
          expanded: true,
        }
        if (task.nodeLevel === NodeLevel.POWDER) {
          node.style = {
            background: task.isCompleted ? '#e5e7eb' : '#fef3c7',
            color: task.isCompleted ? '#9ca3af' : '#b45309',
          }
        } else if (task.nodeLevel === NodeLevel.MODULE) {
          node.style = { background: '#dcfce7', color: '#15803d' }
        } else if (task.nodeLevel === NodeLevel.MILESTONE) {
          node.style = { background: '#e0f2fe', color: '#0369a1' }
        }
        if (children.length > 0) {
          node.children = children.map(c => buildNodeData(c.id!)).filter(Boolean)
        }
        return node
      }

      const rootData = buildNodeData(selectedProject!.id!)
      if (rootData) {
        const jsonStr = JSON.stringify({ nodeData: rootData }, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${projectTitle}.json`
        link.click()
        URL.revokeObjectURL(url)
        message.success('JSON 导出成功')
      }
    } else if (type === 'png') {
      // 导出 PNG - 使用 html2canvas 截图
      try {
        // 找到 mind-elixir 的画布容器
        const container = document.querySelector('.mind-elixir') as HTMLElement
        if (!container) {
          message.error('未找到思维导图画布')
          return
        }

        const html2canvas = (await import('html2canvas')).default
        const canvas = await html2canvas(container, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        })

        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `${projectTitle}.png`
        link.click()
        message.success('PNG 导出成功')
      } catch (err) {
        console.error('PNG export error:', err)
        message.error('PNG 导出失败')
      }
    } else if (type === 'markdown') {
      // 导出 Markdown
      const buildTree = (parentId: number, level: number = 0): string => {
        const children = allProjectTasks.filter(t => t.parentId === parentId)
        if (children.length === 0) return ''

        let md = ''
        children.forEach(task => {
          const indent = '  '.repeat(level)
          const checkbox = task.isCompleted ? '[x]' : '[ ]'
          const levelIcon = task.nodeLevel === NodeLevel.POWDER ? '●' :
                          task.nodeLevel === NodeLevel.MODULE ? '◆' :
                          task.nodeLevel === NodeLevel.MILESTONE ? '■' : '★'
          md += `${indent}- ${checkbox} ${levelIcon} ${task.title}\n`
          md += buildTree(task.id!, level + 1)
        })
        return md
      }

      const md = `# ${projectTitle}\n\n${buildTree(selectedProject!.id!)}`
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${projectTitle}.md`
      link.click()
      URL.revokeObjectURL(url)
      message.success('Markdown 导出成功')
    }
  }

  // 提交到执行清单
  const handleSubmitToExecute = async (taskId: number) => {
    await updateTask(taskId, {
      isSubmitted: true,
    })
    // 刷新列表
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 一键提交所有未提交的粉末动作到执行清单
  const handleSubmitAll = async () => {
    if (!selectedProject) return

    // 获取所有未提交的粉末动作
    // 逻辑：找到所有 MODULE（层级2），它们的 parentId 是当前的里程碑
    // 然后找到所有 POWDER（层级3），它们的 parentId 是这些 MODULE
    const moduleIds = allProjectTasks
      .filter(t => t.parentId === selectedProject.id && t.nodeLevel === NodeLevel.MILESTONE)
      .flatMap(milestone =>
        allProjectTasks.filter(t => t.parentId === milestone.id && t.nodeLevel === NodeLevel.MODULE).map(t => t.id)
      )

    const powderTasks = allProjectTasks.filter(t =>
      moduleIds.includes(t.parentId!) &&
      t.nodeLevel === NodeLevel.POWDER &&
      !t.isCompleted &&
      !t.isSubmitted
    )

    if (powderTasks.length === 0) {
      message.info('没有可提交的粉末动作')
      return
    }

    // 批量提交
    const updates = powderTasks.map(task => ({ id: task.id, isSubmitted: true }))
    await batchUpdateTasks(updates)

    message.success(`已提交 ${powderTasks.length} 个粉末动作到执行清单`)
    // 刷新列表
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  const handleToggleComplete = async (taskId: number) => {
    const task = allProjectTasks.find(t => t.id === taskId)
    if (!task) return

    await updateTask(taskId, {
      isCompleted: !task.isCompleted,
      completedTime: !task.isCompleted ? new Date().toISOString() : null,
      status: task.status, // 保留原有 status
    })

    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  const handleDeleteTask = async (taskId: number) => {
    // 删除所有子节点
    const descendants = getAllDescendants(allProjectTasks, taskId)
    for (const desc of descendants) {
      await deleteTask(desc.id!)
    }
    await deleteTask(taskId)

    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm("确定要删除这个项目吗？删除后可在回收箱恢复哦")) return

    // 删除所有子任务
    const descendants = getAllDescendants(allProjectTasks, id)
    for (const desc of descendants) {
      await deleteTask(desc.id!)
    }
    await deleteTask(id)

    if (selectedProject?.id === id) {
      setSelectedProject(null)
    }
    loadProjects()
  }

  // 打回收集箱（递归处理子节点）
  const handleToInbox = async (id: number) => {
    // 打回所有子节点
    const descendants = getAllDescendants(allProjectTasks, id)
    for (const desc of descendants) {
      await updateTask(desc.id!, { status: TaskStatus.INBOX })
    }
    await updateTask(id, { status: TaskStatus.INBOX })

    if (selectedProject?.id === id) {
      setSelectedProject(null)
    }
    loadProjects()
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 打回单个节点到收集箱（不递归）
  const handleToInboxSingle = async (id: number) => {
    await updateTask(id, { status: TaskStatus.INBOX })
    loadProjects()
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 获取项目进度
  const getProgress = useCallback((projectId: number) => {
    const descendants = getAllDescendants(allProjectTasks, projectId)
    const powderNodes = descendants.filter(t => t.nodeLevel === NodeLevel.POWDER)
    const completed = powderNodes.filter(t => t.isCompleted).length
    return { completed, total: powderNodes.length }
  }, [allProjectTasks])

  // 渲染树形结构
  const renderTree = (parentId: number | null, level: number) => {
    const children = allProjectTasks.filter(t => t.parentId === parentId)
    if (children.length === 0) return null

    return (
      <div className={level > 0 ? `ml-4 mt-2` : ''}>
        {children.map(task => {
          const progress = (task.nodeLevel ?? 0) === NodeLevel.POWDER
            ? null
            : getProgress(task.id!)

          return (
            <div key={task.id} className="mb-2">
              <div className={`flex items-center gap-2 p-2 rounded border ${task.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                {(task.nodeLevel ?? 0) === NodeLevel.POWDER && (
                  <button
                    onClick={() => handleToggleComplete(task.id!)}
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                    }`}
                  >
                    {task.isCompleted && <Check className="h-3 w-3" />}
                  </button>
                )}
                <span className={`flex-1 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </span>
                {progress && progress.total > 0 && (
                  <span className="text-xs text-gray-400">{progress.completed}/{progress.total}</span>
                )}
                <div className="flex gap-1">
                  {(task.nodeLevel ?? 0) < NodeLevel.POWDER && (
                    <Button size="sm" variant="ghost" className="h-6 px-1" onClick={() => handleAddChild(task.id!)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-1 text-gray-400 hover:text-amber-500"
                    onClick={() => handleToInboxSingle(task.id!)}
                    title="打回收集箱"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-1 text-red-400" onClick={() => handleDeleteTask(task.id!)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {renderTree(task.id!, level + 1)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] gap-2 lg:gap-3">
      {/* 左侧项目列表 */}
      <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 flex flex-col">
        <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">项目清单</h2>
        <p className="text-gray-500 mb-4 text-sm">粉末化任务拆解</p>

        <div className="flex gap-2 mb-4">
          <Input
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="新建项目目标..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddProject}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)] md:h-[calc(100vh-240px)]">
          <div className="space-y-2">
            {projects.map((project) => {
              const progress = getProgress(project.id!)
              return (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all group ${
                    selectedProject?.id === project.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => selectProject(project)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span className="flex-1 truncate text-sm font-medium">{project.title}</span>
                      {progress.total > 0 && (
                        <span className="text-xs text-gray-400">
                          {progress.completed}/{progress.total}
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleToInbox(project.id!) }}
                          >
                            <RotateCcw className="h-3 w-3 mr-2" />
                            打回收集箱
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id!) }}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {projects.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无项目<br />
                <span className="text-xs">创建一个目标，开始粉末化拆解吧</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 中间树形结构区域 */}
      <div className="flex-1 bg-white rounded-lg overflow-hidden flex flex-col">
        {selectedProject ? (
          <>
            {/* 顶部工具栏 */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{selectedProject.title}</h3>
                <span className="text-xs text-gray-400">
                  {getProgress(selectedProject.id!).completed > 0 &&
                    `已完成 ${getProgress(selectedProject.id!).completed} 个粉末动作`}
                </span>
              </div>
              <div className="flex gap-2">
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'json',
                        label: <span className="flex items-center gap-2"><FileJson className="h-4 w-4" />导出 JSON</span>,
                        onClick: () => handleExport('json'),
                      },
                      {
                        key: 'png',
                        label: <span className="flex items-center gap-2"><FileImage className="h-4 w-4" />导出 PNG</span>,
                        onClick: () => handleExport('png'),
                      },
                      {
                        key: 'markdown',
                        label: <span className="flex items-center gap-2"><FileText className="h-4 w-4" />导出 Markdown</span>,
                        onClick: () => handleExport('markdown'),
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </Dropdown>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteProject(selectedProject.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 树形思维导图 */}
            <div className="flex-1 overflow-hidden">
              <MindmapElixir
                tasks={allProjectTasks}
                selectedProjectId={selectedProject.id!}
                onAddChild={handleInlineAddChild}
                onAddSibling={handleInlineAddSibling}
                onDelete={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
                onUpdate={handleInlineUpdate}
                onRefresh={handleRefresh}
              />
            </div>

            {/* 底部温柔提示 */}
            <div className="p-3 border-t bg-amber-50">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Sparkles className="h-4 w-4" />
                <span>{guideMessage}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p>选择一个项目开始粉末化拆解</p>
              <p className="text-sm mt-2">点击左侧项目，然后在右侧添加节点</p>
            </div>
          </div>
        )}
      </div>

      {/* 右侧：今日可执行粉末动作 */}
      {selectedProject && (
        <div className="w-full lg:w-56 xl:w-64 flex-shrink-0 bg-white rounded-lg p-3 lg:p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              今日可执行
            </h3>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
              onClick={handleSubmitAll}
            >
              一键提交
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)] md:h-[calc(100vh-240px)]">
            <div className="space-y-2">
              {allProjectTasks
                .filter(t => t.parentId === selectedProject.id)
                .flatMap(milestone =>
                  allProjectTasks
                    .filter(t => t.parentId === milestone.id && t.nodeLevel === NodeLevel.MODULE)
                    .flatMap(module =>
                      allProjectTasks
                        .filter(t => t.parentId === module.id && t.nodeLevel === NodeLevel.POWDER && !t.isCompleted)
                        .map(powder => ({ ...powder, milestoneName: milestone.title, moduleName: module.title }))
                    )
                )
                .slice(0, 10)
                .map(task => (
                  <Card key={task.id} className="border-amber-200 bg-amber-50">
                    <CardContent className="p-3">
                      <div className="text-xs text-amber-600 mb-1">
                        {task.milestoneName} → {task.moduleName}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{task.title}</span>
                        {task.isSubmitted ? (
                          <Button
                            size="sm"
                            disabled
                            className="h-7 bg-green-500"
                          >
                            已提交
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 bg-amber-500 hover:bg-amber-600"
                            onClick={() => handleSubmitToExecute(task.id!)}
                          >
                            提交
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {allProjectTasks.filter(t =>
                t.parentId === selectedProject.id &&
                allProjectTasks.some(p => p.parentId === t.id && p.nodeLevel === NodeLevel.MODULE &&
                  allProjectTasks.some(m => m.parentId === p.id && m.nodeLevel === NodeLevel.POWDER && !m.isCompleted))
              ).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  暂无可执行的粉末动作<br />
                  <span className="text-xs">先把项目拆到粉末节点吧</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* 添加子节点对话框 */}
      <TaskInputDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogParentLevel === NodeLevel.MODULE ? "添加粉末动作" : `添加${getLevelName((dialogParentLevel ?? 0) + 1 as NodeLevel)}`}
        placeholder={dialogParentLevel === NodeLevel.MODULE ? "输入粉末动作（5分钟内可完成）" : "输入名称"}
        onConfirm={handleConfirmAddChild}
      />
    </div>
  )
}
