import { useState, useEffect } from 'react'
import { MoreVertical, Trash2, CheckCircle } from 'lucide-react'
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
import { ScrollArea } from '@/components/ui/scroll-area'

export function WaitingList() {
  const { fetchTasksByStatus, updateTask, deleteTask } = useTaskStore()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const data = await fetchTasksByStatus(TaskStatus.WAITING)
    setTasks(data)
  }

  const handleComplete = async (id: number) => {
    await updateTask(id, { status: TaskStatus.DONE })
    loadTasks()
  }

  const handleDelete = async (id: number) => {
    await deleteTask(id)
    loadTasks()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">等待清单</h2>
      <p className="text-gray-500 mb-6">他人处理或等待响应的任务</p>

      <Card>
        <ScrollArea className="h-[calc(100vh-220px)]">
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => task.id && handleComplete(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      完成
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
    </div>
  )
}
