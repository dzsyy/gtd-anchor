import axios from 'axios'
import type { Task, Inspiration, Achievement, SkillParticle, Material } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Task APIs
export const taskApi = {
  getAll: () => api.get<Task[]>('/tasks'),
  getByStatus: (status: string) => api.get<Task[]>(`/tasks/status/${status}`),
  create: (task: Partial<Task>) => api.post<Task>('/tasks', task),
  update: (id: number, task: Partial<Task>) => api.put<Task>(`/tasks/${id}`, task),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  process: (data: { id: number; targetStatus: string; nextAction?: boolean; contextId?: number }) =>
    api.post<Task>('/tasks/process', data),
  getSubTasks: (id: number) => api.get<Task[]>(`/tasks/${id}/subtasks`),
  batchUpdate: (tasks: Partial<Task>[]) => api.put<Task[]>('/tasks/batch', tasks),
}

// Inspiration APIs
export const inspirationApi = {
  list: () => api.get<Inspiration[]>('/inspiration/list'),
  save: (inspiration: Partial<Inspiration>) => api.post<Inspiration>('/inspiration/save', inspiration),
  update: (id: number, inspiration: Partial<Inspiration>) =>
    api.put<Inspiration>(`/inspiration/update/${id}`, inspiration),
  delete: (id: number) => api.delete(`/inspiration/delete/${id}`),
  toAchievement: (id: number) => api.post<Achievement>(`/inspiration/to-achievement/${id}`),
}

// Achievement APIs
export const achievementApi = {
  list: () => api.get<Achievement[]>('/achievement/list'),
  save: (achievement: Partial<Achievement>) => api.post<Achievement>('/achievement/save', achievement),
  update: (id: number, achievement: Partial<Achievement>) =>
    api.put<Achievement>(`/achievement/update/${id}`, achievement),
  delete: (id: number) => api.delete(`/achievement/delete/${id}`),
  todayStat: () => api.get<{ count: number }>('/achievement/stat/today'),
}

// Skill Particle APIs
export const skillParticleApi = {
  list: () => api.get<SkillParticle[]>('/skill-particle/list'),
  save: (skill: Partial<SkillParticle>) => api.post<SkillParticle>('/skill-particle/save', skill),
  update: (id: number, skill: Partial<SkillParticle>) =>
    api.put<SkillParticle>(`/skill-particle/update/${id}`, skill),
  delete: (id: number) => api.delete(`/skill-particle/delete/${id}`),
  master: (id: number) => api.post(`/skill-particle/master/${id}`),
}

// Material APIs
export const materialApi = {
  list: () => api.get<Material[]>('/material/list'),
  save: (material: Partial<Material>) => api.post<Material>('/material/save', material),
  delete: (id: number) => api.delete(`/material/delete/${id}`),
}

export default api
