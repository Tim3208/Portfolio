/**
 * 원본: src/widgets/calendar-workspace/ui/ScheduleDataNotice.tsx · 기준 커밋: 40c516b.
 * 변경: 원본 타입·표시 계약·순수 로직을 수정 없이 옮겼다.
 */
import { dataStatusIcons, dataStatusToneClasses } from "./constants";
import type { ScheduleDataStatus } from "./types";

export function ScheduleDataNotice({
  status,
  compact = false,
}: {
  readonly status: ScheduleDataStatus;
  readonly compact?: boolean;
}) {
  const Icon = dataStatusIcons[status.tone];
  const toneClasses = dataStatusToneClasses[status.tone];

  if (compact) {
    return (
      <div
        className={[
          "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[10px] font-medium shadow-[0_8px_20px_rgb(0_0_0/18%)]",
          toneClasses.wrapper,
        ].join(" ")}
      >
        <Icon
          className={[
            "h-3 w-3 shrink-0",
            status.tone === "loading" ? "animate-spin" : "",
            toneClasses.icon,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
        <span>{status.label}</span>
      </div>
    );
  }

  return (
    <div
      className={[
        "flex min-w-0 items-start gap-2 rounded-lg border px-3 py-2 shadow-[0_12px_30px_rgb(0_0_0/24%)]",
        toneClasses.wrapper,
      ].join(" ")}
      role={status.tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <Icon
        className={[
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          status.tone === "loading" ? "animate-spin" : "",
          toneClasses.icon,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-medium leading-4">
          {status.label}
        </p>
        <p className="m-0 break-keep text-[11px] leading-4 opacity-70">
          {status.message}
        </p>
      </div>
    </div>
  );
}
