import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BatchImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (text: string) => void
}

export function BatchImportDialog({ open, onOpenChange, onImport }: BatchImportDialogProps) {
  const [batchText, setBatchText] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setBatchText('')
    }
    onOpenChange(newOpen)
  }

  const handleImport = async () => {
    if (!batchText.trim()) return
    setIsImporting(true)
    try {
      await onImport(batchText)
      handleOpenChange(false)
    } finally {
      setIsImporting(false)
    }
  }

  const lineCount = batchText.split('\n').filter(l => l.trim()).length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>批量导入任务</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="text-sm text-gray-600">
            <p>每行一个任务，支持批量添加</p>
          </div>
          <Textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="输入任务，每行一个&#10;例：&#10;买牛奶&#10;回复邮件&#10;整理桌面"
            className="min-h-[200px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleImport()
              }
            }}
          />
          <div className="text-xs text-gray-400">
            按 Ctrl + Enter 快速导入
          </div>
          <Button
            onClick={handleImport}
            disabled={!batchText.trim() || isImporting}
            className="w-full"
          >
            {isImporting ? '导入中...' : `导入 ${lineCount} 个任务`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}