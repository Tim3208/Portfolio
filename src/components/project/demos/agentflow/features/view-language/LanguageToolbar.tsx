import { useId } from 'react';
import type { useViewLanguage } from './useViewLanguage';

export function LanguageToolbar({ language }: { language: ReturnType<typeof useViewLanguage> }) {
  const summaryId = useId();
  if (!language.available) return <div className="language-tools"><p className="language-note">한국어 번역과 요약은 데스크톱 앱에서 사용할 수 있습니다.</p></div>;
  return <div className="language-tools">
    <div className="language-actions">
      <div className="chip-row" role="group" aria-label="표시 언어">
        <button className={`chip${!language.translated ? ' is-selected' : ''}`} aria-pressed={!language.translated} onClick={language.showOriginal}>원문</button>
        <button className={`chip${language.translated ? ' is-selected' : ''}`} aria-pressed={language.translated} disabled={!language.canTranslate || language.translationPending} onClick={language.showTranslation}>{language.translationPending ? '번역 중' : '한국어 번역'}</button>
      </div>
      <button className="chip" aria-expanded={language.summaryOpen} aria-controls={summaryId} disabled={!language.canSummarize || language.summaryPending} onClick={language.toggleSummary}>{language.summaryPending ? '요약 중' : '한국어 요약'}</button>
    </div>
    {(language.translated || language.translationLimited) && <div className="language-feedback" aria-live="polite">
      {language.translated && language.translationError && <p className="language-error">{language.translationError}</p>}
      {!language.translationPending && (language.translationLimited || language.translationIncomplete) && <p className="language-note">{language.translationLimited ? '분량 제한으로 일부 항목은 원문으로 표시됩니다.' : '번역이 준비되지 않은 항목은 원문으로 표시됩니다.'}</p>}
    </div>}
    <section className="language-summary" id={summaryId} aria-label="현재 보기의 한국어 요약" hidden={!language.summaryOpen} aria-busy={language.summaryPending}>
      <h2 className="section-title">한국어 요약</h2>
      {language.summary ? <>
        <p className="language-summary-text">{language.summary}</p>
        {language.summaryLimited && <p className="language-note">현재 보기의 일부 기록을 요약했습니다.</p>}
      </> : <p className={language.summaryError ? 'language-error' : 'language-note'} role="status">{language.summaryPending ? '요약을 만드는 중입니다.' : language.summaryError ?? '기록이 바뀌었습니다. 한국어 요약을 눌러 새로 확인하세요.'}</p>}
    </section>
  </div>;
}
