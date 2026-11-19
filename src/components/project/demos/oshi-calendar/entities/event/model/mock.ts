/**
 * 원본: src/entities/event/model/mock.ts · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
import type { CategoryFilter } from './types'
import { categoryPresentationById } from "./categoryPresentation";

export const mockCategories: CategoryFilter[] = [
  { id: 'event', label: '이벤트', color: categoryPresentationById.event.color },
  { id: 'pickup', label: '픽업', color: categoryPresentationById.pickup.color },
  { id: 'update', label: '업데이트', color: categoryPresentationById.update.color },
  { id: 'redeem', label: '리딤코드', color: categoryPresentationById.redeem.color },
  { id: 'maintenance', label: '점검', color: categoryPresentationById.maintenance.color },
]
