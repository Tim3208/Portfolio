/** 교육 경험과 수치의 근거: docs/content.md#teaching, #volunteer */
/** 홈 교육 경험 섹션과 /teaching 의 머리 문장 */
export const TEACHING_LEAD =
  "동아리 부원에게 프론트엔드 개발을, 고등학생과 재수생에게 수학을 가르쳤습니다. 캄보디아와 베트남에서는 영어로 IT 수업을 진행했습니다.";

export const TRANSLATION = [
  {
    audience: "학생에게 설명할 때",
    detail: "학생이 이해한 내용을 확인하고 설명 방식, 난이도, 진도와 수업 자료를 조정했습니다.",
  },
  {
    audience: "디자이너와 화면을 만들 때",
    detail: "화면의 의도를 컴포넌트와 상태로 옮기고, 예외 상황에서 어떻게 보여줄지 다시 확인했습니다.",
  },
  {
    audience: "백엔드 개발자와 연동할 때",
    detail: "필드의 의미와 응답 형태를 문서로 확인하고, 명세와 실제 응답이 다른 부분을 대조했습니다.",
  },
] as const;

export type TeachingActivity = {
  title: string;
  period: string;
  summary: string;
  detail: string;
  projectLink?: { href: string; label: string };
};

export const TEACHING_ACTIVITIES: readonly TeachingActivity[] = [
  {
    title: "멋쟁이사자처럼 프론트엔드 교육",
    period: "2026 — 현재",
    summary: "부원 27명 대상 HTML·CSS·React·AI 활용 개발 교육 및 해커톤 멘토링",
    detail:
      "14기 프론트엔드 운영진으로 매주 세션과 스터디를 열고, 직접 만든 동아리 플랫폼으로 과제 제출·승인·반려와 개별 피드백을 운영했습니다. 중앙 해커톤에서는 참가 팀 멘토로 막힌 구간을 함께 짚고 기술 방향을 제안했습니다.",
    projectLink: {
      href: "/projects/syu-likelion",
      label: "운영에 쓴 syu-likelion 작업 과정 보기",
    },
  },
  {
    title: "베트남 IT 교육 봉사",
    period: "2026.07",
    summary: "영어 80시간 · 대학생 약 8명 대상 HTML·CSS·JavaScript 기초 웹 수업",
    detail:
      "World Friends Korea 활동으로 University of Science and Education에서 2주간 수업했습니다. 학생별 진도 차이에 맞춰 전체 속도를 조절하고, 보조 강의자와 역할을 나눠 개별 실습을 도왔습니다.",
  },
  {
    title: "고등학생 수학 개인과외",
    period: "2022 — 2026.07",
    summary: "고1~재수생 8명 1:1 지도 · 7~9등급에서 최고 2등급까지 향상",
    detail:
      "군 복무 기간을 제외하고 꾸준히 1:1 수업을 맡았습니다. 학생 이해도에 맞춰 설명과 문제 난이도를 바꿨고, 학부모에게는 성취도와 학습 태도, 보완할 점을 정리한 피드백을 주기적으로 공유했습니다.",
  },
  {
    title: "캄보디아 IT 교육 봉사",
    period: "2025.07",
    summary: "영어 80시간 · 약 20명 대상 Google Workspace 도구 수업",
    detail:
      "World Friends Korea 활동으로 Battambang Teacher Education College에서 2주간 Google Forms·Calendar·Drive·Meet 사용법을 가르쳤습니다.",
  },
];

export const TEACHING_METRICS = [
  { value: "27", label: "프론트엔드 교육 인원" },
  { value: "8", label: "1:1 수학 지도 학생" },
  { value: "160", label: "두 나라에서 진행한 IT 교육 시간" },
] as const;
