"use client";

import type { ReactNode } from "react";

import { useBrowser } from "@/components/browser/BrowserProvider";
import { animateScroll } from "@/components/ui/SmoothAnchor";
import { PROFILE } from "@/data/profile";
import { SECTION } from "@/lib/sections";

/** 바탕화면 아이콘 그림. 크롬 아이콘과 같은 선 하나로, 한 단계 크게 그린다. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const BrowserGlyph = () => (
  <Glyph>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="M3 8.5h18M6 6.5h.01M8.5 6.5h.01" />
  </Glyph>
);

const CodeGlyph = () => (
  <Glyph>
    <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 6l-3 12" />
  </Glyph>
);

const MailGlyph = () => (
  <Glyph>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Glyph>
);

type DeskItem = {
  id: string;
  label: string;
  glyph: ReactNode;
  activate: () => void;
};

/**
 * 창 왼쪽의 바탕화면 아이콘 (lg 이상).
 *
 * 첫 방문 연출에서 큐레이터가 포트폴리오 아이콘을 눌러 창을 열고, 연출이
 * 끝난 뒤에도 그대로 남아 방문자가 직접 쓸 수 있다.
 * 브라우저 도구줄은 사이트 내부 페이지 이동을 맡고, 바탕화면은 실행할 앱과
 * 외부 링크 · 연락처 바로가기(포트폴리오 · GitHub · 연락처)만 두어 중복을 없앤다.
 *
 * 모양은 바탕화면 아이콘이지만 웹의 링크처럼 한 번 누르면 열린다. 방문자는 웹
 * 페이지에서 더블클릭을 기대하지 않아, 한 번 눌러 고르기만 되면 고장으로 읽힌다.
 * 큐레이터가 누르는 모습은 data-pressed 로 보여준다.
 *
 * DOM 에서는 창 뒤에 두어 키보드 순서가 창의 크롬부터 시작하고, 화면에서만 왼쪽에 놓는다.
 */
export function DeskIcons() {
  const { openPage } = useBrowser();

  const items: DeskItem[] = [
    { id: "portfolio", label: "포트폴리오", glyph: <BrowserGlyph />, activate: () => openPage("/") },
    {
      id: "github",
      label: "GitHub",
      glyph: <CodeGlyph />,
      activate: () => window.open(PROFILE.github, "_blank", "noopener,noreferrer"),
    },
    {
      id: "contact",
      label: "연락처",
      glyph: <MailGlyph />,
      activate: () => {
        const target = document.getElementById(SECTION.contact);
        if (target) animateScroll(target);
      },
    },
  ];

  return (
    <nav aria-label="바탕화면" className="hidden shrink-0 lg:order-first lg:mr-3 lg:block lg:w-19">
      <ul className="flex flex-col items-center gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              data-desk-icon={item.id}
              title={item.id === "github" ? `${item.label} (새 창)` : undefined}
              onClick={item.activate}
              className="group flex w-19 cursor-pointer flex-col items-center gap-1 rounded-chip px-1 py-1.5 select-none"
            >
              <span
                className={`flex size-12 items-center justify-center rounded-panel border transition-colors duration-150 group-hover:border-hue-deep group-active:border-hue-deep group-data-pressed:border-hue-deep ${
                  item.id === "portfolio"
                    ? "border-transparent bg-hue-tint text-hue-deep"
                    : "border-rule-strong bg-paper-raised text-ink-2"
                }`}
              >
                {item.glyph}
              </span>
              <span className="rounded-xs px-1 text-center text-xs leading-snug text-ink transition-colors duration-150 group-hover:bg-hue-tint group-active:bg-hue-deep group-active:text-paper group-data-pressed:bg-hue-deep group-data-pressed:text-paper">
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {/* 큐레이터가 쉬는 자리 — 아이콘 바로 아래 */}
      <div data-curator-home aria-hidden="true" className="mx-auto mt-4 h-12 w-8" />
    </nav>
  );
}
