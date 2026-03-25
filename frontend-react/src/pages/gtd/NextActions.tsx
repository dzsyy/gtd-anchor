import { useState, useEffect, useMemo } from 'react'
import { CheckCircle, FolderKanban } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, NodeLevel, type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TaskWithSource extends Task {
  projectName?: string
}

export function NextActions() {
  const { fetchTasksByStatus, updateTask, deleteTask } = useTaskStore()
  const [tasks, setTasks] = useState<TaskWithSource[]>([])
  const [projects, setProjects] = useState<Task[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'all'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time')

  useEffect(() => {
    loadTasks()
  }, [selectedProjectId, sortBy])

  const loadTasks = async () => {
    // 获取所有 PROJECT 状态的任务（执行清单）
    const projectTasks = await fetchTasksByStatus(TaskStatus.PROJECT)

    // 找出所有根项目
    const rootProjects = projectTasks.filter(t => t.nodeLevel === NodeLevel.ROOT && t.isProject)
    setProjects(rootProjects)

    // 过滤出需要执行的任务：
    // 1. 已提交的粉末节点（nodeLevel=3）未完成
    // 2. 已提交的收集箱任务（非粉末、非根项目、未完成、已提交）
    const executableTasks = projectTasks.filter(t => {
      // 已提交的粉末节点
      if (t.nodeLevel === NodeLevel.POWDER && !t.isCompleted && t.isSubmitted) return true
      // 已提交的收集箱任务
      if (!t.isProject && t.nodeLevel !== NodeLevel.ROOT && !t.isCompleted && t.isSubmitted) return true
      return false
    })

    // 为任务找到所属项目
    const tasksWithProject: TaskWithSource[] = executableTasks.map(t => {
      let projectName: string | undefined

      if (t.nodeLevel === NodeLevel.POWDER) {
        // 粉末节点找项目
        projectName = findProjectName(projectTasks, t.parentId)
      } else {
        // 收集箱处理后的任务
        projectName = undefined
      }

      return {
        ...t,
        projectName
      }
    })

    let allTasks = tasksWithProject

    // 按项目筛选
    if (selectedProjectId !== 'all') {
      // 筛选某个项目的任务
      allTasks = allTasks.filter(t => t.projectName !== undefined && t.projectName === projects.find(p => p.id === selectedProjectId)?.title)
    }

    // 排序
    if (sortBy === 'time') {
      allTasks.sort((a, b) => {
        const timeA = new Date(a.createdAt || '').getTime()
        const timeB = new Date(b.createdAt || '').getTime()
        return timeB - timeA // 最新在前
      })
    } else {
      // 重要程度排序
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      allTasks.sort((a, b) => {
        const pA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3
        const pB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3
        return pA - pB
      })
    }

    setTasks(allTasks)
  }

  // 递归查找项目名称
  const findProjectName = (allTasks: Task[], taskId: number | undefined | null): string => {
    if (!taskId) return '未知项目'
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return '未知项目'
    // 根项目：nodeLevel=0 或 isProject=true
    if (task.nodeLevel === NodeLevel.ROOT || task.isProject === true) {
      return task.title
    }
    return findProjectName(allTasks, task.parentId)
  }

  const handleComplete = async (id: number) => {
    // 获取该任务的完整信息
    const task = tasks.find(t => t.id === id)
    if (!task) return

    // 标记任务完成
    await updateTask(id, {
      status: TaskStatus.ARCHIVED,
      isCompleted: true,
      completedTime: new Date().toISOString()
    })

    // 如果是粉末节点，检查项目所有粉末节点是否都完成
    if (task.nodeLevel === NodeLevel.POWDER) {
      const projectTasks = await fetchTasksByStatus(TaskStatus.PROJECT)
      const archivedTasks = await fetchTasksByStatus(TaskStatus.ARCHIVED)
      const allTasks = [...projectTasks, ...archivedTasks]

      // 找到根项目
      const rootId = findRootId(allTasks, task.parentId)
      if (rootId) {
        // 检查该项目的所有粉末节点（包括 PROJECT 和 ARCHIVED）
        const descendants = getAllDescendants(allTasks, rootId)
        const powderNodes = descendants.filter(t => t.nodeLevel === NodeLevel.POWDER)
        const allCompleted = powderNodes.every(t => t.isCompleted || t.id === id)

        // 只有当根项目还在 PROJECT 状态时才归档
        const rootInProject = projectTasks.find(t => t.id === rootId)
        if (allCompleted && rootInProject) {
          // 所有粉末节点都完成了，归档项目
          await updateTask(rootId, {
            status: TaskStatus.ARCHIVED,
            isCompleted: true,
            completedTime: new Date().toISOString()
          })
        }
      }
    }

    loadTasks()
  }

  // 递归查找根项目ID
  const findRootId = (allTasks: Task[], taskId: number | undefined | null): number | null => {
    if (!taskId) return null
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return null
    // 根项目：nodeLevel=0 或 isProject=true
    if (task.nodeLevel === NodeLevel.ROOT || task.isProject === true) {
      return task.id!
    }
    return findRootId(allTasks, task.parentId)
  }

  // 获取所有子任务
  const getAllDescendants = (tasks: Task[], parentId: number): Task[] => {
    const children = tasks.filter(t => t.parentId === parentId)
    let descendants: Task[] = [...children]
    for (const child of children) {
      descendants = [...descendants, ...getAllDescendants(tasks, child.id!)]
    }
    return descendants
  }

  // 获取各分组的任务数量
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { 'all': tasks.length }

    // 各项目数量
    projects.forEach(p => {
      const count = tasks.filter(t => t.projectName === p.title).length
      if (count > 0) {
        counts[p.id!] = count
      }
    })

    return counts
  }, [tasks, projects])

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">执行清单</h2>
      <p className="text-gray-500 mb-3 md:mb-6">收集箱 + 项目粉末任务，按需执行</p>

      {/* 分组筛选 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          variant={selectedProjectId === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedProjectId('all')}
        >
          全部 ({tasks.length})
        </Button>
        {projects.map(project => (
          <Button
            key={project.id}
            variant={selectedProjectId === project.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProjectId(project.id!)}
          >
            <FolderKanban className="h-3 w-3 mr-1" />
            {project.title}
          </Button>
        ))}
      </div>

      {/* 排序 */}
      <div className="flex gap-2 mb-4">
        <span className="text-sm text-gray-500 self-center">排序:</span>
        <Button
          variant={sortBy === 'time' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('time')}
        >
          时间
        </Button>
        <Button
          variant={sortBy === 'priority' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('priority')}
        >
          重要程度
        </Button>
      </div>

      <Card>
        <ScrollArea className="h-[calc(100vh-260px)] md:h-[calc(100vh-340px)]">
          <CardContent className="p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                暂无可执行的任务
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group"
                  >
                    {/* 任务标题 */}
                    <span className="flex-1">{task.title}</span>

                    {/* 完成按钮 */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => task.id && handleComplete(task.id)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      执行
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}
