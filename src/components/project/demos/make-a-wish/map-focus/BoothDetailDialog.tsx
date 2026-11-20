/**
 * 원본: src/features/booths/components/BoothDetailDialog.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 상세 조회 대신 목록의 샘플 부스를 그대로 받고, 불러오는 중 · 실패 안내는 옮기지 않았다.
 *       페이지 전체를 덮는 portal 대신 화면 틀 안에만 그리고, 제목은 상세 페이지의 제목 계층에 맞춰
 *       h2 대신 p 로 둔다. Tabler 닫기 아이콘은 인라인 SVG 로 옮겼다. 팀원이 작성한 파일이다.
 */
import { useEffect, useRef } from 'react'
import type { Booth } from './types'

type BoothDetailDialogProps = {
  booth: Booth
  onClose: () => void
}

/** 공연·협찬사 상세와 같은 규격으로 부스의 사진과 소개를 보여 준다. */
export function BoothDetailDialog({ booth, onClose }: BoothDetailDialogProps) {
  const title = '부스 상세 정보'
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    closeButtonRef.current?.focus({ preventScroll: true })

    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center px-7">
      <button
        type="button"
        aria-label="부스 상세 정보 닫기"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-(--maw-black)/10 backdrop-blur-[5px]"
      />
      <section
        role="dialog"
        aria-label={title}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
        }}
        className="relative z-10 flex max-h-[calc(100%_-_48px)] w-full max-w-[336px] flex-col overflow-hidden rounded-[8px] bg-(--maw-white) shadow-xl"
      >
        <div className="relative shrink-0 py-4 pr-14 pl-5">
          <p className="text-right font-(family-name:--maw-font-display) text-[16px] font-semibold break-words text-[#2a315b]">
            {title}
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 grid size-10 place-items-center text-[#2a315b]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto pb-5">
          {booth.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- 원본 화면의 크기 · 맞춤 방식을 그대로 쓴다
            <img
              src={booth.imageUrl}
              alt=""
              className="mx-[10px] h-[196px] w-[calc(100%-20px)] object-contain"
            />
          ) : (
            <div className="mx-[10px] h-[196px] w-[calc(100%-20px)] bg-(--maw-gray-01)" />
          )}
          <div className="px-[10px] pt-[6px]">
            <p className="font-(family-name:--maw-font-body) text-[14px] break-words text-[#7385a1]">
              <strong className="font-(family-name:--maw-font-display) font-semibold text-[#2a315b]">
                {booth.name ?? '이름 미정'}
              </strong>{' '}
              {booth.operator ?? ''}
            </p>
            <p className="mt-2 font-(family-name:--maw-font-body) text-[14px] leading-[1.55] break-words whitespace-pre-wrap text-[#7385a1]">
              {booth.description || '부스 소개가 준비 중입니다.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
