import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskApi } from '../api'
import type { Task, TaskStatus, ProcessTaskDTO } from '../types'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)

  // 按状态分组
  const tasksByStatus = computed(() => {
    const grouped: Record<string, Task[]> = {
      INBOX: [],
      PROJECT: [],
      WAITING: [],
      CONTEXT: [],
      SOMEDAY: [],
      TRASH: [],
      DONE: []
    }
    tasks.value.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })
    return grouped
  })

  // 获取所有任务
  const fetchAllTasks = async () => {
    loading.value = true
    try {
      const res = await taskApi.getAll()
      tasks.value = res.data
    } finally {
      loading.value = false
    }
  }

  // 按状态获取任务
  const fetchTasksByStatus = async (status: TaskStatus) => {
    loading.value = true
    try {
      const res = await taskApi.getByStatus(status)
      return res.data
    } finally {
      loading.value = false
    }
  }

  // 创建任务
  const createTask = async (task: Task) => {
    const res = await taskApi.create(task)
    tasks.value.push(res.data)
    return res.data
  }

  // 更新任务
  const updateTask = async (id: number, task: Task) => {
    const res = await taskApi.update(id, task)
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = res.data
    }
    return res.data
  }

  // 删除任务
  const deleteTask = async (id: number) => {
    await taskApi.delete(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  // 移动任务
  const moveTask = async (id: number, status: TaskStatus) => {
    const res = await taskApi.move(id, status)
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = res.data
    }
    return res.data
  }

  // GTD 决策流程
  const processTask = async (dto: ProcessTaskDTO) => {
    const res = await taskApi.process(dto)
    const index = tasks.value.findIndex(t => t.id === dto.taskId)
    if (index !== -1) {
      tasks.value[index] = res.data
    }
    return res.data
  }

  return {
    tasks,
    currentTask,
    loading,
    tasksByStatus,
    fetchAllTasks,
    fetchTasksByStatus,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    processTask
  }
})
