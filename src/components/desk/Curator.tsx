"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { useBrowser } from "@/components/browser/BrowserProvider";
import { curator, registerCurator } from "@/components/desk/curatorChannel";
import { CURATOR } from "@/data/curator";
import { INTRO_KEY } from "@/lib/intro";

type Point = { x: number; y: number };
type Burst = Point & { key: number };
/** 큐레이터가 할 말 한마디. target 이 있으면 그 곁으로 가서 말하고, press 가 있으면 말한 뒤 눌러 보인다. */
type Line = { text: string; target?: Element | null; press?: HTMLElement | null };

/** 이미 한 말. 한 번 들어온 동안(sessionStorage) 같은 말을 되풀이하지 않는다. */
const HEARD_KEY = "curator-heard";
let heard: Set<string> | null = null;

function getHeard() {
  if (heard) return heard;
  heard = new Set();
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(HEARD_KEY) ?? "[]");
    if (Array.isArray(saved)) {
      for (const text of saved) if (typeof text === "string") heard.add(text);
    }
  } catch {}
  return heard;
}

function markHeard(text: string) {
  const all = getHeard();
  all.add(text);
  try {
    sessionStorage.setItem(HEARD_KEY, JSON.stringify([...all]));
  } catch {}
}

/**
 * 대신 눌러 보일 조작부. 글자나 aria-label 이 name 과 같은 버튼 · 라디오 · 체크박스 가운데
 * 본문 영역에 온전히 보이고, 막혀 있지 않고, 아직 켜지지 않은 것만 고른다.
 */
function findControl(scope: Element, name: string, view: DOMRect): HTMLElement | null {
  for (const el of scope.querySelectorAll<HTMLElement>("button, label, input")) {
    if (el.getAttribute("aria-label") !== name && el.textContent?.trim() !== name) continue;
    const control = el instanceof HTMLLabelElement ? el.control : el;
    if (control instanceof HTMLInputElement && (control.disabled || control.checked)) continue;
    if (control instanceof HTMLButtonElement && control.disabled) continue;
    if (el.getAttribute("aria-pressed") === "true" || el.closest("[inert]")) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.top >= view.top && r.bottom <= view.bottom) return el;
  }
  return null;
}

/**
 * 지금 자리에서 꺼낼 말. 본문 가운데(높이의 15–85%)에 걸친 요소의 말과 지금 눌러 보일 수
 * 있는 조작부의 말을 먼저, 없으면 이 페이지 전체의 말을 고른다. 이미 한 말은 건너뛴다.
 */
function findNote(viewport: Element | null): Line | null {
  const done = getHeard();
  const view = viewport?.getBoundingClientRect();
  let page: Line | null = null;
  for (const note of [...(CURATOR.notes[location.pathname] ?? []), ...(CURATOR.notes["*"] ?? [])]) {
    if (done.has(note.text)) continue;
    if (!note.target) {
      page ??= { text: note.text };
      continue;
    }
    const target = document.querySelector(note.target);
    if (!target || !view) continue;
    if (note.press) {
      const control = findControl(target, note.press, view);
      if (control) return { text: note.text, target: control, press: control };
      continue;
    }
    const r = target.getBoundingClientRect();
    if (r.height > 0 && r.bottom > view.top + view.height * 0.15 && r.top < view.top + view.height * 0.85) {
      return { text: note.text, target };
    }
  }
  return page;
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/** 큐레이터가 쉬는 자리. 바탕화면 아이콘 아래(DeskIcons 의 data-curator-home)다. */
function homePoint(): Point | null {
  const home = document.querySelector("[data-curator-home]");
  const rect = home?.getBoundingClientRect();
  if (!rect || rect.width === 0) return null;
  return { x: rect.left + 8, y: rect.top + 4 };
}

function centerOf(el: Element): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * 말할 요소의 왼쪽 위 곁. 말풍선이 화면 오른쪽 · 아래로 넘치지 않게 하고,
 * 본문 안의 요소가 위로 밀려나 있으면 본문 영역의 맨 위에 선다.
 */
function beside(target: Element, text: string, viewport: Element | null): Point {
  const r = target.getBoundingClientRect();
  const top = viewport?.contains(target) ? viewport.getBoundingClientRect().top : 0;
  const bubble = Math.min(320, Array.from(text).length * 14 + 24) + 24;
  return {
    x: Math.max(8, Math.min(r.left + Math.min(24, r.width / 2), innerWidth - bubble)),
    y: Math.min(Math.max(r.top + Math.min(16, r.height / 2), top + 12), innerHeight - 96),
  };
}

/**
 * 곁으로 갈 요소가 없는 말을 하는 자리. 쉬던 자리에서 말하면 말풍선이 본문 글자를
 * 덮으므로, 창의 왼쪽 위로 올라가 말풍선이 탭줄 위에 놓이게 한다.
 */
function perchPoint(): Point | null {
  const r = document.querySelector("[data-browser-shell]")?.getBoundingClientRect();
  return r ? { x: r.left - 28, y: Math.max(0, r.top - 14) } : null;
}

function seenIntro() {
  try {
    return localStorage.getItem(INTRO_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * 연출 커서 — 이 사이트를 찾은 방문자를 안내하는 큐레이터 (lg 이상).
 *
 * 첫 방문(src/lib/intro.ts)에는 빈 바탕화면에 나타나 Figma 의 커서 채팅처럼 인사를
 * 타이핑하고, 포트폴리오 아이콘을 눌러 창을 연다. 그 뒤에는 아이콘 아래에서 쉰다.
 *
 * 말은 두 길로 한다 (대사는 src/data/curator.ts).
 *   · 방문자가 커서로 툭 치면 — 지금 보는 자리에 꺼낼 말이 있으면 그 곁으로 가서
 *     말하고, 없으면 Figma 의 하이파이브처럼 손뼉만 맞춘다. 꺼낼 말이 있는 동안
 *     이름표에 점이 켜진다.
 *   · 방문자의 행동에 맞장구 — `curator.react` 요청이 오면 한 번 말한다.
 *
 * 커서를 따라다니지 않고, 쉴 때는 움직이지 않는다. 먼저 말을 거는 일은 방문자가
 * 무언가를 한 순간에만 있다. 연출은 아무 키나 누르거나 화면을 누르면 바로 끝나
 * 창이 열린다. 말풍선은 장식이고, 인사는 화면 낭독기에 한 번에 읽히도록 따로 둔다.
 *
 * 매 프레임 바뀌는 위치는 state 가 아니라 DOM 에 직접 쓴다.
 */
export function Curator() {
  const { pathname, state, viewportRef } = useBrowser();

  const rootRef = useRef<HTMLDivElement>(null);
  const bumpRef = useRef<HTMLDivElement>(null);
  const pos = useRef<Point>({ x: 0, y: 0 });
  const mode = useRef<"intro" | "idle" | "busy">("idle");
  const lastClap = useRef(0);
  const clapCount = useRef(0);
  /** 말 한마디를 차례에 넣는다. 마운트 effect 가 채운다. */
  const speak = useRef<(line: Line) => void>(() => {});
  const tabCount = state ? state.tabs.length : null;
  const lastTabCount = useRef<number | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [intro, setIntro] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);
  /** 지금 자리에 꺼낼 말이 있다 — 이름표의 점 */
  const [pending, setPending] = useState(false);

  function refresh() {
    setPending(findNote(viewportRef.current) !== null);
  }

  /** 옮기는 순간 보이기 시작한다. 처음 자리를 잡기 전에는 숨어 있다. */
  function place(p: Point) {
    pos.current = p;
    const el = rootRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    el.dataset.shown = "";
  }

  /** 사람 손처럼 살짝 휘어서 간다. 모션 감소 설정에서는 바로 옮긴다. */
  function moveTo(to: Point, duration: number, signal: AbortSignal) {
    const from = pos.current;
    if (reducedMotion() || duration === 0) {
      place(to);
      return Promise.resolve();
    }
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const bend = 0.18;
    const control = { x: from.x + dx / 2 - dy * bend, y: from.y + dy / 2 + dx * bend };
    const start = performance.now();

    return new Promise<void>((resolve, reject) => {
      const tick = (now: number) => {
        if (signal.aborted) return reject(signal.reason);
        const t = easeInOut(Math.min(1, (now - start) / duration));
        const u = 1 - t;
        place({
          x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
          y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
        });
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  async function type(text: string, signal: AbortSignal) {
    const chars = Array.from(text);
    setTyping(true);
    setMessage("");
    for (let i = 1; i <= chars.length; i++) {
      await sleep(38 + Math.random() * 46, signal);
      setMessage(chars.slice(0, i).join(""));
    }
    setTyping(false);
  }

  /** 커서가 한 번 누르는 모습 */
  async function tap(signal: AbortSignal) {
    setPressed(true);
    await sleep(90, signal);
    setPressed(false);
    await sleep(80, signal);
  }

  /** 아이콘 자리에서 창이 펼쳐진다. 애니메이션이 끝나면 data-intro 를 지운다. */
  function openWindow(icon: Element | null) {
    const root = document.documentElement;
    const shell = document.querySelector<HTMLElement>("[data-browser-shell]");
    if (shell && icon) {
      const r = shell.getBoundingClientRect();
      const c = centerOf(icon);
      shell.style.setProperty("--open-origin", `${c.x - r.left}px ${c.y - r.top}px`);
    }
    root.dataset.intro = "open";
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch {}

    const done = () => {
      if (root.dataset.intro === "open") delete root.dataset.intro;
      shell?.style.removeProperty("--open-origin");
      if (icon instanceof HTMLElement) delete icon.dataset.pressed;
    };
    shell?.addEventListener("animationend", done, { once: true });
    setTimeout(done, 700);
  }

  useEffect(() => {
    const life = new AbortController();
    let queue = Promise.resolve();

    function goHome(duration: number) {
      const home = homePoint();
      if (!home) return Promise.resolve();
      return moveTo(home, duration, life.signal);
    }

    async function runIntro() {
      const root = document.documentElement;
      const icon = document.querySelector<HTMLElement>('[data-desk-icon="portfolio"]');
      const run = new AbortController();
      life.signal.addEventListener("abort", () => run.abort(), { once: true });

      // 아무 키나 누르거나 화면을 누르면 연출을 건너뛴다
      const skip = () => run.abort();
      addEventListener("keydown", skip);
      addEventListener("pointerdown", skip);

      mode.current = "intro";
      root.dataset.intro = "running";
      setIntro(true);
      place({ x: innerWidth * 0.62, y: innerHeight * 0.66 });

      try {
        await moveTo({ x: innerWidth * 0.42, y: innerHeight * 0.4 }, 700, run.signal);
        await sleep(250, run.signal);
        // "/" 를 누른 것처럼 빈 말풍선과 깜빡이는 커서가 먼저 열린다
        setMessage("");
        setTyping(true);
        await sleep(450, run.signal);
        for (const line of CURATOR.greeting) {
          await type(line, run.signal);
          await sleep(700, run.signal);
        }
        setMessage(null);
        if (icon) {
          await moveTo(centerOf(icon), 900, run.signal);
          await sleep(160, run.signal);
          icon.dataset.pressed = "";
          await tap(run.signal);
        }
        openWindow(icon);
        await sleep(520, run.signal);
      } catch {
        // 언마운트로 끊겼다면 다음 마운트가 처음부터 다시 연다 (아래 cleanup)
        if (life.signal.aborted) return;
        setMessage(null);
        setTyping(false);
        setPressed(false);
        if (root.dataset.intro === "running") openWindow(icon);
      } finally {
        removeEventListener("keydown", skip);
        removeEventListener("pointerdown", skip);
      }

      setIntro(false);
      await goHome(700).catch(() => {});
      mode.current = "idle";
    }

    async function say({ text, target, press }: Line) {
      if (life.signal.aborted || !homePoint()) {
        mode.current = "idle";
        return;
      }
      const run = new AbortController();
      life.signal.addEventListener("abort", () => run.abort(), { once: true });
      // 방문자가 스크롤하면 말을 접고 돌아간다 — 다가간 자리가 밀려나기 때문이다
      const cut = () => run.abort();
      addEventListener("wheel", cut, { passive: true });
      addEventListener("touchstart", cut, { passive: true });
      addEventListener("keydown", cut);

      mode.current = "busy";
      try {
        const spot = target ? beside(target, text, viewportRef.current) : perchPoint();
        if (spot) await moveTo(spot, 700, run.signal);
        await type(text, run.signal);
        // 말을 읽을 틈을 두고 대신 눌러 보인다. 그 사이 조작부가 사라졌으면 누르지 않는다.
        if (press) {
          await sleep(600, run.signal);
          if (press.isConnected) {
            await moveTo(centerOf(press), 300, run.signal);
            await tap(run.signal);
            press.click();
          }
        }
        markHeard(text);
        // 긴 말일수록 오래 보여준다
        await sleep(1600 + Array.from(text).length * 70, run.signal);
      } catch {
        // 스크롤로 끊긴 경우. 그대로 돌아간다
      } finally {
        removeEventListener("wheel", cut);
        removeEventListener("touchstart", cut);
        removeEventListener("keydown", cut);
        setMessage(null);
        setTyping(false);
      }
      if (life.signal.aborted) return;
      await goHome(700).catch(() => {});
      mode.current = "idle";
      refresh();
    }

    /** 차례에 넣는 순간부터 다른 말을 받지 않는다 */
    function enqueue(line: Line) {
      mode.current = "busy";
      queue = queue.then(() => say(line));
    }
    speak.current = enqueue;

    const { tip, returning } = CURATOR.reactions;
    if (document.documentElement.dataset.intro === "play") {
      // 방금 연출을 본 방문자에게 같은 방문에서 "또 오셨네요"라고 하지 않는다
      markHeard(returning);
      queue = runIntro().then(() => say({ text: tip }));
    } else {
      const home = homePoint();
      if (home) place(home);
      if (location.pathname === "/" && seenIntro() && !getHeard().has(returning)) {
        queue = sleep(900, life.signal).then(
          () => say({ text: returning }),
          () => {},
        );
      }
    }

    const unregister = registerCurator((cue, target) => {
      const text = CURATOR.reactions[cue];
      if (mode.current !== "idle" || getHeard().has(text) || !homePoint()) return;
      // 맞장구는 말하다 끊겨도 다시 하지 않는다
      markHeard(text);
      enqueue({ text, target });
    });

    // 창 크기가 바뀌면 쉬던 자리도 함께 옮긴다. lg 미만에서는 CSS 가 숨긴다.
    const onResize = () => {
      refresh();
      if (mode.current !== "idle") return;
      const home = homePoint();
      if (home) place(home);
    };
    addEventListener("resize", onResize);

    // 스크롤이 멈추면 그 자리에 꺼낼 말이 있는지 다시 본다. 스크롤 이벤트는
    // 올라오지 않으므로 capture 로 본문 영역의 스크롤까지 받는다.
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(settle);
      settle = setTimeout(refresh, 160);
    };
    addEventListener("scroll", onScroll, { capture: true, passive: true });

    return () => {
      life.abort();
      // 개발 모드의 effect 재실행처럼 연출 도중 언마운트되면 처음 상태로 돌려 둔다
      mode.current = "idle";
      const root = document.documentElement;
      if (root.dataset.intro === "running") root.dataset.intro = "play";
      unregister();
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll, { capture: true });
      clearTimeout(settle);
    };
    // 마운트 때 한 번만 연다. 함수들은 ref 와 setState 만 만진다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 페이지가 바뀌면 새 본문이 그려진 뒤에 꺼낼 말을 다시 센다
  useEffect(() => {
    const timer = setTimeout(refresh, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 탭을 네 개째 열면 한마디 한다. 새로고침으로 되살아난 탭은 세지 않는다.
  useEffect(() => {
    const before = lastTabCount.current;
    lastTabCount.current = tabCount;
    if (before !== null && tabCount !== null && tabCount > before && tabCount >= 4) curator.react("tabs");
  }, [tabCount]);

  /**
   * 방문자 커서와 부딪히면 서로 다가갔다 튕겨 나며 손뼉을 맞춘다.
   * 지금 자리에 꺼낼 말이 있으면 손뼉 뒤에 그 말을 한다.
   */
  function clap(e: ReactPointerEvent) {
    if (e.pointerType !== "mouse" || mode.current !== "idle") return;
    const now = performance.now();
    if (now - lastClap.current < 900) return;
    lastClap.current = now;

    const tip = pos.current;
    const dx = e.clientX - (tip.x + 8);
    const dy = e.clientY - (tip.y + 10);
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    if (!reducedMotion()) {
      bumpRef.current?.animate(
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${ux * 5}px, ${uy * 5}px) rotate(-6deg)`, offset: 0.25 },
          { transform: `translate(${-ux * 9}px, ${-uy * 9}px) rotate(4deg)`, offset: 0.55 },
          { transform: "translate(0, 0)" },
        ],
        { duration: 420, easing: "ease-out" },
      );
      setBurst({ x: tip.x + 8 + dx / 2, y: tip.y + 10 + dy / 2, key: now });
    }

    const note = findNote(viewportRef.current);
    if (note) {
      speak.current(note);
      return;
    }

    const reaction = CURATOR.clap[clapCount.current % CURATOR.clap.length];
    clapCount.current += 1;
    setMessage(reaction);
    setTimeout(() => {
      if (mode.current === "idle") setMessage((m) => (m === reaction ? null : m));
    }, 1100);
  }

  return (
    <div className="hidden lg:block">
      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 opacity-0 transition-opacity duration-200 data-shown:opacity-100"
      >
        <div ref={bumpRef}>
          {/* 부딪힘 판정 영역. 연출 중에는 누르면 건너뛰기라 받지 않는다 */}
          <span
            onPointerEnter={clap}
            className={`absolute -top-1 -left-1 size-7 rounded-full ${intro ? "" : "pointer-events-auto"}`}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 18 22"
            width="18"
            height="22"
            className={`relative origin-top-left transition-transform duration-75 ${pressed ? "scale-85" : ""}`}
          >
            <path
              d="M1.5 1.5v16.2l4.3-4.2 2.9 6.6 2.6-1.1-2.8-6.5h6.1Z"
              className="fill-hue-deep stroke-paper"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute top-5 left-4">
            {message === null ? (
              <span className="relative block rounded-xs bg-hue-deep px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap text-paper">
                {CURATOR.name}
                {/* 꺼낼 말이 있다는 표시 — 글자가 닿지 않는 장식이라 Accent */}
                {pending && !intro ? <span className="absolute -top-1 -right-1 size-2 rounded-full bg-accent" /> : null}
              </span>
            ) : (
              <p className="w-max max-w-80 rounded-panel rounded-tl-xs bg-hue-deep px-3 py-1.5 text-sm leading-relaxed text-paper">
                {message}
                {typing ? <span className="curator-caret ml-px inline-block h-[1.1em] w-px translate-y-0.5 bg-paper" /> : null}
              </p>
            )}
          </div>
        </div>
      </div>

      {burst ? (
        <svg
          key={burst.key}
          aria-hidden="true"
          viewBox="-16 -16 32 32"
          width="32"
          height="32"
          onAnimationEnd={() => setBurst(null)}
          className="curator-burst pointer-events-none fixed z-50 stroke-accent"
          style={{ left: burst.x - 16, top: burst.y - 16 }}
          strokeWidth="2"
          strokeLinecap="round"
        >
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line key={i} x1={Math.cos(a) * 7} y1={Math.sin(a) * 7} x2={Math.cos(a) * 13} y2={Math.sin(a) * 13} />
            );
          })}
        </svg>
      ) : null}

      {intro ? (
        <>
          <p role="status" className="sr-only">
            {CURATOR.greeting.join(" ")}
          </p>
          <button
            type="button"
            className="fixed right-5 bottom-5 z-50 min-h-9 rounded-chip border border-rule-strong bg-paper-raised px-3 text-sm text-ink-2 transition-colors duration-150 hover:text-ink"
          >
            건너뛰기
          </button>
        </>
      ) : null}
    </div>
  );
}
