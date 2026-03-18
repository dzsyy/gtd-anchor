import axios from 'axios'
import type { Task, ProcessTaskDTO, TaskStatus } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 任务 API
export const taskApi = {
  getAll: () => api.get<Task[]>('/tasks'),

  getByStatus: (status: TaskStatus) => api.get<Task[]>(`/tasks/status/${status}`),

  getById: (id: number) => api.get<Task>(`/tasks/${id}`),

  create: (task: Task) => api.post<Task>('/tasks', task),

  update: (id: number, task: Task) => api.put<Task>(`/tasks/${id}`, task),

  delete: (id: number) => api.delete(`/tasks/${id}`),

  move: (id: number, status: TaskStatus) => api.post<Task>(`/tasks/${id}/move?status=${status}`),

  process: (dto: ProcessTaskDTO) => api.post<Task>('/tasks/process', dto),

  getSubTasks: (id: number) => api.get<Task[]>(`/tasks/${id}/subtasks`)
}

export default api
