<template>
  <div class="emotion-cave">
    <h2>情绪树洞</h2>

    <!-- 情绪输入 -->
    <div class="emotion-input">
      <el-input
        v-model="newContent"
        type="textarea"
        :rows="6"
        placeholder="随便说点什么吧，不用评判对错，我会好好接住你的✨"
      />
      <div class="input-actions">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <!-- 温柔提示 -->
    <div class="gentle-tip">
      {{ gentleTip }}
    </div>

    <!-- 历史碎碎念 -->
    <el-collapse v-model="activeCollapse">
      <el-collapse-item title="历史碎碎念" name="history">
        <div class="history-list">
          <div v-for="item in emotions" :key="item.id" class="history-item">
            <div class="history-content">{{ item.content }}</div>
            <div class="history-meta">
              <span class="history-time">{{ formatTime(item.createTime) }}</span>
              <el-button size="small" type="danger" @click="handleDelete(item.id)">删除</el-button>
            </div>
          </div>
          <el-empty v-if="!emotions.length" description="还没有碎碎念" :image-size="60" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnchorStore } from '../../stores/anchorStore'
import { ElMessage } from 'element-plus'

const store = useAnchorStore()

const newContent = ref('')
const activeCollapse = ref([])

const emotions = computed(() =>
  store.inspirations.filter(i => i.tag === '情绪树洞库')
)

const gentleTips = [
  "你已经很棒了，哪怕今天什么都没做，也值得被接纳",
  "情绪没有对错，它们只是想被看见",
  "在这里，你不需要成为任何人，只需要成为自己",
  "哪怕全世界都不理解你，我也会在这里等你",
  "你的感受是真实的，不需要向任何人解释"
]

const gentleTip = computed(() => gentleTips[Math.floor(Math.random() * gentleTips.length)])

const handleSave = async () => {
  if (!newContent.value.trim()) return

  await store.saveInspiration({
    content: newContent.value.trim(),
    tag: '情绪树洞库'
  })

  newContent.value = ''
  ElMessage.success('我已经好好接住你的情绪啦✨')
}

const handleDelete = async (id: number) => {
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
.emotion-cave {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.emotion-input {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.gentle-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%);
  border-radius: 12px;
  line-height: 1.8;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.history-content {
  margin-bottom: 12px;
  white-space: pre-wrap;
  line-height: 1.8;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-time {
  font-size: 12px;
  color: #999;
}
</style>
