"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { useBrowser } from "@/components/browser/BrowserProvider";
import { animateScroll } from "@/components/ui/SmoothAnchor";
import { PROFILE } from "@/data/profile";
import { PAGES } from "@/lib/pages";
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

const FolderGlyph = () => (
  <Glyph>
    <path d="M3 7.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
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
 * 첫 방문 연출에서 큐레이터가 포트폴리오 아이콘을 더블클릭해 창을 열고, 연출이
 * 끝난 뒤에도 그대로 남아 방문자가 직접 쓸 수 있다. 페이지 바로가기는 그 페이지를
 * 연 탭으로 옮겨 가거나 새 탭으로 연다.
 *
 * 실제 바탕화면처럼 마우스로는 한 번 눌러 고르고 두 번 눌러 연다. 키보드(Enter ·
 * Space)와 터치는 기다릴 이유가 없으니 한 번에 연다. 큐레이터가 누르는 모습은
 * data-pressed 로 보여준다 — 방문자의 선택 상태와 섞지 않는다.
 *
 * DOM 에서는 창 뒤에 두어 키보드 순서가 창의 크롬부터 시작하고, 화면에서만 왼쪽에 놓는다.
 */
export function DeskIcons() {
  const { openPage } = useBrowser();
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pointerType = useRef("mouse");

  // 아이콘 밖을 누르면 선택을 푼다
  useEffect(() => {
    if (!selected) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!listRef.current?.contains(e.target as Node)) setSelected(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [selected]);

  const items: DeskItem[] = [
    { id: "portfolio", label: "포트폴리오", glyph: <BrowserGlyph />, activate: () => openPage("/") },
    ...PAGES.filter((p) => p.href !== "/").map((page) => ({
      id: page.href,
      label: page.label,
      glyph: <FolderGlyph />,
      activate: () => openPage(page.href),
    })),
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
      <ul ref={listRef} className="flex flex-col items-center gap-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              data-desk-icon={item.id}
              data-selected={selected === item.id ? "" : undefined}
              title={item.id === "github" ? `${item.label} (새 창)` : undefined}
              onPointerDown={(e) => {
                pointerType.current = e.pointerType;
              }}
              onClick={(e) => {
                setSelected(item.id);
                if (e.detail === 0 || pointerType.current !== "mouse") item.activate();
              }}
              onDoubleClick={item.activate}
              className="group flex w-19 flex-col items-center gap-1 rounded-chip px-1 py-1.5 select-none"
            >
              <span
                className={`flex size-12 items-center justify-center rounded-panel border transition-colors duration-150 group-hover:border-ink-3 group-data-pressed:border-hue-deep group-data-selected:border-hue-deep ${
                  item.id === "portfolio"
                    ? "border-transparent bg-hue-tint text-hue-deep"
                    : "border-rule-strong bg-paper-raised text-ink-2"
                }`}
              >
                {item.glyph}
              </span>
              <span className="rounded-xs px-1 text-center text-xs leading-snug text-ink transition-colors duration-150 group-data-pressed:bg-hue-deep group-data-pressed:text-paper group-data-selected:bg-hue-deep group-data-selected:text-paper">
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
