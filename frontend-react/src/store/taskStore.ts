import { create } from 'zustand'
import type { Task } from '@/types'
import { taskApi } from '@/api'

interface TaskState {
  tasksByStatus: Record<string, Task[]>
  loading: boolean
  error: string | null
  fetchTasksByStatus: (status: string) => Promise<Task[]>
  createTask: (task: Partial<Task>) => Promise<void>
  createTasks: (tasks: Partial<Task>[]) => Promise<void>
  updateTask: (id: number, task: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  batchUpdateTasks: (tasks: Partial<Task>[]) => Promise<void>
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasksByStatus: {},
  loading: false,
  error: null,

  fetchTasksByStatus: async (status: string) => {
    set({ loading: true, error: null })
    try {
      const res = await taskApi.getByStatus(status)
      set(state => ({
        tasksByStatus: {
          ...state.tasksByStatus,
          [status]: res.data
        },
        loading: false
      }))
      return res.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks'
      set({ loading: false, error: message })
      throw err
    }
  },

  createTask: async (task: Partial<Task>) => {
    set({ loading: true, error: null })
    try {
      await taskApi.create(task)
      const status = task.status || 'INBOX'
      // Optimistically update cache
      set(state => ({
        tasksByStatus: {
          ...state.tasksByStatus,
          [status]: [...(state.tasksByStatus[status] || []), task as Task]
        },
        loading: false
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      set({ loading: false, error: message })
      throw err
    }
  },

  createTasks: async (tasks: Partial<Task>[]) => {
    set({ loading: true, error: null })
    try {
      await taskApi.batchCreate(tasks)
      // Refresh all affected statuses
      const statuses = [...new Set(tasks.map(t => t.status || 'INBOX'))]
      for (const status of statuses) {
        const res = await taskApi.getByStatus(status)
        set(state => ({
          tasksByStatus: {
            ...state.tasksByStatus,
            [status]: res.data
          }
        }))
      }
      set({ loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tasks'
      set({ loading: false, error: message })
      throw err
    }
  },

  updateTask: async (id: number, task: Partial<Task>) => {
    set({ loading: true, error: null })
    try {
      await taskApi.update(id, task)
      // Update cache in place without full refetch
      set(state => {
        const newTasksByStatus = { ...state.tasksByStatus }
        for (const status of Object.keys(newTasksByStatus)) {
          newTasksByStatus[status] = newTasksByStatus[status].map(t =>
            t.id === id ? { ...t, ...task } : t
          )
        }
        return { tasksByStatus: newTasksByStatus, loading: false }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      set({ loading: false, error: message })
      throw err
    }
  },

  deleteTask: async (id: number) => {
    set({ loading: true, error: null })
    try {
      await taskApi.delete(id)
      // Remove from cache
      set(state => {
        const newTasksByStatus = { ...state.tasksByStatus }
        for (const status of Object.keys(newTasksByStatus)) {
          newTasksByStatus[status] = newTasksByStatus[status].filter(t => t.id !== id)
        }
        return { tasksByStatus: newTasksByStatus, loading: false }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      set({ loading: false, error: message })
      throw err
    }
  },

  batchUpdateTasks: async (tasks: Partial<Task>[]) => {
    set({ loading: true, error: null })
    try {
      await taskApi.batchUpdate(tasks)
      // Partial refetch for affected statuses
      const statuses = [...new Set(tasks.map(t => t.status).filter(Boolean))] as string[]
      for (const status of statuses) {
        const res = await taskApi.getByStatus(status)
        set(state => ({
          tasksByStatus: {
            ...state.tasksByStatus,
            [status]: res.data
          }
        }))
      }
      set({ loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to batch update'
      set({ loading: false, error: message })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))