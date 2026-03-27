import { NavLink } from 'react-router-dom'
import {
  Inbox,
  FolderKanban,
  Clock,
  Tag,
  Sparkles,
  Trash2,
  Home,
  Lightbulb,
  Trophy,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuGroups = [
  {
    title: 'GTD 时间管理',
    items: [
      { path: '/inbox', label: '收集箱', icon: Inbox },
      { path: '/next-actions', label: '执行清单', icon: Tag },
      { path: '/projects', label: '项目清单', icon: FolderKanban },
      { path: '/waiting', label: '等待清单', icon: Clock },
      { path: '/someday', label: '可能清单', icon: Sparkles },
      { path: '/trash', label: '回收箱', icon: Trash2 },
      { path: '/archive', label: '归档', icon: Archive },
    ],
  },
  {
    title: '锚点 成长陪伴',
    items: [
      { path: '/anchor', label: '灵感捕捉', icon: Home },
      { path: '/inspirations', label: '灵感信箱', icon: Lightbulb },
      { path: '/achievements', label: '成果箱', icon: Trophy },
    ],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary">GTD + 锚点</h1>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {menuGroups.map((group) => (
              <div key={group.title} className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary border-r-2 border-primary'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )
                        }
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
