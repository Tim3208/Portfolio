/**
 * 원본: src/features/stamps/components/StampsScreen.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 인증·라우터·조회 훅을 속성으로 대체. 오류 문구·role·재시도 버튼은 보존.
 * 서비스 색만 화면 범위 변수로 격리한다.
 */
import type { ReactNode } from 'react'
import type { MyStamp } from '../types'
import { StampPageContent } from './StampPageContent'

const retryButtonClassName =
  'mt-2 min-h-11 rounded-full border border-(--maw-white)/30 bg-(--maw-black)/20 px-5 py-2 text-sm text-(--maw-white) underline backdrop-blur-sm disabled:opacity-50'

type StampsScreenProps = {
  slots: readonly (MyStamp | null)[] | null
  error: 'stamps' | 'classification' | null
  isLoading?: boolean
  isRefreshing?: boolean
  retry: () => void
}

/** 원본 스탬프판 화면에 데모가 검증한 조회 상태를 전달한다. */
export function StampsScreen(board: StampsScreenProps) {
  let status: ReactNode

  if (board.error) {
    const message =
      board.error === 'stamps'
        ? '스탬프를 불러오지 못했습니다.'
        : '적립한 부스 정보를 확인하지 못했습니다.'
    status = (
      <div>
        <p role="alert">
          {message}
          {board.slots ? <span className="block">마지막으로 확인한 내역을 표시합니다.</span> : null}
        </p>
        <button
          type="button"
          className={retryButtonClassName}
          disabled={board.isRefreshing}
          onClick={() => void board.retry()}
        >
          {board.isRefreshing ? '다시 확인하는 중…' : '다시 시도'}
        </button>
      </div>
    )
  } else if (board.isLoading) {
    status = <p role="status">스탬프 정보를 확인하고 있습니다.</p>
  }

  return <StampPageContent slots={board.slots} status={status} />
}
