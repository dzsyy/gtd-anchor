export const TaskStatus = {
  INBOX: 'INBOX',
  PROJECT: 'PROJECT',
  WAITING: 'WAITING',
  CONTEXT: 'CONTEXT',
  SOMEDAY: 'SOMEDAY',
  TRASH: 'TRASH',
  DONE: 'DONE'
} as const
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]

export const Priority = {
  Q1: 'Q1',
  Q2: 'Q2',
  Q3: 'Q3',
  Q4: 'Q4'
} as const
export type Priority = typeof Priority[keyof typeof Priority]

export interface Task {
  id?: number
  title: string
  description?: string
  status: TaskStatus
  priority?: Priority
  contextTag?: string
  estimatedTime?: number
  dueDate?: string
  parentId?: number
  waitingFor?: string
  isProject?: boolean
  completed?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ProcessTaskDTO {
  taskId: number
  actionable?: boolean
  twoMinutes?: boolean
  isProject?: boolean
  hasSpecificTime?: boolean
  isMyTask?: boolean
  waitingFor?: string
  contextTag?: string
  referenceContent?: string
  dueDate?: string
}
