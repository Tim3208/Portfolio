/**
 * 연출 커서(큐레이터)가 하는 말 (docs/design.md#intro).
 *
 * 큐레이터는 방문자 곁에서 사이트를 안내하는 커서다. 본문이 사실을 말하고,
 * 큐레이터는 그 옆에서 길 안내와 뒷이야기를 한마디씩 보탠다. lg 이상에서만
 * 보이는 장식이라, 없어도 되는 말만 맡긴다 — 수치의 출처, 기여 범위, 비공개
 * 사유처럼 꼭 읽혀야 하는 내용은 본문에 둔다. 대사도 docs/content.md 에서
 * 확인된 사실만 쓴다.
 *
 * 같은 말은 한 번 들어온 동안 한 번만 한다.
 */
export type CuratorNote = {
  /**
   * 이 요소가 본문에 보일 때만 꺼내는 말(CSS 선택자). 말할 때 그 곁으로 간다.
   * 없으면 그 페이지 어디서든 꺼낸다.
   */
  target?: string;
  text: string;
  /**
   * 말한 뒤 대신 눌러 보일 조작부의 이름. `target` 안에서 글자나 aria-label 이
   * 이 값과 같은 버튼 · 라디오 · 체크박스를 찾는다. 그 조작부가 화면에 보이고
   * 아직 켜지지 않았을 때만 꺼내며, 말할 때는 그 조작부 곁으로 간다.
   */
  press?: string;
};

/** 방문자의 행동이나 페이지 진입에 한 번 맞장구치는 말 */
const REACTIONS = {
  /** 첫 방문 연출이 끝난 뒤. 큐레이터를 부르는 방법을 알린다. */
  tip: "궁금한 게 생기면 저를 툭 쳐보세요.",
  /** 연출을 본 적이 있는 방문자가 홈으로 다시 들어왔을 때 */
  returning: "또 오셨네요! 이번엔 창 미리 열어뒀어요.",
  /** 주소창에 처음 초점을 뒀을 때 */
  address: "진짜 주소창이에요. syu-likelion.org 쳐보세요.",
  /** 사이트 밖 주소를 입력해 안내 화면으로 왔을 때 */
  external: "거긴 창 밖이라 제가 못 따라가요.",
  /** 없는 경로로 왔을 때 */
  missing: "저도 여긴 처음 와봐요.",
  /** 탭을 네 개째 열었을 때 */
  tabs: "탭 부자시네요. 새로고침해도 그대로 있어요.",
  /** 다크 테마로 바꿨을 때 */
  dark: "색도 다크용으로 따로 맞췄어요.",
  /** 라이브 탭에서 서비스가 열렸을 때 */
  live: "캡처 아니고 진짜 돌아가는 서비스예요. 막 눌러보셔도 됩니다!",
} as const;

export type CuratorCue = keyof typeof REACTIONS;

/**
 * 방문자가 큐레이터를 툭 쳤을 때 꺼내는 말. 경로별로 적고, "*" 는 모든 페이지다.
 * 본문에 보이는 `target` 이 있는 말을 먼저, 없으면 페이지 전체의 말을 꺼낸다.
 */
const NOTES: Record<string, readonly CuratorNote[]> = {
  "/": [
    { text: "시간이 없으시면 첫 번째 프로젝트만 보세요. 제일 깊게 정리했어요." },
    {
      target: 'section[aria-labelledby="method-agentflow"] [data-switch]',
      press: "승인 뒤 파일 변경",
      text: "승인한 뒤에 파일을 바꿔볼게요. 앞선 승인이 전부 무효가 돼요.",
    },
  ],
  "/work": [{ text: "'서비스 열어 보기'를 누르면 진짜 서비스가 이 창 안에서 열려요." }],
  "/teaching": [
    { target: "#tools", text: "mathGraph는 직접 열어볼 수 있어요. '표시 추가'로 점을 찍어 보세요." },
  ],
  "/projects/syu-likelion": [
    { text: "로그인 뒤 화면은 서비스에서 못 보시니까, 실제 코드를 아래에 옮겨 놨어요." },
    {
      target: "#section-06 [data-demo-panel]",
      press: "제출 완료",
      text: "제출 직후로 돌려볼게요. 서류 마감 전까지는 지원서를 고칠 수 있어요.",
    },
    { target: "#section-07 [data-demo-layout]", text: "화면 속 지원자는 전부 가상 인물이에요. 실제 지원서는 옮기지 않았습니다." },
  ],
  "/projects/make-a-wish": [
    { text: "축제는 끝났지만 서비스는 아직 열려 있어요. 게스트 입장으로 부스맵까지 볼 수 있습니다." },
    {
      target: "#section-04 [data-demo-panel]",
      press: "샘플 부스 D",
      text: "부스 D에서 QR을 찍은 셈 칠게요. 별이 하나 더 채워져요.",
    },
    {
      target: "#section-05 [data-demo-panel]",
      press: "보이는 지도 영역 표시",
      text: "목록에 가려지지 않은 지도 영역을 표시해 볼게요.",
    },
    {
      target: "#section-08 [data-demo-panel]",
      press: '"true" (문자열)',
      text: '납부 값을 문자열 "true"로 바꿔볼게요. 진짜 true가 아니면 납부자로 안 쳐요.',
    },
  ],
  "/projects/eodiya": [
    {
      target: "#section-03 [data-demo-panel]",
      press: "학생식당",
      text: "'학생식당'을 눌러볼게요. 공식 이름이 달라도 괄호 안 이름으로 찾아요.",
    },
  ],
  "/projects/oshi-calendar": [
    { text: "캘린더를 만들다가 캘린더를 없앤 프로젝트예요. 없애기 직전 화면도 아래에 있어요." },
    {
      target: "#section-02 [data-demo-panel]",
      press: "하루 뒤",
      text: "'오늘'을 하루 옮겨볼게요. 캘린더와 임박 일정을 견줘 보세요.",
    },
  ],
  "/projects/cctv-scheduler": [{ text: "화면이 없는 이유요? 부대 보안이라서요. 그래서 도식으로 그렸어요." }],
  "*": [{ target: "#contact", text: "끝까지 봐주셨네요. 궁금한 건 메일로 물어보세요." }],
};

export const CURATOR = {
  /** 커서 옆 이름표 */
  name: "박정우",
  /** 첫 방문 인사. 한 줄씩 타이핑한다. */
  greeting: ["오셨군요! 잠깐만요, 창 바로 열어드릴게요."],
  /** 꺼낼 말이 없을 때 방문자 커서와 부딪히면. 차례로 돌아가며 말한다. */
  clap: [
    "짝! 하이파이브!",
    "오, 한 번 더?",
    "지금 근무 중입니다만...",
    "사실 저도 옆에서 좀 심심했어요.",
    "본문도 재밌는데 한 번 봐주세요!",
  ],
  reactions: REACTIONS,
  notes: NOTES,
} as const;
