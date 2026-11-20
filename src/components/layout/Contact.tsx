import { CopyEmailButton } from "@/components/layout/CopyEmailButton";
import { Container } from "@/components/ui/Container";
import { CONTACT_STATEMENT, PROFILE } from "@/data/profile";
import { SECTION } from "@/lib/sections";

const LINK =
  "flex min-h-11 w-fit items-center underline decoration-deep-ink-2 underline-offset-4 transition-colors duration-150 hover:decoration-deep-ink";

/**
 * 모든 페이지의 마지막 섹션. 이메일과 GitHub 를 같은 자리에 둔다.
 * deep-ground 반전 블록이라 글자는 테마와 무관한 deep-ink 상수를 쓴다.
 */
export function Contact() {
  return (
    <section id={SECTION.contact} className="scroll-mt-6 bg-deep-ground text-deep-ink">
      <Container className="grid gap-6 py-14 md:py-20 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <h2 className="text-title font-bold">Contact</h2>
          <p className="text-deep-ink-2">{CONTACT_STATEMENT}</p>
        </div>
        <div className="flex flex-col gap-1 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={`mailto:${PROFILE.email}`} className={`${LINK} text-xl font-semibold break-all md:text-2xl`}>
              {PROFILE.email}
            </a>
            <CopyEmailButton email={PROFILE.email} />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a href={PROFILE.github} target="_blank" rel="noreferrer noopener" className={`${LINK} text-deep-ink-2 hover:text-deep-ink`}>
              GitHub
              <span aria-hidden="true" className="ml-1">
                ↗
              </span>
              <span className="sr-only"> (새 창)</span>
            </a>
            <a href="/resume.pdf" download="박정우_이력서.pdf" className={`${LINK} text-deep-ink-2 hover:text-deep-ink`}>
              이력서 다운로드 (PDF)
              <span aria-hidden="true" className="ml-1">
                ↓
              </span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
