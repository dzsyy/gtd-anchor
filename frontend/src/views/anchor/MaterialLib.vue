<template>
  <div class="material-lib">
    <h2>灵感投喂库</h2>

    <!-- 添加素材 -->
    <div class="add-form">
      <el-input v-model="newTitle" placeholder="素材标题" style="width: 200px; margin-right: 10px;" />
      <el-input v-model="newUrl" placeholder="素材链接（可选）" style="width: 300px; margin-right: 10px;" />
      <el-button type="primary" @click="handleSave">添加素材</el-button>
    </div>

    <!-- 素材列表 -->
    <div class="material-list">
      <el-card v-for="item in materials" :key="item.id" class="material-card" shadow="hover">
        <div class="material-title">{{ item.title || '无标题' }}</div>
        <div v-if="item.url" class="material-url">
          <a :href="item.url" target="_blank">{{ item.url }}</a>
        </div>
        <div class="card-footer">
          <span class="time">{{ formatTime(item.createTime) }}</span>
          <el-button size="small" type="danger" @click="handleDelete(item.id)">删除</el-button>
        </div>
      </el-card>
      <el-empty v-if="!materials.length" description="投喂库是空的，去找点有趣的内容吧" />
    </div>

    <!-- 温柔提示 -->
    <div class="gentle-tip">
      没关系哦，灵感有时候需要睡一觉才会冒出来，先去做个5分钟的微动作，或者去情绪树洞说说话吧
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnchorStore } from '../../stores/anchorStore'
import { ElMessage } from 'element-plus'

const store = useAnchorStore()

const newTitle = ref('')
const newUrl = ref('')

const materials = computed(() => store.materials)

const handleSave = async () => {
  if (!newTitle.value.trim() && !newUrl.value.trim()) return

  await store.saveMaterial({
    title: newTitle.value.trim() || null,
    url: newUrl.value.trim() || null
  })

  newTitle.value = ''
  newUrl.value = ''
  ElMessage.success('素材已添加')
}

const handleDelete = async (id: number) => {
  await store.deleteMaterial(id)
  ElMessage.success('已删除')
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric' })
}

onMounted(() => {
  store.fetchMaterials()
})
</script>

<style scoped>
.material-lib {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.add-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.material-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.material-card {
  margin-bottom: 0;
}

.material-title {
  font-weight: 500;
  margin-bottom: 8px;
}

.material-url {
  margin-bottom: 10px;
}

.material-url a {
  color: #409eff;
  font-size: 12px;
  text-decoration: none;
}

.material-url a:hover {
  text-decoration: underline;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  font-size: 12px;
  color: #999;
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
