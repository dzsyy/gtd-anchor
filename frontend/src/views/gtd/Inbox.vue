<template>
  <div class="inbox-page">
    <h2>收集箱</h2>
    <p class="subtitle">将所有任务暂时存放在这里，稍后进行分类处理</p>

    <el-empty v-if="!tasks.length" description="收集箱是空的" />

    <div v-else class="task-list">
      <el-card
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        shadow="hover"
      >
        <div class="task-content">
          <el-checkbox
            v-model="task.completed"
            @change="handleComplete(task)"
          />
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ task.description }}</p>
            <div class="task-meta">
              <el-tag v-if="task.estimatedTime" size="small">
                {{ task.estimatedTime }}分钟
              </el-tag>
              <el-tag v-if="task.dueDate" size="small" type="warning">
                {{ formatDate(task.dueDate) }}
              </el-tag>
            </div>
          </div>
          <div class="task-actions">
            <el-button size="small" @click="openProcessDialog(task)">
              处理
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(task.id!)">
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- GTD 处理对话框 -->
    <el-dialog v-model="dialogVisible" title="GTD 决策流程" width="500px">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="可行动?" />
        <el-step title="2分钟?" />
        <el-step title="多步骤?" />
        <el-step title="特定时间?" />
        <el-step title="该我做?" />
      </el-steps>

      <div class="process-content">
        <!-- 步骤 1: 可行动 -->
        <div v-if="currentStep === 0" class="step-content">
          <h4>这个问题可行动吗？</h4>
          <el-button type="primary" @click="nextStep(true)">是</el-button>
          <el-button @click="nextStep(false)">否</el-button>
        </div>

        <!-- 步骤 2: 2分钟 -->
        <div v-if="currentStep === 1" class="step-content">
          <h4>这件事可以在 2 分钟内搞定吗？</h4>
          <el-button type="primary" @click="handleTwoMinutes(true)">能</el-button>
          <el-button @click="handleTwoMinutes(false)">不能</el-button>
        </div>

        <!-- 步骤 3: 多步骤 -->
        <div v-if="currentStep === 2" class="step-content">
          <h4>这件事可以一步搞定吗？（需要多步骤成为项目）</h4>
          <el-button type="primary" @click="nextStep(true)">是（一步）</el-button>
          <el-button @click="nextStep(false)">否（多步骤）</el-button>
        </div>

        <!-- 步骤 4: 特定时间 -->
        <div v-if="currentStep === 3" class="step-content">
          <h4>有特定时间吗？</h4>
          <el-date-picker
            v-model="processData.dueDate"
            type="datetime"
            placeholder="选择时间"
          />
          <el-button type="primary" @click="nextStep(true)">有</el-button>
          <el-button @click="handleSpecificTime(false)">没有</el-button>
        </div>

        <!-- 步骤 5: 该我做 -->
        <div v-if="currentStep === 4" class="step-content">
          <h4>这件事该我做吗？</h4>
          <el-input
            v-if="!isMyTask"
            v-model="processData.waitingFor"
            placeholder="等待谁？"
          />
          <el-button type="primary" @click="handleIsMyTask(true)">是</el-button>
          <el-button @click="handleIsMyTask(false)">否</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task, type ProcessTaskDTO } from '../../types'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const taskStore = useTaskStore()
const tasks = computed(() => taskStore.tasksByStatus[TaskStatus.INBOX] || [])

// 处理对话框
const dialogVisible = ref(false)
const currentStep = ref(0)
const selectedTask = ref<Task | null>(null)
const isMyTask = ref(true)

const processData = ref<ProcessTaskDTO>({
  taskId: 0,
  actionable: true,
  twoMinutes: false,
  isProject: false,
  hasSpecificTime: false,
  isMyTask: true
})

onMounted(() => {
  taskStore.fetchAllTasks()
})

const openProcessDialog = (task: Task) => {
  selectedTask.value = task
  currentStep.value = 0
  processData.value = {
    taskId: task.id!,
    actionable: true,
    twoMinutes: false,
    isProject: false,
    hasSpecificTime: false,
    isMyTask: true
  }
  dialogVisible.value = true
}

const nextStep = (value: boolean) => {
  if (currentStep.value === 0) {
    processData.value.actionable = value
    if (!value) {
      // 不可行动 -> 可能清单
      processTaskFinal()
      return
    }
  } else if (currentStep.value === 2) {
    processData.value.isProject = !value // "否"意味着多步骤
  } else if (currentStep.value === 3) {
    processData.value.hasSpecificTime = value
  }
  currentStep.value++
}

const handleTwoMinutes = async (value: boolean) => {
  processData.value.twoMinutes = value
  if (value) {
    // 2分钟内完成 -> 标记为完成
    await taskStore.moveTask(processData.value.taskId, TaskStatus.DONE)
    ElMessage.success('任务已完成！')
    dialogVisible.value = false
  } else {
    currentStep.value = 2
  }
}

const handleSpecificTime = async (value: boolean) => {
  processData.value.hasSpecificTime = value
  if (!value) {
    // 没有特定时间 -> 询问是否该我做
    currentStep.value = 4
  } else {
    // 有特定时间 -> 保持 inbox 或创建日历事件
    dialogVisible.value = false
    ElMessage.info('已设置截止时间')
  }
}

const handleIsMyTask = async (value: boolean) => {
  processData.value.isMyTask = value
  isMyTask.value = value
  await processTaskFinal()
}

const processTaskFinal = async () => {
  const dto = { ...processData.value }

  if (dto.actionable === false) {
    await taskStore.moveTask(dto.taskId, TaskStatus.SOMEDAY)
    ElMessage.success('已移至可能清单')
  } else if (dto.isProject) {
    await taskStore.moveTask(dto.taskId, TaskStatus.PROJECT)
    ElMessage.success('已移至项目清单')
  } else if (dto.isMyTask === false) {
    await taskStore.moveTask(dto.taskId, TaskStatus.WAITING)
    ElMessage.success('已移至等待清单')
  } else {
    await taskStore.moveTask(dto.taskId, TaskStatus.CONTEXT)
    ElMessage.success('已移至执行清单')
  }

  dialogVisible.value = false
}

const handleComplete = async (task: Task) => {
  await taskStore.moveTask(task.id!, TaskStatus.DONE)
  ElMessage.success('任务已完成！')
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await taskStore.deleteTask(id)
  ElMessage.success('已删除')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.inbox-page {
  max-width: 800px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  margin-bottom: 0;
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.task-info {
  flex: 1;
}

.task-info h4 {
  margin: 0 0 4px 0;
}

.task-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.task-meta {
  display: flex;
  gap: 8px;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.process-content {
  margin-top: 30px;
  text-align: center;
}

.step-content {
  padding: 20px;
}

.step-content h4 {
  margin-bottom: 20px;
}

.step-content .el-button {
  margin: 0 8px;
}
</style>
