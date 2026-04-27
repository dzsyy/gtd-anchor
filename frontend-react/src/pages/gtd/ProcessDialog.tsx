import { useState } from 'react'
import { TaskStatus, type Task } from '@/types'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProcessDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (status: string, isProject?: boolean) => void
}

export function ProcessDialog({ task, open, onOpenChange, onAction }: ProcessDialogProps) {
  const [step, setStep] = useState(1)
  const [waitingFor, setWaitingFor] = useState('')

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep(1)
      setWaitingFor('')
    }
    onOpenChange(newOpen)
  }

  const executeAction = (status: TaskStatus | string, isProject = false) => {
    onAction(status, isProject)
    handleOpenChange(false)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">这件事情可行动吗？</div>
            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} className="flex-1">
                是 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                否
              </Button>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">可以一步搞定吗？</div>
            <div className="flex gap-2">
              <Button onClick={() => setStep(3)} className="flex-1">
                是 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => executeAction(TaskStatus.PROJECT, true)}
                className="flex-1"
              >
                否 → 项目
              </Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">2分钟内能搞定吗？</div>
            <div className="flex gap-2">
              <Button
                onClick={() => executeAction(TaskStatus.DONE)}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Check className="mr-2 h-4 w-4" />
                立即执行
              </Button>
              <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                否 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">该我做吗？等别人？</div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => executeAction(TaskStatus.PROJECT)} className="flex-1">
                该我做 → 执行
              </Button>
              <Button variant="outline" onClick={() => setStep(6)} className="flex-1">
                <Clock className="mr-2 h-4 w-4" />
                等待
              </Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">那是什么？</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => executeAction(TaskStatus.SOMEDAY)}>
                可能清单
              </Button>
              <Button variant="secondary" onClick={() => executeAction(TaskStatus.TRASH)}>
                回收箱
              </Button>
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-center py-4">等待谁？</div>
            <Input
              placeholder="输入等待对象..."
              value={waitingFor}
              onChange={(e) => setWaitingFor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeAction(TaskStatus.WAITING)}
            />
            <Button onClick={() => executeAction(TaskStatus.WAITING)} className="w-full">
              确认等待
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>处理任务</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
            {task?.title}
          </div>
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}