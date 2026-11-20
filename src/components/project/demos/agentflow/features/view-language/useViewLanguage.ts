import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { languageAvailable, requestLanguage, type LanguageResult } from '@/components/project/demos/agentflow/shared/api/language';
import { originalText, translatedText, type DisplayText, type ViewLanguageProjection } from './projection';

type Mode = 'translate' | 'summarize';
type Panel = { scope: string; translated: boolean; summaryOpen: boolean };
type Job = { id: number; scope: string; identity: string; error?: string };
type TranslationCache = { scope: string; values: ReadonlyMap<string, string> };
type SummaryCache = { key: string; text: string };
const idlePanel: Panel = { scope: '', translated: false, summaryOpen: false };

function mergeTranslations(previous: TranslationCache, scope: string, texts: string[], result: LanguageResult, visible: ReadonlySet<string>): TranslationCache {
  const values = new Map(previous.scope === scope ? [...previous.values].filter(([source]) => visible.has(source)) : []);
  texts.forEach((text, index) => {
    const translated = result.translations[index];
    if (visible.has(text) && typeof translated === 'string' && translated.trim()) values.set(text, translated);
  });
  return { scope, values };
}

function summaryText(result: LanguageResult): string | null {
  return result.summary?.trim().replace(/⟦경로\d+⟧/gu, '(경로 생략)') || null;
}

function languageError(reason: unknown, mode: Mode): string {
  const message = typeof reason === 'string' ? reason : reason instanceof Error ? reason.message : '';
  if (message.length <= 240 && /[가-힣]/u.test(message) && !/[\r\n]/u.test(message)) return message;
  return mode === 'translate' ? '번역을 가져오지 못했습니다. 다시 시도해 주세요.' : '요약을 가져오지 못했습니다. 다시 시도해 주세요.';
}

/** 조회는 캐시만 사용한다. 화면 전환·폴링 뒤에는 현재 내용과 일치하는 응답만 표시한다. */
export function useViewLanguage(scope: string, projection: ViewLanguageProjection) {
  const available = languageAvailable();
  const translationKey = useMemo(() => JSON.stringify(projection.translationTexts), [projection.translationTexts]);
  const visible = useMemo(() => new Set(JSON.parse(translationKey) as string[]), [translationKey]);
  const summaryKey = useMemo(() => JSON.stringify(projection.summaryTexts), [projection.summaryTexts]);
  const summaryIdentity = JSON.stringify([scope, summaryKey]);
  const [panel, setPanel] = useState<Panel>(idlePanel);
  const [translationCache, setTranslationCache] = useState<TranslationCache>({ scope: '', values: new Map() });
  const [summaryCache, setSummaryCache] = useState<SummaryCache | null>(null);
  const [jobs, setJobs] = useState<Partial<Record<Mode, Job>>>({});
  const inFlight = useRef(new Set<string>());
  const sequence = useRef(0);
  const current = useRef({ scope, summaryIdentity, visible });
  useLayoutEffect(() => { current.current = { scope, summaryIdentity, visible }; }, [scope, summaryIdentity, visible]);

  useEffect(() => {
    const texts = JSON.parse(translationKey) as string[];
    if (!available || !scope || !texts.length) return;
    let stopped = false;
    void requestLanguage({ action: 'lookup', mode: 'translate', texts }).then(result => {
      if (!stopped) setTranslationCache(previous => mergeTranslations(previous, scope, texts, result, visible));
    }).catch(() => { /* 직접 생성할 때 오류를 표시한다. */ });
    return () => { stopped = true; };
  }, [available, scope, translationKey, visible]);

  useEffect(() => {
    const texts = JSON.parse(summaryKey) as string[];
    if (!available || !scope || !texts.length) return;
    let stopped = false;
    void requestLanguage({ action: 'lookup', mode: 'summarize', texts }).then(result => {
      const text = summaryText(result);
      if (!stopped && text) setSummaryCache({ key: summaryIdentity, text });
    }).catch(() => { /* 직접 생성할 때 오류를 표시한다. */ });
    return () => { stopped = true; };
  }, [available, scope, summaryIdentity, summaryKey]);

  const selected = panel.scope === scope ? panel : { ...idlePanel, scope };
  const bySource = useMemo(() => {
    const result = new Map<string, string>();
    if (translationCache.scope !== scope) return result;
    for (const entry of projection.translations) {
      const cached = translationCache.values.get(entry.text);
      const displayed = cached == null ? null : translatedText(entry, cached);
      if (displayed != null) result.set(entry.original, displayed);
    }
    return result;
  }, [projection.translations, scope, translationCache]);
  const display = useMemo<DisplayText>(() => selected.translated ? text => bySource.get(text) ?? text : originalText, [bySource, selected.translated]);
  const summary = summaryCache?.key === summaryIdentity ? summaryCache.text : null;
  const translationJob = jobs.translate?.scope === scope ? jobs.translate : null;
  const summaryJob = jobs.summarize?.scope === scope && (!jobs.summarize.error || jobs.summarize.identity === summaryIdentity) ? jobs.summarize : null;

  async function generate(mode: Mode, texts: string[]) {
    if (!available || !scope || !texts.length) return;
    const identity = mode === 'translate' ? scope : summaryIdentity;
    const pendingKey = JSON.stringify([mode, scope]);
    if (inFlight.current.has(pendingKey)) return;
    inFlight.current.add(pendingKey);
    const id = ++sequence.current;
    setJobs(previous => ({ ...previous, [mode]: { id, scope, identity } }));
    let error: string | undefined;
    try {
      const result = await requestLanguage({ action: 'generate', mode, texts });
      if (mode === 'translate' && current.current.scope === scope) {
        const currentlyVisible = current.current.visible;
        setTranslationCache(previous => mergeTranslations(previous, scope, texts, result, currentlyVisible));
      }
      if (mode === 'summarize' && current.current.summaryIdentity === summaryIdentity) {
        const text = summaryText(result);
        if (text) setSummaryCache({ key: summaryIdentity, text });
        else error = '요약을 받지 못했습니다. 다시 시도해 주세요.';
      }
    } catch (reason) {
      error = languageError(reason, mode);
    } finally {
      inFlight.current.delete(pendingKey);
      setJobs(previous => previous[mode]?.id === id
        ? { ...previous, [mode]: error ? { id, scope, identity, error } : undefined }
        : previous);
    }
  }

  function showTranslation() {
    setPanel({ ...selected, translated: true });
    const missing = projection.translations.filter(entry => !bySource.has(entry.original)).map(entry => entry.text);
    void generate('translate', [...new Set(missing)]);
  }

  function toggleSummary() {
    if (selected.summaryOpen && summary) { setPanel({ ...selected, summaryOpen: false }); return; }
    setPanel({ ...selected, summaryOpen: true });
    if (!summary) void generate('summarize', projection.summaryTexts);
  }

  return {
    available, display, translated: selected.translated,
    canTranslate: projection.translationTexts.length > 0,
    canSummarize: projection.summaryTexts.length > 0,
    translationPending: Boolean(translationJob && !translationJob.error),
    summaryPending: Boolean(summaryJob && !summaryJob.error),
    translationError: translationJob?.error,
    summaryError: summaryJob?.error,
    translationLimited: projection.translationLimited,
    translationIncomplete: selected.translated && bySource.size < projection.translations.length,
    summaryLimited: projection.summaryLimited,
    summaryOpen: selected.summaryOpen,
    summary,
    showOriginal: () => setPanel({ ...selected, translated: false }),
    showTranslation,
    toggleSummary,
  };
}
