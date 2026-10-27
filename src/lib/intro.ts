/**
 * 첫 방문 연출 (docs/design.md#intro)
 *
 * 처음 들어오면 빈 바탕화면에 아이콘만 있고, 연출 커서가 인사한 뒤
 * 포트폴리오 아이콘을 더블클릭해 창을 연다. 연출은 한 번만 본다.
 *
 * 창을 숨기는 일은 첫 페인트 전에 해야 한다. 하이드레이션을 기다리면 창이
 * 한 번 보였다가 사라진다. 그래서 테마처럼 <body> 안의 동기 스크립트가
 * <html> 에 data-intro="play" 를 붙이고, CSS 가 그동안 창을 숨긴다.
 * 이후 단계는 Curator 가 이어받는다.
 *   · play    — 스크립트가 붙임. 아직 아무도 이어받지 않음
 *   · running — Curator 가 연출을 시작함
 *   · open    — 창이 열리는 중 (globals.css 의 window-open)
 *   · 속성 없음 — 연출 없음 또는 끝남
 *
 * 연출 조건은 바탕화면 아이콘이 보이는 폭(lg), 모션 감소 설정 없음, 홈으로
 * 들어온 첫 방문이다. 이력서 링크로 상세 페이지에 바로 온 방문자는 기다리게
 * 하지 않는다. 저장소 접근이 막힌 환경에서는 매번 재생하지 않도록 아예 건너뛴다.
 *
 * JS 가 하이드레이션까지 가지 못하면 창이 영영 숨겨지므로, 아무도 이어받지
 * 않은 채 일정 시간이 지나면 스크립트가 스스로 속성을 지운다.
 */
export const INTRO_KEY = "intro-seen";

export const INTRO_INIT_SCRIPT = `(function(){try{
if(location.pathname!=="/")return;
if(!matchMedia("(min-width: 64rem)").matches)return;
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(localStorage.getItem("${INTRO_KEY}"))return;
var r=document.documentElement;
r.dataset.intro="play";
setTimeout(function(){if(r.dataset.intro==="play")delete r.dataset.intro;},8000);
}catch(e){}})();`;
