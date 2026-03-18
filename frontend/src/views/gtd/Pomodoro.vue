<template>
  <div class="pomodoro-page">
    <h2>番茄钟</h2>
    <p class="subtitle">使用番茄工作法提高专注力</p>

    <div class="pomodoro-card">
      <div class="timer-display">
        <span class="time">{{ formatTime(timeLeft) }}</span>
        <span class="status">{{ statusText }}</span>
      </div>

      <div class="controls">
        <el-button
          v-if="!isRunning"
          type="primary"
          size="large"
          @click="startTimer"
        >
          开始
        </el-button>
        <el-button
          v-else
          type="danger"
          size="large"
          @click="pauseTimer"
        >
          暂停
        </el-button>
        <el-button size="large" @click="resetTimer">
          重置
        </el-button>
      </div>

      <div class="settings">
        <el-input-number
          v-model="workMinutes"
          :min="1"
          :max="60"
          :disabled="isRunning"
        />
        <span>分钟 / 工作</span>
        <el-input-number
          v-model="breakMinutes"
          :min="1"
          :max="30"
          :disabled="isRunning"
        />
        <span>分钟 / 休息</span>
      </div>

      <div class="stats">
        <el-statistic title="今日完成" :value="completedPomodoros" />
        <el-statistic title="总专注时间" :value="totalMinutes" suffix="分钟" />
      </div>
    </div>

    <!-- 任务选择 -->
    <div class="task-select">
      <h3>选择任务</h3>
      <el-select v-model="selectedTaskId" placeholder="选择要专注的任务" clearable>
        <el-option
          v-for="task in contextTasks"
          :key="task.id"
          :label="task.title"
          :value="task.id"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus } from '../../types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const taskStore = useTaskStore()

const workMinutes = ref(25)
const breakMinutes = ref(5)
const timeLeft = ref(workMinutes.value * 60)
const isRunning = ref(false)
const isBreak = ref(false)
const completedPomodoros = ref(0)
const totalMinutes = ref(0)
const selectedTaskId = ref<number | undefined>(undefined)

let timer: number | null = null

const contextTasks = computed(() => {
  return taskStore.tasksByStatus[TaskStatus.CONTEXT] || []
})

const statusText = computed(() => {
  if (isBreak.value) return '休息时间'
  if (isRunning.value) return '专注时间'
  return '准备开始'
})

onMounted(() => {
  // 从路由获取任务ID
  const taskId = route.query.taskId
  if (taskId) {
    selectedTaskId.value = Number(taskId)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startTimer = () => {
  isRunning.value = true
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      handleTimerComplete()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const resetTimer = () => {
  pauseTimer()
  isBreak.value = false
  timeLeft.value = workMinutes.value * 60
}

const handleTimerComplete = () => {
  pauseTimer()

  if (!isBreak.value) {
    // 工作完成
    completedPomodoros.value++
    totalMinutes.value += workMinutes.value
    ElMessage.success('工作完成！休息一下吧~')

    // 询问是否继续休息
    isBreak.value = true
    timeLeft.value = breakMinutes.value * 60
  } else {
    // 休息完成
    ElMessage.success('休息结束！继续工作吧~')
    isBreak.value = false
    timeLeft.value = workMinutes.value * 60
  }
}
</script>

<style scoped>
.pomodoro-page {
  max-width: 600px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.pomodoro-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.timer-display {
  margin-bottom: 30px;
}

.time {
  font-size: 72px;
  font-weight: bold;
  color: #008080;
  display: block;
}

.status {
  font-size: 18px;
  color: #666;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
}

.settings {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  color: #666;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.task-select {
  margin-top: 30px;
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.task-select h3 {
  margin: 0 0 12px 0;
}

.task-select .el-select {
  width: 100%;
}
</style>
