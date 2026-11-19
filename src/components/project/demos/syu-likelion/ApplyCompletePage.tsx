/**
 * 원본: features/public/apply/ApplyCompletePage.tsx · feat/#36 · 763061c
 * 변경: 조회·인증·라우터·삭제 요청·취소 확인 창을 걷어 내고 canEdit만 받아 그리도록 분리. 원본 cancelDisabledReason 중 canEdit에 해당하는 문구 유지. 수정·취소는 비이동 button이며 둘 다 canEdit으로 활성화. 토큰·그림 경로 범위화, h1을 p로 변경. 사이트 헤더가 없는 데모라 상단 여백을 32px로 줄이고 하단 여백은 유지.
 */
import Image from "next/image";

import styles from "./service.module.css";

type ApplyCompletePageProps = { canEdit: boolean };

export default function ApplyCompletePage({ canEdit }: ApplyCompletePageProps) {
  const cancelDisabledReason = canEdit
    ? ""
    : "지원서를 수정할 수 없는 기간입니다. 지원 취소도 불가능합니다.";

  return (
    <section className={`${styles.screen} bg-(--syu-background) px-4 pb-16 pt-8 text-(--syu-white) lg:px-6 lg:pb-24`}>
      <div className="mx-auto flex w-full max-w-290 flex-col items-center text-center">
        <Image
          src="/images/projects/syu-likelion/result/standing-thankyou.webp"
          alt="지원 완료 라이언"
          width={180}
          height={180}
          className="h-auto w-[130px] lg:w-[180px]"
          priority
        />

        <p className="mt-4 text-[28px] font-bold leading-[1.27] text-(--syu-main-3) lg:mt-6 lg:text-[48px]">
          LIKELION at SYU 14th
        </p>
        <p className="mt-3 text-[18px] font-bold leading-[1.27] lg:mt-0 lg:text-[48px]">
          아기사자 지원서 제출이 정상적으로
          <br className="lg:hidden" /> 완료되었습니다.
        </p>

        <div className="mt-7.75 w-full max-w-[940px] rounded-[20px] bg-(--syu-surface) p-5 leading-[1.9] lg:mt-14.25 lg:px-26.25 lg:py-6.25">
          <p className="text-[12px] font-light text-(--syu-gray-3) lg:text-[16px]">
            <span className="font-bold">1차 합격 결과 </span> 3월 13일 10시
            홈페이지 발표
          </p>
          <p className="text-[12px] font-light text-(--syu-gray-3) lg:text-[16px]">
            <span className="font-bold">2차 면접 기간 </span> 3월 15일 ~ 3월
            17일
          </p>
          <p className="mt-8 break-keep text-[14px] font-bold text-(--syu-gray-3) lg:text-[18px]">
            합격 후 면접 날짜 및 시간은 홈페이지를 통해 신청 받습니다. 미지정 시
            면접 진행 불가하니 유의 바랍니다.
          </p>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3 lg:mt-21.5 lg:gap-5.5">
          <button
            type="button"
            disabled={!canEdit}
            title={cancelDisabledReason || undefined}
            className="rounded-[14px] disabled:cursor-not-allowed disabled:opacity-60 bg-(--syu-main-1) px-8.5 py-4 text-[18px] font-bold text-(--syu-white) transition-opacity hover:opacity-90 lg:px-13.5 lg:py-6 lg:text-[24px]"
          >
            지원서 수정
          </button>
          <button
            type="button"
            disabled={!canEdit}
            title={cancelDisabledReason || undefined}
            className="rounded-[14px] bg-(--syu-gray-5) px-10.5 py-4 cursor-pointer text-[18px] font-bold text-(--syu-surface) disabled:cursor-not-allowed disabled:opacity-60 hover:bg-(--syu-red-400) hover:text-(--syu-white-1) lg:px-16 lg:py-6 lg:text-[24px]"
          >
            지원 취소
          </button>
        </div>

        {cancelDisabledReason && (
          <p className="mt-3 text-[12px] text-(--syu-gray-4) lg:text-[14px]">
            {cancelDisabledReason}
          </p>
        )}

        <div className="mt-11 text-[12px] font-light leading-[1.9] text-(--syu-gray-5) lg:mt-9 lg:text-[16px]">
          <p>* 서류 마감 기간 이후에는 지원서 수정이 불가능합니다.</p>
          <p>* 지원 취소 버튼은 취소 가능한 기간에만 활성화됩니다.</p>
          <p>* 반드시 제출 기한이 지나기 전 수정을 완료해 주세요.</p>
        </div>
      </div>

    </section>
  );
}
