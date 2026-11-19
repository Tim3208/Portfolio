/**
 * 원본: features/public/result/sections/ReservedSection.tsx · feat/#36 · 763061c
 * 변경: 클라이언트 선언 제거, 토큰·그림 경로 범위화, h1을 p로 변경하고 min-h-screen 제거. 메인 이동 링크를 이동하지 않는 button으로 변경하고 좁은 폭에서 확인 버튼 최소 폭 해제. 사이트 헤더가 없는 데모라 상단 여백을 32px로 줄임. 날짜 표시와 안내 문구는 유지.
 */
import Image from "next/image";
import type { InterviewReservation } from "./type";

type ReservedSectionProps = {
  reservation: InterviewReservation;
  location?: string | null;
};

const DATE_WITH_TZ_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;

const parseDateWithKstFallback = (value: string) => {
  const normalized = DATE_WITH_TZ_PATTERN.test(value)
    ? value
    : `${value}+09:00`;
  return new Date(normalized);
};

const formatKstDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseDateWithKstFallback(value));

const formatKstTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parseDateWithKstFallback(value));

export default function ReservedSection({
  reservation,
  location,
}: ReservedSectionProps) {
  const interviewDate = formatKstDate(reservation.startAt);
  const interviewTimeRange = `${formatKstTime(reservation.startAt)}-${formatKstTime(
    reservation.endAt,
  )}`;
  const interviewLocation =
    location ??
    reservation.location ??
    "면접 장소는 운영진 안내를 확인해 주세요.";

  return (
    <section className="bg-(--syu-background) px-4 pb-24 pt-8 text-(--syu-white) lg:px-6">
      <div className="mx-auto flex w-full max-w-[980px] flex-col items-center">
        <p className="flex flex-col items-center text-center leading-[1.2] font-bold">
          <Image
            src="/images/projects/syu-likelion/result/standing-thankyou.webp"
            alt="예약 완료 라이언"
            width={180}
            height={180}
            className="h-auto w-[130px] lg:w-[180px]"
            priority
          />
          <span className="mt-5 lg:mt-6 block text-[28px] font-bold text-(--syu-main-3) lg:text-[48px]">
            LIKELION at SYU 14th
          </span>
          <span className="mt-3 lg:mt-0 block text-[18px] font-bold text-(--syu-white-1) lg:text-[48px]">
            면접 예약이 완료되었습니다.
          </span>
        </p>

        <div className="mt-12 w-full rounded-[20px] bg-[#343740]/90 px-6 py-8 text-center text-[20px] leading-[1.65] text-[#E6EAF2] lg:px-14 lg:py-10 lg:text-[34px]">
          면접 일정이 확정되었습니다.
          <br />
          아래 예약 정보를 확인해 주세요.
        </div>

        <div className="mt-8 w-full rounded-[16px] border border-[#5A6378] bg-[#2F333D] px-6 py-7 lg:px-10 lg:py-9">
          <div className="space-y-6">
            <div>
              <p className="text-[14px] font-semibold text-(--syu-main-3) lg:text-[18px]">
                면접 일시
              </p>
              <p className="mt-1 text-[20px] font-semibold text-(--syu-white) lg:text-[30px]">
                {interviewDate} / {interviewTimeRange}
              </p>
            </div>

            <div>
              <p className="text-[14px] font-semibold text-(--syu-main-3) lg:text-[18px]">
                면접 장소
              </p>
              <p className="mt-1 text-[20px] font-semibold text-(--syu-white) lg:text-[30px]">
                {interviewLocation}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-14 inline-flex h-[72px] w-full max-w-[430px] min-w-0 items-center justify-center rounded-full bg-(--syu-main-1) px-10 text-[32px] font-bold text-(--syu-white) transition-colors hover:bg-[#3A79D7] lg:min-w-[430px] lg:text-[36px]"
        >
          확인
        </button>
      </div>
    </section>
  );
}
