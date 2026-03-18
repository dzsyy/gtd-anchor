<template>
  <div class="someday-page">
    <h2>可能清单</h2>
    <p class="subtitle">未来可能做的事情</p>

    <el-empty v-if="!tasks.length" description="可能清单是空的" />

    <div v-else class="task-list">
      <el-card
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        shadow="hover"
      >
        <div class="task-content">
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ task.description }}</p>
          </div>
          <div class="task-actions">
            <el-button size="small" type="primary" @click="handleActivate(task)">
              激活
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
import { computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { ElMessage } from 'element-plus'

const taskStore = useTaskStore()
const tasks = computed(() => taskStore.tasksByStatus[TaskStatus.SOMEDAY] || [])

const handleActivate = async (task: Task) => {
  await taskStore.moveTask(task.id!, TaskStatus.INBOX)
  ElMessage.success('已移至收集箱，可以开始处理')
}

const handleDelete = async (id: number) => {
  await taskStore.deleteTask(id)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.someday-page {
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
  margin: 0 0 8px 0;
}

.task-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.task-actions {
  display: flex;
  gap: 8px;
}
</style>
