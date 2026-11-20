import type { CSSProperties } from 'react';

/** 하나의 선 아이콘 세트. 크기 16, 선 두께 1.5를 기본으로 하고 색은 글자 역할을 따른다. */
export type IconName =
  | 'flow' | 'chevron' | 'chevron-down' | 'arrow' | 'up' | 'file' | 'folder' | 'close' | 'refresh' | 'search'
  | 'layers' | 'check' | 'copy' | 'wrap' | 'alert' | 'hourglass' | 'repeat' | 'list' | 'clock' | 'target';

const paths: Record<IconName, React.ReactNode> = {
  flow: <><rect x="3" y="3" width="6" height="6" rx="1.5" /><rect x="15" y="15" width="6" height="6" rx="1.5" /><path d="M6 9v6a3 3 0 0 0 3 3h6M9 6h6a3 3 0 0 1 3 3v6" /></>,
  chevron: <path d="m9 6 6 6-6 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  up: <path d="M12 19V5m-6 6 6-6 6 6" />,
  file: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  refresh: <path d="M20 7v5h-5M4 17v-5h5M5.6 9A7 7 0 0 1 18 7l2 2M18.4 15A7 7 0 0 1 6 17l-2-2" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  layers: <path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  wrap: <path d="M4 6h16M4 12h13a3 3 0 0 1 0 6h-4m0 0 2-2m-2 2 2 2M4 18h5" />,
  alert: <><path d="M12 4 3 20h18z" /><path d="M12 10v4M12 17.5v.01" /></>,
  hourglass: <path d="M7 3h10M7 21h10M8 3v3a4 4 0 0 0 4 4 4 4 0 0 0 4-4V3M8 21v-3a4 4 0 0 1 4-4 4 4 0 0 1 4 4v3" />,
  repeat: <path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4" />,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>,
};

export function Icon({ name, size = 16, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
