/**
 * 원본: src/entities/game/model/mock.ts · 기준 커밋: 40c516b.
 * 변경: 그림 경로를 포트폴리오의 축소 WebP 위치로 바꿨다.
 */
import type { GameHubItem, GameMetadata } from "./types";

export const UNKNOWN_GAME_ID = "unknown-game";
export const UNKNOWN_GAME_NAME = "알 수 없는 게임";

export const mockGames: GameHubItem[] = [
  {
    id: "genshin-impact",
    name: "원신",
    label: "원",
    tone: "mint",
    imageUrl: "/images/projects/oshi-calendar/games/genshin-impact.webp",
  },
  {
    id: "arknights",
    name: "명일방주",
    label: "명",
    tone: "cyan",
    imageUrl: "/images/projects/oshi-calendar/games/arknights.webp",
  },
  {
    id: "honkai-star-rail",
    name: "붕괴: 스타레일",
    label: "붕",
    tone: "violet",
    imageUrl: "/images/projects/oshi-calendar/games/honkai-star-rail.webp",
  },
  {
    id: "blue-archive",
    name: "블루 아카이브",
    label: "블",
    tone: "sky",
    imageUrl: "/images/projects/oshi-calendar/games/blue-archive.webp",
  },
  {
    id: "girls-frontline",
    name: "소녀전선",
    label: "소",
    tone: "rose",
    imageUrl: "/images/projects/oshi-calendar/games/girls-frontline.webp",
  },
  {
    id: "alchemy-stars",
    name: "백야극광",
    label: "백",
    tone: "mint",
    imageUrl: "/images/projects/oshi-calendar/games/alchemy-stars.webp",
  },
  {
    id: "umamusume-pretty-derby",
    name: "우마무스메 프리티 더비",
    label: "우",
    tone: "amber",
    imageUrl: "/images/projects/oshi-calendar/games/umamusume-pretty-derby.webp",
  },
  {
    id: "goddess-of-victory-nikke",
    name: "승리의 여신: 니케",
    label: "니",
    tone: "rose",
    imageUrl: "/images/projects/oshi-calendar/games/goddess-of-victory-nikke.webp",
  },
  {
    id: "fate-grand-order",
    name: "페이트/그랜드 오더",
    label: "페",
    tone: "sky",
    imageUrl: "/images/projects/oshi-calendar/games/fate-grand-order.webp",
  },
  {
    id: "honkai-impact-3rd",
    name: "붕괴3rd",
    label: "붕",
    tone: "violet",
    imageUrl: "/images/projects/oshi-calendar/games/honkai-impact-3rd.webp",
  },
  {
    id: "reverse-1999",
    name: "리버스: 1999",
    label: "리",
    tone: "amber",
    imageUrl: "/images/projects/oshi-calendar/games/reverse-1999.webp",
  },
  {
    id: "zenless-zone-zero",
    name: "젠레스 존 제로",
    label: "젠",
    tone: "amber",
    imageUrl: "/images/projects/oshi-calendar/games/zenless-zone-zero.webp",
  },
  {
    id: "azur-lane",
    name: "벽람항로",
    label: "벽",
    tone: "sky",
    imageUrl: "/images/projects/oshi-calendar/games/azur-lane.webp",
  },
  {
    id: "wuthering-waves",
    name: "명조",
    label: "명",
    tone: "cyan",
    imageUrl: "/images/projects/oshi-calendar/games/wuthering-waves.webp",
  },
  {
    id: "arknights-endfield",
    name: "명일방주: 엔드필드",
    label: "명",
    tone: "cyan",
    imageUrl: "/images/projects/oshi-calendar/games/arknights-endfield.webp",
  },
];

/** 첫 진입 시 노출할 게임 허브의 부분집합이다. 나머지 mock 게임은 사용자가 추가할 수 있는 후보로 유지한다. */
const initialGameHubOptionIds = [
  "genshin-impact","honkai-star-rail","zenless-zone-zero","wuthering-waves","arknights-endfield",
];

export const gameHubOptions = mockGames.filter((game) =>
  initialGameHubOptionIds.includes(game.id),
);

/**
 * 수집기·서버가 보내는 별칭을 UI의 canonical game id로 통일한다.
 * 새 별칭은 metadata와 필터 저장소가 같은 게임으로 인식하도록 반드시 여기서 해석한다.
 */
const gameAliases: Record<string, string> = {
  genshin: "genshin-impact",
  genshin_impact: "genshin-impact",
  arknights: "arknights",
  myeongilbangju: "arknights",
  starrail: "honkai-star-rail",
  honkai_starrail: "honkai-star-rail",
  honkai_star_rail: "honkai-star-rail",
  star_rail: "honkai-star-rail",
  bluearchive: "blue-archive",
  blue_archive: "blue-archive",
  girls_frontline: "girls-frontline",
  gfl: "girls-frontline",
  alchemy_stars: "alchemy-stars",
  umamusume: "umamusume-pretty-derby",
  umamusume_pretty_derby: "umamusume-pretty-derby",
  nikke: "goddess-of-victory-nikke",
  goddess_of_victory_nikke: "goddess-of-victory-nikke",
  fgo: "fate-grand-order",
  fate_grand_order: "fate-grand-order",
  honkai3rd: "honkai-impact-3rd",
  honkai_impact_3rd: "honkai-impact-3rd",
  reverse1999: "reverse-1999",
  reverse_1999: "reverse-1999",
  zzz: "zenless-zone-zero",
  zenless_zone_zero: "zenless-zone-zero",
  azur_lane: "azur-lane",
  wuwa: "wuthering-waves",
  wuthering_waves: "wuthering-waves",
  arknights_endfield: "arknights-endfield",
  endfield: "arknights-endfield",
};

/** canonical id만 키로 갖는 metadata 인덱스다. 별칭 키는 아래 공개 인덱스에서 별도로 확장한다. */
const baseGameMetadataById = mockGames.reduce<Record<string, GameMetadata>>(
  (metadataById, game) => ({
    ...metadataById,
    [game.id]: game,
  }),
  {},
);

/** canonical id와 유효한 별칭 모두를 지원하는 읽기 전용 metadata 인덱스다. */
export const gameMetadataById: Record<string, GameMetadata> = {
  ...baseGameMetadataById,
  ...Object.fromEntries(
    Object.entries(gameAliases)
      .filter(([, gameId]) => baseGameMetadataById[gameId])
      .map(([alias, gameId]) => [alias, baseGameMetadataById[gameId]]),
  ),
};
