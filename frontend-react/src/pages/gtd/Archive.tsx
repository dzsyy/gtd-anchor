import { useState, useEffect } from 'react'
import { RotateCcw, FolderKanban, ChevronLeft, Search } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, NodeLevel, type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TaskWithProject extends Task {
  projectName?: string
}

interface ProjectWithCount {
  project: Task
  count: number
}

type ViewMode = 'all' | 'projects' | 'project-detail'

export function Archive() {
  const { fetchTasksByStatus, updateTask } = useTaskStore()
  const [projects, setProjects] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [allArchivedTasks, setAllArchivedTasks] = useState<Task[]>([])
  const [allProjectTasks, setAllProjectTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const archivedTasks = await fetchTasksByStatus(TaskStatus.ARCHIVED)
    const projectTasks = await fetchTasksByStatus(TaskStatus.PROJECT)

    // 找出根项目：从 PROJECT 和 ARCHIVED 中找
    const allTasks = [...projectTasks, ...archivedTasks]
    const rootProjects = allTasks.filter(t =>
      t.isProject === true && (t.nodeLevel === NodeLevel.ROOT || t.nodeLevel === null)
    )
    setProjects(rootProjects)
    setAllArchivedTasks(archivedTasks)
    setAllProjectTasks(projectTasks)
  }

  // 递归查找根项目
  const findRootProject = (taskId: number | undefined | null, taskList: Task[]): Task | undefined => {
    if (!taskId) return undefined
    const task = taskList.find(t => t.id === taskId)
    if (!task) return undefined
    if (task.isProject || task.nodeLevel === NodeLevel.ROOT) {
      return task
    }
    return findRootProject(task.parentId, taskList)
  }

  // 获取归档中有粉末任务的项目列表
  const getProjectList = (): ProjectWithCount[] => {
    const projectMap = new Map<number, { project: Task, count: number }>()
    const allTasks = [...allProjectTasks, ...allArchivedTasks]

    allArchivedTasks.forEach(t => {
      // 粉末/模块/里程碑节点
      if (t.nodeLevel === NodeLevel.POWDER || t.nodeLevel === NodeLevel.MODULE || t.nodeLevel === NodeLevel.MILESTONE) {
        const root = findRootProject(t.parentId, allTasks)
        if (root) {
          const existing = projectMap.get(root.id!)
          if (existing) {
            existing.count++
          } else {
            projectMap.set(root.id!, { project: root, count: 1 })
          }
        }
      }
      // 根项目或无层级任务（等待清单直接归档的）
      else if (t.nodeLevel === NodeLevel.ROOT || t.nodeLevel === null) {
        const existing = projectMap.get(t.id!)
        if (existing) {
          existing.count++
        } else {
          projectMap.set(t.id!, { project: t, count: 1 })
        }
      }
    })

    return Array.from(projectMap.values()).sort((a, b) => b.count - a.count)
  }

  // 获取当前项目的归档任务
  const getProjectTasks = (projectId: number): TaskWithProject[] => {
    const project = projects.find(p => p.id === projectId)
    if (!project) {
      // 可能是从归档中直接取的根项目
      const archivedProject = allArchivedTasks.find(t => t.id === projectId)
      if (archivedProject) {
        return [{
          ...archivedProject,
          projectName: archivedProject.title
        }]
      }
      return []
    }

    return allArchivedTasks
      .filter(t => {
        // 粉末/模块/里程碑节点
        if (t.nodeLevel === NodeLevel.POWDER || t.nodeLevel === NodeLevel.MODULE || t.nodeLevel === NodeLevel.MILESTONE) {
          const root = findRootProject(t.parentId, [...allProjectTasks, ...allArchivedTasks])
          return root?.id === projectId
        }
        // 根项目本身
        if (t.nodeLevel === NodeLevel.ROOT || t.nodeLevel === null) {
          return t.id === projectId
        }
        return false
      })
      .map(t => ({
        ...t,
        projectName: project.title
      }))
      .sort((a, b) => {
        const timeA = new Date(a.completedTime || '').getTime()
        const timeB = new Date(b.completedTime || '').getTime()
        return timeB - timeA
      })
  }

  const handleBack = () => {
    if (viewMode === 'project-detail') {
      setViewMode('projects')
      setSelectedProjectId(null)
    } else if (viewMode === 'projects') {
      setViewMode('all')
    }
  }

  const handleProjectClick = (projectId: number) => {
    setSelectedProjectId(projectId)
    setViewMode('project-detail')
  }

  const handleRestore = async (id: number) => {
    await updateTask(id, { status: TaskStatus.PROJECT })
    loadData()
  }

  // 渲染全部视图
  const renderAllView = () => {
    const allTasksCombined = [...allProjectTasks, ...allArchivedTasks]
    const allTasks: TaskWithProject[] = allArchivedTasks
      .filter(t => {
        // 粉末/模块/里程碑节点
        if (t.nodeLevel === NodeLevel.POWDER || t.nodeLevel === NodeLevel.MODULE || t.nodeLevel === NodeLevel.MILESTONE) return true
        // 根项目本身（isProject=true）不显示在全部任务列表里，只在项目列表里显示
        if ((t.nodeLevel === NodeLevel.ROOT || t.nodeLevel === null) && t.isProject) return false
        // 无层级非项目任务（等待清单直接归档的）
        if (t.nodeLevel === NodeLevel.ROOT || t.nodeLevel === null) return true
        return false
      })
      .map(t => {
        // 根项目本身
        if (t.nodeLevel === NodeLevel.ROOT || t.nodeLevel === null) {
          return { ...t, projectName: t.title }
        }
        const root = findRootProject(t.parentId, allTasksCombined)
        return {
          ...t,
          projectName: root?.title
        }
      })
      // 搜索过滤
      .filter(t => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return t.title.toLowerCase().includes(query) || t.projectName?.toLowerCase().includes(query)
      })
      .sort((a, b) => {
        const timeA = new Date(a.completedTime || '').getTime()
        const timeB = new Date(b.completedTime || '').getTime()
        return timeB - timeA
      })

    return (
      <div className="space-y-2">
        {allTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无归档任务</div>
        ) : (
          allTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group">
              {task.projectName && (
                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{task.projectName}</span>
              )}
              <span className="flex-1 line-through text-gray-400">{task.title}</span>
              <span className="text-xs text-gray-400">
                {task.completedTime ? new Date(task.completedTime).toLocaleDateString() : ''}
              </span>
              <Button size="sm" variant="outline" onClick={() => task.id && handleRestore(task.id)} className="opacity-0 group-hover:opacity-100">
                <RotateCcw className="h-3 w-3 mr-1" />恢复
              </Button>
            </div>
          ))
        )}
      </div>
    )
  }

  // 渲染项目列表视图
  const renderProjectListView = () => {
    const projectList = getProjectList()
      .filter(p => {
        if (!searchQuery) return true
        return p.project.title.toLowerCase().includes(searchQuery.toLowerCase())
      })

    return (
      <div className="space-y-2">
        {projectList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无匹配的项目</div>
        ) : (
          projectList.map(({ project, count }) => (
            <div
              key={project.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
              onClick={() => handleProjectClick(project.id!)}
            >
              <FolderKanban className="h-4 w-4 text-blue-500" />
              <span className="flex-1">{project.title}</span>
              <span className="text-xs text-gray-400">{count} 个任务</span>
            </div>
          ))
        )}
      </div>
    )
  }

  // 渲染项目详情视图
  const renderProjectDetailView = () => {
    const projectTasks = selectedProjectId ? getProjectTasks(selectedProjectId) : []

    return (
      <div className="space-y-2">
        {projectTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无归档任务</div>
        ) : (
          projectTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group">
              <span className="flex-1 line-through text-gray-400">{task.title}</span>
              <span className="text-xs text-gray-400">
                {task.completedTime ? new Date(task.completedTime).toLocaleDateString() : ''}
              </span>
              <Button size="sm" variant="outline" onClick={() => task.id && handleRestore(task.id)} className="opacity-0 group-hover:opacity-100">
                <RotateCcw className="h-3 w-3 mr-1" />恢复
              </Button>
            </div>
          ))
        )}
      </div>
    )
  }

  // 获取当前视图的标题
  const getTitle = () => {
    if (viewMode === 'project-detail' && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId)
      return project?.title || '项目详情'
    }
    return '归档'
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {viewMode !== 'all' && (
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-1">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
      </div>
      <p className="text-gray-500 mb-4">
        {viewMode === 'all' ? '已完成的任务归档' : viewMode === 'projects' ? '选择查看的项目' : '项目归档任务'}
      </p>

      {/* 搜索栏 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索归档任务..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 视图切换 */}
      {viewMode === 'all' && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button variant="default" size="sm">全部</Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('projects')}>
            <FolderKanban className="h-3 w-3 mr-1" />按项目
          </Button>
        </div>
      )}

      <Card>
        <ScrollArea className="h-[calc(100vh-260px)] md:h-[calc(100vh-340px)]">
          <CardContent className="p-4">
            {viewMode === 'all' && renderAllView()}
            {viewMode === 'projects' && renderProjectListView()}
            {viewMode === 'project-detail' && renderProjectDetailView()}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}
