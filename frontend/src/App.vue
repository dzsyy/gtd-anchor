<script setup lang="ts">
import { onMounted } from 'vue'
import { useTaskStore } from './stores/taskStore'
import Sidebar from './components/Sidebar.vue'

const taskStore = useTaskStore()

onMounted(() => {
  taskStore.fetchAllTasks()
})
</script>

<template>
  <el-container class="app-container">
    <el-aside width="220px">
      <Sidebar />
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
}

.el-main {
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
