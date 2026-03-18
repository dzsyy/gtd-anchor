<template>
  <div class="achievement-box">
    <h2>成果收集箱</h2>

    <!-- 添加成果 -->
    <div class="add-form">
      <el-input
        v-model="newContent"
        type="textarea"
        :rows="3"
        placeholder="记录你的成果..."
      />
      <div class="form-actions">
        <el-select v-model="newTag" placeholder="添加标签(可选)" clearable size="small">
          <el-option label="Java学习" value="Java学习" />
          <el-option label="读书" value="读书" />
          <el-option label="项目迭代" value="项目迭代" />
          <el-option label="技能掌握" value="技能掌握" />
        </el-select>
        <el-button type="primary" @click="handleSave">记录成果</el-button>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="filter-bar">
      <el-select v-model="selectedTag" placeholder="筛选标签" clearable @change="handleFilter">
        <el-option label="Java学习" value="Java学习" />
        <el-option label="读书" value="读书" />
        <el-option label="项目迭代" value="项目迭代" />
        <el-option label="技能掌握" value="技能掌握" />
      </el-select>
    </div>

    <!-- 成果列表 -->
    <div class="achievement-list">
      <el-timeline>
        <el-timeline-item
          v-for="item in achievements"
          :key="item.id"
          :timestamp="formatTime(item.createTime)"
          placement="top"
        >
          <el-card shadow="hover">
            <div class="achievement-content">{{ item.content }}</div>
            <div class="card-footer">
              <el-tag v-if="item.tag" size="small" type="success">{{ item.tag }}</el-tag>
              <el-button size="small" type="danger" @click="handleDelete(item.id)">删除</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="!achievements.length" description="暂无成果记录" />
    </div>

    <!-- 温柔提示 -->
    <div class="gentle-tip">
      没关系哦，成果是一点点积累的，每一步都值得被看见
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnchorStore } from '../../stores/anchorStore'
import { ElMessage } from 'element-plus'

const store = useAnchorStore()
const newContent = ref('')
const newTag = ref('')
const selectedTag = ref('')

const achievements = computed(() => store.achievements)

const handleSave = async () => {
  if (!newContent.value.trim()) return

  await store.saveAchievement({
    content: newContent.value.trim(),
    tag: newTag.value || undefined
  })

  newContent.value = ''
  newTag.value = ''
  ElMessage.success('太棒了！你的成果已记录✨')
}

const handleFilter = () => {
  store.fetchAchievements(selectedTag.value || undefined)
}

const handleDelete = async (id: number) => {
  await store.deleteAchievement(id)
  ElMessage.success('已删除')
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric' })
}

onMounted(() => {
  store.fetchAchievements()
})
</script>

<style scoped>
.achievement-box {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.add-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.filter-bar {
  margin-bottom: 20px;
}

.achievement-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.achievement-content {
  margin-bottom: 10px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
