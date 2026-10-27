"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { registerCurator, type SayRequest } from "@/components/desk/curatorChannel";
import { CURATOR } from "@/data/curator";
import { INTRO_KEY } from "@/lib/intro";

type Point = { x: number; y: number };
type Burst = Point & { key: number };

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
 * 연출 커서 — 이 사이트를 찾은 방문자를 안내하는 큐레이터 (lg 이상).
 *
 * 첫 방문(src/lib/intro.ts)에는 빈 바탕화면에 나타나 Figma 의 커서 채팅처럼 인사를
 * 타이핑하고, 포트폴리오 아이콘을 더블클릭해 창을 연다. 그 뒤에는 아이콘 아래에서
 * 쉬다가 `curator.say` 요청이 오면 그 자리로 다가가 말하고 돌아온다.
 * 방문자의 커서가 와서 부딪히면 Figma 의 하이파이브처럼 손뼉을 맞춘다.
 *
 * 커서를 따라다니지 않고, 쉴 때는 움직이지 않는다. 연출은 아무 키나 누르거나
 * 화면을 누르면 바로 끝나 창이 열린다. 말풍선은 장식이고, 인사는 화면 낭독기에
 * 한 번에 읽히도록 따로 둔다.
 *
 * 매 프레임 바뀌는 위치는 state 가 아니라 DOM 에 직접 쓴다.
 */
export function Curator() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bumpRef = useRef<HTMLDivElement>(null);
  const pos = useRef<Point>({ x: 0, y: 0 });
  const mode = useRef<"intro" | "idle" | "busy">("idle");
  const lastClap = useRef(0);
  const clapCount = useRef(0);

  const [message, setMessage] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [intro, setIntro] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);

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

  async function click(target: HTMLElement, signal: AbortSignal) {
    target.dataset.pressed = "";
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
          await click(icon, run.signal);
          await click(icon, run.signal);
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

    async function say({ text, target, hold = 2800 }: SayRequest) {
      if (!homePoint()) return;
      const run = new AbortController();
      life.signal.addEventListener("abort", () => run.abort(), { once: true });
      // 방문자가 스크롤하면 말을 접고 돌아간다 — 다가간 자리가 밀려나기 때문이다
      const cut = () => run.abort();
      addEventListener("wheel", cut, { passive: true });
      addEventListener("touchstart", cut, { passive: true });
      addEventListener("keydown", cut);

      mode.current = "busy";
      try {
        if (target) {
          const r = target.getBoundingClientRect();
          await moveTo(
            {
              x: Math.min(r.left + Math.min(24, r.width / 2), innerWidth - 340),
              y: Math.min(r.top + Math.min(16, r.height / 2), innerHeight - 96),
            },
            700,
            run.signal,
          );
        }
        await type(text, run.signal);
        await sleep(hold, run.signal);
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
    }

    if (document.documentElement.dataset.intro === "play") {
      queue = runIntro();
    } else {
      const home = homePoint();
      if (home) place(home);
    }

    const unregister = registerCurator((request) => {
      queue = queue.then(() => say(request));
      return queue;
    });

    // 창 크기가 바뀌면 쉬던 자리도 함께 옮긴다. lg 미만에서는 CSS 가 숨긴다.
    const onResize = () => {
      if (mode.current !== "idle") return;
      const home = homePoint();
      if (home) place(home);
    };
    addEventListener("resize", onResize);

    return () => {
      life.abort();
      // 개발 모드의 effect 재실행처럼 연출 도중 언마운트되면 처음 상태로 돌려 둔다
      const root = document.documentElement;
      if (root.dataset.intro === "running") root.dataset.intro = "play";
      unregister();
      removeEventListener("resize", onResize);
    };
    // 마운트 때 한 번만 연다. 함수들은 ref 와 setState 만 만진다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 방문자 커서와 부딪히면 서로 다가갔다 튕겨 나며 손뼉을 맞춘다. */
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
              <span className="block rounded-xs bg-hue-deep px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap text-paper">
                {CURATOR.name}
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
