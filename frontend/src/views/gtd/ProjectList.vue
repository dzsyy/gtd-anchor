<template>
  <div class="project-page">
    <h2>项目清单</h2>
    <p class="subtitle">需要多个步骤才能完成的任务</p>

    <el-empty v-if="!projects.length" description="暂无项目" />

    <div v-else class="project-list">
      <el-card
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        shadow="hover"
      >
        <div class="project-header">
          <el-checkbox
            :model-value="project.status === TaskStatus.DONE"
            @change="handleComplete(project)"
          />
          <h3 :class="{ completed: project.status === TaskStatus.DONE }">
            {{ project.title }}
          </h3>
          <el-dropdown @command="handleCommand($event, project)">
            <el-button size="small">
              <el-icon><More /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="move">移动到...</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <p v-if="project.description" class="project-desc">{{ project.description }}</p>
        <div class="project-meta">
          <el-tag v-if="project.priority" :type="getPriorityType(project.priority)" size="small">
            {{ getPriorityLabel(project.priority) }}
          </el-tag>
          <el-tag v-if="project.dueDate" size="small" type="warning">
            截止: {{ formatDate(project.dueDate) }}
          </el-tag>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore'
import { TaskStatus, type Task } from '../../types'
import { More } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const taskStore = useTaskStore()
const projects = computed(() => taskStore.tasksByStatus[TaskStatus.PROJECT] || [])

const handleComplete = async (project: Task) => {
  await taskStore.moveTask(project.id!, TaskStatus.DONE)
  ElMessage.success('项目已完成！')
}

const handleCommand = async (command: string, project: Task) => {
  switch (command) {
    case 'delete':
      await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await taskStore.deleteTask(project.id!)
      ElMessage.success('已删除')
      break
    case 'move':
      // TODO: 显示移动菜单
      break
  }
}

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    Q1: 'danger',
    Q2: 'warning',
    Q3: 'info',
    Q4: ''
  }
  return types[priority] || ''
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    Q1: '重要紧急',
    Q2: '重要不紧急',
    Q3: '紧急不重要',
    Q4: '不重要不紧急'
  }
  return labels[priority] || priority
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.project-page {
  max-width: 800px;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-card {
  margin-bottom: 0;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-header h3 {
  flex: 1;
  margin: 0;
}

.project-header h3.completed {
  text-decoration: line-through;
  color: #999;
}

.project-desc {
  color: #666;
  margin: 12px 0;
}

.project-meta {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
