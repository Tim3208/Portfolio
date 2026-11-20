/**
 * 원본: Tim3208/agentflow-skills @ 3eb3c16 (apps/agentflow-monitor/src/shared/api/language.ts)
 * 변경점: 데스크톱 앱 전용 로컬 번역·요약 명령은 포트폴리오 데모에서 비활성화한다.
 */
export interface LanguageRequest {
  action: "lookup" | "generate";
  mode: "translate" | "summarize";
  texts: string[];
}

export interface LanguageResult {
  translations: (string | null)[];
  summary: string | null;
}

export const languageAvailable = () => false;

export async function requestLanguage(request: LanguageRequest): Promise<LanguageResult> {
  void request;
  throw new Error("데스크톱 앱에서 사용할 수 있습니다.");
}
