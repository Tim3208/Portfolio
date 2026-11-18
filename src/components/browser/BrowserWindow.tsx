import Link from "next/link";
import type { ReactNode } from "react";

import { BrowserProvider } from "@/components/browser/BrowserProvider";
import { TabStrip } from "@/components/browser/TabStrip";
import { Toolbar } from "@/components/browser/Toolbar";
import { Viewport } from "@/components/browser/Viewport";
import { Curator } from "@/components/desk/Curator";
import { DeskIcons } from "@/components/desk/DeskIcons";
import { SmoothAnchor } from "@/components/ui/SmoothAnchor";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PROJECTS_WITH_CASE_STUDY } from "@/data/caseStudies";
import { PROFILE } from "@/data/profile";
import { LIVE_PROJECTS } from "@/data/projects";
import { bareAddress } from "@/lib/address";
import { EXTERNAL_PATH, LIVE_PATH, NEW_TAB_PATH, PAGES } from "@/lib/pages";
import { SECTION } from "@/lib/sections";
import { SITE_URL } from "@/lib/site";

const PAGE_LINK =
  "flex h-8 shrink-0 items-center rounded-chip px-2 text-[0.8125rem] text-ink-2 transition-colors duration-150 hover:bg-paper-sunk hover:text-ink";

/**
 * 사이트 전체를 감싸는 창.
 *
 * 데스크톱(md 이상): 화면 높이에 맞춘 창 하나가 가운데 놓이고, 크롬은
 * 탭줄 · 도구줄 2행이다. 주요 페이지 링크는 도구줄 오른쪽에 둔다.
 * 창 바깥 여백은 12 · 16 · 20px 로 최소로 두고, 창은 최대 1760px 까지 넓어진다.
 * 본문은 Viewport 안에서만 스크롤된다. lg 이상에서는 창 왼쪽에 바탕화면
 * 아이콘이 놓이고, 연출 커서(Curator)가 그 아래에서 쉰다.
 * 모바일: 창 연출을 풀고 일반 페이지처럼 스크롤한다. 크롬 대신 간단한
 * 상단 내비를 둔다.
 *
 * 창 셸에는 overflow · transform · filter 를 주지 않는다. 둥근 모서리는
 * 크롬(위)과 Viewport(아래)가 각자 맞춘다.
 *
 * 서버 컴포넌트다. 탭 제목에 필요한 경로 → 이름 표와, 라이브 탭의
 * 경로 → 실제 주소 표만 조립해 내려보낸다.
 */
export function BrowserWindow({ children }: { children: ReactNode }) {
  const host = new URL(SITE_URL).host;
  const titles: Record<string, string> = {
    ...Object.fromEntries(PAGES.map((p) => [p.href, p.label])),
    // 홈 탭은 이 창이 누구의 포트폴리오인지 말한다. 내비 링크의 이름은 그대로 "홈"이다.
    "/": `${PROFILE.name} 포트폴리오`,
    ...Object.fromEntries(PROJECTS_WITH_CASE_STUDY.map((p) => [`/projects/${p.slug}`, p.name])),
    // 같은 프로젝트의 작업 과정 탭과 구분되도록 "서비스"를 붙인다
    ...Object.fromEntries(LIVE_PROJECTS.map(({ project }) => [`${LIVE_PATH}/${project.slug}`, `${project.name} · 서비스`])),
    [NEW_TAB_PATH]: "새 탭",
    [EXTERNAL_PATH]: "열 수 없는 주소",
  };
  // 라이브 탭에서는 주소창이 이 사이트의 경로 대신 서비스의 실제 주소를 보여준다
  const live = Object.fromEntries(
    LIVE_PROJECTS.map(({ project, service }) => [`${LIVE_PATH}/${project.slug}`, bareAddress(service)]),
  );

  return (
    <BrowserProvider host={host} titles={titles} live={live}>
      <div className="md:flex md:h-dvh md:p-3 lg:p-4 2xl:p-5">
        <div
          data-browser-shell
          className="mx-auto flex w-full max-w-window min-w-0 flex-col bg-paper md:min-h-0 md:rounded-window md:shadow-(--window-shadow)"
        >
          {/* 데스크톱 크롬 — 탭줄 · 도구줄 */}
          <div className="hidden shrink-0 rounded-t-window bg-chrome md:block">
            <TabStrip />
            <Toolbar>
              <nav aria-label="주요 페이지" className="flex items-center gap-0.5">
                {PAGES.map((page) => (
                  <Link key={page.href} href={page.href} className={PAGE_LINK}>
                    {page.label}
                  </Link>
                ))}
                <SmoothAnchor href={`#${SECTION.contact}`} className={PAGE_LINK}>
                  Contact
                </SmoothAnchor>
                {/* 768–1023px 에는 도구줄이 좁아 GitHub 은 본문 · 연락처의 링크에 맡긴다 */}
                <span aria-hidden="true" className="mx-1 hidden h-4 border-l border-rule-strong lg:block" />
                <a
                  href={PROFILE.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${PAGE_LINK} hidden lg:flex`}
                >
                  GitHub
                  <span className="sr-only"> (새 창)</span>
                </a>
              </nav>
            </Toolbar>
          </div>

          {/* 모바일 상단 내비 — 창 연출 없음 */}
          <header className="flex flex-col border-b border-rule px-4 pt-2 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="flex min-h-11 items-baseline gap-2 font-bold">
                {PROFILE.name}
                <span className="text-sm font-normal text-ink-2">{PROFILE.role}</span>
              </Link>
              <ThemeToggle />
            </div>
            <nav aria-label="주요 페이지" className="-mx-2 flex flex-wrap">
              {PAGES.map((page) => (
                <Link key={page.href} href={page.href} className="flex min-h-11 items-center px-2 text-[0.9375rem] text-ink-2">
                  {page.label}
                </Link>
              ))}
              <SmoothAnchor href={`#${SECTION.contact}`} className="flex min-h-11 items-center px-2 text-[0.9375rem] text-ink-2">
                Contact
              </SmoothAnchor>
            </nav>
          </header>

          <Viewport>{children}</Viewport>
        </div>
        <DeskIcons />
      </div>
      <Curator />
    </BrowserProvider>
  );
}
