import type { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { MoreVertical, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface InboxListProps {
  tasks: Task[]
  onProcess: (task: Task) => void
  onDelete: (id: number) => void
}

export function InboxList({ tasks, onProcess, onDelete }: InboxListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        收集箱是空的，添加一些任务吧
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group"
        >
          <span className="flex-1">{task.title}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onProcess(task)}
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
                onClick={() => task.id && onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
}