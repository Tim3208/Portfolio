/**
 * 원본: src/widgets/dashboard-sidebar/ui/DashboardSidebar.tsx · 기준 커밋: 40c516b.
 * 변경: 서비스 별칭 import를 데모 안의 상대 경로로 바꿨다. 반응형은 설계 폭 1280px 기준으로 풀어 두고, 요청한 원본 max-xl 안쪽 여백 14px을 쓴다. 흰색·검정색 팔레트를 루트의 --oshi-* 변수로 격리했다. 상세 페이지 h2 아래 영역·하위 제목을 h3·h4로 낮췄다. 인증을 제외하고 고정 오늘을 전달하며, 추가 창을 캔버스 안에 두고 초점 복원·순환·Escape 닫기를 보완했다.
 */
/* eslint-disable @next/next/no-img-element -- 원본 게임 아바타와 축소 WebP를 그대로 표시한다. */
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgePlus, Check, UsersRound, X } from "lucide-react";
import type {
  CategoryFilter as CategoryFilterModel,
  CategoryId,
} from "../../../entities/event/model";
import type { GameHubItem, GameHubTone } from "../../../entities/game/model";
import { CategoryFilter } from "../../../features/filter-categories";
import { PlannedAction } from "../../../features/planned-action";
import { MiniCalendar } from "../../../features/select-date";
import { IconButton, Panel } from "../../../shared/ui";

type DashboardSidebarProps = {
  readonly today: Date;
  readonly selectedDate: Date;
  readonly onSelectedDateChange: (date: Date) => void;
  readonly categories: CategoryFilterModel[];
  readonly visibleCategoryIds: CategoryId[];
  readonly onToggleCategory: (categoryId: CategoryId) => void;
  readonly availableGames: GameHubItem[];
  readonly addedGameIds: string[];
  readonly activeGameIds: string[];
  readonly onAddGame: (gameId: string) => void;
  readonly onToggleGameActive: (gameId: string) => void;
  readonly onActivateAllGames: () => void;
};

/** 게임 이미지가 없을 때 metadata의 의미 tone으로 대체 아바타를 그리는 UI 전용 스타일 매핑이다. */
const gameToneClasses = {
  mint: "bg-[linear-gradient(135deg,#a5f3fc,#6ee7b7_52%,#818cf8)]",
  violet: "bg-[linear-gradient(135deg,#ddd6fe,#a78bfa_48%,#475569)]",
  cyan: "bg-[linear-gradient(135deg,#67e8f9,#38bdf8_46%,#1f2937)]",
  amber: "bg-[linear-gradient(135deg,#fde68a,#fb923c_52%,#1f2937)]",
  rose: "bg-[linear-gradient(135deg,#fecdd3,#fb7185_52%,#1f2937)]",
  sky: "bg-[linear-gradient(135deg,#bfdbfe,#60a5fa_52%,#312e81)]",
} satisfies Record<GameHubTone, string>;

export function DashboardSidebar({
  today,
  selectedDate,
  onSelectedDateChange,
  categories,
  visibleCategoryIds,
  onToggleCategory,
  availableGames,
  addedGameIds,
  activeGameIds,
  onAddGame,
  onToggleGameActive,
  onActivateAllGames,
}: DashboardSidebarProps) {
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const gameDialogRef = useRef<HTMLDivElement>(null);
  const gameDialogTriggerRef = useRef<HTMLButtonElement | null>(null);

  // 축소 캔버스 안에서도 대화상자 열기·닫기 후 키보드 초점을 잃지 않게 한다.
  useEffect(() => {
    if (!isGameModalOpen) return;
    gameDialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const trigger = gameDialogTriggerRef.current;
    return () => trigger?.focus();
  }, [isGameModalOpen]);
  /** 배열 기반 저장 상태를 렌더 중 빠르게 조회하기 위한 파생 Set이다. 저장 순서와 외부 API는 배열 계약을 유지한다. */
  const addedGameIdSet = useMemo(() => new Set(addedGameIds), [addedGameIds]);
  /** 추가된 게임 중 현재 일정 필터에 실제로 참여하는 게임을 빠르게 판별하는 파생 Set이다. */
  const activeGameIdSet = useMemo(
    () => new Set(activeGameIds),
    [activeGameIds],
  );
  /** 전체 후보 중 사용자가 허브에 추가한 게임만 표시한다. 활성 여부는 숨기지 않고 흐린 상태로 별도 표현한다. */
  const addedGames = availableGames.filter((game) =>
    addedGameIdSet.has(game.id),
  );

  return (
    <aside
      className="dashboard-scrollbar flex min-h-0 min-w-0 w-full shrink-0 flex-col gap-2 overflow-y-auto border-r border-[#252525] bg-[#171717] p-3.5 max-w-full"
      aria-label="캘린더 도구"
    >
      <MiniCalendar
        today={today}
        selectedDate={selectedDate}
        onSelectedDateChange={onSelectedDateChange}
      />

      <PlannedAction message="친구 캘린더와 약속 생성은 추후 지원 예정입니다.">
        <button
          type="button"
          className="inline-flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-[#2d2d2d] bg-[#212121] px-3 text-[12px] text-[color:var(--oshi-white)]/62 transition-colors hover:border-[#3a3a3a] hover:bg-[#282828] hover:text-[color:var(--oshi-white)]/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24e6b0]/60 [&_svg]:h-3.5 [&_svg]:w-3.5"
        >
          <UsersRound aria-hidden="true" />
          <span>만날 사람</span>
          <span
            className="ml-auto h-1.5 w-1.5 rounded-full bg-[#27FFBB]/70"
            aria-hidden="true"
          />
        </button>
      </PlannedAction>

      <Panel className="p-4" aria-labelledby="game-hub-title">
        <div className="flex items-center justify-between gap-3">
          <h3
            id="game-hub-title"
            className="m-0 text-[13px] font-medium tracking-normal text-[color:var(--oshi-white)]/72"
          >
            게임 허브
          </h3>
          <div className="flex items-center gap-1.5">
            <IconButton label="모든 게임 활성화" onClick={onActivateAllGames}>
              <Check aria-hidden="true" />
            </IconButton>
            <IconButton
              label="게임 추가"
              onClick={(event) => {
                gameDialogTriggerRef.current = event.currentTarget;
                setIsGameModalOpen(true);
              }}
            >
              <BadgePlus aria-hidden="true" />
            </IconButton>
          </div>
        </div>

        {addedGames.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {addedGames.map((game) => {
              const active = activeGameIdSet.has(game.id);

              return (
                <button
                  key={game.id}
                  type="button"
                  className={[
                    "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#242424] text-[11px] font-bold text-[#f8fbff] transition-[opacity,filter,box-shadow,transform] duration-150 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24e6b0]",
                    game.imageUrl ? "" : gameToneClasses[game.tone],
                    active ? "" : "opacity-35 grayscale",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`${game.name} ${active ? "비활성화" : "활성화"}`}
                  aria-pressed={active}
                  title={game.name}
                  onClick={() => onToggleGameActive(game.id)}
                >
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    game.label
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 mb-0 rounded-lg border border-dashed border-[#343434] px-3 py-3 text-center text-xs text-[#8d8d8d]">
            추가된 게임이 없습니다.
          </p>
        )}

        {isGameModalOpen && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center bg-[color:var(--oshi-black)]/62 p-4"
            role="presentation"
          >
            <div
              ref={gameDialogRef}
              className="w-full max-w-[420px] rounded-lg border border-[#303030] bg-[#181818] p-4 shadow-[0_24px_80px_rgb(0_0_0/52%)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="game-add-title"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setIsGameModalOpen(false);
                  return;
                }
                if (event.key !== "Tab") return;
                const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "button:not(:disabled)",
                );
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (event.shiftKey && event.target === first) {
                  event.preventDefault();
                  last?.focus();
                } else if (!event.shiftKey && event.target === last) {
                  event.preventDefault();
                  first?.focus();
                }
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <h4
                  id="game-add-title"
                  className="m-0 text-base font-normal text-[color:var(--oshi-white)]/80"
                >
                  게임 추가
                </h4>
                <IconButton
                  label="닫기"
                  onClick={() => setIsGameModalOpen(false)}
                >
                  <X aria-hidden="true" />
                </IconButton>
              </div>

              <div className="mt-4 grid gap-2">
                {availableGames.map((game) => {
                  const alreadyAdded = addedGameIdSet.has(game.id);

                  return (
                    <button
                      key={game.id}
                      type="button"
                      className="grid cursor-pointer grid-cols-[36px_minmax(0,1fr)_max-content] items-center gap-3 rounded-lg border border-[#2d2d2d] bg-[#202020] px-3 py-2 text-left text-sm text-[#ededed] transition-colors hover:border-[#3c3c3c] hover:bg-[#242424] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24e6b0] disabled:cursor-default disabled:opacity-55"
                      disabled={alreadyAdded}
                      onClick={() => onAddGame(game.id)}
                    >
                      <span
                        className={[
                          "inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#242424] text-xs font-bold text-[#f8fbff]",
                          game.imageUrl ? "" : gameToneClasses[game.tone],
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      >
                        {game.imageUrl ? (
                          <img
                            src={game.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          game.label
                        )}
                      </span>
                      <span className="min-w-0 truncate">{game.name}</span>
                      <span className="inline-flex h-6 min-w-12 items-center justify-center rounded-md border border-[#343434] px-2 text-[11px] text-[#bdbdbd]">
                        {alreadyAdded ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          "추가"
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel className="p-4" aria-labelledby="category-title">
        <CategoryFilter
          categories={categories}
          visibleCategoryIds={visibleCategoryIds}
          onToggleCategory={onToggleCategory}
        />
      </Panel>

    </aside>
  );
}
