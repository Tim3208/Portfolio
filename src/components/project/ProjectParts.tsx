import Link from "next/link";
import { Fragment } from "react";

import { Placeholder } from "@/components/ui/Placeholder";
import { Shot } from "@/components/ui/Shot";
import type { Project } from "@/data/projects";
import { LIVE_PATH } from "@/lib/pages";

/**
 * 프로젝트를 보여주는 화면들(홈 · /work · 상세)이 공유하는 조각.
 * 모두 비어 있는 필드는 그리지 않는다 — 데이터가 늘거나 줄어도 레이아웃이 따라온다.
 */

export const LINK =
  "inline-flex min-h-11 items-center underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:decoration-hue-deep";

/** 글자가 있는 버튼 면. Accent 대신 hue-deep 을 쓴다(지면 대비 6.5:1 이상). */
export const BUTTON =
  "inline-flex min-h-11 items-center gap-2 rounded-chip bg-hue-deep px-4 text-sm font-semibold text-paper transition-colors duration-150 hover:bg-ink";

/** 보조 버튼. 대표 2–4번처럼 상세 진입을 일반 링크보다 분명하게 구분할 때 쓴다. */
export const BUTTON_OUTLINE =
  "inline-flex min-h-11 items-center gap-2 rounded-chip border border-hue-deep bg-paper px-4 text-sm font-semibold text-hue-deep transition-colors duration-150 hover:bg-hue-tint hover:text-ink";

const LINK_LABEL = { service: "서비스", github: "GitHub", figma: "Figma" } as const;

/**
 * 대표 화면. 실제 캡처가 있으면 주석과 함께, 공개할 수 없으면 비공개 사유,
 * 캡처를 확보하기 전이면 담당 범위 도식이나 확보할 화면 자리를 그린다.
 * 휴대폰 폭의 세로 화면(phones)은 한 장을 크게 늘리지 않고 나란히 놓는다.
 * 어떤 경우에도 실제 화면처럼 보이는 목업은 만들지 않는다.
 */
export function ProjectCover({
  project,
  sizes,
  preload = false,
  annotated = true,
  original = true,
  notesClassName,
}: {
  project: Project;
  sizes: string;
  preload?: boolean;
  annotated?: boolean;
  original?: boolean;
  notesClassName?: string;
}) {
  if (project.coverWithheld) return <WithheldNote project={project} />;
  if (project.cover?.src) {
    return (
      <Shot
        src={project.cover.src}
        alt={project.cover.alt}
        aspectRatio={project.cover.aspectRatio ?? "3 / 2"}
        position={project.cover.position}
        sizes={sizes}
        preload={preload}
        annotated={annotated}
        original={original}
        notesClassName={notesClassName}
      />
    );
  }
  if (project.phones?.length) {
    return (
      <div className="grid grid-cols-2 items-start gap-4 md:gap-6">
        {project.phones.map((screen, i) => (
          <Shot
            key={screen.src}
            src={screen.src}
            alt={screen.alt}
            aspectRatio={screen.aspectRatio}
            position={screen.position}
            sizes="(min-width: 1024px) 26vw, 46vw"
            preload={preload && i === 0}
            annotated={annotated}
            original={original}
            notesClassName="grid gap-y-2"
          />
        ))}
      </div>
    );
  }
  if (project.ownership) return <OwnershipMap project={project} />;
  return <Placeholder description={project.cover?.alt ?? `${project.name} 대표 화면`} ratio="3 / 2" />;
}

/**
 * 담당 범위 도식 — 화면을 확보하기 전의 대표 자리.
 * 내가 구현한 화면과 팀원 · 백엔드가 맡은 부분을 같은 높이에 나란히 둔다.
 * 확보할 화면은 방문자에게 적지 않는다(데이터의 cover.alt 와 TODO 가 기억한다).
 */
function OwnershipMap({ project }: { project: Project }) {
  const { mine, others } = project.ownership ?? { mine: [] };
  return (
    <div className="grid overflow-hidden rounded-xs border border-rule md:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-3 bg-hue-wash p-5">
        <p className="text-sm font-semibold text-hue-deep">내가 구현한 화면</p>
        <ol className="flex flex-col gap-2">
          {mine.map((item, i) => (
            <li key={item} className="flex gap-3 rounded-xs border border-hue-deep/40 bg-paper-raised px-3 py-2.5">
              <span className="font-mono text-xs leading-6 text-hue-deep tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>
      {others?.length ? (
        <div className="flex flex-col gap-3 border-t border-rule bg-paper p-5 md:border-t-0 md:border-l">
          <p className="text-sm text-ink-2">팀원 · 백엔드가 맡은 부분</p>
          <ul className="flex flex-col gap-2">
            {others.map((item) => (
              <li key={item} className="rounded-xs border border-dashed border-rule-strong px-3 py-2.5 text-sm text-ink-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** 화면을 공개할 수 없는 프로젝트. 사유를 그대로 적고, 화면을 지어내지 않는다. */
function WithheldNote({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-2 rounded-xs border border-dashed border-rule-strong bg-paper-sunk p-5">
      <p className="text-sm font-semibold text-ink-2">{project.coverWithheld}</p>
      <p className="max-w-measure text-sm text-ink-2">
        실제 화면과 코드는 공개하지 않습니다. 공개할 수 있는 제약과 처리 흐름만 글과 도식으로 설명합니다.
      </p>
    </div>
  );
}

/** 역할 · 팀 · 상태 · 기술을 라벨과 값으로 나눈 메타 그리드. 기간은 제목 위 줄에 둔다. */
export function ProjectMeta({ project, compact = false }: { project: Project; compact?: boolean }) {
  const rows = [
    { label: "역할", value: project.role },
    { label: "팀", value: project.team },
    // period 가 없을 때는 status 가 상단 시점 자리에 올라가므로 중복 표시하지 않는다
    { label: "상태", value: !compact && project.period ? project.status : undefined },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  const tech = compact ? project.technologies?.slice(0, 3) : project.technologies;

  if (!rows.length && !tech?.length) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-rule pt-4">
      {rows.map((row) => (
        <div key={row.label} className={`flex flex-col gap-0.5 ${rows.length === 1 ? "col-span-2" : ""}`}>
          <dt className="text-xs text-ink-3">{row.label}</dt>
          <dd className="text-sm leading-snug text-ink">{row.value}</dd>
        </div>
      ))}
      {tech?.length ? (
        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="text-xs text-ink-3">기술</dt>
          <dd className="font-mono text-xs leading-5 text-ink-2">{tech.join(" · ")}</dd>
        </div>
      ) : null}
    </dl>
  );
}

/**
 * 수치. 읽는 범위는 note 로 덧붙인다.
 * 출처·시점은 상세 페이지에서만 보여준다(withSource). 홈과 목록은 수치만 간결하게 둔다.
 * limit 은 앞에서부터 보여줄 개수다 — 홈은 가장 큰 수치 둘만 둔다.
 */
export function ProjectMetrics({
  project,
  withSource = false,
  limit,
}: {
  project: Project;
  withSource?: boolean;
  limit?: number;
}) {
  const metrics = project.metrics?.slice(0, limit);
  if (!metrics?.length) return null;
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:flex sm:flex-wrap">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5">
            <dt className="order-2 text-sm text-ink-2">{m.label}</dt>
            <dd className="order-1 font-mono text-2xl font-semibold tracking-tight text-ink tabular-nums md:text-3xl">
              {m.value}
            </dd>
            {withSource && (m.source || m.asOf) ? (
              <dd className="order-3 text-xs text-ink-2 tabular-nums">{[m.source, m.asOf].filter(Boolean).join(" · ")}</dd>
            ) : null}
          </div>
        ))}
      </dl>
      {project.metricsNote ? <p className="max-w-measure text-sm text-ink-2">{project.metricsNote}</p> : null}
    </div>
  );
}

/**
 * 상세 페이지 링크(있을 때)와 외부 링크.
 * serviceOnly 면 외부 링크는 실제 서비스만 둔다 — 홈처럼 짧게 보여주는 자리에서 쓴다.
 */
export function ProjectLinks({
  project,
  detail,
  serviceOnly = false,
  emphasizeService = false,
}: {
  project: Project;
  detail: boolean;
  serviceOnly?: boolean;
  emphasizeService?: boolean;
}) {
  const external = Object.entries(project.links ?? {}).filter(([key]) => !serviceOnly || key === "service");
  if (!detail && external.length === 0) return null;
  const serviceClass = emphasizeService ? BUTTON_OUTLINE : `${LINK} text-sm text-ink-2`;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {detail ? (
        <Link href={`/projects/${project.slug}`} className={`${LINK} font-semibold`}>
          {project.name} 작업 과정 읽기
          <span aria-hidden="true" className="ml-1.5 text-hue-deep">
            →
          </span>
        </Link>
      ) : null}
      {external.map(([key, href]) => {
        const outside = (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className={key === "service" ? serviceClass : `${LINK} text-sm text-ink-2`}
          >
            {LINK_LABEL[key as keyof typeof LINK_LABEL]} (새 창)
          </a>
        );
        if (key !== "service" || !project.live) return outside;
        // 라이브 탭: 창이 있는 화면(md 이상)에서는 창 안에서 열고, 좁은 화면에서는 실제 새 창으로 연다.
        // 겉의 span 은 한쪽만 보이게 할 뿐 배치에는 끼어들지 않는다(contents).
        return (
          <Fragment key={key}>
            <span className="hidden md:contents">
              <Link href={`${LIVE_PATH}/${project.slug}`} className={serviceClass}>
                서비스 열어 보기
                {emphasizeService ? <span aria-hidden="true">→</span> : null}
              </Link>
            </span>
            <span className="contents md:hidden">{outside}</span>
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * 라벨이 붙은 한 줄. 문제 · 판단 · 결과처럼 같은 형식으로 비교할 문장에 쓴다.
 * 라벨은 왼쪽 칸에 두어 여러 줄이 이어질 때 라벨끼리, 문장끼리 세로로 맞는다.
 * 라벨은 두 글자 한국어로 맞춘다(문제 · 판단 · 결과 · 적용).
 */
export function Labeled({ label, children }: { label: string; children?: string }) {
  if (!children) return null;
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-3">
      <p className="text-sm font-semibold text-hue-deep">{label}</p>
      <p className="max-w-measure">{children}</p>
    </div>
  );
}
