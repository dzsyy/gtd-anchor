import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { type Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Calendar() {
  const { fetchTasksByStatus } = useTaskStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const data = await fetchTasksByStatus('PROJECT')
    setTasks(data.filter((t) => t.dueDate))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    const startDay = firstDay.getDay()

    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((t) => t.dueDate?.startsWith(formatDate(date)))
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">日历</h2>
      <p className="text-gray-500 mb-6">有截止日期的任务</p>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-lg font-medium">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            </div>
            <Button variant="ghost" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="py-2 text-sm font-medium text-gray-500">
                {d}
              </div>
            ))}
            {days.map((date, i) => (
              <div
                key={i}
                className={`min-h-[60px] p-1 border rounded ${
                  date ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm ${isToday(date) ? 'font-bold text-primary' : ''}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getTasksForDate(date).slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className="text-xs bg-primary/10 text-primary truncate px-1 rounded"
                        >
                          {task.title}
                        </div>
                      ))}
                      {getTasksForDate(date).length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{getTasksForDate(date).length - 2}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
