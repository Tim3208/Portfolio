/**
 * 원본: features/public/result/ResultStatusPage.tsx · feat/#36 · 763061c
 * 변경: 조회·인증·라우터·로딩 처리를 제거하고 샘플 응답·예약 액션을 props로 받도록 분리.
 * resolveResultStatus와 공개 여부·서류 결과·예약 여부의 분기 순서·문구를 보존하며 최종 합격과
 * 최종 불합격 화면은 제외. 토큰을 범위화하고 min-h-screen 제거, h2를 p로 변경.
 * 지원하러 가기 링크를 비이동 button으로 바꾸며 화면을 service.module.css로 감싼다.
 * 사이트 헤더가 없는 데모라 상단 여백을 32px로 줄인다.
 */
import { getRecruitmentPhaseLabel } from "./recruitmentPhase";
import { resolveResultStatus } from "./status";
import type { DashboardForResultResponse, InterviewSlot, PhaseType } from "./type";
import FailedSection from "./FailedSection";
import PassedSection from "./PassedSection";
import ReservedSection from "./ReservedSection";
import styles from "./service.module.css";

type ResultStatusScreenProps = {
  dashboard: DashboardForResultResponse;
  slots: InterviewSlot[];
  phaseType: PhaseType;
  userName?: string;
  reserveErrorMessage: string;
  reserveSuccessMessage: string;
  onReserve: (slotId: number) => Promise<void>;
  isReserving: boolean;
};

function ResultContent({
  dashboard,
  slots,
  phaseType,
  userName,
  reserveErrorMessage,
  reserveSuccessMessage,
  onReserve,
  isReserving,
}: ResultStatusScreenProps) {
  const status = resolveResultStatus({
    dashboardStatus: dashboard.myApplication?.status,
    applicationStatus: null,
    isDocumentResultVisible: dashboard.documentResult.visible === true,
    documentResult: dashboard.documentResult.result,
  });
  const reservation = dashboard.interview?.myReservation ?? null;
  const matchedSlot = reservation
    ? slots.find((slot) => slot.slotId === reservation.slotId)
    : null;
  const reservationLocation =
    matchedSlot?.location ?? reservation?.location ?? null;
  const hasDashboardApplication = dashboard.myApplication != null;
  const canReserveInterview = dashboard.interview?.canReserve === true;
  const isFinalResultStatus =
    status === "FINAL_FAILED" || status === "FINAL_PASSED";
  const isResultVisible =
    dashboard.documentResult.visible === true || isFinalResultStatus;

  if (!hasDashboardApplication && status === null) {
    return (
      <section className="bg-(--syu-background) px-4 pt-8 text-(--syu-white) lg:px-6">
        <div className="mx-auto w-full max-w-[980px] rounded-[16px] bg-[#343740] px-8 py-12 text-center">
          <p className="text-[30px] font-bold text-(--syu-main-3) lg:text-[44px]">
            지원 내역이 없습니다
          </p>
          <p className="mt-4 text-[18px] text-(--syu-white)/80 lg:text-[24px]">
            해당 모집에 제출된 지원서를 먼저 작성해 주세요.
          </p>
          <button
            type="button"
            className="mt-8 inline-flex h-[56px] items-center justify-center rounded-full bg-(--syu-main-1) px-8 text-[18px] font-semibold text-(--syu-white)"
          >
            지원하러 가기
          </button>
        </div>
      </section>
    );
  }

  if (!isResultVisible) {
    return (
      <section className="bg-(--syu-background) px-4 pt-8 text-(--syu-white) lg:px-6">
        <div className="mx-auto w-full max-w-[980px] rounded-[16px] bg-[#343740] px-8 py-12 text-center">
          <p className="text-[30px] font-bold text-(--syu-main-3) lg:text-[44px]">
            결과 확인 준비중
          </p>
          <p className="mt-4 text-[18px] text-(--syu-white)/80 lg:text-[24px]">
            아직 결과 발표 전입니다.
          </p>
          {phaseType && (
            <p className="mt-3 text-[14px] text-(--syu-white)/55 lg:text-[16px]">
              현재 모집 단계: {getRecruitmentPhaseLabel(phaseType)}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (status === "DOC_FAILED") {
    return <FailedSection stage="DOCUMENT" userName={userName} />;
  }

  if (status === "DOC_PASSED") {
    if (reservation) {
      return <ReservedSection reservation={reservation} location={reservationLocation} />;
    }

    return (
      <PassedSection
        userName={userName}
        slots={slots}
        reservation={reservation}
        canReserve={canReserveInterview}
        isReserving={isReserving}
        reserveErrorMessage={reserveErrorMessage}
        reserveSuccessMessage={reserveSuccessMessage}
        onReserve={onReserve}
      />
    );
  }

  return (
    <section className="bg-(--syu-background) px-4 pt-8 text-(--syu-white) lg:px-6">
      <div className="mx-auto w-full max-w-[980px] rounded-[16px] bg-[#343740] px-8 py-12 text-center">
        <p className="text-[30px] font-bold text-(--syu-main-3) lg:text-[44px]">
          결과 정보를 확인할 수 없습니다
        </p>
        <p className="mt-4 text-[18px] text-(--syu-white)/80 lg:text-[24px]">
          잠시 후 다시 시도해 보시거나 운영진에게 문의 바랍니다.
        </p>
      </div>
    </section>
  );
}

/** 동일한 상태 판정과 분기를 범위가 격리된 서비스 화면에 적용한다. */
export function ResultStatusScreen(props: ResultStatusScreenProps) {
  return (
    <div className={styles.screen}>
      <ResultContent {...props} />
    </div>
  );
}
