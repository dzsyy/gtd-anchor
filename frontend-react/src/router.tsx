import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Inbox } from '@/pages/gtd/Inbox'
import { ProjectList } from '@/pages/gtd/ProjectList'
import { NextActions } from '@/pages/gtd/NextActions'
import { WaitingList } from '@/pages/gtd/WaitingList'
import { SomedayList } from '@/pages/gtd/SomedayList'
import { Trash } from '@/pages/gtd/Trash'
import { Archive } from '@/pages/gtd/Archive'

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
      { path: 'trash', element: <Trash /> },
      { path: 'archive', element: <Archive /> },
    ],
  },
])

export default router