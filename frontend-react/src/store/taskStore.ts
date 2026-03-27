import { create } from 'zustand'
import type { Task } from '@/types'
import { taskApi } from '@/api'

interface TaskState {
  tasks: Task[]
  loading: boolean
  fetchAllTasks: () => Promise<void>
  fetchTasksByStatus: (status: string) => Promise<Task[]>
  createTask: (task: Partial<Task>) => Promise<void>
  updateTask: (id: number, task: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  batchUpdateTasks: (tasks: Partial<Task>[]) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  fetchAllTasks: async () => {
    set({ loading: true })
    try {
      const res = await taskApi.getAll()
      set({ tasks: res.data })
    } finally {
      set({ loading: false })
    }
  },

  fetchTasksByStatus: async (status: string) => {
    const res = await taskApi.getByStatus(status)
    return res.data
  },

  createTask: async (task: Partial<Task>) => {
    await taskApi.create(task)
    await get().fetchAllTasks()
  },

  updateTask: async (id: number, task: Partial<Task>) => {
    await taskApi.update(id, task)
    await get().fetchAllTasks()
  },

  deleteTask: async (id: number) => {
    await taskApi.delete(id)
    await get().fetchAllTasks()
  },

  batchUpdateTasks: async (tasks: Partial<Task>[]) => {
    await taskApi.batchUpdate(tasks)
    await get().fetchAllTasks()
  },
}))
