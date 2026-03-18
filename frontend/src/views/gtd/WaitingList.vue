<template>
  <div class="waiting-page">
    <h2>等待清单</h2>
    <p class="subtitle">等待他人完成的任务</p>

    <el-empty v-if="!tasks.length" description="暂无等待中的任务" />

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
            <p v-if="task.waitingFor" class="waiting-for">
              <el-icon><Clock /></el-icon>
              等待: {{ task.waitingFor }}
            </p>
            <div class="task-meta">
              <el-tag v-if="task.dueDate" size="small" type="warning">
                截止: {{ formatDate(task.dueDate) }}
              </el-tag>
            </div>
          </div>
          <div class="task-actions">
            <el-button size="small" type="success" @click="handleReceived(task)">
              已收到
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
import { Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const taskStore = useTaskStore()
const tasks = computed(() => taskStore.tasksByStatus[TaskStatus.WAITING] || [])

const handleReceived = async (task: Task) => {
  await taskStore.moveTask(task.id!, TaskStatus.CONTEXT)
  ElMessage.success('已移至执行清单，继续跟进')
}

const handleDelete = async (id: number) => {
  await taskStore.deleteTask(id)
  ElMessage.success('已删除')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.waiting-page {
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

.waiting-for {
  color: #e6a23c;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 4px;
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
