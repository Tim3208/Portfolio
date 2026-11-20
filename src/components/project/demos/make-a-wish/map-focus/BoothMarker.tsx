/**
 * 원본: src/features/booths/lib/mapMarker.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: SDK 마커에 넣을 DOM 을 직접 조립하던 것을 같은 크기 · 색 · 이름표의 React 버튼으로 옮김.
 *       SDK 클릭과 겹치지 않게 키보드 선택만 따로 받던 처리는 일반 버튼 클릭 하나로 줄었다.
 *       자리는 지도의 CSS 변수 카메라가 정한다(BoothMap.module.css).
 */
import type { CSSProperties } from 'react'
import styles from './BoothMap.module.css'
import { getBoothMarkerIcon } from './category'
import type { Booth } from './types'

const MARKER_HIT_SIZE = 44
const MARKER_SIZE = 32

type BoothMarkerProps = {
  booth: Booth
  point: { x: number; y: number }
  isSelected: boolean
  labelWidth: number
  onSelect: (id: number) => void
}

/** 기존 부스별 아이콘을 유지하고 선택 상태와 키보드 조작을 표시한다. */
export function BoothMarker({ booth, point, isSelected, labelWidth, onSelect }: BoothMarkerProps) {
  const name = booth.name ?? '부스'
  const id = booth.id
  const imageSize = isSelected ? MARKER_HIT_SIZE : MARKER_SIZE

  return (
    <button
      type="button"
      aria-label={`${name} 지도에서 보기`}
      aria-pressed={isSelected}
      title={name}
      onClick={() => id !== null && onSelect(id)}
      className={styles.marker}
      style={
        {
          '--px': point.x,
          '--py': point.y,
          zIndex: isSelected ? 1000 : 2,
          width: `${MARKER_HIT_SIZE}px`,
          height: `${MARKER_HIT_SIZE}px`,
          boxShadow: isSelected ? '0 0 0 2px #fff, 0 0 0 4px #2D7DC8, 0 2px 8px #2A315B55' : 'none',
        } as CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 원본 마커 그림(SVG)을 크기 그대로 쓴다 */}
      <img
        src={getBoothMarkerIcon(booth.category)}
        alt=""
        draggable={false}
        width={imageSize}
        height={imageSize}
        style={{
          display: 'block',
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          maxWidth: 'none',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      {isSelected ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: `${MARKER_HIT_SIZE + 4}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${Math.max(64, Math.min(196, labelWidth - 24))}px`,
            boxSizing: 'border-box',
            display: '-webkit-box',
            maxHeight: '34px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            padding: '3px 8px',
            borderRadius: '8px',
            background: '#fff',
            color: '#2A315B',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 8px #2A315B33',
            pointerEvents: 'none',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {name}
        </span>
      ) : null}
    </button>
  )
}
