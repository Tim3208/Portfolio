import type { DemoName } from "@/data/caseStudies";

import { ApprovalResetDemo } from "./ApprovalResetDemo";
import { CalendarFirstDemo } from "./CalendarFirstDemo";
import { EvaluationScreenDemo } from "./EvaluationScreenDemo";
import { InputQaDemo } from "./InputQaDemo";
import { PlaceSearchDemo } from "./PlaceSearchDemo";
import { ResultStatusDemo } from "./ResultStatusDemo";
import { StampBoardDemo } from "./StampBoardDemo";

/** Case Study 의 demo 블록이 이름으로 고르는 위젯 */
export function Demo({ name }: { name: DemoName }) {
  switch (name) {
    case "evaluation-screen":
      return <EvaluationScreenDemo />;
    case "approval-reset":
      return <ApprovalResetDemo />;
    case "stamp-board":
      return <StampBoardDemo />;
    case "result-status":
      return <ResultStatusDemo />;
    case "place-search":
      return <PlaceSearchDemo />;
    case "calendar-first":
      return <CalendarFirstDemo />;
    case "input-qa":
      return <InputQaDemo />;
  }
}

export { ApprovalResetDemo, CalendarFirstDemo, EvaluationScreenDemo, InputQaDemo, PlaceSearchDemo, ResultStatusDemo, StampBoardDemo };
