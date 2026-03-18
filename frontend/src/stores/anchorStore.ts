import { defineStore } from 'pinia'
import { ref } from 'vue'
import { inspirationApi, achievementApi, skillParticleApi, materialApi } from '../api/anchor'

export const useAnchorStore = defineStore('anchor', () => {
  const inspirations = ref<any[]>([])
  const achievements = ref<any[]>([])
  const skillParticles = ref<any[]>([])
  const materials = ref<any[]>([])
  const todayStats = ref({ todayInspirations: 0, todayAchievements: 0, todayTotal: 0 })
  const loading = ref(false)

  // 获取灵感列表
  const fetchInspirations = async (tag?: string) => {
    loading.value = true
    try {
      const res = await inspirationApi.getList(tag)
      inspirations.value = res.data
    } finally {
      loading.value = false
    }
  }

  // 保存灵感
  const saveInspiration = async (data: any) => {
    const res = await inspirationApi.save(data)
    inspirations.value.unshift(res.data)
    await fetchTodayStats()
    return res.data
  }

  // 删除灵感
  const deleteInspiration = async (id: number) => {
    await inspirationApi.delete(id)
    inspirations.value = inspirations.value.filter(i => i.id !== id)
  }

  // 灵感转成果
  const inspirationToAchievement = async (id: number) => {
    await inspirationApi.toAchievement(id)
    inspirations.value = inspirations.value.filter(i => i.id !== id)
  }

  // 获取成果列表
  const fetchAchievements = async (tag?: string) => {
    loading.value = true
    try {
      const res = await achievementApi.getList(tag)
      achievements.value = res.data
    } finally {
      loading.value = false
    }
  }

  // 保存成果
  const saveAchievement = async (data: any) => {
    const res = await achievementApi.save(data)
    achievements.value.unshift(res.data)
    await fetchTodayStats()
    return res.data
  }

  // 删除成果
  const deleteAchievement = async (id: number) => {
    await achievementApi.delete(id)
    achievements.value = achievements.value.filter(a => a.id !== id)
  }

  // 获取技能颗粒
  const fetchSkillParticles = async (skillDomain?: string) => {
    loading.value = true
    try {
      const res = await skillParticleApi.getList(skillDomain)
      skillParticles.value = res.data
    } finally {
      loading.value = false
    }
  }

  // 保存技能颗粒
  const saveSkillParticle = async (data: any) => {
    const res = await skillParticleApi.save(data)
    skillParticles.value.unshift(res.data)
    return res.data
  }

  // 标记掌握
  const masterSkill = async (id: number) => {
    const res = await skillParticleApi.master(id)
    const index = skillParticles.value.findIndex(s => s.id === id)
    if (index !== -1) {
      skillParticles.value[index] = res.data
    }
    return res.data
  }

  // 删除技能颗粒
  const deleteSkillParticle = async (id: number) => {
    await skillParticleApi.delete(id)
    skillParticles.value = skillParticles.value.filter(s => s.id !== id)
  }

  // 获取投喂库
  const fetchMaterials = async () => {
    loading.value = true
    try {
      const res = await materialApi.getList()
      materials.value = res.data
    } finally {
      loading.value = false
    }
  }

  // 保存素材
  const saveMaterial = async (data: any) => {
    const res = await materialApi.save(data)
    materials.value.unshift(res.data)
    return res.data
  }

  // 删除素材
  const deleteMaterial = async (id: number) => {
    await materialApi.delete(id)
    materials.value = materials.value.filter(m => m.id !== id)
  }

  // 获取今日统计
  const fetchTodayStats = async () => {
    try {
      const res = await achievementApi.getTodayStats()
      todayStats.value = res.data
    } catch (e) {
      console.error(e)
    }
  }

  return {
    inspirations,
    achievements,
    skillParticles,
    materials,
    todayStats,
    loading,
    fetchInspirations,
    saveInspiration,
    deleteInspiration,
    inspirationToAchievement,
    fetchAchievements,
    saveAchievement,
    deleteAchievement,
    fetchSkillParticles,
    saveSkillParticle,
    masterSkill,
    deleteSkillParticle,
    fetchMaterials,
    saveMaterial,
    deleteMaterial,
    fetchTodayStats
  }
})
