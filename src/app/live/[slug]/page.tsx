import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LiveFrame } from "@/components/project/LiveFrame";
import { BUTTON, LINK } from "@/components/project/ProjectParts";
import { Container } from "@/components/ui/Container";
import { hasCaseStudy } from "@/data/caseStudies";
import { LIVE_PROJECTS } from "@/data/projects";
import { bareAddress } from "@/lib/address";
import { HUE_CLASS } from "@/lib/hue";

type Params = { params: Promise<{ slug: string }> };

const STRIP_LINK = `${LINK} text-sm md:min-h-9`;

export function generateStaticParams() {
  return LIVE_PROJECTS.map(({ project }) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const live = LIVE_PROJECTS.find(({ project }) => project.slug === slug);
  if (!live) return {};
  // 다른 사람의 화면이 아니라 연출용 경로다. 검색에는 원래 서비스와 작업 과정이 나오면 된다.
  return { title: `${live.project.name} 실제 서비스`, robots: { index: false, follow: true } };
}

/**
 * 라이브 탭 — 배포된 실제 서비스를 창 안에서 그대로 연다 (docs/design.md#live).
 *
 * 한 줄 안내(이름 · 해 볼 것 · 작업 과정 · 새 창에서 열기) 아래를 서비스가 채운다.
 * 넓은 화면에서는 이 섹션이 본문 영역 높이와 같아 서비스가 창을 꽉 채우고,
 * 연락처는 그 아래로 스크롤하면 나온다. 주소창에는 이 경로 대신 서비스의 실제
 * 주소가 보인다(BrowserWindow 가 넘기는 표).
 *
 * 창이 없는 좁은 화면에서는 서비스를 불러오지 않고 새 창으로 여는 버튼을 둔다.
 * 본문의 서비스 링크는 좁은 화면에서 이 페이지를 거치지 않고 바로 새 창으로 간다
 * (ProjectLinks).
 */
export default async function LivePage({ params }: Params) {
  const { slug } = await params;
  const live = LIVE_PROJECTS.find(({ project }) => project.slug === slug);
  if (!live) notFound();

  const { project, service, hint } = live;

  return (
    <section
      aria-labelledby="live-title"
      className={`${project.hue ? HUE_CLASS[project.hue] : ""} flex flex-col md:h-(--viewport-height)`}
    >
      <Container className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-rule py-2 md:py-1">
        <p className="text-sm font-semibold text-hue-deep">실제 서비스</p>
        <h1 id="live-title" className="font-bold">
          {project.name}
        </h1>
        {hint ? <p className="min-w-0 text-sm text-ink-2">{hint}</p> : null}
        <div className="flex flex-wrap items-center gap-x-5 md:ml-auto">
          {hasCaseStudy(project.slug) ? (
            <Link href={`/projects/${project.slug}`} className={STRIP_LINK}>
              작업 과정 읽기
            </Link>
          ) : null}
          <a href={service} target="_blank" rel="noreferrer noopener" className={STRIP_LINK}>
            새 창에서 열기
            <span aria-hidden="true" className="ml-1">
              ↗
            </span>
          </a>
        </div>
      </Container>

      <LiveFrame key={service} src={service} title={`${project.name} 실제 서비스`} address={bareAddress(service)}>
        <p className="max-w-measure text-ink-2">좁은 화면에서는 실제 서비스를 새 창에서 엽니다.</p>
        <a href={service} target="_blank" rel="noreferrer noopener" className={BUTTON}>
          {project.name} 열기
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> (새 창)</span>
        </a>
      </LiveFrame>
    </section>
  );
}
