/**
 * 사이트의 주요 페이지.
 *
 * 도구줄의 주요 페이지 링크, 모바일 내비, 새 탭 시작 페이지, sitemap 이 모두 이 목록을 쓴다.
 * 창 안의 탭은 이 목록과 무관하게 방문자가 열고 닫는 상태다
 * (src/components/browser/BrowserProvider.tsx).
 */
export type SitePage = {
  href: string;
  label: string;
};

export const PAGES: readonly SitePage[] = [
  { href: "/", label: "홈" },
  { href: "/work", label: "프로젝트" },
  { href: "/career", label: "경력" },
  { href: "/teaching", label: "교육 경험" },
];

/** 주소창에 보이지 않는 연출용 경로. sitemap 과 검색에서 제외한다. */
export const NEW_TAB_PATH = "/new";
export const EXTERNAL_PATH = "/external";
/**
 * 실제 서비스를 창 안에서 여는 라이브 탭(/live/[slug]). 주소창에는 이 경로 대신
 * 서비스의 실제 주소를 보여준다(src/lib/address.ts). 마찬가지로 연출용 경로다.
 */
export const LIVE_PATH = "/live";
