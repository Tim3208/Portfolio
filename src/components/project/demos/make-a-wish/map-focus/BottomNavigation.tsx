/**
 * 원본: src/components/layout/BottomNavigation.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 다른 화면으로 가는 링크를 이동하지 않는 장식(span)으로 바꾸고 묶음 전체를 접근성 트리에서 뺐다.
 *       게스트용 색 분기는 이 화면에서 쓰지 않아 옮기지 않았다. 색은 화면 범위 변수로 격리.
 */
import type { ReactNode } from 'react'

type BottomNavigationItem = {
  id: string
  icon: ReactNode
}

type BottomNavigationProps = {
  items: readonly BottomNavigationItem[]
  activeId: string
  className?: string
}

/** 목적지와 이용자 상태는 사용하는 화면에서 전달하는 공통 하단 메뉴다. */
export function BottomNavigation({ items, activeId, className }: BottomNavigationProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'isolate mx-auto flex h-[70px] w-[calc(100%_-_28px)] max-w-[365px] items-center overflow-hidden rounded-full bg-(--maw-white)/[0.01] px-3 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] backdrop-blur-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map(({ id, icon }) => {
        const isActive = id === activeId

        return (
          <span
            key={id}
            className="relative grid min-h-11 min-w-11 flex-1 place-items-center rounded-full text-(--maw-white)"
          >
            {isActive && (
              <span className="pointer-events-none absolute -z-10 size-[50px] rounded-full bg-(--maw-main-01) blur-[19px]" />
            )}
            <span className="pointer-events-none grid size-[26px] place-items-center drop-shadow-[0_0_5.8px_rgb(20_74_132/0.7)] [&>svg]:size-full">
              {icon}
            </span>
          </span>
        )
      })}
    </div>
  )
}
