import type { Hue } from "@/lib/hue";

/**
 * 프로젝트 데이터 — 화면 배치는 전부 이 파일의 필드에서 나온다.
 *
 * 프로젝트를 추가하거나 위상을 바꿀 때 컴포넌트를 고치지 않는다.
 *   · 새 프로젝트 → PROJECTS 에 항목 하나 추가 (원하는 위치에)
 *   · 대표로 올리기 → tier 를 "featured" 로
 *   · 상세 페이지 → src/data/caseStudies 에 같은 slug 로 등록
 * 배열 순서가 곧 노출 순서다. 대표의 첫 항목이 홈에서 가장 크게 나온다.
 *
 * 사실 근거는 docs/content.md 를 따른다. 기간·수치·링크는 확인된 것만 넣고,
 * 모르면 필드를 비운다. 화면은 비어 있는 필드를 그리지 않는다.
 */

/** featured: 홈과 /work 에 크게. supporting: /work 의 비교 목록과 홈 요약. */
/**
 * archive: 상세 페이지는 유지하되, 목록에서는 "기타 프로젝트" 양식으로 짧게만 보여준다.
 */
export type ProjectTier = "featured" | "supporting" | "archive";

/** 프로젝트의 성격. 홈의 "일하는 방식", 교육 경험의 "수업 도구" 처럼 자리를 정한다. */
export type ProjectKind =
  | "product"
  | "method"
  | "in-progress"
  | "teaching-tool"
  | "constraint"
  | "brief";

export const KIND_LABEL: Record<ProjectKind, string> = {
  product: "서비스",
  method: "AI WorkFlow",
  "in-progress": "개발 중",
  "teaching-tool": "교육 도구",
  constraint: "제약 환경",
  brief: "짧은 소개",
};

/** 확인된 수치. 팀 집계처럼 출처가 따로 있으면 source · asOf 를 함께 적는다. */
export type Metric = {
  value: string;
  label: string;
  source?: string;
  asOf?: string;
};

/**
 * 실제 화면 한 장. 화면 주석은 src/data/annotations.ts 가 이미지 경로로 찾아 붙인다.
 * aspectRatio · position 은 이 자리에서 잘라 보여줄 범위다.
 */
export type Screen = {
  src: string;
  alt: string;
  aspectRatio?: string;
  position?: string;
};

export type Project = {
  slug: string;
  name: string;
  tier: ProjectTier;
  kind: ProjectKind;
  /** 카드 제목 아래 한 줄 */
  headline: string;
  /** 무엇인지 설명하는 한 문장 */
  subtitle: string;
  /**
   * 무슨 서비스인지. 카드 제목은 "category - name" 으로 조합하고(displayTitle),
   * 탭·새 탭·이전/다음처럼 좁은 자리에는 name 만 쓴다. 비교 목록에서는 이름 위 라벨이 된다.
   * 없으면 kind 라벨(KIND_LABEL)로 대신한다.
   */
  category?: string;
  /** 출발점이 된 불편 */
  problem?: string;
  /** 대표로 보여줄 판단 하나 */
  decision?: string;
  /** 확인된 결과 한 줄 (수치가 없을 때 특히) */
  outcome?: string;
  role: string;
  team?: string;
  period?: string;
  status?: string;
  /**
   * 일하는 방식(kind: "method")에서 쓰는 원칙 목록. 서비스 프로젝트의
   * 문제 · 판단 대신 라벨이 붙은 문장으로 보여준다. 순서가 곧 노출 순서다.
   */
  principles?: readonly { label: string; text: string }[];
  /** 본인 담당과 팀원·다른 파트 담당을 나란히 보여준다 */
  ownership?: {
    mine: readonly string[];
    others?: readonly string[];
  };
  /** 도색 단계의 색맥락. 상세 페이지·OG 이미지가 있는 프로젝트만 지정한다 */
  hue?: Hue;
  technologies?: readonly string[];
  metrics?: readonly Metric[];
  /** 수치를 읽을 때 함께 알아야 할 범위 */
  metricsNote?: string;
  links?: {
    service?: string;
    github?: string;
    figma?: string;
  };
  /**
   * 라이브 탭 — links.service 를 창 안 탭에서 그대로 연다(/live/[slug]).
   * 다른 사이트 안에 넣어도 열리는 것을 확인한 서비스만 켠다(docs/design.md#live).
   * hint 는 들어가서 해 볼 것 한 가지다. 화면에서 확인한 사실만 적는다.
   */
  live?: { hint?: string };
  /**
   * 대표 화면. src 가 없으면 어떤 화면이 필요한지만 적어 둔 상태다.
   * 화면이 없으면 목업 대신 담당 범위 도식(ownership)이나 확보할 화면 자리로 그린다.
   */
  cover?: {
    src?: string;
    alt: string;
    position?: string;
    aspectRatio?: string;
  };
  /**
   * 홈 첫 화면에서 고를 수 있는 실제 화면. 대표의 첫 항목만 쓴다.
   * label 은 그 화면에서 내린 판단을 짧게 부르는 이름이고, 첫 항목이 처음 보인다.
   * 전환 패널은 최대 4개다(globals.css "전환 패널").
   */
  screens?: readonly (Screen & { label: string })[];
  /**
   * 휴대폰 폭으로 캡처한 세로 화면들. 가로 대표 화면(cover.src) 대신 대표 행에
   * 나란히 놓는다. 화면마다 주석이 붙는다(annotations.ts).
   */
  phones?: readonly Screen[];
  /** 상세 첫 화면에 둘 공개 화면. 없으면 cover 를 쓴다 */
  landing?: Screen & { caption: string };
  /**
   * 홈 첫 화면(HERO) 프로젝트 목록의 한 칸. 대표(featured) 프로젝트만 쓴다.
   * label 은 어떤 웹 서비스인지 알려주는 짧은 이름이다.
   * 화면은 칸에 맞춰 따로 잘라 둔 전용 컷(public/images/projects/thumbs, 약 4 : 5)이다.
   * 바로 아래 대표 프로젝트 소개와 겹치지 않도록 다른 화면이나 다른 부분을 고르고,
   * 화면의 다른 영역 가장자리나 잘린 글자가 걸리지 않게 자른다. 칸의 비율은 화면
   * 폭마다 달라지므로, 어느 쪽이 잘려도 되는지를 position 으로 정한다.
   * src 가 없으면 화면을 지어내지 않고 이름 · 운영 시점만 적은 칸을 그린다.
   */
  preview?: { label: string; src?: string; position?: string };
  /** 화면을 공개할 수 없는 사유 */
  coverWithheld?: string;
};

export const PROJECTS: readonly Project[] = [
  {
    slug: "syu-likelion",
    name: "syu-likelion",
    category: "삼육대학교 멋쟁이사자처럼 14기 홈페이지",
    tier: "featured",
    kind: "product",
    headline: "분산된 동아리 운영을 하나의 플랫폼으로",
    subtitle: "멋쟁이사자처럼 삼육대학교 모집 · 평가 · 부원 운영 플랫폼",
    problem:
      "모집·평가·공지·과제가 Google Forms, Excel, Discord, KakaoTalk에 흩어져 있어 지원자와 운영진 모두 정보 확인과 취합에 많은 시간을 썼습니다.",
    decision:
      "지원자 한 명의 서류·채점·점수 현황을 한 화면에 모으고, 블라인드 서류 평가와 신원 확인이 필요한 면접 평가에 맞춰 단계별 노출 정보를 분리했습니다.",
    outcome:
      "14기 지원서 접수와 서류·면접 평가를 이 플랫폼으로 진행했고, 현재도 30건 이상의 공지·세션 자료와 과제 운영에 실사용 중입니다.",
    period: "2026.01 — 현재",
    role: "Frontend Developer",
    team: "Frontend 2 · Backend 2 · Designer 1",
    status: "운영 · 유지보수 중",
    ownership: {
      mine: [
        "지원서 작성 · 임시 저장 · 제출 후 수정",
        "면접 시간 선택 · 예약",
        "운영진 서류 · 면접 평가와 합격 관리 화면(팀원과 공동 작성)",
        "공지 · 세션 자료 · 과제 · 일정 등 부원 공통 공간",
        "운영 중 후속 수정",
      ],
      others: [
        "초기 인증 · 헤더 · 관리자 구조",
        "서류 지원자 표 · 지원서 상세의 초기 구현",
        "출결 관리",
      ],
    },
    hue: "mocha",
    technologies: ["Next.js", "TypeScript", "React", "Axios"],
    metrics: [
      {
        value: "30+",
        label: "운영 공지 · 세션 자료",
        asOf: "2026-08-16",
      },
    ],
    links: {
      service: "https://syu-likelion.org",
      github: "https://github.com/No4hh4oN/Likelion14th-FE",
      figma: "https://www.figma.com/design/ZORVqHx4WTt4ePPM4mIYz4/",
    },
    live: {
      hint: "지원자 · 운영진 화면은 로그인이 필요해 작업 과정에 캡처로 담았습니다.",
    },
    cover: {
      src: "/images/projects/syu-likelion-evaluation.png",
      aspectRatio: "1262 / 933",
      alt: "syu-likelion 지원서 상세의 점수 현황 탭. 같은 지원자의 답변, 문항별 점수와 운영진 코멘트를 탭으로 전환하며 확인한다. 가상 지원자로 실행한 화면이다.",
      position: "center top",
    },
    screens: [
      {
        label: "운영진 평가",
        src: "/images/projects/syu-likelion-evaluation.png",
        aspectRatio: "16 / 10",
        position: "center top",
        alt: "syu-likelion 지원서 상세의 점수 현황 탭. 왼쪽에는 모집 단계별 지원자 목록, 오른쪽에는 서류 보기·점수 매기기·점수 현황 탭과 리뷰어별 문항 점수, 코멘트가 있다. 가상 지원자로 실행한 화면이다.",
      },
      {
        label: "제출 후 수정",
        src: "/images/projects/apply/application-submitted.png",
        aspectRatio: "16 / 10",
        position: "center",
        alt: "지원서 제출 완료 화면. 1차 합격 결과 발표일과 2차 면접 기간 안내, 지원서 수정과 지원 취소 버튼, 1차 합격 결과 발표 후에는 수정이 불가능하다는 안내가 있다.",
      },
      {
        label: "면접 예약",
        src: "/images/projects/apply/first-result-interview.png",
        aspectRatio: "16 / 10",
        position: "center 40%",
        alt: "1차 모집 결과 발표 화면. 1차 합격 안내 아래 면접 시간 영역에서 달력으로 날짜를 고르고 20분 간격의 시간대를 선택한다.",
      },
    ],
    // 아래 대표 소개는 운영진 화면을 쓰므로, 첫 화면에는 공개 모집 안내 화면을 둔다.
    // 좁은 폭의 배치(제목 · 마스코트 · 지원 버튼이 세로로 놓인다)를 헤더 아래부터 잘랐다
    preview: {
      label: "동아리 모집·운영 플랫폼",
      src: "/images/projects/thumbs/syu-likelion.png",
      position: "center top",
    },
    landing: {
      src: "/images/projects/syu-likelion.png",
      aspectRatio: "1600 / 1079",
      alt: "syu-likelion 14기 모집 안내 첫 화면. LIKELION at SYU 14th 문구와 마스코트, 14기 지원하기 버튼이 보인다.",
      caption:
        "모집 안내에서 지원서를 작성하고, 합격 후에는 같은 계정으로 동아리 활동을 이어갑니다.",
    },
  },
  {
    slug: "make-a-wish",
    name: "Make A Wish",
    category: "삼육대학교 축제 홈페이지",
    tier: "featured",
    kind: "product",
    headline: "축제 당일, 가입부터 부스 찾기와 스탬프 완주까지 막힘 없이",
    subtitle:
      "학교 축제 기간에 로그인·가입, 부스 스탬프, 부스 지도를 제공한 웹 서비스",
    problem:
      "단 하루 열리는 학교 축제 서비스라, 현장에서 가입·스탬프·부스 지도 흐름이 한 번 막히면 즉각 대응하기 어려운 환경이었습니다.",
    decision:
      "오픈 전 비정상 입력과 중복 요청을 가정한 독립 QA로 인증 흐름을 검증하고, 잘못된 스탬프 응답이나 지도 시트 가림 같은 현장 예외를 화면 단에서 차단했습니다.",
    // 팀 집계 수치는 바로 아래 metrics 가 보여주므로 여기서는 본인 담당 범위만 적는다
    outcome:
      "오픈 전 독립 QA 8건과 자동 검사 258건을 통과했고, 축제 당일 로그인·가입과 스탬프·지도 선택 영역을 담당해 운영했습니다.",
    role: "Frontend Developer",
    status: "2026-10-06 축제 운영",
    ownership: {
      mine: [
        "로그인 · 인증 세션 연결, 학교 계정 가입과 직접 가입",
        "아이디 찾기 · 비밀번호 재설정과 로그인 후 환영창",
        "부스 스탬프 조회와 별자리 화면",
        "부스 지도의 선택 · 이동 경험 개선",
      ],
      others: [
        "부스 지도 · 시트 · 카드 최초 구현 (팀원)",
        "학교 신원 · 학생회비 · 입장 QR · 운영자 권한 판별 (백엔드)",
        "배포와 로그 수집",
      ],
    },
    hue: "blush",
    technologies: ["React", "TypeScript", "TanStack Query", "Zustand"],
    metrics: [
      {
        value: "1,889",
        label: "축제 당일 활동 이용자(식별)",
        source: "팀 성과 보고서",
        asOf: "2026-10-06",
      },
      {
        value: "48,347",
        label: "축제 당일 페이지 조회",
        source: "팀 성과 보고서",
        asOf: "2026-10-06",
      },
      {
        value: "278",
        label: "스탬프 참여",
        source: "팀 성과 보고서 · 보존된 도장 상태",
      },
      {
        value: "106",
        label: "스탬프 완주",
        source: "팀 성과 보고서 · 보존된 도장 상태",
      },
    ],
    // 집계 기준과 읽는 범위는 상세 "축제 당일의 팀 운영 결과" 섹션이 설명한다
    metricsNote: "팀 전체의 운영 결과입니다.",
    // 종료된 서비스라 실제 화면을 새로 찍을 수 없다. phones · preview 는 상세의 실제 코드 실행 데모(샘플 데이터)를 캡처한 것이다.
    // 대표 행은 받는 중인 스탬프 판과 환영창, 첫 화면은 여섯 개를 모두 받은 판을 쓴다.
    phones: [
      {
        src: "/images/projects/make-a-wish.png",
        alt: "부스 스탬프 화면. 받은 스탬프 세 개가 색이 채워진 별로, 아직 받지 않은 자리는 점선 별로 별자리에 놓여 있다. 샘플 데이터로 실행한 화면이다.",
      },
      {
        src: "/images/projects/make-a-wish-welcome.png",
        alt: "로그인 후 환영창. 이름 자리에 넣은 img 태그 문자열이 실행되지 않고 글자 그대로 편지에 적혀 있고, 편지 모서리에 납부자 표시인 별이 있다. 샘플 데이터로 실행한 화면이다.",
      },
    ],
    preview: {
      label: "축제 웹 서비스",
      src: "/images/projects/thumbs/make-a-wish.png",
      position: "center top",
    },
  },
  {
    slug: "eodiya",
    name: "삼육대 어디야",
    category: "삼육대학교 길찾기 서비스",
    tier: "featured",
    kind: "product",
    headline: "'장근청홀..?이 대체 어디야?'",
    subtitle: "교내 건물과 건물 안 시설의 위치를 검색하는 캠퍼스 지도",
    problem:
      "일반 지도 앱에는 건물 이름만 나와, '장근청홀' 같은 교내 홀이나 강의실이 어느 건물 몇 층에 있는지 찾기 어려웠습니다.",
    decision:
      "공식 명칭을 몰라도 찾을 수 있게 장소명·건물·층별 시설 설명까지 검색 대상으로 넓히고, 일치 필드와 정확도에 따라 결과 순위를 매겼습니다.",
    outcome:
      "공식 캠퍼스맵을 정제해 123개 건물·층별 시설 데이터를 구축하고, 재학생이 바로 검색해 쓸 수 있도록 배포했습니다.",
    period: "2026.02",
    role: "기획 · 개발 · 배포 전 과정",
    team: "1인 프로젝트",
    hue: "sage",
    technologies: ["TypeScript", "Kakao Maps API", "GitHub Pages"],
    metrics: [{ value: "123", label: "장소 데이터 (건물 38 · 층별 항목 85)" }],
    links: {
      service: "https://tim3208.github.io/eodiya/",
      github: "https://github.com/Tim3208/eodiya",
    },
    live: { hint: "검색창에 '장근청홀'을 입력해 보세요." },
    // 아래 대표 소개는 검색 패널까지 전체 화면을 쓰므로, 첫 화면에는 지도에서 캠퍼스 부분만 잘라 둔다
    preview: {
      label: "캠퍼스 지도·검색 서비스",
      src: "/images/projects/thumbs/eodiya.png",
      position: "center",
    },
    cover: {
      src: "/images/projects/eodiya.png",
      aspectRatio: "1090 / 720",
      alt: "삼육대 어디야 검색 화면. 좌측에 장소 검색창과 건물·건물 내부 필터, 국제교육관의 층별 상세 정보가 있고, 우측 지도에는 교내 장소 마커와 선택한 장소의 InfoWindow가 표시되어 있다.",
      position: "center",
    },
  },
  {
    slug: "oshi-calendar",
    name: "Oshi Calendar",
    category: "서브컬처 게임 일정·보상 대시보드",
    tier: "featured",
    kind: "product",
    headline: "여러 게임에서 놓칠 일정과 보상을 한눈에",
    subtitle:
      "여러 서브컬처 게임의 마감 일정과 보상을 모아 오늘 할 일을 보여주는 대시보드",
    problem:
      "여러 서브컬처 게임의 이벤트 마감과 보상을 게임별 공지와 인게임에서 따로 확인하다 보면 피곤할 뿐더러 놓치기도 쉬웠습니다.",
    decision:
      "실제 일정을 채워 보니 날짜 격자에서는 당장 끝나는 일정이 묻혔습니다. 첫 화면 중심을 캘린더에서 '종료 임박·보상·오늘 할 일' 대시보드로 전환했습니다.",
    outcome:
      "비로그인(LocalStorage)과 로그인(서버) 설정 동기화 및 5단계 데이터 상태 UI를 구현해 Preview 배포까지 마쳤습니다.",
    period: "2026.06 — 현재",
    role: "공동 기획 · Frontend 전 영역",
    status: "이용 가능 · 홍보 전",
    hue: "plum",
    technologies: ["React", "TypeScript", "TanStack Query", "Supabase"],
    links: {
      service: "https://oshi-calendar-cyan.vercel.app/",
      figma: "https://www.figma.com/design/XCVUGdYiwQYnrsAVrTogcR/",
    },
    live: { hint: "게임 허브에서 게임을 끄고 켜며 일정을 걸러 보세요." },
    // 임박 일정 열 하나. 글자가 읽히는 크기로 보이도록 열의 폭에 맞춰 잘랐다(비로그인 화면)
    preview: {
      label: "일정·보상 관리 대시보드",
      src: "/images/projects/thumbs/oshi-calendar.png",
      position: "center top",
    },
    cover: {
      src: "/images/projects/oshi-calendar.png",
      alt: "Oshi Calendar 대시보드 화면. 종료 임박 일정과 오늘 할 일, 게임별 보상 현황이 한 화면에 모여 있다. 표시된 수치는 목업 데이터다.",
      // 아래쪽 계정 영역(이메일)을 잘라낸다
      aspectRatio: "1827 / 760",
      position: "center top",
    },
  },
  {
    slug: "agentflow",
    name: "AgentFlow",
    category: "AI WorkFlow",
    tier: "supporting",
    kind: "method",
    headline: "승인 · 독립 QA · Wiki 보존을 코드로 관리하는 개발 도구",
    subtitle:
      "AI 작업자에게 역할을 나누고, 검토·독립 QA·문서화가 끝나야 완료되도록 관리하는 설치형 개발 도구",
    decision:
      "작업과 검수 역할을 분리하고, 각 단계(기획·개발·QA·Wiki)마다 독립된 검수 승인을 거쳐야만 다음 단계로 이동합니다.",
    // 홈 "AI와 일하는 방식" 전용. 라벨은 두 글자로 맞춘다(Labeled 의 라벨 칸 폭)
    principles: [
      {
        label: "이유",
        text: "AI에게 일을 맡기면 환각과 검증 누락이 생길 수 있어, 작업 세션과 검수 세션을 분리했습니다.",
      },
      {
        label: "규칙",
        text: "기획·개발·QA·문서화 단계마다 독립 승인을 거쳐야 넘어가며, 승인 후 코드가 바뀌면 기존 승인은 자동 무효 처리됩니다.",
      },
      {
        label: "역할",
        text: "전체 구조와 검수 기준을 직접 설계하고, 판단이 필요한 분기점의 승인과 최종 결과 검증을 맡습니다.",
      },
    ],
    outcome:
      "Make A Wish 개발에 적용해 인증 엣지 케이스 QA와 디자인 오차 검수 자동화에 활용했습니다.",
    role: "워크플로우 설계 · 검수 기준 정의",
    hue: "wheat",
    technologies: ["Node.js", "node:test"],
  },
  {
    slug: "campuspolio",
    name: "CampusPolio",
    tier: "supporting",
    kind: "in-progress",
    category: "프로젝트 아카이브",
    headline: "흩어진 학생 프로젝트를 모아 포트폴리오로",
    subtitle:
      "삼육대학교 학생의 프로젝트를 올리고 묶어서 포트폴리오로 구성하는 웹 서비스",
    problem:
      "학생 프로젝트가 Figma · GitHub · Google Drive 등 각자 고른 곳에 흩어져 있었습니다.",
    decision:
      "UI 개선 1차 범위를 홈 → 탐색 → 상세로 정하고, 저장·권한 계약이 바뀌는 작성·포트폴리오 개편은 뒤로 미뤘습니다.",
    outcome: "홈·탐색·상세 1차 UI 개편을 진행 중인 비공개 프로젝트입니다.",
    role: "Frontend · UI/UX 디자인",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    links: { github: "https://github.com/Tim3208/CampusPolio_FE" },
  },
  {
    slug: "math-graph",
    name: "mathGraph",
    category: "수학 문제용 그래프 제작 도구",
    tier: "supporting",
    kind: "teaching-tool",
    headline: "과외 문제에 넣을 그래프를 직접 그리는 도구",
    subtitle:
      "수식을 입력해 교재와 비슷한 그래프를 만들고 SVG·PNG로 내보내는 그래프 제작 도구",
    problem:
      "수학 과외 문제를 직접 만들 때, 교재 수준의 함수 그래프를 원하는 라벨로 빠르게 그릴 도구가 없었습니다.",
    decision:
      "보조점의 실제 좌표와 표시 글자를 분리해, 숫자 위치에 3a 같은 라벨을 붙일 수 있게 했습니다.",
    outcome: "만든 그래프를 실제 과외 문제와 수업 자료에 썼습니다.",
    role: "1인 기획 · 개발",
    technologies: ["React", "TypeScript", "mathjs", "SVG"],
    links: {
      service: "https://tim3208.github.io/math-graph/",
      github: "https://github.com/Tim3208/math-graph",
    },
    live: { hint: "'표시 추가'를 누르고 x축 라벨 글자를 바꿔 보세요." },
  },
  {
    slug: "foodmap",
    name: "길맛로드",
    tier: "supporting",
    kind: "brief",
    category: "길거리 푸드트럭 정보",
    headline: "날마다 자리를 옮기는 푸드트럭 정보를 모으는 지도",
    subtitle:
      "길거리 푸드트럭 정보를 모으고, 사용자 제보를 관리자가 승인해 보여주는 사이트",
    problem:
      "요일마다 위치가 바뀌는 푸드트럭 특성상, 기존 지도에서는 당일 영업 장소를 확인하기 어려웠습니다.",
    decision:
      "무분별한 제보를 사람이 걸러내도록 관리자 승인을 두고, 위치는 요일별로 지도 주소와 안내 주소를 나눠 받았습니다.",
    outcome:
      "2025 삼육대학교 SW 프로젝트 경진대회 최우수상을 수상했습니다. (시연 배포 후 종료)",
    role: "Frontend · UI 디자인",
    technologies: ["React", "Axios", "Styled Components", "Tailwind CSS"],
    links: { github: "https://github.com/iyeonggyu0/FoodMap" },
  },
  {
    slug: "cctv-scheduler",
    name: "CCTV 근무 자동 편성",
    tier: "archive",
    kind: "constraint",
    headline: "인터넷도 라이브러리도 IDE도 없는 환경에서 만든 근무 자동화",
    subtitle: "복잡한 근무 규칙과 인원별 조건을 반영하는 폐쇄망 근무 편성 도구",
    problem:
      "매일 반복되는 CCTV 근무 편성을 인원별 역할, 휴가, 근무 규칙, 이전 근무 기록을 손으로 확인하며 짜야 했습니다.",
    decision:
      "인터넷·데이터베이스·라이브러리·IDE가 없는 폐쇄망이라 브라우저와 Vanilla JavaScript, LocalStorage만으로 만들었습니다.",
    outcome:
      "별도 설치 없이 브라우저만으로 동작하게 구현해 전역 전 부대 담당자에게 인계했습니다.",
    period: "2023.09 — 2024.06",
    role: "기획 · 개발",
    team: "1인 프로젝트",
    hue: "terracotta",
    technologies: ["Vanilla JavaScript", "HTML", "CSS", "LocalStorage"],
    coverWithheld: "보안상 화면 비공개",
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.tier === "featured");
export const SUPPORTING_PROJECTS = PROJECTS.filter(
  (p) => p.tier === "supporting",
);
export const ARCHIVE_PROJECTS = PROJECTS.filter((p) => p.tier === "archive");

/** 목록에 보일 분류 라벨 */
export function categoryOf(project: Project) {
  return project.category ?? KIND_LABEL[project.kind];
}

/** 카드 제목: [무슨 서비스인지] - [서비스명]. category 가 없으면 이름만. */
export function displayTitle(project: Project) {
  return project.category
    ? `${project.category} - ${project.name}`
    : project.name;
}

export function projectsOfKind(kind: ProjectKind) {
  return PROJECTS.filter((p) => p.kind === kind);
}

/** 라이브 탭으로 여는 프로젝트. 실제 서비스 주소가 있는 것만 남긴다. */
export const LIVE_PROJECTS = PROJECTS.flatMap((p) =>
  p.live && p.links?.service
    ? [{ project: p, service: p.links.service, hint: p.live.hint }]
    : [],
);

/**
 * Case Study 로 풀지 않는 나머지 작업들. 무엇을 만들었고 무엇이 되는가까지가
 * 확인된 전부라 필드도 그만큼만 둔다. 상세를 쓸 근거가 생기면 PROJECTS 로 옮긴다.
 */
export type OtherProject = {
  name: string;
  fullName?: string;
  summary: string;
  features: readonly string[];
  role?: string;
  links?: {
    service?: string;
    github?: string;
  };
};

export const OTHER_PROJECTS: readonly OtherProject[] = [
  {
    name: "세미콜론",
    fullName: "컴퓨터공학부 학회 페이지",
    summary: "학회 소개와 내부 운영을 한 페이지에서 다루는 학회 사이트",
    features: ["학회 소개", "학회비 납부자 체크", "회의록 작성"],
    role: "Frontend · Design · Backend",
    links: { service: "https://semicolon-psi-blush.vercel.app/" },
  },
  {
    name: "LA",
    summary: "지역별 축제 · 행사 정보를 모아 AI 요약과 함께 보여주는 서비스",
    features: ["지역별 축제 · 행사 정보 수집", "AI 요약 · 코멘트", "AI 채팅"],
    role: "Frontend · Design",
    links: { github: "https://github.com/Tim3208/LA" },
  },
  {
    name: "ReadUp",
    summary: "기사를 직접 요약해 보고 AI에게 채점받는 독해력 향상 서비스",
    features: ["기사 읽고 직접 요약", "AI 채점 · 피드백"],
    role: "Frontend · Design",
    links: {
      github:
        "https://github.com/Likelion-Ganjiton/ReadUp-Frontend/tree/develop",
    },
  },
  {
    name: "두사타",
    fullName: "두유는 사랑을 타고",
    summary: "동아리 박람회에서 선보인, 웹과 오프라인을 잇는 작품",
    features: [
      "자기를 어필하는 한두 문장을 포스트잇으로 게시",
      "마음에 든 포스트잇을 가져가 뒷면 연락처로 연락",
    ],
    role: "Frontend · Design",
    links: { github: "https://github.com/Tim3208/dusata" },
  },
  {
    name: "Pret",
    summary: "텍스트와 아스키 아트만으로 화면을 구성한 웹 RPG",
    features: ["Pretext 라이브러리 기반 화면 디자인", "웹에서 진행하는 RPG"],
    role: "Frontend",
    links: { service: "https://tim3208.github.io/Pret/" },
  },
];
