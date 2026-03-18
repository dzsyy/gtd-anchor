<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from './stores/taskStore'
import Sidebar from './components/Sidebar.vue'

const taskStore = useTaskStore()
const isMobile = ref(window.innerWidth < 768)
const drawerVisible = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const handleMenuSelect = () => {
  // 移动端选择菜单后关闭抽屉
  if (isMobile.value) {
    drawerVisible.value = false
  }
}

onMounted(() => {
  taskStore.fetchAllTasks()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <el-container class="app-container">
    <!-- 移动端顶部导航栏 -->
    <el-header v-if="isMobile" class="mobile-header">
      <div class="header-left">
        <el-button :icon="Menu" circle @click="drawerVisible = true" />
        <span class="header-title">锚点</span>
      </div>
    </el-header>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-if="isMobile"
      v-model="drawerVisible"
      direction="ltr"
      size="80%"
      :show-close="true"
    >
      <Sidebar @select="handleMenuSelect" />
    </el-drawer>

    <!-- 桌面端侧边栏 -->
    <el-aside v-else width="220px">
      <Sidebar />
    </el-aside>

    <el-main :class="{ 'mobile-main': isMobile }">
      <router-view />
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { Menu } from '@element-plus/icons-vue'
export default {
  setup() {
    return { Menu }
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #008080;
}

.el-main {
  padding: 20px;
  background-color: #f5f5f5;
}

.mobile-main {
  padding: 16px;
}

/* 抽屉内边距 */
:deep(.el-drawer__body) {
  padding: 0;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px;
}
</style>
