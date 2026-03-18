import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 灵感 API
export const inspirationApi = {
  getList: (tag?: string) => api.get('/inspiration/list', { params: { tag } }),
  getById: (id: number) => api.get(`/inspiration/${id}`),
  save: (data: any) => api.post('/inspiration/save', data),
  update: (data: any) => api.put('/inspiration/update', data),
  delete: (id: number) => api.delete(`/inspiration/delete/${id}`),
  toAchievement: (id: number) => api.post(`/inspiration/to-achievement/${id}`)
}

// 成果 API
export const achievementApi = {
  getList: (tag?: string) => api.get('/achievement/list', { params: { tag } }),
  getById: (id: number) => api.get(`/achievement/${id}`),
  save: (data: any) => api.post('/achievement/save', data),
  update: (data: any) => api.put('/achievement/update', data),
  delete: (id: number) => api.delete(`/achievement/delete/${id}`),
  getTodayStats: () => api.get('/achievement/stat/today')
}

// 技能颗粒 API
export const skillParticleApi = {
  getList: (skillDomain?: string) => api.get('/skill-particle/list', { params: { skillDomain } }),
  getById: (id: number) => api.get(`/skill-particle/${id}`),
  save: (data: any) => api.post('/skill-particle/save', data),
  update: (data: any) => api.put('/skill-particle/update', data),
  delete: (id: number) => api.delete(`/skill-particle/delete/${id}`),
  master: (id: number) => api.post(`/skill-particle/master/${id}`)
}

// 灵感投喂 API
export const materialApi = {
  getList: () => api.get('/material/list'),
  getById: (id: number) => api.get(`/material/${id}`),
  save: (data: any) => api.post('/material/save', data),
  delete: (id: number) => api.delete(`/material/delete/${id}`)
}

export default api
