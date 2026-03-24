import { useEffect, useRef } from 'react'
import { Transformer } from 'markmap-lib'

interface MarkmapViewProps {
  markdown: string
  className?: string
}

// 动态加载 markmap
let Markmap: any = null
let loadMarkmapPromise: Promise<any> | null = null

async function loadMarkmap() {
  if (Markmap) return Markmap
  if (loadMarkmapPromise) return loadMarkmapPromise

  loadMarkmapPromise = import('markmap-view').then((mod) => {
    Markmap = mod.Markmap
    return Markmap
  })

  return loadMarkmapPromise
}

export function MarkmapView({ markdown, className = '' }: MarkmapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markmapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let mm: any = null
    let cancelled = false

    const init = async () => {
      const transformer = new Transformer()
      const { root } = transformer.transform(markdown)

      const MK = await loadMarkmap()
      if (cancelled || !containerRef.current) return

      // 清理旧的
      if (markmapRef.current) {
        markmapRef.current.destroy()
      }

      containerRef.current.innerHTML = ''
      mm = MK.create(containerRef.current)
      if (cancelled) {
        mm.destroy()
        return
      }
      mm.setData(root)
      markmapRef.current = mm
    }

    init()

    return () => {
      cancelled = true
      if (mm) mm.destroy()
    }
  }, [markdown])

  return (
    <div
      ref={containerRef}
      className={`markmap-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
      }}
    />
  )
}
