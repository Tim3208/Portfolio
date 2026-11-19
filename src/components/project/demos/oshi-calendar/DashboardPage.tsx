/**
 * 원본: src/pages/dashboard/ui/DashboardPage.tsx · 기준 커밋: 40c516b.
 * 변경: API 조회·시계·저장 훅 대신 샘플 일정과 고정 오늘을 받아 메모리 상태만 쓴다.
 * 원본 기본값은 주간이며 데모가 initialViewMode로 월간을 넘긴다. 필터 순서와
 * 이동·접기·게임 조작은 유지한다. 게임 추가를 직접
 * 시험할 수 있도록 최초 허브에서 붕괴: 스타레일 한 개만 빼고, 후보 목록에는 남긴다.
 * main은 div로 바꾸고 1280×800 설계 크기(여백 40px)에 고정한다. 열과 사이드바 여백은
 * 요청한 원본 max-xl 값을 써 브라우저 폭과 무관하게 같은 설계 배치를 유지한다.
 * 샘플을 서버 일정으로 부르는 정상 안내만 조립부에서 null로 넘겨 생략한다.
 * 패널의 오늘이 바뀌면 필터와 보기 모드는 보존하고 선택 날짜만 따라간다.
 */
import { useMemo, useState } from "react";
import { mockCategories } from "./entities/event/model";
import type { CategoryId, ScheduleItem } from "./entities/event/model";
import { gameHubOptions } from "./entities/game/model";
import {
  filterScheduleItemsByVisibleDateRange,
  filterScheduleItemsByCategory,
  getCalendarViewDateRange,
  getImminentScheduleItems,
  shiftCalendarDate,
} from "./shared/lib/date";
import { CalendarWorkspace } from "./widgets/calendar-workspace";
import type { CalendarViewMode } from "./widgets/calendar-workspace";
import { DashboardSidebar } from "./widgets/dashboard-sidebar";
import { ImminentSchedule } from "./widgets/imminent-schedule";
import { mergeScheduleGamesIntoGameOptions } from "./model/dashboardGameOptions";
import { createScheduleDataStatus } from "./model/scheduleDataStatus";
import styles from "./screen.module.css";

type DashboardPageProps = {
  readonly today: Date;
  readonly items: ScheduleItem[];
  readonly initialViewMode?: CalendarViewMode;
};

export function DashboardPage({ today, items: scheduleItems, initialViewMode = "week" }: DashboardPageProps) {
  const [selectedDate, setSelectedDate] = useState(today);
  const [previousTodayTime, setPreviousTodayTime] = useState(today.getTime());
  const [calendarViewMode, setCalendarViewMode] =
    useState<CalendarViewMode>(initialViewMode);
  const [imminentScheduleCollapsed, setImminentScheduleCollapsed] =
    useState(false);
  const availableGames = useMemo(
    () => mergeScheduleGamesIntoGameOptions(gameHubOptions, scheduleItems),
    [scheduleItems],
  );
  const [visibleCategoryIds, setVisibleCategoryIds] = useState<CategoryId[]>(
    () => mockCategories.map((category) => category.id),
  );
  const [addedGameIds, setAddedGameIds] = useState<string[]>(() =>
    availableGames
      .filter((game) => game.id !== "honkai-star-rail")
      .map((game) => game.id),
  );
  const [activeGameIds, setActiveGameIds] = useState<string[]>(addedGameIds);

  // 같은 컴포넌트의 props 변화에 선택 날짜만 맞추므로 다른 조작 상태는 유지된다.
  if (previousTodayTime !== today.getTime()) {
    setPreviousTodayTime(today.getTime());
    setSelectedDate(today);
  }

  const activeGameScheduleItems = useMemo(
    () =>
      scheduleItems.filter(
        (item) => item.gameId && activeGameIds.includes(item.gameId),
      ),
    [activeGameIds, scheduleItems],
  );
  const visibleImminentScheduleItems = useMemo(
    () =>
      getImminentScheduleItems(
        activeGameScheduleItems,
        visibleCategoryIds,
        today,
      ),
    [activeGameScheduleItems, today, visibleCategoryIds],
  );
  const calendarScheduleItems = useMemo(
    () =>
      filterScheduleItemsByCategory(activeGameScheduleItems, visibleCategoryIds),
    [activeGameScheduleItems, visibleCategoryIds],
  );
  const visibleRangeScheduleItemCount = useMemo(
    () =>
      filterScheduleItemsByVisibleDateRange(
        calendarScheduleItems,
        getCalendarViewDateRange(selectedDate, calendarViewMode),
      ).length,
    [calendarScheduleItems, calendarViewMode, selectedDate],
  );
  const hiddenActiveGameLabels = useMemo(() => {
    const labels: string[] = [];
    const seenLabels = new Set<string>();
    scheduleItems.forEach((item) => {
      const gameId = item.gameId;
      if (!gameId || activeGameIds.includes(gameId)) return;
      const label = item.gameName ?? item.game ?? gameId;
      if (seenLabels.has(label)) return;
      seenLabels.add(label);
      labels.push(label);
    });
    return labels.slice(0, 3);
  }, [activeGameIds, scheduleItems]);
  const scheduleDataStatus = createScheduleDataStatus(
    { isLoading: false, isError: false, isFetching: false },
    {
      remoteItemCount: scheduleItems.length,
      activeGameItemCount: activeGameScheduleItems.length,
      categoryItemCount: calendarScheduleItems.length,
      visibleRangeItemCount: visibleRangeScheduleItemCount,
      excludedItemCount: 0,
      viewMode: calendarViewMode,
      hiddenGameLabels: hiddenActiveGameLabels,
    },
  );

  // 로딩·오류·빈 결과의 원본 상태는 보존하고, 정상 조회 성공 안내만 숨긴다.
  const visibleDataStatus = scheduleDataStatus.tone === "live" && visibleRangeScheduleItemCount > 0
    ? null
    : scheduleDataStatus;

  const toggleCategory = (categoryId: CategoryId) => {
    setVisibleCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };
  const addGame = (gameId: string) => {
    setAddedGameIds((current) =>
      current.includes(gameId) ? current : [...current, gameId],
    );
    setActiveGameIds((current) =>
      current.includes(gameId) ? current : [...current, gameId],
    );
  };
  const toggleGameActive = (gameId: string) => {
    setActiveGameIds((current) =>
      current.includes(gameId)
        ? current.filter((id) => id !== gameId)
        : [...current, gameId],
    );
  };
  const activateAllGames = () => {
    const gameIds = availableGames.map((game) => game.id);
    setAddedGameIds(gameIds);
    setActiveGameIds(gameIds);
  };

  return (
    <div className={styles.screen}>
      <div
        className={[
          "grid h-[720px] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[14px] bg-[#111111] text-[#e7e7e7] transition-[grid-template-columns] duration-200 motion-reduce:transition-none",
          imminentScheduleCollapsed
            ? "grid-cols-[300px_56px_minmax(0,1fr)]"
            : "grid-cols-[300px_minmax(248px,280px)_minmax(0,1fr)]",
        ].join(" ")}
      >
        <DashboardSidebar
          today={today}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          categories={mockCategories}
          visibleCategoryIds={visibleCategoryIds}
          onToggleCategory={toggleCategory}
          availableGames={availableGames}
          addedGameIds={addedGameIds}
          activeGameIds={activeGameIds}
          onAddGame={addGame}
          onToggleGameActive={toggleGameActive}
          onActivateAllGames={activateAllGames}
        />
        <ImminentSchedule
          collapsed={imminentScheduleCollapsed}
          items={visibleImminentScheduleItems}
          dataStatus={visibleDataStatus}
          onToggleCollapsed={() => setImminentScheduleCollapsed((value) => !value)}
        />
        <CalendarWorkspace
          today={today}
          selectedDate={selectedDate}
          viewMode={calendarViewMode}
          items={calendarScheduleItems}
          activeGameCount={activeGameIds.length}
          visibleCategoryIds={visibleCategoryIds}
          dataStatus={visibleDataStatus}
          onSelectedDateChange={setSelectedDate}
          onViewModeChange={setCalendarViewMode}
          onToday={() => setSelectedDate(today)}
          onPreviousPeriod={() =>
            setSelectedDate((date) => shiftCalendarDate(date, calendarViewMode, -1))
          }
          onNextPeriod={() =>
            setSelectedDate((date) => shiftCalendarDate(date, calendarViewMode, 1))
          }
        />
      </div>
    </div>
  );
}
