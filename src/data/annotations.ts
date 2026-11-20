/**
 * 실제 스크린샷 위의 주석.
 *
 * 같은 이미지는 홈 · 목록 · 상세 어디에 놓여도 같은 주석을 단다. 그래서 주석은
 * 이미지 경로로 찾고, 위치는 원본 이미지 기준 백분율로 적는다. 잘라 보여주는
 * 자리에서는 Shot 이 잘린 범위에 맞춰 위치를 다시 계산하고, 잘려 나간 주석은
 * 번호째 빼고 나머지를 다시 번호 매긴다.
 *
 * 주석은 화면이 "무엇을 하는지"가 아니라 그 자리에서 내린 판단을 짚는다.
 * 문장의 근거는 해당 프로젝트의 projects.ts · caseStudies 서술과 docs/content.md 다.
 * 점은 설명하는 요소를 덮지 않도록 그 옆 여백에 둔다.
 */

export type Note = {
  /** 원본 이미지 기준 가로 위치 (%) */
  x: number;
  /** 원본 이미지 기준 세로 위치 (%) */
  y: number;
  text: string;
};

export type ShotInfo = {
  /** 원본 픽셀 크기 — 잘린 자리에서 주석 위치를 다시 계산할 때 쓴다 */
  width: number;
  height: number;
  notes?: readonly Note[];
};

export const SHOTS: Record<string, ShotInfo> = {
  // evaluation-screen 데모를 가상 지원자로 캡처한 화면이다 (2524 × 1866, 표시 기준 1262 × 933)
  "/images/projects/syu-likelion-evaluation.png": {
    width: 1262,
    height: 933,
    notes: [
      { x: 29.4, y: 13.4, text: "지원자 목록을 서류 지원자부터 최종 합격자까지 모집 단계별로 나눴습니다." },
      { x: 32.6, y: 44.5, text: "지원자 한 명 안에서 서류 보기 · 점수 매기기 · 점수 현황만 바꿔 봅니다." },
      { x: 32.6, y: 67.2, text: "총점이 같아도 어느 문항에서 갈렸는지 보이도록 문항별 점수를 함께 둡니다." },
    ],
  },
  "/images/projects/apply/application-submitted.png": {
    width: 1920,
    height: 1249,
    notes: [
      { x: 24, y: 59.2, text: "1차 결과 발표일과 면접 기간을 제출 완료 화면에 함께 적었습니다." },
      { x: 36, y: 80, text: "서류 마감 전까지는 지원서 수정과 지원 취소를 할 수 있습니다." },
      { x: 38.5, y: 87.3, text: "수정이 불가능해지는 시점을 버튼 바로 아래에 안내합니다." },
    ],
  },
  "/images/projects/apply/first-result-interview.png": {
    width: 1920,
    height: 2685,
    notes: [
      { x: 17.5, y: 25.8, text: "서류 합격 안내 바로 아래에서 면접 일정을 고릅니다." },
      { x: 46.5, y: 38.3, text: "달력에서 날짜를 고르면 20분 간격의 시간대가 옆에 나타납니다." },
    ],
  },
  "/images/projects/syu-likelion-mypage.png": { width: 1920, height: 2110 },
  "/images/projects/syu-likelion.png": { width: 1600, height: 1079 },
  // 상세 04 스탬프 데모 · 08 입력 검증 데모의 서비스 화면을 샘플 데이터로 캡처했다 (782 × 1596, 표시 기준 391 × 798)
  "/images/projects/make-a-wish.png": {
    width: 391,
    height: 798,
    notes: [
      { x: 21.5, y: 26.5, text: "받은 스탬프는 지급 시각과 부스 분류를 기준으로 별자리에 놓습니다." },
      { x: 11, y: 58, text: "응답이 누락되거나 꼬이면 빈 스탬프판으로 그리지 않고 오류로 구분합니다." },
    ],
  },
  "/images/projects/make-a-wish-welcome.png": {
    width: 391,
    height: 798,
    notes: [
      { x: 27.5, y: 43.2, text: "이름에 HTML 마크업을 넣어도 실행하지 않고 글자 그대로 보여줍니다." },
      { x: 90, y: 37.5, text: "납부자 표시인 별은 학생회비 납부 값이 boolean true일 때만 그립니다." },
    ],
  },
  "/images/projects/eodiya.png": {
    width: 1090,
    height: 720,
    notes: [
      { x: 39.8, y: 14.3, text: "장소명 · 건물과 층 · 층별 시설 설명을 모두 검색 대상으로 둡니다." },
      { x: 39.8, y: 29, text: "건물을 찾는 경우와 건물 안 시설을 찾는 경우를 필터로 나눴습니다." },
      { x: 39.8, y: 45.8, text: "건물 앞에 도착한 뒤에도 강의실을 찾도록 층별 정보를 함께 보여줍니다." },
      { x: 76.9, y: 52.8, text: "결과를 고르면 지도 이동 · Marker · 상세 정보가 한 번에 바뀝니다." },
    ],
  },
  "/images/projects/oshi-calendar.png": {
    width: 1827,
    height: 841,
    notes: [
      { x: 8, y: 4.8, text: "날짜로 일정을 찾는 캘린더는 좌측 레일에 남겼습니다." },
      { x: 17.2, y: 8.7, text: "첫 자리는 종료 임박 일정입니다. D-3 · D-5처럼 남은 일수를 바로 보여줍니다." },
      { x: 36, y: 8, text: "그 옆에 오늘 할 일을 둡니다." },
      { x: 64.6, y: 7.7, text: "보상 현황도 같은 화면에서 확인합니다. 표시된 수치는 목업 데이터입니다." },
    ],
  },
};
