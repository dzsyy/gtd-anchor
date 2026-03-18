<template>
  <div class="inspiration-box">
    <h2>灵感信箱</h2>

    <!-- 标签筛选 -->
    <div class="filter-bar">
      <el-select v-model="selectedTag" placeholder="筛选标签" clearable @change="handleFilter">
        <el-option label="5分钟小事库" value="5分钟小事库" />
        <el-option label="30分钟兴趣库" value="30分钟兴趣库" />
        <el-option label="长期灵感储备库" value="长期灵感储备库" />
        <el-option label="情绪树洞库" value="情绪树洞库" />
      </el-select>
    </div>

    <!-- 灵感列表 -->
    <div class="inspiration-list">
      <el-card v-for="item in inspirations" :key="item.id" class="inspiration-card" shadow="hover">
        <div class="card-content">{{ item.content }}</div>
        <div class="card-footer">
          <el-tag v-if="item.tag" size="small">{{ item.tag }}</el-tag>
          <span class="time">{{ formatTime(item.createTime) }}</span>
          <div class="actions">
            <el-button size="small" type="success" @click="handleToAchievement(item.id)">转成果</el-button>
            <el-button size="small" type="danger" @click="handleDelete(item.id)">删除</el-button>
          </div>
        </div>
      </el-card>
      <el-empty v-if="!inspirations.length" description="暂无灵感" />
    </div>

    <!-- 温柔提示 -->
    <div class="gentle-tip">
      {{ gentleTip }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnchorStore } from '../../stores/anchorStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useAnchorStore()
const selectedTag = ref('')

const inspirations = computed(() => store.inspirations)

const gentleTips = [
  "没关系哦，灵感有时候需要睡一觉才会冒出来",
  "先去个5分钟的微动作，或者去情绪树洞说说话吧",
  "翻着翻着灵感就来了，不着急"
]
const gentleTip = computed(() => gentleTips[Math.floor(Math.random() * gentleTips.length)])

const handleFilter = () => {
  store.fetchInspirations(selectedTag.value || undefined)
}

const handleToAchievement = async (id: number) => {
  await ElMessageBox.confirm('是否将这条灵感转为成果？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  await store.inspirationToAchievement(id)
  ElMessage.success('已转为成果，快去成果箱看看吧')
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定删除这条灵感吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await store.deleteInspiration(id)
  ElMessage.success('已删除')
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  store.fetchInspirations()
})
</script>

<style scoped>
.inspiration-box {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.filter-bar {
  margin-bottom: 20px;
}

.inspiration-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspiration-card {
  margin-bottom: 0;
}

.card-content {
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  flex: 1;
  color: #999;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

.gentle-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 30px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>
