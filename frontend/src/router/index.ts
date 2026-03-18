import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 锚点首页
    {
      path: '/',
      redirect: '/anchor'
    },
    // 锚点模块
    {
      path: '/anchor',
      name: 'AnchorHome',
      component: () => import('../views/anchor/Home.vue')
    },
    {
      path: '/inspirations',
      name: 'InspirationBox',
      component: () => import('../views/anchor/InspirationBox.vue')
    },
    {
      path: '/achievements',
      name: 'AchievementBox',
      component: () => import('../views/anchor/AchievementBox.vue')
    },
    {
      path: '/skills',
      name: 'SkillPuzzle',
      component: () => import('../views/anchor/SkillPuzzle.vue')
    },
    {
      path: '/emotion',
      name: 'EmotionCave',
      component: () => import('../views/anchor/EmotionCave.vue')
    },
    {
      path: '/materials',
      name: 'MaterialLib',
      component: () => import('../views/anchor/MaterialLib.vue')
    },
    {
      path: '/bedtime',
      name: 'BedtimeLamp',
      component: () => import('../views/anchor/BedtimeLamp.vue')
    },
    // GTD模块
    {
      path: '/gtd/inbox',
      name: 'Inbox',
      component: () => import('../views/gtd/Inbox.vue')
    },
    {
      path: '/gtd/projects',
      name: 'Projects',
      component: () => import('../views/gtd/ProjectList.vue')
    },
    {
      path: '/gtd/waiting',
      name: 'Waiting',
      component: () => import('../views/gtd/WaitingList.vue')
    },
    {
      path: '/gtd/context',
      name: 'Context',
      component: () => import('../views/gtd/ContextList.vue')
    },
    {
      path: '/gtd/someday',
      name: 'Someday',
      component: () => import('../views/gtd/SomedayList.vue')
    },
    {
      path: '/gtd/quadrants',
      name: 'Quadrants',
      component: () => import('../views/gtd/Quadrants.vue')
    },
    {
      path: '/gtd/pomodoro',
      name: 'Pomodoro',
      component: () => import('../views/gtd/Pomodoro.vue')
    }
  ]
})

export default router
