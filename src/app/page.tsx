import { Fragment } from "react";
import Link from "next/link";

import { ApprovalResetDemo } from "@/components/project/demos";
import { FeaturedRow } from "@/components/project/FeaturedRow";
import { BUTTON, LINK, Labeled, ProjectLinks } from "@/components/project/ProjectParts";
import { ProjectIndex } from "@/components/project/ProjectIndex";
import { Container } from "@/components/ui/Container";
import { SmoothAnchor } from "@/components/ui/SmoothAnchor";
import { getCaseStudy, hasCaseStudy } from "@/data/caseStudies";
import { TIMELINE } from "@/data/experiences";
import { PROFILE } from "@/data/profile";
import {
  ARCHIVE_PROJECTS,
  FEATURED_PROJECTS,
  OTHER_PROJECTS,
  PROJECTS,
  projectsOfKind,
  type Project,
} from "@/data/projects";
import { TEACHING_LEAD, TEACHING_METRICS } from "@/data/teaching";
import { HUE_CLASS } from "@/lib/hue";

const SECTION_TITLE = "text-title font-bold";

/**
 * 홈 — 스토리형 요약.
 *
 *   소개(HERO: 정체성 · 작업 방향 + 대표 프로젝트 목록)
 *   → 대표 프로젝트(첫 항목을 가장 깊게) → AI와 일하는 방식 → 교육 경험 → 경력
 *   → 그 밖의 프로젝트 → (layout) 연락처
 *
 * HERO 는 개발자와 작업의 다양성을, 대표 프로젝트는 개별 사례의 문제 · 판단 ·
 * 결과를 맡는다. HERO 에서 한 프로젝트를 키우지 않고, 같은 화면을 HERO 와
 * 대표 프로젝트에 연달아 크게 반복하지 않는다(Project.preview).
 *
 * 홈은 요약이다. 기간 · 상태 · 기술, 교육 활동과 수업 도구, 전공 배경처럼
 * /work · /teaching · /career 가 자세히 다루는 내용은 여기서 되풀이하지 않고
 * 한 문장과 링크로 넘긴다.
 *
 * 모든 섹션이 src/data 에서 목록을 받아 그린다. 프로젝트를 추가·승격해도
 * 이 파일은 바뀌지 않는다. 비어 있는 섹션은 그리지 않는다.
 * 섹션마다 색맥락(.hue-*)은 하나다.
 */
export default function HomePage() {
  const methods = projectsOfKind("method");
  const shown = new Set([...FEATURED_PROJECTS, ...methods].map((p) => p.slug));
  const remaining = PROJECTS.filter((p) => p.tier === "supporting" && !shown.has(p.slug));
  const otherNames = OTHER_PROJECTS.map((p) => p.name);

  return (
    <>
      <Container className="flex flex-col gap-9 pt-8 pb-14 md:gap-10 md:pt-10 md:pb-16">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10 xl:gap-12">
          <div className="lg:col-span-8 xl:col-span-7">
            {/* h1 이 이 사이트가 누구의 포트폴리오인지부터 말한다: 직무 · 이름 → 메인 문구 */}
            <h1>
              <span className="block text-lg font-semibold tracking-tight text-ink-2 md:text-xl">
                Frontend Developer {PROFILE.name}
              </span>{" "}
              <span className="mt-3 block text-hero font-bold">
                {PROFILE.headline.map((line, i) => (
                  <span key={line} className="block">
                    {line}
                    {i < PROFILE.headline.length - 1 ? " " : null}
                  </span>
                ))}
              </span>
            </h1>
          </div>
          <div className="flex flex-col gap-5 lg:col-span-4 lg:pb-1.5 xl:col-span-5">
            <p className="max-w-[30rem] text-lead text-ink-2">{PROFILE.intro}</p>
            <ul aria-label="핵심 기술 스택" className="flex flex-wrap gap-1.5">
              {PROFILE.coreSkills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-chip border border-rule bg-paper-raised px-2.5 py-0.5 font-mono text-xs text-ink-2"
                >
                  {skill}
                </li>
              ))}
            </ul>
            {/* GitHub · 연락처는 도구줄과 바탕화면에 늘 있으므로, 여기서는 다음 행동 하나만 둔다 */}
            <SmoothAnchor href="#featured" className={`${BUTTON} w-fit`}>
              프로젝트 둘러보기
              <span aria-hidden="true">↓</span>
            </SmoothAnchor>
          </div>
        </div>

        <nav aria-labelledby="hero-projects" className="flex flex-col gap-3">
          <p id="hero-projects" className="text-sm font-semibold text-ink-2">
            대표 프로젝트
          </p>
          <ProjectIndex projects={FEATURED_PROJECTS} />
        </nav>
      </Container>

      {FEATURED_PROJECTS.length ? (
        <section aria-labelledby="featured" className="border-t border-rule">
          <Container className="pt-14 pb-2 md:pt-20">
            <h2 id="featured" className={`${SECTION_TITLE} scroll-mt-6`}>
              직접 겪은 불편에서 시작한 서비스
            </h2>
          </Container>
          {FEATURED_PROJECTS.map((project, i) => (
            <FeaturedRow key={project.slug} project={project} lead={i === 0} flip={i % 2 === 1} compact />
          ))}
        </section>
      ) : null}

      {methods.map((project) => (
        <MethodSection key={project.slug} project={project} />
      ))}

      {/* 교육 활동 · 수업 도구 · 설명을 맞추는 방법은 /teaching 이 다룬다. 홈은 범위와 수치만 */}
      <section aria-labelledby="teaching" className="hue-sage border-t border-rule">
        <Container className="grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <h2 id="teaching" className={SECTION_TITLE}>
              교육 경험
            </h2>
            <p className="max-w-measure text-ink-2">{TEACHING_LEAD}</p>
            <Link href="/teaching" className={`${LINK} w-fit`}>
              교육 경험 전체 보기
            </Link>
          </div>
          <dl className="flex flex-wrap content-start gap-x-12 gap-y-6 lg:col-span-7">
            {TEACHING_METRICS.map((m) => (
              <div key={m.label} className="flex flex-col gap-0.5">
                <dt className="order-2 text-sm text-ink-2">{m.label}</dt>
                <dd className="order-1 font-mono text-4xl font-semibold tracking-tight tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section aria-labelledby="path" className="hue-wheat border-t border-rule">
        <Container className="grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <h2 id="path" className={SECTION_TITLE}>
              경력
            </h2>
            <Link href="/career" className={`${LINK} w-fit`}>
              경력 · 수상 · 기술 전체 보기
            </Link>
          </div>
          <ol className="flex flex-col lg:col-span-8">
            {TIMELINE.map((year) => (
              <li key={year.year} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-4 border-b border-rule py-3 first:border-t">
                <span className="font-mono text-sm leading-7 text-hue-deep tabular-nums">{year.year}</span>
                <span className="text-ink-2">{year.items.map((item) => item.title).join(" · ")}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="others" className="border-t border-rule">
        <Container className="grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-4">
            <h2 id="others" className={SECTION_TITLE}>
              그 밖의 프로젝트
            </h2>
            <Link href="/work" className={`${LINK} w-fit`}>
              전체 프로젝트 비교해 보기
            </Link>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-8">
            {remaining.length ? (
              <ul className="flex flex-col">
                {remaining.map((p) => {
                  const href = hasCaseStudy(p.slug) ? `/projects/${p.slug}` : "/work#supporting";
                  return (
                    <li key={p.slug} className="border-b border-rule first:border-t">
                      <Link
                        href={href}
                        className="group grid gap-x-6 gap-y-1 py-3 transition-colors duration-150 md:grid-cols-[9rem_minmax(0,1fr)]"
                      >
                        <span className="font-semibold underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-hue-deep">
                          {p.name}
                        </span>
                        <span className="text-ink-2 transition-colors duration-150 group-hover:text-ink">{p.headline}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {ARCHIVE_PROJECTS.length || otherNames.length ? (
              <p className="text-ink-2">
                그리고{" "}
                {ARCHIVE_PROJECTS.map((p, i) => (
                  <Fragment key={p.slug}>
                    {i > 0 ? " · " : null}
                    {hasCaseStudy(p.slug) ? (
                      <Link
                        href={`/projects/${p.slug}`}
                        className="font-medium text-ink underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:decoration-hue-deep"
                      >
                        {p.name}
                      </Link>
                    ) : (
                      p.name
                    )}
                  </Fragment>
                ))}
                {ARCHIVE_PROJECTS.length && otherNames.length ? " · " : null}
                {otherNames.length ? (
                  <Link
                    href="/work#others"
                    className="underline decoration-rule-strong underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-hue-deep"
                  >
                    {otherNames.join(" · ")}
                  </Link>
                ) : null}
              </p>
            ) : null}
          </div>
        </Container>
      </section>
    </>
  );
}

/**
 * AI와 일하는 방식 — 서비스 사례와 성격이 다른 블록. 문제 · 판단 대신 원칙(principles)을
 * 보여주고, 옆에서 승인 무효화 규칙을 직접 바꿔 볼 수 있다.
 */
function MethodSection({ project }: { project: Project }) {
  const flow = getCaseStudy(project.slug)
    ?.sections.flatMap((s) => s.blocks)
    .find((b) => b.type === "flow");

  return (
    <section
      aria-labelledby={`method-${project.slug}`}
      className={`${project.hue ? HUE_CLASS[project.hue] : ""} border-t border-rule bg-hue-wash`}
    >
      <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-5 lg:col-span-5">
          <h2 id={`method-${project.slug}`} className={SECTION_TITLE}>
            AI와 일하는 방식
          </h2>
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">{project.name}</h3>
            <p className="max-w-measure text-ink-2">{project.subtitle}</p>
          </div>
          <div className="flex flex-col gap-3">
            {project.principles?.length ? (
              project.principles.map((p) => (
                <Labeled key={p.label} label={p.label}>
                  {p.text}
                </Labeled>
              ))
            ) : (
              <Labeled label="판단">{project.decision}</Labeled>
            )}
            <Labeled label="적용">{project.outcome}</Labeled>
          </div>
          <ProjectLinks project={project} detail={hasCaseStudy(project.slug)} serviceOnly />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
          {flow?.type === "flow" ? (
            <div className="flex flex-col gap-3">
              {flow.label ? <p className="text-sm font-semibold text-ink-2">{flow.label}</p> : null}
              <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
                {flow.steps.map((step, i) => (
                  <li key={step} className="flex items-center gap-1">
                    <span className="rounded-chip border border-rule bg-paper px-2.5 py-1 text-sm">{step}</span>
                    {i < flow.steps.length - 1 ? (
                      <span aria-hidden="true" className="font-mono text-xs text-hue-deep">
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          <ApprovalResetDemo name={`home-${project.slug}`} />
        </div>
      </Container>
    </section>
  );
}
