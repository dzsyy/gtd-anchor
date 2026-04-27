import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { message } from 'antd'
import { Plus, Folder, Trash2, ChevronRight, Sparkles, RotateCcw, MoreVertical } from 'lucide-react'
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
import { MindmapSimple } from '@/components/MindmapSimple'

// 温柔引导提示
const GUIDE_MESSAGES: Record<number, string> = {
  [NodeLevel.ROOT]: "只定一个你真正想完成的终点就好哦，不用想过程、不用想细节，我们后面会一步步把它拆成你抬脚就能走的小石子✨",
  [NodeLevel.MILESTONE]: "我们先把这3个里程碑拆完、做完好不好？太多的阶段会让你的大脑过载哦，先聚焦最核心的3步就够啦✨",
  [NodeLevel.MODULE]: "不用想具体怎么做哦，只要把这个里程碑，拆成几个独立的小模块就好，拆完我们再把每个模块，变成你5分钟就能做完的小事✨",
  [NodeLevel.POWDER]: "记得哦，这个节点要小到5分钟就能做完，你的潜意识才会愿意动起来✨",
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

  // 添加子节点
  const handleAddChildNode = async (parentId: number, parentLevel: NodeLevel) => {
    const nextLevel = (parentLevel + 1) as NodeLevel
    if (nextLevel > NodeLevel.POWDER) return

    const levelNames: Record<NodeLevel, string> = {
      [NodeLevel.ROOT]: '里程碑',
      [NodeLevel.MILESTONE]: '模块',
      [NodeLevel.MODULE]: '粉末动作',
      [NodeLevel.POWDER]: '子节点',
    }

    const title = window.prompt(`请输入${levelNames[nextLevel]}名称：`)
    if (!title?.trim()) return

    await createTask({
      title: title.trim(),
      status: TaskStatus.PROJECT,
      isProject: false,
      nodeLevel: nextLevel,
      parentId,
    })
    // 刷新
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 更新任务标题
  const handleUpdateTask = async (taskId: number, title: string) => {
    await updateTask(taskId, { title })
    // 刷新
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 删除任务
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('确定要删除这个节点吗？其所有子节点也会被删除。')) return
    const descendants = getAllDescendants(allProjectTasks, taskId)
    for (const desc of descendants) {
      await deleteTask(desc.id!)
    }
    await deleteTask(taskId)
    // 刷新
    const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
    setAllProjectTasks(allTasks)
  }

  // 切换完成状态
  const handleToggleComplete = async (taskId: number) => {
    const task = allProjectTasks.find(t => t.id === taskId)
    if (task) {
      await updateTask(taskId, { isCompleted: !task.isCompleted })
      // 刷新
      const allTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
      setAllProjectTasks(allTasks)
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

  // 获取项目进度
  const getProgress = useCallback((projectId: number) => {
    const descendants = getAllDescendants(allProjectTasks, projectId)
    const powderNodes = descendants.filter(t => t.nodeLevel === NodeLevel.POWDER)
    const completed = powderNodes.filter(t => t.isCompleted).length
    return { completed, total: powderNodes.length }
  }, [allProjectTasks])

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

            {/* 思维导图 */}
            <div className="flex-1 overflow-hidden">
              <MindmapSimple
                tasks={allProjectTasks}
                selectedProjectId={selectedProject.id!}
                onAddChild={handleAddChildNode}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onToggleComplete={handleToggleComplete}
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
    </div>
  )
}
