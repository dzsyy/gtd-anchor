import { useState, useEffect } from 'react'
import { MoreVertical, Trash2 } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { type Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Reference() {
  const { fetchTasksByStatus, deleteTask } = useTaskStore()
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    // Get all tasks and filter by contextTag or some marker
    const allTasks = await fetchTasksByStatus('PROJECT')
    setTasks(allTasks.filter((t) => t.contextTag === 'REFERENCE'))
  }

  const handleDelete = async (id: number) => {
    await deleteTask(id)
    loadTasks()
  }

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">参考资料</h2>
      <p className="text-gray-500 mb-3 md:mb-6">需要保留的参考资料和信息</p>

      <Card>
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-220px)]">
          <CardContent className="p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                暂无参考资料
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="flex-1">{task.title}</span>
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
