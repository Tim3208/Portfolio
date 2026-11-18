/**
 * 원본: src/components/layout/PageHeader.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 이동 버튼을 장식용 span·인라인 SVG로, h1을 div로 대체. 색·폰트는 화면 범위에 격리.
 */
type PageHeaderProps = {
  title: string
  className?: string
}

/** 상태바를 제외한 공통 페이지 제목과 뒤로 가기 버튼을 표시한다. */
export function PageHeader({ title, className }: PageHeaderProps) {
  return (
    <header
      className={[
        'relative grid min-h-14 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 bg-(--maw-black) px-3 py-1.5 shadow-[0_4px_10px_rgb(15_33_66/0.5)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-full text-(--maw-white)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </span>
      <div
        className="min-w-0 truncate text-center font-(family-name:--maw-font-display) text-xl leading-none font-normal tracking-normal text-[#E6E0FF] [text-shadow:0_0_5.8px_#7F8CFF]"
        title={title}
      >
        {title}
      </div>
    </header>
  )
}
