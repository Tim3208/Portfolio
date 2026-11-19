/**
 * 원본: src/entities/game/model/types.ts · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
export type GameHubTone = 'mint' | 'violet' | 'cyan' | 'amber' | 'rose' | 'sky'

export type GameMetadata = {
  id: string
  name: string
  label: string
  tone: GameHubTone
  imageUrl?: string
}

export type GameHubItem = GameMetadata & {
  muted?: boolean
}
