<template>
  <div class="quick-add">
    <el-input
      v-model="newTaskTitle"
      placeholder="添加新任务... (回车添加)"
      @keyup.enter="handleAddTask"
      size="large"
    >
      <template #append>
        <el-button :icon="Plus" @click="handleAddTask" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { TaskStatus } from '../types'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const taskStore = useTaskStore()
const newTaskTitle = ref('')

const handleAddTask = async () => {
  if (!newTaskTitle.value.trim()) return

  await taskStore.createTask({
    title: newTaskTitle.value.trim(),
    status: TaskStatus.INBOX
  })

  newTaskTitle.value = ''
  ElMessage.success('任务已添加到收集箱')
}
</script>

<style scoped>
.quick-add {
  margin-bottom: 20px;
}
</style>
