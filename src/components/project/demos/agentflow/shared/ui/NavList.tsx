import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface NavItem { id: string; selected: boolean; content: ReactNode; title?: string }

/** 위·아래 화살표로 항목 사이를 이동하는 목록. Enter와 클릭은 같은 선택 동작이다. */
export function NavList({ items, onSelect, label, className = '' }: { items: NavItem[]; onSelect: (id: string) => void; label: string; className?: string }) {
  const list = useRef<HTMLUListElement>(null);
  function move(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const buttons = [...list.current?.querySelectorAll<HTMLButtonElement>('button.nav-item') ?? []];
    const index = buttons.findIndex(button => button === document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
  }
  return <ul className={`nav-list ${className}`} aria-label={label} ref={list} onKeyDown={move}>
    {items.map(item => <li key={item.id}>
      <button className={`nav-item${item.selected ? ' is-selected' : ''}`} aria-current={item.selected ? 'true' : undefined} title={item.title} onClick={() => onSelect(item.id)}>{item.content}</button>
    </li>)}
  </ul>;
}
