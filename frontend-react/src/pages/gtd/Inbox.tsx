import { useState, useEffect } from 'react'
import { Plus, MoreVertical, Trash2, ArrowRight, Clock, Check } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, NodeLevel, type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function Inbox() {
  const { fetchTasksByStatus, createTask, updateTask, deleteTask } = useTaskStore()
  const [inboxTasks, setInboxTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [processDialog, setProcessDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [step, setStep] = useState(1)
  const [waitingFor, setWaitingFor] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const data = await fetchTasksByStatus(TaskStatus.INBOX)
    setInboxTasks(data)
  }

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    await createTask({ title: newTitle.trim(), status: TaskStatus.INBOX })
    setNewTitle('')
    loadTasks()
  }

  const startProcess = (task: Task) => {
    setSelectedTask(task)
    setStep(1)
    setWaitingFor('')
    setProcessDialog(true)
  }

  const executeAction = async (status: string, isProject = false) => {
    if (!selectedTask?.id || !selectedTask.title) return

    const updateData: Record<string, unknown> = {
      title: selectedTask.title,
    }
    // 立即执行 -> 归档
    if (status === TaskStatus.DONE) {
      updateData.status = TaskStatus.ARCHIVED
      updateData.isCompleted = true
      updateData.completedTime = new Date().toISOString()
    } else {
      updateData.status = status
    }
    if (isProject) {
      updateData.isProject = true
      updateData.nodeLevel = NodeLevel.ROOT
    }
    // 进入执行清单的任务需要设置 isSubmitted=true
    if (status === TaskStatus.PROJECT) {
      updateData.isSubmitted = true
    }
    if (waitingFor) updateData.waitingFor = waitingFor

    await updateTask(selectedTask.id, updateData)

    setProcessDialog(false)
    setSelectedTask(null)
    loadTasks()
  }

  const handleDelete = async (id: number) => {
    await deleteTask(id)
    loadTasks()
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">这件事情可行动吗？</div>
            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} className="flex-1">是 <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => setStep(5)} className="flex-1">否</Button>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">可以一步搞定吗？</div>
            <div className="flex gap-2">
              <Button onClick={() => setStep(3)} className="flex-1">是 <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => executeAction(TaskStatus.PROJECT, true)} className="flex-1">否 → 项目</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">2分钟内能搞定吗？</div>
            <div className="flex gap-2">
              <Button onClick={() => executeAction(TaskStatus.DONE)} className="flex-1 bg-green-500 hover:bg-green-600">
                <Check className="mr-2 h-4 w-4" />立即执行
              </Button>
              <Button variant="outline" onClick={() => setStep(4)} className="flex-1">否 <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">该我做吗？等别人？</div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => executeAction(TaskStatus.PROJECT)} className="flex-1">该我做 → 执行</Button>
              <Button variant="outline" onClick={() => setStep(6)} className="flex-1"><Clock className="mr-2 h-4 w-4" />等待</Button>
            </div>
          </div>
        )
      case 5: // 否 - 不可行动
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">那是什么？</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => executeAction(TaskStatus.SOMEDAY)}>可能清单</Button>
              <Button variant="secondary" onClick={() => executeAction(TaskStatus.TRASH)}>回收箱</Button>
            </div>
          </div>
        )
      case 6: // 等待
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">等待谁？</div>
            <Input
              placeholder="输入等待对象..."
              value={waitingFor}
              onChange={(e) => setWaitingFor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeAction(TaskStatus.WAITING)}
            />
            <Button onClick={() => executeAction(TaskStatus.WAITING)} className="w-full">确认等待</Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">收集箱</h2>
      <p className="text-gray-500 mb-3 md:mb-6">快速收集任务想法，稍后处理</p>

      <div className="flex gap-2 mb-6">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="添加新任务..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1"
        />
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />添加
        </Button>
      </div>

      <Card>
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-200px)] md:h-[calc(100vh-280px)]">
          <CardContent className="p-4">
            {inboxTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">收集箱是空的，添加一些任务吧</div>
            ) : (
              <div className="space-y-2">
                {inboxTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group">
                    <span className="flex-1">{task.title}</span>
                    <Button size="sm" variant="outline" onClick={() => startProcess(task)} className="opacity-0 group-hover:opacity-100">处理</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-500" onClick={() => task.id && handleDelete(task.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />删除
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

      <Dialog open={processDialog} onOpenChange={setProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>处理任务</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">{selectedTask?.title}</div>
            {renderStep()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
