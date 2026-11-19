/**
 * 원본: features/public/result/ResultStatusPage.tsx handleReserveInterview · feat/#36 · 763061c
 * 변경: 컨테이너의 catch 분기를 순수 함수로 분리. API 오류 파싱·재조회·React 상태 갱신은
 * 호출자가 맡고, 갱신 응답과 오류 코드를 받는다. 실패 조건의 순서·문구와 최신 예약 반영 유지.
 */
import type {
  DashboardForResultResponse,
  InterviewReservation,
  InterviewSlot,
} from "./type";

type ReservationFeedbackInput = {
  slotId: number;
  nextDashboard: DashboardForResultResponse | null;
  nextSlots: InterviewSlot[] | null;
  slots: InterviewSlot[];
  canReserveInterview: boolean;
  errorCode?: string | null;
};

type ReservationFeedback = {
  latestReservation: InterviewReservation | null;
  errorMessage: string;
  successMessage: string;
};

/** 재조회 결과를 먼저 반영한 뒤 원본 순서로 예약 실패 사유를 결정한다. */
export function resolveReservationFeedback({
  slotId,
  nextDashboard,
  nextSlots,
  slots,
  canReserveInterview,
  errorCode,
}: ReservationFeedbackInput): ReservationFeedback {
  const latestReservation = nextDashboard?.interview?.myReservation ?? null;

  if (latestReservation) {
    return {
      latestReservation,
      errorMessage: "",
      successMessage: "면접 일정이 이미 확정되어 예약 완료 상태로 반영했습니다.",
    };
  }

  const latestCanReserve =
    nextDashboard?.interview?.canReserve ?? canReserveInterview;
  const attemptedSlot =
    nextSlots?.find((slot) => slot.slotId === slotId) ??
    slots.find((slot) => slot.slotId === slotId) ??
    null;
  const isAttemptedSlotUnavailable =
    attemptedSlot !== null &&
    (!attemptedSlot.available ||
      attemptedSlot.closed ||
      (attemptedSlot.remainingCount !== null &&
        attemptedSlot.remainingCount <= 0));

  let nextErrorMessage =
    "면접 시간 확정에 실패했습니다. 잠시 후 다시 시도해 보시거나 운영진에게 문의 바랍니다.";

  if (!latestCanReserve) {
    nextErrorMessage = "현재 면접 일정 선택 기간이 아닙니다.";
  } else if (isAttemptedSlotUnavailable) {
    nextErrorMessage =
      "방금 다른 사용자가 먼저 예약해 해당 면접 시간이 마감되었습니다. 다른 시간을 선택해 주세요.";
  } else if (errorCode === "ALREADY_RESERVED") {
    nextErrorMessage = "이미 면접 일정이 확정된 상태입니다.";
  } else if (errorCode === "RESERVATION_CLOSED") {
    nextErrorMessage = "현재 면접 일정 선택 기간이 아닙니다.";
  } else if (errorCode === "UNAUTHORIZED") {
    nextErrorMessage =
      "로그인 정보가 만료되었습니다. 다시 로그인한 뒤 시도해 주세요.";
  } else if (errorCode === "SLOT_UNAVAILABLE") {
    nextErrorMessage =
      "이미 마감된 면접 시간입니다. 다른 시간을 선택해 주세요.";
  }

  return {
    latestReservation,
    errorMessage: nextErrorMessage,
    successMessage: "",
  };
}
