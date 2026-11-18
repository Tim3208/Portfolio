/**
 * 원본: src/features/stamps/lib/artwork.ts
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 에셋 가져오기를 공개 경로 문자열로 대체. 모든 좌표·크기는 보존.
 */
const greenEmpty = '/images/projects/make-a-wish/stamps/star-green-empty.svg'
const greenFilled = '/images/projects/make-a-wish/stamps/star-green-filled.svg'
const cyanEmpty = '/images/projects/make-a-wish/stamps/star-cyan-empty.svg'
const cyanFilled = '/images/projects/make-a-wish/stamps/star-cyan-filled.svg'
const pinkEmpty = '/images/projects/make-a-wish/stamps/star-pink-empty.svg'
const pinkFilled = '/images/projects/make-a-wish/stamps/star-pink-filled.svg'
const yellowEmpty = '/images/projects/make-a-wish/stamps/star-yellow-empty.svg'
const yellowFilled = '/images/projects/make-a-wish/stamps/star-yellow-filled.svg'
const purpleEmpty = '/images/projects/make-a-wish/stamps/star-purple-empty.svg'
const purpleFilled = '/images/projects/make-a-wish/stamps/star-purple-filled.svg'
const whiteEmpty = '/images/projects/make-a-wish/stamps/star-white-empty.svg'
const whiteFilled = '/images/projects/make-a-wish/stamps/star-white-filled.svg'
const connectionOne = '/images/projects/make-a-wish/stamps/connection-1.svg'
const connectionTwo = '/images/projects/make-a-wish/stamps/connection-2.svg'
const connectionThree = '/images/projects/make-a-wish/stamps/connection-3.svg'
const connectionFour = '/images/projects/make-a-wish/stamps/connection-4.svg'
const connectionFive = '/images/projects/make-a-wish/stamps/connection-5.svg'

/** Figma 원본을 내보낸 SVG. 빈 별은 점선의 꼭짓점 배치를 보존하도록 윤곽으로 내보냈다. */
export const STAMP_STARS = [
  {
    empty: greenEmpty,
    filled: greenFilled,
    x: 29.1104,
    y: 274.4346,
    emptyGeometry: { x: 25.1025, y: 263.2588, width: 133, height: 125 },
    left: 39,
    top: 285,
    tooltipX: 109,
    tooltipY: 386,
  },
  {
    empty: cyanEmpty,
    filled: cyanFilled,
    x: 241.1104,
    y: 235.4346,
    emptyGeometry: { x: 237.1025, y: 224.2588, width: 133, height: 125 },
    left: 251,
    top: 246,
    tooltipX: 323,
    tooltipY: 342,
  },
  {
    empty: pinkEmpty,
    filled: pinkFilled,
    x: 129.1104,
    y: 427.4346,
    emptyGeometry: { x: 125.1025, y: 416.2588, width: 133, height: 125 },
    left: 139,
    top: 438,
    tooltipX: 211,
    tooltipY: 536,
  },
  {
    empty: yellowEmpty,
    filled: yellowFilled,
    x: 273.1104,
    y: 505.4346,
    emptyGeometry: { x: 269.1025, y: 494.2588, width: 133, height: 125 },
    left: 283,
    top: 516,
    tooltipX: 305,
    tooltipY: 619,
  },
  {
    empty: purpleEmpty,
    filled: purpleFilled,
    x: 2.1104,
    y: 561.4346,
    emptyGeometry: { x: -1.8975, y: 550.2588, width: 133, height: 125 },
    left: 12,
    top: 572,
    tooltipX: 86,
    tooltipY: 671,
  },
  {
    empty: whiteEmpty,
    filled: whiteFilled,
    x: 187.7715,
    y: 668.459,
    emptyGeometry: { x: 183.1016, y: 656.2598, width: 139, height: 131 },
    left: 198,
    top: 679,
    tooltipX: 249,
    tooltipY: 786,
  },
] as const

export const STAMP_CONNECTIONS = [
  { src: connectionOne, x: 122, y: 298, width: 137.001, height: 28.0005 },
  { src: connectionTwo, x: 221, y: 328.5, width: 70.5005, height: 121.501 },
  { src: connectionThree, x: 230, y: 500.5, width: 74.5004, height: 46.5004 },
  { src: connectionFour, x: 91.5, y: 500.5, width: 77, height: 83.5 },
  {
    src: connectionFive,
    x: -1.5,
    y: -1.5,
    width: 11.2139,
    height: 115.2,
    transform: 'matrix(-0.7540582 -0.6568076 0.6568076 -0.7540582 255.5 692)',
  },
] as const

/** Figma의 393px 폭을 반응형 컨테이너 단위로 환산한다. */
export function cqw(value: number) {
  return `${(value / 393) * 100}cqw`
}
