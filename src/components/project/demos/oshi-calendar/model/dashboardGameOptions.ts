/**
 * 원본: src/pages/dashboard/model/dashboardGameOptions.ts · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다.
 */
import type { ScheduleItem } from "../entities/event/model";
import type { GameHubItem, GameHubTone } from "../entities/game/model";
import { UNKNOWN_GAME_ID, UNKNOWN_GAME_NAME } from "../entities/game/model";

/** 서버가 아직 metadata를 제공하지 않는 게임에도 허브 UI를 유지하기 위한 중립 대체 tone이다. */
const fallbackGameTone: GameHubTone = "amber";

/** unknown 게임명은 의미 없는 첫 글자 대신 물음표로 표시한다. */
function createFallbackLabel(name: string) {
  if (name === UNKNOWN_GAME_NAME) {
    return "?";
  }

  return name.trim().slice(0, 1) || "?";
}

/** 일정에서 발견한 게임을 이미지 없이도 선택 가능한 허브 옵션으로 최소 변환한다. */
function createGameOptionFromScheduleItem(
  item: ScheduleItem,
): GameHubItem | null {
  const gameId = item.gameId ?? UNKNOWN_GAME_ID;
  const gameName = item.gameName ?? item.game ?? UNKNOWN_GAME_NAME;

  return {
    id: gameId,
    name: gameName,
    label: createFallbackLabel(gameName),
    tone: fallbackGameTone,
    imageUrl: item.gameImageUrl,
  };
}

/**
 * 정적 게임 허브에 서버 일정에서 발견한 새 게임을 덧붙인다.
 * 기존 옵션의 순서와 metadata를 우선하며 같은 id는 중복 추가하지 않는다.
 */
export function mergeScheduleGamesIntoGameOptions(
  baseGames: readonly GameHubItem[],
  scheduleItems: readonly ScheduleItem[],
): GameHubItem[] {
  const gameOptions = [...baseGames];
  const knownGameIds = new Set(gameOptions.map((game) => game.id));

  scheduleItems.forEach((item) => {
    const option = createGameOptionFromScheduleItem(item);

    if (!option || knownGameIds.has(option.id)) {
      return;
    }

    knownGameIds.add(option.id);
    gameOptions.push(option);
  });

  return gameOptions;
}
