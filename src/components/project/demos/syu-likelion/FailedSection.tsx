/**
 * 원본: features/public/result/sections/FailedSection.tsx · feat/#36 · 763061c
 * 변경: 서류 불합격 화면만 이식하고 최종 불합격 분기·문구 제거. 클라이언트 선언 제거, 토큰·그림 경로 범위화, h1을 p로 변경하고 min-h-screen 제거. 메인 이동 링크를 이동하지 않는 button으로 변경. 사이트 헤더가 없는 데모라 상단 여백을 32px로 줄임.
 */
import Image from "next/image";

export type FailedStage = "DOCUMENT";

type FailedSectionProps = {
  stage: FailedStage;
  userName?: string | null;
};

const FAILED_COPY = {
  DOCUMENT: {
    titleLine1: "LIKELION at SYU 14th",
    titleLine2: "아기사자 1차 모집 결과 발표",
    getMessage: (name: string) => (
      <>
        {name} 님께서는 멋쟁이사자처럼 삼육대학교 14기 아기사자 모집에 1차{" "}
        <span className="text-(--syu-red-1)">불합격</span>하셨음을 안내드립니다.
        <br />
        <br className="lg:hidden block" />본 동아리에 관심을 가지고 지원해
        주셔서 진심으로 감사드립니다.
      </>
    ),
  },
} as const;

export default function FailedSection({ stage, userName }: FailedSectionProps) {
  const copy = FAILED_COPY[stage];
  const displayName = userName?.trim() ? userName.trim() : "지원자";

  return (
    <section className="bg-(--syu-background) px-4 pb-24 pt-8 text-(--syu-white) lg:px-6">
      <div className="mx-auto relative flex w-full max-w-[1160px] flex-col items-center">
        <p className="text-center leading-[1.27] text-[24px] lg:text-[48px] font-bold">
          <span className="block text-(--syu-main-3)">{copy.titleLine1}</span>
          <span className="block text-(--syu-white-1)">{copy.titleLine2}</span>
        </p>

        <div className="z-0 mt-12 lg:mt-20 mx-auto w-[110px] lg:w-[167px]">
          <Image
            src="/images/projects/syu-likelion/result/peek.webp"
            alt="라이언 빼꼼"
            width={476}
            height={408}
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="w-full z-10 rounded-[20px] bg-(--syu-gray-7) px-10 py-4.5 text-center font-semibold text-[14px] leading-[1.27] text-(--syu-gray-3) lg:px-26.75 lg:py-11.5 lg:text-[24px]">
          {copy.getMessage(displayName)}
        </div>

        <button
          type="button"
          className="mt-23 inline-flex items-center justify-center rounded-full bg-(--syu-gray-6) px-5.5 py-4.5 lg:px-17 lg:py-5 text-[14px] font-bold text-(--syu-white-1) transition-colors lg:text-[28px] hover:bg-[#626A7F] lg:mt-28"
        >
          메인페이지로 돌아가기
        </button>
      </div>
    </section>
  );
}
