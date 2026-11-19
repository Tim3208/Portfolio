"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BuildingCard from "./eodiya/BuildingCard";
import Button from "./eodiya/Button";
import Card from "./eodiya/Card";
import EmptyState from "./eodiya/EmptyState";
import { campusPlaces } from "./eodiya/places";
import { explainSearchPlaces, searchPlaces, type PlaceSearchResult } from "./eodiya/search";
import SearchInput from "./eodiya/SearchInput";
import SearchResultItem from "./eodiya/SearchResultItem";
import styles from "./eodiya/service.module.css";
import type { CampusPlace, PlaceCategory } from "./eodiya/types";
import { DeferredDemoFrame } from "./shell/DeferredDemoFrame";
import { DemoLayout } from "./shell/DemoLayout";
import { DemoPanel } from "./shell/DemoPanel";

/**
 * 원본: eodiya/src/pages/CampusMapPage.tsx (origin/main, 20f029a).
 * 변경: 지도 전용 계산·MapView·AppLayout/헤더 제외, 기본 검색어를 장근청홀로 지정.
 * 패널의 검색·필터·선택·드롭다운 동작은 유지하고 색 유틸리티만 Tailwind 4로 이식.
 * 포트폴리오 공통 프레임과 화면 밖 예시 검색어·순위 설명을 추가했다.
 */
type CategoryFilter = "전체" | PlaceCategory;
const EXAMPLE_QUERIES = ["장근청홀", "학생식당", "편의점", "프랜들리", "중앙 도서관", "총장실", "중앙도서곤"];
const INITIAL_QUERY = EXAMPLE_QUERIES[0];
const INITIAL_SELECTED_ID = searchPlaces(INITIAL_QUERY, campusPlaces)[0]?.place.id ?? null;

const formatLocation = (place: CampusPlace) =>
  place.floor ? `${place.building} ${place.floor}` : place.building;

const toDefaultResult = (place: CampusPlace): PlaceSearchResult => ({
  key: place.id,
  place,
  title: place.name,
  subtitle: `${formatLocation(place)} · ${place.category}`,
});

export function PlaceSearchControls() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [category, setCategory] = useState<CategoryFilter>("전체");
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_SELECTED_ID);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const categoryOptions = useMemo<CategoryFilter[]>(() => [
    "전체", ...new Set(campusPlaces.map((place) => place.category)),
  ], []);

  const searchedResults = useMemo<PlaceSearchResult[]>(() => {
    if (!query.trim()) return campusPlaces.map(toDefaultResult);
    return searchPlaces(query, campusPlaces);
  }, [query]);

  const visibleResults = useMemo(() => {
    if (category === "전체") return searchedResults;
    return searchedResults.filter((result) => result.place.category === category);
  }, [category, searchedResults]);

  const visiblePlaces = useMemo<CampusPlace[]>(() => {
    const byId = new Map<string, CampusPlace>();
    visibleResults.forEach((result) => {
      if (!byId.has(result.place.id)) byId.set(result.place.id, result.place);
    });
    return Array.from(byId.values());
  }, [visibleResults]);

  const selected = useMemo<CampusPlace | null>(() => {
    if (visiblePlaces.length === 0) return null;
    return visiblePlaces.find((place) => place.id === selectedId) ?? visiblePlaces[0];
  }, [selectedId, visiblePlaces]);

  const quickResults = useMemo(() => visibleResults.slice(0, 8), [visibleResults]);

  const explanations = useMemo(() => explainSearchPlaces(query, campusPlaces)
    .filter((result) => category === "전체" || result.place.category === category)
    .slice(0, 5), [query, category]);

  const handleSelectFromList = useCallback((result: PlaceSearchResult) => {
    setSelectedId(result.place.id);
    setQuery(result.title);
    setIsDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (searchBoxRef.current?.contains(target)) return;
      setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  return (
    <DemoLayout>
      <DeferredDemoFrame
        className={styles.frame}
        placeholder={<div className={`${styles.screen} min-h-[48rem]`} aria-hidden="true" />}
      >
        <div className={`${styles.screen} space-y-4 p-4`}>
          <div ref={searchBoxRef} className="relative">
            <SearchInput
              value={query}
              aria-label="장소명, 건물명, 내부 시설명으로 검색"
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                setIsDropdownOpen(Boolean(next.trim()));
              }}
              onFocus={() => {
                if (query.trim()) setIsDropdownOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsDropdownOpen(false);
                  return;
                }
                if (event.key !== "Enter") return;
                event.preventDefault();
                if (visibleResults.length > 0) handleSelectFromList(visibleResults[0]);
                else setIsDropdownOpen(false);
              }}
              placeholder="장소명, 건물명, 내부 시설명으로 검색"
            />
            {isDropdownOpen && query.trim() && visibleResults.length > 0 ? (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-(--eodiya-gray-200) bg-(--eodiya-white) shadow-sm">
                {visibleResults.slice(0, 10).map((result) => (
                  <button
                    key={result.key}
                    className="block w-full text-left hover:bg-(--eodiya-gray-50)"
                    onClick={() => handleSelectFromList(result)}
                    type="button"
                  >
                    <SearchResultItem result={result} />
                  </button>
                ))}
              </div>
            ) : null}
            {isDropdownOpen && query.trim() && visibleResults.length === 0 ? (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-(--eodiya-gray-200) bg-(--eodiya-white) px-4 py-3 text-sm text-(--eodiya-gray-600) shadow-sm">
                검색 결과가 없습니다. 다른 키워드로 찾아보세요.
              </div>
            ) : null}
          </div>

          <Card>
            <div className="text-sm font-semibold text-(--eodiya-gray-900)">분류 필터</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categoryOptions.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={category === option ? "primary" : "ghost"}
                  aria-pressed={category === option}
                  onClick={() => setCategory(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </Card>

          {selected ? <BuildingCard place={selected} /> : <EmptyState />}

          <Card>
            <div className="text-sm font-semibold text-(--eodiya-gray-900)">
              주요 장소 ({visibleResults.length})
            </div>
            <div className="mt-2 divide-y divide-(--eodiya-gray-200)">
              {quickResults.map((result) => {
                const isActive = selected?.id === result.place.id;
                return (
                  <button
                    key={result.key}
                    type="button"
                    onClick={() => handleSelectFromList(result)}
                    className={`block w-full py-2 text-left ${isActive
                      ? "bg-(--eodiya-brand-primary)/5"
                      : "hover:bg-(--eodiya-gray-50)"}`}
                  >
                    <SearchResultItem result={result} />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </DeferredDemoFrame>

      <DemoPanel
        label="왜 이 순서인가"
        intro={
          <>
            <p className="font-semibold">왜 이 순서인가</p>
            <p className="text-sm text-ink-2">
              검색어가 어느 필드에 어떻게 일치했는지로 점수를 매기고, 점수가 낮을수록 위에 옵니다.
            </p>
          </>
        }
        controls={
          <fieldset className="min-w-0">
            <legend className="sr-only mb-1 text-xs text-ink-2 md:not-sr-only">예시 검색어</legend>
            <div className="flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
              {EXAMPLE_QUERIES.map((example) => (
                <button
                  key={example}
                  type="button"
                  aria-pressed={query === example}
                  onClick={() => {
                    setQuery(example);
                    setIsDropdownOpen(false);
                  }}
                  className="min-h-11 shrink-0 rounded-xs border border-rule px-3 text-sm aria-pressed:border-hue-deep aria-pressed:bg-hue-tint aria-pressed:font-semibold"
                >
                  {example}
                </button>
              ))}
            </div>
          </fieldset>
        }
        body={
          <div className="mt-4 md:mt-0" aria-live="polite" aria-atomic="false">
            {!query.trim() ? (
              <p className="text-sm text-ink-2">검색어를 입력하면 순서의 이유가 여기에 나옵니다.</p>
            ) : explanations.length === 0 ? (
              <p className="text-sm text-ink-2">일치하는 필드가 없습니다. 오타는 보정하지 않습니다.</p>
            ) : (
              <>
                <ol className="divide-y divide-rule border-y border-rule" aria-label="검색 결과 순서 설명">
                  {explanations.map((result, index) => (
                    <li key={result.key} className="flex gap-3 py-3">
                      <span className="text-sm tabular-nums text-hue-deep">{index + 1}위</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{result.title}</p>
                        <p className="text-xs text-ink-2">{result.subtitle}</p>
                        <p className="mt-2 text-sm">{result.fieldLabel} · {result.matchKind}</p>
                        <p className="break-words text-sm text-ink-2">“{result.matchedText}”</p>
                        <p className="mt-1 text-sm tabular-nums">
                          <strong>{result.score}점</strong>
                          <span className="text-ink-2"> = 필드 {result.baseScore} + 일치 {result.matchPenalty}
                            {result.repetitionPenalty > 0 ? ` + 반복 ${result.repetitionPenalty}` : ""}
                          </span>
                        </p>
                        {result.repetitionPenalty > 0 ? (
                          <p className="mt-1 text-sm text-ink-2">
                            같은 시설 이름이 {result.repetitionFrequency}개 층별 항목에 반복되어 {result.repetitionPenalty}점을 더했습니다.
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-ink-2">동점이면 결과 이름, 장소 이름 순으로 한국어 정렬합니다.</p>
              </>
            )}
          </div>
        }
      />
    </DemoLayout>
  );
}
