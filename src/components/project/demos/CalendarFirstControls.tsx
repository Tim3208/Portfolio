"use client";

import { useState } from "react";
import { TZDate } from "@date-fns/tz";
import { addDays, format } from "date-fns";
import { ko } from "date-fns/locale";

import { DashboardPage } from "./oshi-calendar/DashboardPage";
import { INITIAL_TODAY_ISO, SAMPLE_ITEMS } from "./oshi-calendar/fixture";
import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";
import styles from "./CalendarFirstDemo.module.css";

/** 데모에만 있는 시각 이동은 화면 밖에 둔다. KST 정오와 ±7일 범위를 고정한다. */
export function CalendarFirstControls() {
  const [dayOffset, setDayOffset] = useState(0);
  const today = addDays(new TZDate(INITIAL_TODAY_ISO, "Asia/Seoul"), dayOffset);

  return (
    <DemoLayout variant="wide">
      <div className="min-w-0">
        <DeferredDemoFrame
          variant="wide"
          designWidth={1280}
          designHeight={800}
          scaleAtAllWidths
          resetKey={dayOffset}
          label="Oshi Calendar 바꾸기 전 첫 화면"
          className={styles.frame}
          placeholder={<div className={styles.placeholder} aria-hidden="true" />}
        >
          {/* 원본 기본값은 주간이며, 날짜 칸의 겹침을 보여주는 데모만 월간으로 시작한다. */}
          <DashboardPage today={today} items={SAMPLE_ITEMS} initialViewMode="month" />
        </DeferredDemoFrame>
        <p className="mt-2 text-sm text-ink-2 lg:hidden">
          넓은 화면에서는 캘린더와 게임 허브를 직접 조작할 수 있습니다.
        </p>
      </div>
      <DemoPanel
        label="같은 일정, 두 가지 보기"
        intro={
          <>
            <p className="font-semibold">같은 일정, 두 가지 보기</p>
            <p className="text-sm text-ink-2">가운데 캘린더에서 종료일까지 남은 날을 세어 보세요. 왼쪽 임박 일정은 같은 일정을 남은 일수로 보여줍니다.</p>
          </>
        }
        controls={
          <div className={styles.dateControls}>
            <span className={styles.controlLabel}>오늘 옮기기</span>
            <div className={styles.dateNavigation}>
              <button type="button" className={styles.button} disabled={dayOffset === -7} onClick={() => setDayOffset((value) => Math.max(-7, value - 1))}>하루 전</button>
              <span role="status" className={styles.currentDate}>
                <time dateTime={format(today, "yyyy-MM-dd")}>{format(today, "yyyy.MM.dd (EEE)", { locale: ko })}</time>
              </span>
              <button type="button" className={styles.button} disabled={dayOffset === 7} onClick={() => setDayOffset((value) => Math.min(7, value + 1))}>하루 뒤</button>
            </div>
            <button type="button" className={`${styles.button} ${styles.reset}`} disabled={dayOffset === 0} onClick={() => setDayOffset(0)}>처음으로</button>
          </div>
        }
      />
    </DemoLayout>
  );
}
