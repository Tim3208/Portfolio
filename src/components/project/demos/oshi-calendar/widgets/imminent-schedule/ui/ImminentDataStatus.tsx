/**
 * 원본: src/widgets/imminent-schedule/ui/ImminentDataStatus.tsx · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
import { dataStatusToneClasses } from "./constants";
import type { ScheduleDataStatus } from "./types";

export function ImminentDataStatus({
  status,
}: {
  readonly status: ScheduleDataStatus;
}) {
  const toneClasses = dataStatusToneClasses[status.tone];

  return (
    <div
      className={[
        "grid min-w-0 grid-cols-[8px_minmax(0,1fr)] items-start gap-2 rounded-lg border px-3 py-2",
        toneClasses.wrapper,
      ].join(" ")}
      role={status.tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span
        className={[
          "mt-[5px] h-2 w-2 rounded-full",
          status.tone === "loading" ? "animate-pulse" : "",
          toneClasses.dot,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="m-0 text-[10px] font-medium leading-4">
          {status.label}
        </p>
        <p className="m-0 break-keep text-[10px] leading-4 opacity-70">
          {status.message}
        </p>
      </div>
    </div>
  );
}
