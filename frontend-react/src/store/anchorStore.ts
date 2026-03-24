import { create } from 'zustand'
import type { Inspiration, Achievement, SkillParticle, Material } from '@/types'
import { inspirationApi, achievementApi, skillParticleApi, materialApi } from '@/api'

interface AnchorState {
  inspirations: Inspiration[]
  achievements: Achievement[]
  skills: SkillParticle[]
  materials: Material[]
  todayAchievementCount: number
  loading: boolean
  fetchInspirations: () => Promise<void>
  fetchAchievements: () => Promise<void>
  fetchSkills: () => Promise<void>
  fetchMaterials: () => Promise<void>
  fetchTodayStat: () => Promise<void>
  createInspiration: (inspiration: Partial<Inspiration>) => Promise<void>
  createAchievement: (achievement: Partial<Achievement>) => Promise<void>
  createSkill: (skill: Partial<SkillParticle>) => Promise<void>
  createMaterial: (material: Partial<Material>) => Promise<void>
  deleteInspiration: (id: number) => Promise<void>
  deleteAchievement: (id: number) => Promise<void>
  deleteSkill: (id: number) => Promise<void>
  deleteMaterial: (id: number) => Promise<void>
  masterSkill: (id: number) => Promise<void>
}

export const useAnchorStore = create<AnchorState>((set, get) => ({
  inspirations: [],
  achievements: [],
  skills: [],
  materials: [],
  todayAchievementCount: 0,
  loading: false,

  fetchInspirations: async () => {
    const res = await inspirationApi.list()
    set({ inspirations: res.data })
  },

  fetchAchievements: async () => {
    const res = await achievementApi.list()
    set({ achievements: res.data })
  },

  fetchSkills: async () => {
    const res = await skillParticleApi.list()
    set({ skills: res.data })
  },

  fetchMaterials: async () => {
    const res = await materialApi.list()
    set({ materials: res.data })
  },

  fetchTodayStat: async () => {
    const res = await achievementApi.todayStat()
    set({ todayAchievementCount: res.data.count })
  },

  createInspiration: async (inspiration) => {
    await inspirationApi.save(inspiration)
    await get().fetchInspirations()
  },

  createAchievement: async (achievement) => {
    await achievementApi.save(achievement)
    await get().fetchAchievements()
    await get().fetchTodayStat()
  },

  createSkill: async (skill) => {
    await skillParticleApi.save(skill)
    await get().fetchSkills()
  },

  createMaterial: async (material) => {
    await materialApi.save(material)
    await get().fetchMaterials()
  },

  deleteInspiration: async (id) => {
    await inspirationApi.delete(id)
    await get().fetchInspirations()
  },

  deleteAchievement: async (id) => {
    await achievementApi.delete(id)
    await get().fetchAchievements()
    await get().fetchTodayStat()
  },

  deleteSkill: async (id) => {
    await skillParticleApi.delete(id)
    await get().fetchSkills()
  },

  deleteMaterial: async (id) => {
    await materialApi.delete(id)
    await get().fetchMaterials()
  },

  masterSkill: async (id) => {
    await skillParticleApi.master(id)
    await get().fetchSkills()
  },
}))
