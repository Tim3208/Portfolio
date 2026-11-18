import { readBoard } from "./api/getMyStamps";
import { buildStampBoard, type StampSlots } from "./lib/board";
import type { BoothCategory } from "./types";

/** 데모 전용 가짜 서버. 검증·배정은 이식한 원본 함수에만 맡긴다. */
export const SAMPLE_BOOTHS = [
  { id: 1, name: "샘플 부스 A", category: "STUDENT_COUNCIL" },
  { id: 2, name: "샘플 부스 B", category: "CAMPUS" },
  { id: 3, name: "샘플 부스 C", category: "GENERAL" },
  { id: 4, name: "샘플 부스 D", category: "OTHER" },
  { id: 5, name: "샘플 부스 E", category: "FOOD_TRUCK" },
  { id: 6, name: "샘플 부스 F", category: "EXTERNAL" },
] as const satisfies readonly { id: number; name: string; category: BoothCategory }[];

export const SCENARIOS = [
  { value: "normal", label: "정상" },
  { value: "mismatch", label: "총개수 불일치" },
  { value: "unclassified", label: "분류 누락" },
  { value: "failure", label: "조회 실패" },
] as const;
type Scenario = (typeof SCENARIOS)[number]["value"];
type Grant = { boothId: number; order: number };
type SampleServer = { grants: readonly Grant[]; scenario: Scenario; nextOrder: number };
type Screen = {
  slots: StampSlots | null;
  error: "stamps" | "classification" | null;
  autoRefresh: boolean;
};
export type DemoState = SampleServer & { screen: Screen; visit: number };
export type DemoAction =
  | { type: "toggle"; boothId: number }
  | { type: "scenario"; value: string }
  | { type: "retry" }
  | { type: "reopen" };

const BASE_TIME = Date.parse("2026-10-06T09:00:00+09:00");

export function makeResponse(server: SampleServer) {
  if (server.scenario === "failure") return { error: "샘플 조회 실패" } as const;
  const stamps = SAMPLE_BOOTHS.flatMap((booth) => {
    const grant = server.grants.find(({ boothId }) => boothId === booth.id);
    return grant ? [{
      boothId: booth.id,
      boothName: booth.name,
      grantedAt: new Date(BASE_TIME + grant.order * 60_000).toISOString(),
      operator: null,
    }] : [];
  });
  return {
    stamps: {
      participated: stamps.length > 0,
      stampCount: stamps.length + (server.scenario === "mismatch" ? 1 : 0),
      stamps,
    },
    booths: SAMPLE_BOOTHS.map(({ id, category }) => ({
      id,
      category: server.scenario === "unclassified" && id === server.grants[0]?.boothId ? null : category,
    })),
  };
}

/** 패널 변경 한 번을 다음 자동 조회로 취급한다. 요청 실패만 자동 갱신을 멈춘다. */
function query(server: SampleServer, previousSlots: StampSlots | null): Screen {
  try {
    // 네트워크 대신 JSON 왕복을 거친 응답을 원본 검증기에 전달한다.
    const response: ReturnType<typeof makeResponse> = JSON.parse(JSON.stringify(makeResponse(server)));
    if ("error" in response) throw new Error(response.error);
    const data = readBoard(response.stamps);
    const result = buildStampBoard(data.stamps, response.booths);
    return result.status === "ready"
      ? { slots: result.slots, error: null, autoRefresh: true }
      : { slots: previousSlots, error: "classification", autoRefresh: true };
  } catch {
    return { slots: previousSlots, error: "stamps", autoRefresh: false };
  }
}

export function initialDemoState(): DemoState {
  const server: SampleServer = {
    grants: [1, 2, 3].map((boothId, order) => ({ boothId, order })),
    scenario: "normal",
    nextOrder: 3,
  };
  return { ...server, screen: query(server, null), visit: 0 };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "retry") return { ...state, screen: query(state, state.screen.slots) };
  if (action.type === "reopen") {
    return { ...state, screen: query(state, null), visit: state.visit + 1 };
  }
  let next: DemoState;
  if (action.type === "scenario") {
    const scenario = SCENARIOS.find(({ value }) => value === action.value)?.value;
    if (!scenario) return state;
    next = { ...state, scenario };
  } else {
    if (!SAMPLE_BOOTHS.some(({ id }) => id === action.boothId)) return state;
    const granted = state.grants.some(({ boothId }) => boothId === action.boothId);
    next = {
      ...state,
      grants: granted
        ? state.grants.filter(({ boothId }) => boothId !== action.boothId)
        : [...state.grants, { boothId: action.boothId, order: state.nextOrder }],
      nextOrder: state.nextOrder + (granted ? 0 : 1),
    };
  }
  return { ...next, screen: state.screen.autoRefresh ? query(next, state.screen.slots) : state.screen };
}
