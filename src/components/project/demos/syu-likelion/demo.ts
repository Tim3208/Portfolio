import { resolveReservationFeedback } from "./reserve";
import type { DashboardForResultResponse, InterviewReservation, InterviewSlot } from "./type";

/**
 * 샘플 응답 공급부. 원본 features/public/result/ResultStatusPage.tsx (763061c)의
 * 조회·예약 요청만 메모리 상태로 대신하며, 화면과 상태 판정·실패 문구는 이식한 코드를 쓴다.
 * 실제 인물이나 현재 시각에 의존하지 않는다.
 */
export const SCENARIOS = [
  { value: "submitted", label: "제출 완료" },
  { value: "pending", label: "발표 전" },
  { value: "failed", label: "서류 불합격" },
  { value: "passed", label: "서류 합격" },
] as const;

export type Scenario = (typeof SCENARIOS)[number]["value"];
export type DemoState = {
  scenario: Scenario;
  deadlinePassed: boolean;
  outsidePeriod: boolean;
  takenByOther: boolean;
  slots: InterviewSlot[];
  reservation: InterviewReservation | null;
  errorMessage: string;
  successMessage: string;
  visit: number;
};

export type DemoAction =
  | { type: "scenario"; value: Scenario }
  | { type: "deadline" | "period" | "race"; checked: boolean }
  | { type: "reserve"; slotId: number }
  | { type: "clear" };

/** 일·월·화, 20분 간격. 마감 플래그와 잔여 0을 각각 섞어 원본 조건을 통과시킨다. */
export function makeSlots(): InterviewSlot[] {
  return ["2026-03-15", "2026-03-16", "2026-03-17"].flatMap((day, dayIndex) =>
    Array.from({ length: 9 }, (_, index) => {
      const minutes = 10 * 60 + index * 20;
      const time = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}:00+09:00`;
      return {
        slotId: dayIndex * 9 + index + 1,
        startAt: `${day}T${time(minutes)}`,
        endAt: `${day}T${time(minutes + 20)}`,
        location: dayIndex === 0 ? "삼육대학교 도서관 스터디룸 304호" : "삼육대학교 학생회관 304호",
        available: index !== 1,
        closed: index === 1,
        remainingCount: index === 3 ? 0 : 1,
      };
    }),
  );
}

export function initialDemoState(): DemoState {
  return {
    scenario: "passed",
    deadlinePassed: false,
    outsidePeriod: false,
    takenByOther: false,
    slots: makeSlots(),
    reservation: null,
    errorMessage: "",
    successMessage: "",
    visit: 0,
  };
}

export function makeDashboard(state: DemoState): DashboardForResultResponse {
  const submitted = state.scenario === "submitted";
  const pending = state.scenario === "pending";
  const passed = state.scenario === "passed";
  return {
    serverTime: state.scenario === "passed" && state.outsidePeriod
      ? "2026-03-18T10:00:00+09:00"
      : submitted && !state.deadlinePassed
      ? "2026-03-12T12:00:00+09:00"
      : pending ? "2026-03-13T09:00:00+09:00" : "2026-03-13T10:00:00+09:00",
    recruitment: {
      recruitmentId: 14,
      generation: 14,
      title: "멋쟁이사자처럼 삼육대학교 14기 아기사자 모집",
      phaseType: submitted
        ? state.deadlinePassed ? "DOC_CLOSED" : "DOC_OPEN"
        : pending ? "DOC_EVALUATING"
          : state.outsidePeriod ? "INTERVIEW_EVALUATING" : "INTERVIEW_SELECT",
      docStartAt: "2026-03-02T00:00:00+09:00",
      docEndAt: "2026-03-12T23:59:59+09:00",
    },
    myApplication: {
      applicationId: 1,
      applyPart: "FRONTEND",
      status: submitted || pending ? "SUBMITTED" : passed ? "DOC_PASSED" : "DOC_FAILED",
      canEdit: submitted && !state.deadlinePassed,
      canSubmit: false,
    },
    documentResult: {
      visible: !submitted && !pending,
      result: submitted || pending ? null : passed ? "PASS" : "FAIL",
    },
    interview: {
      canReserve: passed && !state.outsidePeriod,
      myReservation: passed ? state.reservation : null,
    },
  };
}

export function makeResponse(state: DemoState) {
  return { dashboard: makeDashboard(state), slots: state.scenario === "passed" ? state.slots : [] };
}

function closeSlot(slots: InterviewSlot[], slotId: number): InterviewSlot[] {
  return slots.map((slot) => slot.slotId === slotId ? {
    ...slot,
    available: false,
    closed: true,
    remainingCount: slot.remainingCount === null ? null : Math.max(slot.remainingCount - 1, 0),
  } : slot);
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "scenario") {
    return { ...initialDemoState(), scenario: action.value, visit: state.visit + 1 };
  }
  if (action.type === "deadline") return { ...state, deadlinePassed: action.checked };
  if (action.type === "period") return { ...state, outsidePeriod: action.checked, errorMessage: "", successMessage: "" };
  if (action.type === "race") return { ...state, takenByOther: action.checked };
  if (action.type === "clear") {
    if (!state.reservation) return state;
    const originalSlot = makeSlots().find(({ slotId }) => slotId === state.reservation?.slotId);
    return {
      ...state,
      slots: state.slots.map((slot) => slot.slotId === originalSlot?.slotId ? originalSlot : slot),
      reservation: null,
      errorMessage: "",
      successMessage: "",
      visit: state.visit + 1,
    };
  }
  if (action.type !== "reserve" || state.scenario !== "passed") return state;

  const dashboard = makeDashboard(state);
  // 원본 handleReserveInterview의 선행 가드와 같은 순서다.
  if (!dashboard.interview.canReserve) {
    return { ...state, errorMessage: "현재 면접 일정 선택 기간이 아닙니다.", successMessage: "" };
  }
  if (state.reservation) return state;

  const slot = state.slots.find(({ slotId }) => slotId === action.slotId);
  const nextSlots = state.takenByOther ? closeSlot(state.slots, action.slotId) : state.slots;
  if (!slot || state.takenByOther || !slot.available || slot.closed || (slot.remainingCount !== null && slot.remainingCount <= 0)) {
    const feedback = resolveReservationFeedback({
      slotId: action.slotId,
      nextDashboard: dashboard,
      nextSlots,
      slots: state.slots,
      canReserveInterview: dashboard.interview.canReserve,
      errorCode: "SLOT_UNAVAILABLE",
    });
    return { ...state, slots: nextSlots, errorMessage: feedback.errorMessage, successMessage: feedback.successMessage };
  }

  return {
    ...state,
    slots: closeSlot(state.slots, action.slotId),
    reservation: { slotId: slot.slotId, startAt: slot.startAt, endAt: slot.endAt, location: slot.location },
    errorMessage: "",
    successMessage: "면접 일정이 확정되었습니다.",
  };
}
