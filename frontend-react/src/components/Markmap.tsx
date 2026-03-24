import { useEffect, useRef } from 'react'
import { Markmap } from 'markmap-view'
import { Transformer } from 'markmap-lib'
import { Toolbar } from 'markmap-toolbar'
import './markmap.css'

const transformer = new Transformer()

// 加载 markmap 资源
function loadAssets() {
  const { scripts, styles } = transformer.getAssets()

  // 加载 CSS
  styles.forEach((href) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      document.head.appendChild(link)
    }
  })

  // 加载 JS
  scripts.forEach((src) => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script')
      script.src = src
      script.async = false
      document.head.appendChild(script)
    }
  })
}

interface MarkmapProps {
  value: string
  onChange?: (value: string) => void
  editable?: boolean
}

export function MarkmapView({ value, onChange, editable = false }: MarkmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mmRef = useRef<Markmap | null>(null)

  useEffect(() => {
    loadAssets()

    if (!containerRef.current) return

    // 等待脚本加载后初始化
    const initMarkmap = () => {
      if (!containerRef.current) return

      // 清除之前的内容
      containerRef.current.innerHTML = ''

      // 创建 SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      containerRef.current.appendChild(svg)

      // 初始化 markmap
      const mm = Markmap.create(svg, {
        autoFit: true,
        duration: 300,
        maxWidth: 300,
        nodeMinHeight: 16,
        spaceX: 20,
        spaceY: 8,
        render: (node, e, isCollapsed) => {
          const group = e as SVGGraphicsElement
          const rect = node.payload

          // 节点样式
          const color = node.data.color || '#4a90d9'
          const isActive = node.state?.active

          group.style.cursor = 'pointer'
          group.style.opacity = isActive ? '0.8' : '1'

          return {
            style: {
              fill: isActive ? color : '#fff',
              stroke: color,
              strokeWidth: 2,
            },
          }
        },
      })

      // 加载数据
      const { root } = transformer.transform(value)
      mm.setData(root)
      mm.fit()

      mmRef.current = mm

      // 如果可编辑，添加点击事件
      if (editable && onChange) {
        svg.addEventListener('click', (e) => {
          const target = e.target as SVGElement
          if (target.tagName === 'text' || target.tagName === 'rect') {
            // 获取节点文本
            const textEl = svg.querySelector('text')
            if (textEl) {
              const newValue = prompt('编辑节点内容:', value)
              if (newValue !== null) {
                onChange(newValue)
              }
            }
          }
        })
      }
    }

    // 延迟初始化，等待脚本加载
    setTimeout(initMarkmap, 100)

    return () => {
      mmRef.current = null
    }
  }, [value])

  return <div ref={containerRef} className="markmap-container" />
}

// 将任务树转换为 Markdown
export function taskTreeToMarkdown(
  tasks: Array<{ id: number; parentId: number | null; title: string; nodeLevel: number; isCompleted: boolean }>,
  rootId: number
): string {
  const buildMarkdown = (parentId: number | null, level: number): string => {
    const children = tasks.filter((t) => t.parentId === parentId)
    if (children.length === 0) return ''

    const indent = '  '.repeat(level)
    let md = ''

    for (const task of children) {
      const prefix = task.isCompleted ? 'x ' : '- '
      const nodeLevel = task.nodeLevel

      // 根据层级添加不同的前缀
      if (nodeLevel === 0) {
        md += `# ${task.title}\n\n`
      } else if (nodeLevel === 1) {
        md += `${indent}## ${task.title}\n\n`
      } else if (nodeLevel === 2) {
        md += `${indent}### ${task.title}\n\n`
      } else {
        md += `${indent}${prefix} ${task.title}\n`
      }

      // 递归添加子节点
      const childMd = buildMarkdown(task.id, level + 1)
      md += childMd
    }

    return md
  }

  return buildMarkdown(rootId, 0)
}
