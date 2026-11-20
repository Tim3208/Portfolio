import Link from "next/link";
import type { CSSProperties } from "react";

import {
  BUTTON,
  BUTTON_OUTLINE,
  Labeled,
  ProjectCover,
  ProjectLinks,
  ProjectMeta,
  ProjectMetrics,
} from "@/components/project/ProjectParts";
import { Container } from "@/components/ui/Container";
import { Shot, parseRatio } from "@/components/ui/Shot";
import { Switcher } from "@/components/ui/Switcher";
import { SHOTS } from "@/data/annotations";
import { hasCaseStudy } from "@/data/caseStudies";
import type { Project } from "@/data/projects";
import { HUE_CLASS } from "@/lib/hue";

/**
 * 대표 프로젝트 한 행 — 큰 화면과 짧은 문제 · 판단 · 결과가 나란하다.
 * 홈과 /work 가 같이 쓴다. 넓은 화면에서 화면이 7, 설명이 5 를 차지하고,
 * flip 이면 좌우를 바꿔 행이 이어질 때 리듬을 만든다. 좁은 화면에서는 화면이 먼저다.
 *
 * 화면 위의 번호와 그 아래 주석 목록은 한 화면에 같이 들어와야 읽힌다. 그래서 넓은
 * 화면에서는 화면 칸의 폭을 창 높이로도 제한한다(globals.css "대표 프로젝트 행").
 * 창이 낮으면 화면 칸이 줄고 남는 폭은 설명 칸이 받는다. 설명 칸은 화면 칸보다
 * 짧을 때 스크롤을 따라 붙어 옆자리가 비지 않는다.
 *
 * 실제 화면이 여러 장(Project.screens)인 프로젝트는 판단 이름으로 화면을 골라 보고,
 * 화면마다 주석이 붙는다. lead 는 대표의 첫 항목 — 화면을 8 로 넓히고 상세 진입을
 * 버튼으로 둔다. 가장 깊이 설명하는 사례다. firstScreen 이면(페이지 첫 화면에 걸리는 행)
 * 대표 화면을 우선 로딩한다.
 *
 * compact 는 홈의 요약이다. 수치는 둘까지, 역할 · 팀만 남기고 기간 · 상태 · 기술과
 * GitHub · Figma 링크는 /work 와 상세 페이지에 맡긴다.
 *
 * 행마다 배경색이나 카드를 늘리지 않는다. 프로젝트 색은 라벨과 화면 주석에만 쓴다.
 */
export function FeaturedRow({
  project,
  flip = false,
  lead = false,
  firstScreen = false,
  compact = false,
}: {
  project: Project;
  flip?: boolean;
  lead?: boolean;
  firstScreen?: boolean;
  compact?: boolean;
}) {
  const detail = hasCaseStudy(project.slug);
  const sizes = lead ? "(min-width: 1024px) 64vw, 100vw" : "(min-width: 1024px) 56vw, 100vw";
  const when = project.period ?? project.status;
  const switching = Boolean(project.screens && project.screens.length > 1);
  const media = mediaShape(project, switching, compact);

  return (
    <article aria-labelledby={`project-${project.slug}`} className={project.hue ? HUE_CLASS[project.hue] : undefined}>
      <Container className="border-t border-rule py-10 md:py-14">
        <div
          data-flip={flip ? "" : undefined}
          className="featured-row grid gap-8 lg:gap-12"
          style={
            {
              // 12칸 중 8칸 · 7칸에 해당하는 폭(칸 사이 48px 기준)
              "--media-share": lead ? "calc(66.667% - 1rem)" : "calc(58.333% - 1.25rem)",
              ...(media ? { "--media-ratio": media.ratio, "--media-rest": media.rest } : null),
            } as CSSProperties
          }
        >
        <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
          {switching && project.screens ? (
            <Switcher
              name={`screens-${project.slug}`}
              legend={`${project.name} 화면 고르기`}
              options={project.screens.map((screen, i) => ({
                label: screen.label,
                panel: (
                  <Shot
                    src={screen.src}
                    alt={screen.alt}
                    aspectRatio={screen.aspectRatio}
                    position={screen.position}
                    sizes={sizes}
                    preload={firstScreen && i === 0}
                    annotated={!compact}
                    original={!compact}
                  />
                ),
              }))}
            />
          ) : (
            <ProjectCover
              project={project}
              sizes={sizes}
              preload={firstScreen}
              annotated={!compact}
              original={!compact}
            />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
          <div className="flex flex-col gap-1.5">
            {project.category || when ? (
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                {project.category ? <p className="text-sm font-semibold text-hue-deep">{project.category}</p> : null}
                {when ? <p className="text-xs text-ink-2 tabular-nums">{when}</p> : null}
              </div>
            ) : null}
            <h3 id={`project-${project.slug}`} className="text-2xl font-bold tracking-tight">
              {project.name}
            </h3>
            <p className="text-lead text-ink-2">{project.headline}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Labeled label="문제">{project.problem}</Labeled>
            <Labeled label="판단">{project.decision}</Labeled>
            <Labeled label="결과">{project.outcome}</Labeled>
          </div>
          <ProjectMetrics project={project} limit={compact ? 2 : undefined} />
          <ProjectMeta project={project} compact={compact} />
          {detail ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href={`/projects/${project.slug}`} className={lead ? BUTTON : BUTTON_OUTLINE}>
                {project.name} 작업 과정 읽기
                <span aria-hidden="true">→</span>
              </Link>
              <ProjectLinks project={project} detail={false} serviceOnly={compact} />
            </div>
          ) : (
            <ProjectLinks project={project} detail={false} serviceOnly={compact} />
          )}
        </div>
        </div>
      </Container>
    </article>
  );
}

/**
 * 화면 칸의 가로세로 비와, 화면 말고 같이 보여야 하는 것(전환 컨트롤 · 주석 목록)의
 * 높이. 화면이 없는 행(담당 범위 도식 · 비공개 사유)은 창 높이로 제한하지 않는다.
 */
function mediaShape(project: Project, switching: boolean, compact: boolean) {
  if (project.coverWithheld) return null;
  if (switching && project.screens) {
    // 전환 패널은 한 칸에 겹치므로 가장 세로로 긴 화면에 맞춘다
    const ratios = project.screens.map((screen) => parseRatio(screen.aspectRatio ?? "16 / 10"));
    return { ratio: Math.min(...ratios), rest: compact ? "7rem" : "13rem" };
  }
  if (project.cover?.src) return { ratio: parseRatio(project.cover.aspectRatio ?? "3 / 2"), rest: compact ? "4rem" : "10rem" };
  if (project.phones?.length) {
    const ratio = project.phones.reduce((sum, screen) => {
      const info = SHOTS[screen.src];
      return sum + (info ? info.width / info.height : 0.5);
    }, 0);
    return { ratio, rest: compact ? "4rem" : "12rem" };
  }
  return null;
}
