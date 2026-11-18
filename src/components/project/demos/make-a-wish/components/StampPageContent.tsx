/**
 * 원본: src/features/stamps/components/StampPageContent.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: min-h-dvh와 이동 관련 속성을 제거하고 main을 div로 대체. 서비스 색·폰트·포커스는 화면 범위에 격리.
 */
import type { ReactNode } from 'react'
import '@fontsource-variable/hahmlet'
import { PageHeader } from './PageHeader'
import styles from '../service.module.css'
import type { MyStamp } from '../types'
import { StampBackdrop } from './StampBackdrop'
import { StampBoard } from './StampBoard'

type StampPageContentProps = {
  slots: readonly (MyStamp | null)[] | null
  status?: ReactNode
}

/** 부스 스탬프 화면. 데이터와 별 배정 정책은 호출부에서 전달한다. */
export function StampPageContent({ slots, status }: StampPageContentProps) {
  return (
    <div className={`${styles.service} w-full overflow-x-clip bg-(--maw-main-01)`}>
      <PageHeader
        title="부스 스탬프"
        className="relative z-10 min-h-[63px] border-b border-(--maw-white)/[0.17] bg-(--maw-black) shadow-none"
      />
      {status ? (
        <div className="relative z-30 bg-(--maw-black) px-4 py-3 text-center font-(family-name:--maw-font-body) text-sm text-(--maw-white)">
          {status}
        </div>
      ) : null}
      <div className="@container relative aspect-[393/739] w-full font-(family-name:--maw-font-display)">
        <StampBackdrop />
        <p className="absolute top-[12.468cqw] left-1/2 z-10 w-max -translate-x-1/2 text-center text-[4.58cqw] leading-[1.5] font-light text-[#ADAEFF] [text-shadow:0_0_10px_#645CFF]">
          부스 체험 후 <span className="text-[#FA9EFF]">QR을 스캔</span>하고
          <br />
          별자리를 완성해보세요!
        </p>
        {slots ? <StampBoard slots={slots} /> : null}
      </div>
    </div>
  )
}
