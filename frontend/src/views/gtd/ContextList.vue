<template>
  <div class="context-page">
    <h2>执行清单</h2>
    <p class="subtitle">可立即执行的行动，按 @上下文 分组</p>

    <!-- 上下文标签筛选 -->
    <div class="context-filter">
      <el-select v-model="selectedContext" placeholder="筛选上下文" clearable>
        <el-option
          v-for="ctx in contexts"
          :key="ctx"
          :label="ctx"
          :value="ctx"
        />
      </el-select>
    </div>

    <el-empty v-if="!filteredTasks.length" description="暂无执行任务" />

    <div v-else class="task-list">
      <el-card
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-card"
        shadow="hover"
      >
        <div class="task-content">
          <el-checkbox @change="handleComplete(task)" />
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <div class="task-meta">
              <el-tag v-if="task.contextTag" size="small" type="info">
                {{ task.contextTag }}
              </el-tag>
              <el-tag v-if="task.estimatedTime" size="small">
                {{ task.estimatedTime }}分钟
              </el-tag>
            </div>
          </div>
          <div class="task-actions">
            <el-button size="small" @click="startPomodoro(task)">
              番茄钟
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(task.id!)">
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { ElMessage } from 'element-plus'

const router = useRouter()
const taskStore = useTaskStore()
const selectedContext = ref('')

const tasks = computed(() => taskStore.tasksByStatus[TaskStatus.CONTEXT] || [])

const contexts = computed(() => {
  const ctxSet = new Set<string>()
  tasks.value.forEach(t => {
    if (t.contextTag) ctxSet.add(t.contextTag)
  })
  return Array.from(ctxSet)
})

const filteredTasks = computed(() => {
  if (!selectedContext.value) return tasks.value
  return tasks.value.filter(t => t.contextTag === selectedContext.value)
})

const handleComplete = async (task: Task) => {
  await taskStore.moveTask(task.id!, TaskStatus.DONE)
  ElMessage.success('任务已完成！')
}

const handleDelete = async (id: number) => {
  await taskStore.deleteTask(id)
  ElMessage.success('已删除')
}

const startPomodoro = (task: Task) => {
  router.push({ path: '/pomodoro', query: { taskId: task.id } })
}
</script>

<style scoped>
.context-page {
  max-width: 800px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.context-filter {
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
  margin: 0 0 8px 0;
}

.task-meta {
  display: flex;
  gap: 8px;
}

.task-actions {
  display: flex;
  gap: 8px;
}
</style>
