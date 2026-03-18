<template>
  <el-menu
    :default-active="currentPath"
    class="sidebar-menu"
    :router="false"
    @select="handleSelect"
  >
    <div class="logo">
      <h2>锚点</h2>
      <span class="subtitle">高敏感+ADHD+INFP 专属</span>
    </div>

    <!-- 锚点模块 -->
    <div class="menu-group">
      <div class="menu-group-title">成长陪伴</div>
      <el-menu-item index="/anchor">
        <el-icon><EditPen /></el-icon>
        <span>灵感捕捉</span>
      </el-menu-item>
      <el-menu-item index="/inspirations">
        <el-icon><MessageBox /></el-icon>
        <span>灵感信箱</span>
      </el-menu-item>
      <el-menu-item index="/achievements">
        <el-icon><Collection /></el-icon>
        <span>成果收集箱</span>
      </el-menu-item>
      <el-menu-item index="/skills">
        <el-icon><PieChart /></el-icon>
        <span>技能拼图</span>
      </el-menu-item>
      <el-menu-item index="/emotion">
        <el-icon><ChatDotRound /></el-icon>
        <span>情绪树洞</span>
      </el-menu-item>
      <el-menu-item index="/materials">
        <el-icon><FolderOpened /></el-icon>
        <span>投喂库</span>
      </el-menu-item>
      <el-menu-item index="/bedtime">
        <el-icon><Sunny /></el-icon>
        <span>睡前小台灯</span>
      </el-menu-item>
    </div>

    <el-divider />

    <!-- GTD模块 -->
    <div class="menu-group">
      <div class="menu-group-title">时间管理</div>
      <el-menu-item index="/gtd/inbox">
        <el-icon><Box /></el-icon>
        <span>收集箱</span>
      </el-menu-item>
      <el-menu-item index="/gtd/projects">
        <el-icon><Folder /></el-icon>
        <span>项目清单</span>
      </el-menu-item>
      <el-menu-item index="/gtd/waiting">
        <el-icon><Clock /></el-icon>
        <span>等待清单</span>
      </el-menu-item>
      <el-menu-item index="/gtd/context">
        <el-icon><Check /></el-icon>
        <span>执行清单</span>
      </el-menu-item>
      <el-menu-item index="/gtd/someday">
        <el-icon><Star /></el-icon>
        <span>可能清单</span>
      </el-menu-item>
      <el-menu-item index="/gtd/quadrants">
        <el-icon><Grid /></el-icon>
        <span>四象限</span>
      </el-menu-item>
      <el-menu-item index="/gtd/pomodoro">
        <el-icon><Timer /></el-icon>
        <span>番茄钟</span>
      </el-menu-item>
    </div>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditPen, MessageBox, Collection, PieChart, ChatDotRound, FolderOpened, Sunny, Box, Folder, Clock, Check, Star, Grid, Timer } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const currentPath = computed(() => route.path)

const emit = defineEmits(['select'])

const handleSelect = (index: string) => {
  emit('select', index)
  router.push(index)
}
</script>

<style scoped>
.sidebar-menu {
  height: 100vh;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.logo h2 {
  margin: 0;
  color: #008080;
}

.logo .subtitle {
  font-size: 12px;
  color: #999;
}

.menu-group {
  padding: 10px 0;
}

.menu-group-title {
  padding: 8px 20px;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}

.el-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
}

.el-divider {
  margin: 5px 0;
}
</style>
