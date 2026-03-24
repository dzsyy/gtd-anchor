import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface TaskInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  placeholder: string
  onConfirm: (value: string) => void
}

export function TaskInputDialog({
  open,
  onOpenChange,
  title,
  placeholder,
  onConfirm,
}: TaskInputDialogProps) {
  const [value, setValue] = useState('')

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim())
      setValue('')
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!value.trim()}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
