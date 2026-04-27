import { useState, useEffect } from 'react'
import { Plus, List } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, NodeLevel, type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InboxList } from './InboxList'
import { ProcessDialog } from './ProcessDialog'
import { BatchImportDialog } from './BatchImportDialog'

export function Inbox() {
  const { tasksByStatus, fetchTasksByStatus, createTask, createTasks, updateTask, deleteTask, loading } = useTaskStore()
  const [newTitle, setNewTitle] = useState('')
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [batchImportOpen, setBatchImportOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const inboxTasks = tasksByStatus[TaskStatus.INBOX] || []

  useEffect(() => {
    fetchTasksByStatus(TaskStatus.INBOX)
  }, [fetchTasksByStatus])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    await createTask({ title: newTitle.trim(), status: TaskStatus.INBOX })
    setNewTitle('')
    fetchTasksByStatus(TaskStatus.INBOX)
  }

  const handleBatchImport = async (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    if (lines.length === 0) return
    const tasks = lines.map(title => ({ title, status: TaskStatus.INBOX }))
    await createTasks(tasks)
    fetchTasksByStatus(TaskStatus.INBOX)
  }

  const startProcess = (task: Task) => {
    setSelectedTask(task)
    setProcessDialogOpen(true)
  }

  const handleProcessAction = async (status: string, isProject = false) => {
    if (!selectedTask?.id || !selectedTask.title) return

    const updateData: Partial<Task> = {
      title: selectedTask.title,
    }

    if (status === TaskStatus.DONE) {
      updateData.status = TaskStatus.ARCHIVED as unknown as string
      updateData.isCompleted = true
      updateData.completedTime = new Date().toISOString() as unknown as string
    } else {
      updateData.status = status
    }

    if (isProject) {
      updateData.isProject = true
      updateData.nodeLevel = NodeLevel.ROOT
    }

    if (status === TaskStatus.PROJECT) {
      updateData.isSubmitted = true
    }

    await updateTask(selectedTask.id, updateData)
    fetchTasksByStatus(TaskStatus.INBOX)
  }

  const handleDelete = async (id: number) => {
    await deleteTask(id)
    fetchTasksByStatus(TaskStatus.INBOX)
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
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={loading}>
          <Plus className="h-4 w-4 mr-1" />
          添加
        </Button>
        <Button variant="outline" onClick={() => setBatchImportOpen(true)}>
          <List className="h-4 w-4 mr-1" />
          批量导入
        </Button>
      </div>

      <Card>
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-200px)]">
          <CardContent className="p-4">
            <InboxList
              tasks={inboxTasks}
              onProcess={startProcess}
              onDelete={handleDelete}
            />
          </CardContent>
        </ScrollArea>
      </Card>

      <ProcessDialog
        task={selectedTask}
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        onAction={handleProcessAction}
      />

      <BatchImportDialog
        open={batchImportOpen}
        onOpenChange={setBatchImportOpen}
        onImport={handleBatchImport}
      />
    </div>
  )
}