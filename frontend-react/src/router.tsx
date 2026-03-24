import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Inbox } from '@/pages/gtd/Inbox'
import { ProjectList } from '@/pages/gtd/ProjectList'
import { NextActions } from '@/pages/gtd/NextActions'
import { WaitingList } from '@/pages/gtd/WaitingList'
import { SomedayList } from '@/pages/gtd/SomedayList'
import { Reference } from '@/pages/gtd/Reference'
import { Trash } from '@/pages/gtd/Trash'
import { Calendar } from '@/pages/gtd/Calendar'
import { Pomodoro } from '@/pages/gtd/Pomodoro'
import { MindMap } from '@/pages/gtd/MindMap'
import { Home } from '@/pages/anchor/Home'
import { InspirationBox } from '@/pages/anchor/InspirationBox'
import { AchievementBox } from '@/pages/anchor/AchievementBox'
import { SkillPuzzle } from '@/pages/anchor/SkillPuzzle'
import { EmotionCave } from '@/pages/anchor/EmotionCave'
import { MaterialLib } from '@/pages/anchor/MaterialLib'
import { BedtimeLamp } from '@/pages/anchor/BedtimeLamp'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/inbox" replace /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'projects', element: <ProjectList /> },
      { path: 'next-actions', element: <NextActions /> },
      { path: 'waiting', element: <WaitingList /> },
      { path: 'someday', element: <SomedayList /> },
      { path: 'reference', element: <Reference /> },
      { path: 'trash', element: <Trash /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'pomodoro', element: <Pomodoro /> },
      { path: 'mindmap', element: <MindMap /> },
      { path: 'anchor', element: <Home /> },
      { path: 'inspirations', element: <InspirationBox /> },
      { path: 'achievements', element: <AchievementBox /> },
      { path: 'skills', element: <SkillPuzzle /> },
      { path: 'emotion', element: <EmotionCave /> },
      { path: 'materials', element: <MaterialLib /> },
      { path: 'bedtime', element: <BedtimeLamp /> },
    ],
  },
])

export default router
