<template>
  <div class="quadrants-page">
    <h2>四象限法则</h2>
    <p class="subtitle">艾森豪威尔法则 - 重要性和紧急性矩阵</p>

    <div class="quadrants-grid">
      <!-- Q1: 重要且紧急 -->
      <div class="quadrant q1">
        <div class="quadrant-header">
          <h3>Q1 重要且紧急</h3>
          <span class="action">立即执行</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in getTasksByPriority('Q1')"
            :key="task.id"
            class="task-item"
          >
            <el-checkbox @change="handleComplete(task)" />
            <span>{{ task.title }}</span>
          </div>
          <el-empty v-if="!getTasksByPriority('Q1').length" :image-size="60" />
        </div>
      </div>

      <!-- Q2: 重要不紧急 -->
      <div class="quadrant q2">
        <div class="quadrant-header">
          <h3>Q2 重要不紧急</h3>
          <span class="action">计划执行</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in getTasksByPriority('Q2')"
            :key="task.id"
            class="task-item"
          >
            <el-checkbox @change="handleComplete(task)" />
            <span>{{ task.title }}</span>
          </div>
          <el-empty v-if="!getTasksByPriority('Q2').length" :image-size="60" />
        </div>
      </div>

      <!-- Q3: 紧急不重要 -->
      <div class="quadrant q3">
        <div class="quadrant-header">
          <h3>Q3 紧急不重要</h3>
          <span class="action">授权他人</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in getTasksByPriority('Q3')"
            :key="task.id"
            class="task-item"
          >
            <el-checkbox @change="handleComplete(task)" />
            <span>{{ task.title }}</span>
          </div>
          <el-empty v-if="!getTasksByPriority('Q3').length" :image-size="60" />
        </div>
      </div>

      <!-- Q4: 不重要不紧急 -->
      <div class="quadrant q4">
        <div class="quadrant-header">
          <h3>Q4 不重要不紧急</h3>
          <span class="action">尽量不做</span>
        </div>
        <div class="task-list">
          <div
            v-for="task in getTasksByPriority('Q4')"
            :key="task.id"
            class="task-item"
          >
            <el-checkbox @change="handleComplete(task)" />
            <span>{{ task.title }}</span>
          </div>
          <el-empty v-if="!getTasksByPriority('Q4').length" :image-size="60" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { ElMessage } from 'element-plus'

const taskStore = useTaskStore()

// 获取有优先级的任务
const prioritizedTasks = computed(() => {
  return taskStore.tasks.filter(t =>
    t.priority && t.status !== TaskStatus.DONE && t.status !== TaskStatus.TRASH
  )
})

const getTasksByPriority = (priority: string) => {
  return prioritizedTasks.value.filter(t => t.priority === priority)
}

const handleComplete = async (task: Task) => {
  await taskStore.moveTask(task.id!, TaskStatus.DONE)
  ElMessage.success('任务已完成！')
}
</script>

<style scoped>
.quadrants-page {
  height: 100%;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.quadrants-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: calc(100vh - 180px);
}

.quadrant {
  border-radius: 8px;
  padding: 16px;
  overflow: auto;
}

.quadrant.q1 {
  background: #fef0f0;
  border: 2px solid #f56c6c;
}

.quadrant.q2 {
  background: #f0f9eb;
  border: 2px solid #67c23a;
}

.quadrant.q3 {
  background: #fdf6ec;
  border: 2px solid #e6a23c;
}

.quadrant.q4 {
  background: #f4f4f5;
  border: 2px solid #909399;
}

.quadrant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.quadrant-header h3 {
  margin: 0;
}

.q1 .action { color: #f56c6c; }
.q2 .action { color: #67c23a; }
.q3 .action { color: #e6a23c; }
.q4 .action { color: #909399; }

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
}
</style>
