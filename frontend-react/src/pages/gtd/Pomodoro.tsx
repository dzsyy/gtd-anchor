import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const WORK_TIME = 25 * 60 // 25 minutes
const BREAK_TIME = 5 * 60 // 5 minutes

export function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isWorking, setIsWorking] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleComplete()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  const handleComplete = () => {
    setIsRunning(false)
    if (isWorking) {
      setSessions((s) => s + 1)
      setTimeLeft(BREAK_TIME)
      setIsWorking(false)
    } else {
      setTimeLeft(WORK_TIME)
      setIsWorking(true)
    }
  }

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(isWorking ? WORK_TIME : BREAK_TIME)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">番茄钟</h2>
      <p className="text-gray-500 mb-3 md:mb-6">专注工作 25 分钟，休息 5 分钟</p>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className={isWorking ? 'text-red-500' : 'text-green-500'}>
            {isWorking ? '工作时间' : '休息时间'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-7xl font-bold mb-8">{formatTime(timeLeft)}</div>
          <div className="flex justify-center gap-4 mb-6">
            <Button size="lg" onClick={toggleTimer}>
              {isRunning ? (
                <Pause className="h-5 w-5 mr-2" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {isRunning ? '暂停' : '开始'}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5 mr-2" />
              重置
            </Button>
          </div>
          <div className="text-gray-500">
            完成的番茄数: <span className="font-bold text-primary">{sessions}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
