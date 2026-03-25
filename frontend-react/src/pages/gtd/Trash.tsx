import { useState, useEffect } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Trash() {
  const { fetchTasksByStatus, updateTask, deleteTask } = useTaskStore()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const data = await fetchTasksByStatus(TaskStatus.TRASH)
    setTasks(data)
  }

  const handleRestore = async (id: number) => {
    await updateTask(id, { status: TaskStatus.INBOX })
    loadTasks()
  }

  const handleDelete = async (id: number) => {
    await deleteTask(id)
    loadTasks()
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">回收箱</h2>
      <p className="text-gray-500 mb-3 md:mb-6">已删除的任务，可以恢复或彻底删除</p>

      <Card>
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)]">
          <CardContent className="p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                回收箱是空的
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                  >
                    <span className="flex-1 text-gray-500 line-through">{task.title}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => task.id && handleRestore(task.id)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      恢复
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 text-red-500"
                      onClick={() => task.id && handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
