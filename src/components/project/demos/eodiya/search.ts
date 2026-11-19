/**
 * 원본: eodiya origin/main src/lib/search.ts · 기준 커밋 20f029a.
 * 변경점: 계산에 쓰이지 않는 필드 이름표와 explainSearchPlaces 설명 함수를 추가했다. 원본 searchPlaces의 계산·정렬·결과는 바꾸지 않았다.
 */
import type { CampusPlace } from "./types";

const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, "");
const NO_MATCH_SCORE = 999;
const ROOM_NUMBER_PAREN_PATTERN = /\(\s*\d+\s*호\s*\)$/u;

const GENERIC_DETAIL_TERMS = new Set(
  [
    "강의실",
    "대강의실",
    "중강의실",
    "소강의실",
    "세미나실",
    "실습실",
    "실험실",
    "주차장",
    "자료실",
    "학생공간",
    "각 동아리방",
    "휴게실",
  ].map(normalize),
);

type MatchField = {
  text: string;
  baseScore: number;
  // 데모 추가: 점수 계산에는 사용하지 않는 필드 이름표.
  label: string;
};

type InternalDetail = {
  title: string;
  aliases: string[];
};

type SearchCandidate = {
  key: string;
  place: CampusPlace;
  title: string;
  subtitle: string;
  fields: MatchField[];
  scoreOffset?: number;
};

export type PlaceSearchResult = {
  key: string;
  place: CampusPlace;
  title: string;
  subtitle: string;
};

function formatLocation(place: CampusPlace): string {
  return place.floor ? `${place.building} ${place.floor}` : place.building;
}

function cleanDetailText(text: string): string {
  return text
    .replace(/^\s*(지하\s*\d+층|B\s*\d+|\d+\s*층)\s*:\s*/iu, "")
    .replace(/[•●◦▪◆◇▶▷►]/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitOutsideParentheses(text: string, separators: Set<string>): string[] {
  const output: string[] = [];
  let token = "";
  let parenDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (ch === "(") {
      parenDepth += 1;
      token += ch;
      continue;
    }
    if (ch === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      token += ch;
      continue;
    }
    if (ch === "[") {
      bracketDepth += 1;
      token += ch;
      continue;
    }
    if (ch === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      token += ch;
      continue;
    }

    if (parenDepth === 0 && bracketDepth === 0 && separators.has(ch)) {
      const normalized = cleanDetailText(token);
      if (normalized) output.push(normalized);
      token = "";
      continue;
    }

    token += ch;
  }

  const normalized = cleanDetailText(token);
  if (normalized) output.push(normalized);

  return output;
}

function normalizeItemText(item: string): string {
  return cleanDetailText(item)
    .replace(/^[-–—•●◦▪◆◇▶▷►\s]+/, "")
    .replace(/[.;,]$/g, "")
    .trim();
}

function splitDetailItems(description: string): string[] {
  const normalized = cleanDetailText(description);
  if (!normalized) return [];

  const primarySplit = splitOutsideParentheses(normalized, new Set(["|", "/"]));
  const results: string[] = [];
  const englishCommaList = /^[A-Za-z0-9&().\-\s]+[,，]\s*[A-Za-z0-9&().\-\s]+$/;

  for (const item of primarySplit) {
    const trimmed = normalizeItemText(item);
    if (!trimmed) continue;

    const hasComma = /[,，]/.test(trimmed);
    if (hasComma && !englishCommaList.test(trimmed)) {
      const commaSplit = splitOutsideParentheses(trimmed, new Set([",", "，"]))
        .map((value) => normalizeItemText(value))
        .filter(Boolean);

      if (commaSplit.length >= 2) {
        results.push(...commaSplit);
        continue;
      }
    }

    results.push(trimmed);
  }

  return results;
}

function isGenericDetailTerm(value: string): boolean {
  return GENERIC_DETAIL_TERMS.has(normalize(value));
}

function toDisplayTitle(rawItem: string): string {
  const cleaned = normalizeItemText(rawItem);
  if (ROOM_NUMBER_PAREN_PATTERN.test(cleaned)) {
    return cleaned.replace(ROOM_NUMBER_PAREN_PATTERN, "").trim();
  }
  return cleaned;
}

function buildDetailAliases(rawItem: string, title: string): string[] {
  const aliasSet = new Set<string>();
  const cleanedRaw = normalizeItemText(rawItem);
  const noParen = cleanedRaw.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();

  if (cleanedRaw) aliasSet.add(cleanedRaw);
  if (title) aliasSet.add(title);
  if (noParen) aliasSet.add(noParen);

  return Array.from(aliasSet).filter((alias) => alias.length >= 2);
}

function extractInternalDetails(description?: string): InternalDetail[] {
  if (!description) return [];

  const detailMap = new Map<string, InternalDetail>();
  const parts = splitDetailItems(description);

  for (const rawItem of parts) {
    const title = toDisplayTitle(rawItem);
    if (!title || title.length < 2) continue;
    if (isGenericDetailTerm(title)) continue;

    const aliases = buildDetailAliases(rawItem, title);
    if (aliases.length === 0) continue;

    const key = normalize(title);
    const existing = detailMap.get(key);
    if (existing) {
      existing.aliases = Array.from(new Set([...existing.aliases, ...aliases]));
      continue;
    }

    detailMap.set(key, { title, aliases });
  }

  return Array.from(detailMap.values());
}

function buildDetailIndex(list: CampusPlace[]): {
  detailsByPlaceId: Map<string, InternalDetail[]>;
  detailFrequency: Map<string, number>;
} {
  const detailsByPlaceId = new Map<string, InternalDetail[]>();
  const detailFrequency = new Map<string, number>();

  list.forEach((place) => {
    if (place.category !== "건물 내부") return;

    const details = extractInternalDetails(place.description);
    detailsByPlaceId.set(place.id, details);

    details.forEach((detail) => {
      const key = normalize(detail.title);
      detailFrequency.set(key, (detailFrequency.get(key) ?? 0) + 1);
    });
  });

  return { detailsByPlaceId, detailFrequency };
}

function detailScoreOffset(title: string, frequencyMap: Map<string, number>): number {
  const count = frequencyMap.get(normalize(title)) ?? 1;
  if (count >= 5) return 2;
  if (count >= 3) return 1;
  return 0;
}

function buildBaseCandidate(place: CampusPlace): SearchCandidate {
  return {
    key: place.id,
    place,
    title: place.name,
    subtitle: `${formatLocation(place)} · ${place.category}`,
    fields: [
      { text: place.name, baseScore: 0, label: "이름" },
      ...place.aliases.map((alias) => ({ text: alias, baseScore: 2, label: "장소명·건물명·층" })),
      { text: formatLocation(place), baseScore: 4, label: "건물과 층" },
      { text: place.category, baseScore: 6, label: "분류" },
      { text: place.description ?? "", baseScore: 10, label: "설명" },
    ],
  };
}

function buildInternalDetailCandidates(
  place: CampusPlace,
  detailsByPlaceId: Map<string, InternalDetail[]>,
  frequencyMap: Map<string, number>,
): SearchCandidate[] {
  if (place.category !== "건물 내부") return [];

  const details = detailsByPlaceId.get(place.id) ?? [];
  const location = formatLocation(place);

  return details.map((detail, index) => ({
    key: `${place.id}::detail::${index}`,
    place,
    title: detail.title,
    subtitle: location,
    scoreOffset: detailScoreOffset(detail.title, frequencyMap),
    fields: [
      { text: detail.title, baseScore: 1, label: "층별 시설" },
      ...detail.aliases.map((alias) => ({ text: alias, baseScore: 2, label: "층별 시설 표기" })),
      { text: location, baseScore: 5, label: "건물과 층" },
      { text: place.name, baseScore: 5, label: "층별 항목 이름" },
      ...place.aliases.map((alias) => ({ text: alias, baseScore: 6, label: "장소명·건물명·층" })),
    ],
  }));
}

function scoreField(normalizedValue: string, query: string, baseScore: number): number {
  if (!normalizedValue) return NO_MATCH_SCORE;
  if (normalizedValue === query) return baseScore;
  if (normalizedValue.startsWith(query)) return baseScore + 1;
  if (normalizedValue.includes(query)) return baseScore + 2;
  return NO_MATCH_SCORE;
}

function scoreCandidate(candidate: SearchCandidate, query: string): number {
  const baseScore = candidate.fields.reduce((best, field) => {
    const next = scoreField(normalize(field.text), query, field.baseScore);
    return Math.min(best, next);
  }, NO_MATCH_SCORE);

  if (baseScore >= NO_MATCH_SCORE) return baseScore;
  return baseScore + (candidate.scoreOffset ?? 0);
}

export function searchPlaces(query: string, list: CampusPlace[]): PlaceSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const { detailsByPlaceId, detailFrequency } = buildDetailIndex(list);

  const candidates = list.flatMap((place) => [
    buildBaseCandidate(place),
    ...buildInternalDetailCandidates(place, detailsByPlaceId, detailFrequency),
  ]);

  return candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, normalizedQuery),
    }))
    .filter(({ score }) => score < NO_MATCH_SCORE)
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.candidate.title !== b.candidate.title) {
        return a.candidate.title.localeCompare(b.candidate.title, "ko");
      }
      return a.candidate.place.name.localeCompare(b.candidate.place.name, "ko");
    })
    .map(({ candidate }) => ({
      key: candidate.key,
      place: candidate.place,
      title: candidate.title,
      subtitle: candidate.subtitle,
    }))
    .slice(0, 20);
}

// ── 데모 추가: 원본 검색 계산과 순서는 위에 그대로 두고 이유만 읽는다. ──

export type PlaceSearchExplanation = PlaceSearchResult & {
  fieldLabel: string;
  matchedText: string;
  matchKind: "완전 일치" | "앞부분 일치" | "포함";
  baseScore: number;
  matchPenalty: number;
  repetitionPenalty: number;
  repetitionFrequency: number;
  score: number;
};

/** 원본 searchPlaces 결과의 순서대로, 최저 점수를 만든 필드를 설명한다. */
export function explainSearchPlaces(
  query: string,
  list: CampusPlace[],
): PlaceSearchExplanation[] {
  const results = searchPlaces(query, list);
  if (results.length === 0) return [];

  const normalizedQuery = normalize(query);
  const { detailsByPlaceId, detailFrequency } = buildDetailIndex(list);
  const candidates = list.flatMap((place) => [
    buildBaseCandidate(place),
    ...buildInternalDetailCandidates(place, detailsByPlaceId, detailFrequency),
  ]);

  return results.map((result) => {
    const candidate = candidates.find(
      (item) => item.key === result.key && item.place === result.place,
    );
    if (!candidate) throw new Error("검색 결과의 원본 후보를 찾을 수 없습니다.");

    // 같은 점수면 원본 fields 순서의 첫 필드를 설명한다. 검색 순위에는 영향이 없다.
    let bestField = candidate.fields[0];
    let bestScore = NO_MATCH_SCORE;
    candidate.fields.forEach((field) => {
      const score = scoreField(normalize(field.text), normalizedQuery, field.baseScore);
      if (score < bestScore) {
        bestField = field;
        bestScore = score;
      }
    });

    const matchPenalty = bestScore - bestField.baseScore;
    const matchKind = matchPenalty === 0
      ? "완전 일치"
      : matchPenalty === 1 ? "앞부분 일치" : "포함";
    const matchesParentheticalName = Array.from(
      bestField.text.matchAll(/\(([^)]*)\)/g),
    ).some((match) => normalize(match[1]).includes(normalizedQuery));
    const fieldLabel = matchesParentheticalName
      ? bestField.label.startsWith("층별 시설")
        ? "시설의 괄호 속 이름"
        : `${bestField.label}의 괄호 속 이름`
      : bestField.label;

    return {
      ...result,
      fieldLabel,
      matchedText: bestField.text,
      matchKind,
      baseScore: bestField.baseScore,
      matchPenalty,
      repetitionPenalty: candidate.scoreOffset ?? 0,
      repetitionFrequency: candidate.scoreOffset === undefined
        ? 1
        : detailFrequency.get(normalize(candidate.title)) ?? 1,
      score: scoreCandidate(candidate, normalizedQuery),
    };
  });
}
