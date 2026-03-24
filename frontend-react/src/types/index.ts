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
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const

export type Priority = typeof Priority[keyof typeof Priority]

// 碎碎锚节点层级
export const NodeLevel = {
  ROOT: 0,       // 根节点（项目）
  MILESTONE: 1,  // 一级里程碑
  MODULE: 2,     // 二级模块
  POWDER: 3      // 粉末叶子节点
} as const

export type NodeLevel = typeof NodeLevel[keyof typeof NodeLevel]

export interface Task {
  id?: number
  title: string
  description?: string | null
  status: string
  priority?: string | null
  contextTag?: string | null
  estimatedTime?: number | null
  dueDate?: string | null
  parentId?: number | null
  waitingFor?: string | null
  isProject?: boolean | null
  // 碎碎锚扩展字段
  nodeLevel?: NodeLevel | null    // 节点层级 0-3
  isCompleted?: boolean | null      // 是否完成（仅粉末节点可标记）
  completedTime?: string | null     // 完成时间
  createdAt?: string
  updatedAt?: string
}

export const InspirationTag = {
  FIVE_MIN: '5分钟小事库',
  THIRTY_MIN: '30分钟兴趣库',
  LONG_TERM: '长期灵感储备库',
  EMOTION: '情绪树洞库'
} as const

export type InspirationTag = typeof InspirationTag[keyof typeof InspirationTag]

export interface Inspiration {
  id?: number
  content: string
  tag: string
  isArchived?: boolean
  createTime?: string
}

export interface Achievement {
  id?: number
  content: string
  tag: string
  inspirationId?: number
  createTime?: string
}

export interface SkillParticle {
  id?: number
  skillDomain: string
  particleName: string
  particleTip?: string
  isMastered?: boolean
  masteredTime?: string
  createTime?: string
}

export interface Material {
  id?: number
  title: string
  url?: string
  content?: string
  createTime?: string
}
