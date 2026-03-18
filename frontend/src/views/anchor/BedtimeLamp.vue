<template>
  <div class="bedtime-lamp" :class="{ active: isActive }">
    <h2>睡前小台灯</h2>
    <p class="subtitle">15分钟温柔收尾仪式</p>

    <!-- 步骤展示 -->
    <div class="steps-container">
      <div v-for="(step, index) in steps" :key="index" class="step-card" :class="{ completed: currentStep > index, active: currentStep === index }">
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-content">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <!-- 步骤输入区 -->
          <div v-if="currentStep === index" class="step-input">
            <el-input
              v-model="stepAnswers[index]"
              type="textarea"
              :rows="3"
              :placeholder="step.placeholder"
            />
            <el-button v-if="!isTimerRunning" type="primary" @click="nextStep">
              {{ currentStep === steps.length - 1 ? '完成仪式' : '下一步' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 计时器 -->
    <div class="timer-section">
      <div class="timer-display">{{ formatTime(timeLeft) }}</div>
      <el-button v-if="!isTimerRunning && !isCompleted" type="warning" @click="startTimer">
        开始计时
      </el-button>
      <el-button v-else-if="isTimerRunning" @click="pauseTimer">
        暂停
      </el-button>
    </div>

    <!-- 完成提示 -->
    <div v-if="isCompleted" class="complete-tip">
      <div class="complete-icon">✨</div>
      <h3>今天的你已经做得很好了</h3>
      <p>好好休息吧，明天见✨</p>
    </div>

    <!-- 步骤提示 -->
    <div class="step-tips">
      <h4>{{ currentStep < steps.length ? steps[currentStep].tip : '' }}</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const currentStep = ref(0)
const timeLeft = ref(5 * 60) // 5分钟
const isTimerRunning = ref(false)
const isActive = ref(false)
const isCompleted = ref(false)
let timer: number | null = null

const stepAnswers = ref(['', '', '', ''])

const steps = [
  {
    title: '未完成收纳',
    description: '把今天所有没做完的事、没落地的灵感、担心的问题，全部写下来',
    placeholder: '写下所有未完成的事情...',
    tip: '不用分类、不用排序，写完就放下，明天再来找它们'
  },
  {
    title: '灵感播种',
    description: '写下1个你今天最在意、最想深挖的灵感/问题',
    placeholder: '写下你最想在意的灵感...',
    tip: '交给你的潜意识，它会在你睡觉的时候帮你找到答案'
  },
  {
    title: '最小成就确认',
    description: '找出1件今天做到的小事',
    placeholder: '记录你的成就...',
    tip: '告诉自己做得很好了'
  },
  {
    title: '明日开门锚定',
    description: '只定1件明天5分钟就能完成的小事',
    placeholder: '写下明天的小目标...',
    tip: '提前把启动道具准备好'
  }
]

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    timeLeft.value = 5 * 60
  } else {
    complete()
  }
}

const startTimer = () => {
  isTimerRunning.value = true
  isActive.value = true
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      pauseTimer()
      nextStep()
    }
  }, 1000)
}

const pauseTimer = () => {
  isTimerRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const complete = () => {
  isCompleted.value = true
  isActive.value = false
  pauseTimer()
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

onUnmounted(() => {
  pauseTimer()
})
</script>

<style scoped>
.bedtime-lamp {
  max-width: 700px;
  margin: 0 auto;
  padding: 30px;
  background: linear-gradient(180deg, #fff 0%, #fdf6ec 100%);
  border-radius: 20px;
  min-height: 80vh;
  transition: all 0.5s;
}

.bedtime-lamp.active {
  background: linear-gradient(180deg, #fff9f0 0%, #fff3e0 100%);
}

h2 {
  text-align: center;
  color: #e6a23c;
  margin-bottom: 5px;
}

.subtitle {
  text-align: center;
  color: #999;
  margin-bottom: 30px;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.step-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  opacity: 0.6;
  transition: all 0.3s;
}

.step-card.completed {
  opacity: 0.4;
}

.step-card.active {
  opacity: 1;
  box-shadow: 0 4px 20px rgba(230, 162, 60, 0.3);
}

.step-number {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #999;
  flex-shrink: 0;
}

.step-card.active .step-number {
  background: #e6a23c;
  color: white;
}

.step-content h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.step-content p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.step-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timer-section {
  text-align: center;
  margin: 30px 0;
}

.timer-display {
  font-size: 48px;
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 15px;
}

.complete-tip {
  text-align: center;
  padding: 40px;
}

.complete-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.complete-tip h3 {
  color: #e6a23c;
  margin-bottom: 10px;
}

.complete-tip p {
  color: #999;
}

.step-tips {
  text-align: center;
  padding: 20px;
  background: #fff3e0;
  border-radius: 12px;
  margin-top: 20px;
}

.step-tips h4 {
  margin: 0;
  color: #e6a23c;
  font-weight: normal;
}
</style>
