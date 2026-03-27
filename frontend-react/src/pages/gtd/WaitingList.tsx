import { useState, useEffect } from 'react'
import { MoreVertical, Trash2, ArrowRight, Check, RotateCcw } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export function WaitingList() {
  const { fetchTasksByStatus, updateTask, deleteTask } = useTaskStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [processDialog, setProcessDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const data = await fetchTasksByStatus(TaskStatus.WAITING)
    setTasks(data)
  }

  // 开始处理
  const startProcess = (task: Task) => {
    setSelectedTask(task)
    setProcessDialog(true)
  }

  // 立即完成 -> 归档
  const handleComplete = async () => {
    if (!selectedTask?.id) return
    await updateTask(selectedTask.id, {
      status: TaskStatus.ARCHIVED,
      isCompleted: true,
      completedTime: new Date().toISOString()
    })
    setProcessDialog(false)
    setSelectedTask(null)
    loadTasks()
  }

  // 移入项目清单
  const handleToProject = async () => {
    if (!selectedTask?.id) return
    await updateTask(selectedTask.id, { status: TaskStatus.PROJECT })
    setProcessDialog(false)
    setSelectedTask(null)
    loadTasks()
  }

  // 打回收集箱
  const handleToInbox = async (id: number) => {
    await updateTask(id, { status: TaskStatus.INBOX })
    loadTasks()
  }

  const handleDelete = async (id: number) => {
    await deleteTask(id)
    loadTasks()
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">等待清单</h2>
      <p className="text-gray-500 mb-3 md:mb-6">等待他人响应的任务</p>

      <Card>
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)]">
          <CardContent className="p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                等待清单是空的
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <span className="flex-1">{task.title}</span>
                    {task.waitingFor && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        等待: {task.waitingFor}
                      </span>
                    )}
                    {/* 打回收集箱按钮 */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => task.id && handleToInbox(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-amber-600"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startProcess(task)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      处理
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => task.id && handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* 处理弹窗 */}
      <Dialog open={processDialog} onOpenChange={setProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>处理任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">{selectedTask?.title}</div>
            <div className="text-lg font-medium text-center py-2">可以一步搞定吗？</div>
            <div className="flex gap-2">
              <Button onClick={handleComplete} className="flex-1 bg-green-500 hover:bg-green-600">
                <Check className="mr-2 h-4 w-4" />搞定 → 归档
              </Button>
              <Button variant="outline" onClick={handleToProject} className="flex-1">
                <ArrowRight className="mr-2 h-4 w-4" />否 → 项目
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
