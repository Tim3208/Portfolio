/**
 * 원본: src/features/home/components/LoginWelcome.tsx
 * 기준 커밋: 436b5ef832c5b7c03ff65bfd898c90381a45887d
 * 변경: 에셋을 공개 경로로 참조하고 h2를 상세 섹션 아래 h3로 바꾼다.
 * showModal·초점 이동/복원·Tab 가두기를 제거하고 open 비모달 dialog를 프레임에만 그린다.
 * Escape는 이 dialog 안에서만 닫고, 원본 텍스트·마크업·닫기 콜백은 유지한다.
 */
/* eslint-disable @next/next/no-img-element -- 원본 환영창 에셋의 표시 방식과 크기를 유지한다. */
import { useId } from 'react'
import styles from './welcome.module.css'

const envelope = '/images/projects/make-a-wish/welcome/welcome-envelope.png'
const logo = '/images/projects/make-a-wish/welcome/welcome-logo.svg'
const starTop = '/images/projects/make-a-wish/welcome/welcome-star-top.svg'
const starBottom = '/images/projects/make-a-wish/welcome/welcome-star-bottom.svg'

type LoginWelcomeProps = {
  invitation: { sessionVersion: number; name: string; suffix: string; isPaid: boolean }
  onDismiss: (sessionVersion: number) => void
}

export function LoginWelcome({ invitation, onDismiss }: LoginWelcomeProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dismiss = () => onDismiss(invitation.sessionVersion)

  return (
    <dialog
      open
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={`${styles.dialog} ${invitation.isPaid ? styles.paid : ''}`}
      onCancel={(event) => {
        event.preventDefault()
        event.stopPropagation()
        dismiss()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          dismiss()
        }
      }}
    >
      <div className={styles.scene}>
        <div className={styles.letter}>
          <img src={envelope} alt="" className={styles.envelope} />
          <img src={logo} alt="" className={styles.logo} />
          <div className={styles.copy}>
            <h3 id={titleId} className={styles.salutation}>
              Dear. <span className={styles.accent}>{invitation.name}</span>
              {invitation.suffix}
            </h3>
            <div id={descriptionId}>
              <p className={styles.introduction}>
                <span className={styles.accent}>120번째 생일</span>을 맞은 삼육대학교가
                <br />
                <strong className={styles.accent}>{invitation.name}</strong>
                {invitation.suffix}을 생일파티에 초대합니다.
              </p>
              <p className={styles.message}>
                함께 축하하고, 함께 웃으며
                <br />
                우리의 다음 120년을 위한
                <br />
                WISH를 빌어주세요.
              </p>
              <p className={styles.wish}>MAKE A WISH</p>
            </div>
          </div>
          {invitation.isPaid && (
            <>
              <img src={starTop} alt="" className={styles.starTop} />
              <img src={starBottom} alt="" className={styles.starBottom} />
            </>
          )}
        </div>
        <button type="button" onClick={dismiss} className={styles.enter}>
          생일파티 입장하기
        </button>
      </div>
    </dialog>
  )
}
