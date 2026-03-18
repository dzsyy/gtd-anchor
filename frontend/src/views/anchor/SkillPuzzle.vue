<template>
  <div class="skill-puzzle">
    <h2>技能拼图</h2>

    <!-- 添加技能颗粒 -->
    <div class="add-form">
      <el-input v-model="newSkillDomain" placeholder="技能领域（如：Java基础）" style="width: 200px; margin-right: 10px;" />
      <el-input v-model="newParticleName" placeholder="技能颗粒名称" style="width: 300px; margin-right: 10px;" />
      <el-input v-model="newParticleTip" placeholder="掌握提示（可选）" style="width: 300px; margin-right: 10px;" />
      <el-button type="primary" @click="handleSave">添加</el-button>
    </div>

    <!-- 按领域分组展示 -->
    <div v-for="domain in groupedSkills" :key="domain.name" class="skill-domain">
      <h3>{{ domain.name }}</h3>
      <div class="puzzle-grid">
        <div
          v-for="skill in domain.skills"
          :key="skill.id"
          class="puzzle-piece"
          :class="{ mastered: skill.isMastered }"
          @click="handleSkillClick(skill)"
        >
          <div class="puzzle-name">{{ skill.particleName }}</div>
          <div v-if="skill.isMastered" class="mastered-badge">✓</div>
          <div v-else-if="skill.particleTip" class="tip-badge">?</div>
        </div>
      </div>
    </div>

    <el-empty v-if="!skillParticles.length" description="还没有技能颗粒，快去添加吧" />

    <!-- 技能详情对话框 -->
    <el-dialog v-model="showDetail" :title="selectedSkill?.particleName" width="500px">
      <div v-if="selectedSkill">
        <p><strong>技能领域：</strong>{{ selectedSkill.skillDomain }}</p>
        <p v-if="selectedSkill.particleTip"><strong>掌握提示：</strong></p>
        <div class="tip-content">{{ selectedSkill.particleTip || '暂无提示' }}</div>
        <p v-if="selectedSkill.isMastered"><strong>掌握时间：</strong>{{ formatTime(selectedSkill.masteredTime) }}</p>
      </div>
      <template #footer>
        <el-button v-if="!selectedSkill?.isMastered" type="success" @click="handleMaster">标记已掌握</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </template>
    </el-dialog>

    <!-- 温柔提示 -->
    <div class="gentle-tip">
      没关系哦，拼图是一块一块拼起来的，哪怕只有一块，也是你的成长呀，继续加油✨
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnchorStore } from '../../stores/anchorStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useAnchorStore()

const newSkillDomain = ref('')
const newParticleName = ref('')
const newParticleTip = ref('')
const showDetail = ref(false)
const selectedSkill = ref<any>(null)

const skillParticles = computed(() => store.skillParticles)

const groupedSkills = computed(() => {
  const groups: Record<string, any[]> = {}
  skillParticles.value.forEach(skill => {
    if (!groups[skill.skillDomain]) {
      groups[skill.skillDomain] = []
    }
    groups[skill.skillDomain].push(skill)
  })
  return Object.entries(groups).map(([name, skills]) => ({ name, skills }))
})

const handleSave = async () => {
  if (!newSkillDomain.value.trim() || !newParticleName.value.trim()) return

  await store.saveSkillParticle({
    skillDomain: newSkillDomain.value.trim(),
    particleName: newParticleName.value.trim(),
    particleTip: newParticleTip.value.trim() || null
  })

  newSkillDomain.value = ''
  newParticleName.value = ''
  newParticleTip.value = ''
  ElMessage.success('技能颗粒已添加')
}

const handleSkillClick = (skill: any) => {
  selectedSkill.value = skill
  showDetail.value = true
}

const handleMaster = async () => {
  if (selectedSkill.value) {
    await store.masterSkill(selectedSkill.value.id)
    ElMessage.success('太棒了！又掌握了一个技能颗粒！')
    showDetail.value = false
  }
}

const handleDelete = async () => {
  if (selectedSkill.value) {
    await ElMessageBox.confirm('确定删除这个技能颗粒吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await store.deleteSkillParticle(selectedSkill.value.id)
    ElMessage.success('已删除')
    showDetail.value = false
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
}

onMounted(() => {
  store.fetchSkillParticles()
})
</script>

<style scoped>
.skill-puzzle {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.add-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-domain {
  margin-bottom: 30px;
}

.skill-domain h3 {
  margin-bottom: 15px;
  color: #008080;
}

.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.puzzle-piece {
  aspect-ratio: 1;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  font-size: 14px;
}

.puzzle-piece:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.puzzle-piece.mastered {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: white;
}

.mastered-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
}

.tip-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tip-content {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
  white-space: pre-wrap;
  line-height: 1.8;
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
