<template>
  <div class="anchor-home">
    <!-- 应急手册按钮 -->
    <div class="emergency-btn" @click="showEmergency = true">
      <el-icon><FirstAidKit /></el-icon>
    </div>

    <!-- 灵感输入区 -->
    <div class="inspiration-input">
      <el-input
        v-model="newContent"
        type="textarea"
        :rows="6"
        placeholder="写下你的灵感/感受/碎碎念..."
        @keydown.enter.ctrl="handleSave"
      />
      <div class="input-actions">
        <el-select v-model="newTag" placeholder="添加标签(可选)" clearable size="small">
          <el-option label="5分钟小事库" value="5分钟小事库" />
          <el-option label="30分钟兴趣库" value="30分钟兴趣库" />
          <el-option label="长期灵感储备库" value="长期灵感储备库" />
          <el-option label="情绪树洞库" value="情绪树洞库" />
        </el-select>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <!-- 今日统计 -->
    <div class="today-stats">
      <el-card shadow="hover">
        <div class="stat-content">
          <div class="stat-item">
            <span class="stat-number">{{ stats.todayInspirations }}</span>
            <span class="stat-label">今日灵感</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-number">{{ stats.todayAchievements }}</span>
            <span class="stat-label">今日成果</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item highlight">
            <span class="stat-number">{{ stats.todayTotal }}</span>
            <span class="stat-label">微小胜利</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 温柔提示 -->
    <div class="gentle-tip">
      {{ gentleTip }}
    </div>

    <!-- 历史灵感折叠区 -->
    <el-collapse v-model="activeCollapse">
      <el-collapse-item title="历史灵感" name="history">
        <div class="history-list">
          <div v-for="item in inspirations" :key="item.id" class="history-item">
            <div class="history-content">{{ item.content }}</div>
            <div class="history-meta">
              <el-tag v-if="item.tag" size="small">{{ item.tag }}</el-tag>
              <span class="history-time">{{ formatTime(item.createTime) }}</span>
            </div>
          </div>
          <el-empty v-if="!inspirations.length" description="暂无灵感记录" :image-size="60" />
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 应急手册抽屉 -->
    <el-drawer v-model="showEmergency" title="应急手册" size="400px">
      <div class="emergency-content">
        <div v-for="(item, index) in emergencyItems" :key="index" class="emergency-item">
          <h4>{{ item.problem }}</h4>
          <p>{{ item.solution }}</p>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAnchorStore } from '../../stores/anchorStore'
import { FirstAidKit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const store = useAnchorStore()

const newContent = ref('')
const newTag = ref('')
const showEmergency = ref(false)
const activeCollapse = ref([])

const stats = computed(() => store.todayStats)
const inspirations = computed(() => store.inspirations.slice(0, 10))

const gentleTips = [
  "你已经很棒了，哪怕今天什么都没做，也值得被接纳",
  "灵感就像星星，捕捉到了就让它闪闪发光吧",
  "不用担心写得好不好，先记下来再说",
  "每一个想法都值得被温柔以待"
]

const gentleTip = computed(() => gentleTips[Math.floor(Math.random() * gentleTips.length)])

const emergencyItems = [
  { problem: "灾难性设想、未来焦虑", solution: "1.立刻定性：这是我的哨兵在报警，不是真的会发生\n2.用3分钟轻锚点拉回当下\n3.把担心的事写下来" },
  { problem: "做事觉得枯燥、厌倦", solution: "立刻给意识找一个低压力副业：打开听书/播客，把注意力移到听觉内容上" },
  { problem: "没状态、不想动、拖延", solution: "只做一个10秒就能完成的微启动动作，比如打开软件、翻开书、写下第一句话" },
  { problem: "走神、坐不住、脑子乱", solution: "立刻停下，用5分钟清后台，把脑子里的念头全写下来，再用3分钟轻锚点回血" },
  { problem: "完美主义发作", solution: "立刻告诉自己：先完成，再完美，哪怕只完成了最小闭环，也是100分的成功" },
  { problem: "自我攻击、觉得自己一事无成", solution: "立刻打开成果箱，翻3条你之前记录的成果，告诉自己：我不是一事无成" }
]

const handleSave = async () => {
  if (!newContent.value.trim()) return

  await store.saveInspiration({
    content: newContent.value.trim(),
    tag: newTag.value || '长期灵感储备库'
  })

  newContent.value = ''
  newTag.value = ''
  ElMessage.success('灵感已锚定，不会丢啦✨')
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  store.fetchInspirations()
  store.fetchTodayStats()
})
</script>

<style scoped>
.anchor-home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.emergency-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  z-index: 100;
}

.emergency-btn:hover {
  transform: scale(1.1);
}

.inspiration-input {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.today-stats {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #008080;
}

.stat-item.highlight .stat-number {
  color: #67c23a;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #eee;
}

.gentle-tip {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.history-content {
  margin-bottom: 8px;
  color: #333;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-time {
  font-size: 12px;
  color: #999;
}

.emergency-content {
  padding: 10px;
}

.emergency-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.emergency-item h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.emergency-item p {
  margin: 0;
  color: #666;
  white-space: pre-wrap;
  line-height: 1.8;
}
</style>
