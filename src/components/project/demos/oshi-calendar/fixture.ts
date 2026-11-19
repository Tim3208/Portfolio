/**
 * 화면 타입 원본: Oshi Calendar `src/entities/event/model/types.ts` (40c516b).
 * 표시 규칙 원본: `src/entities/event/model/categoryPresentation.ts`,
 * 게임 표시 정보 원본: `src/entities/game/model/mock.ts` (모두 40c516b).
 *
 * 샘플 출처: oshi-calendar-db/tests/fixtures/schedules/api-v2.json의 공지 수집 일정 126건 중 22건.
 * 0부터 세는 원본 행 7, 8, 9, 11, 12, 14, 19, 26, 27, 29, 31, 33, 34, 35, 39, 46, 47, 50, 51, 70, 74, 88을 골랐다.
 * 제목·기간·게임명·분류·보상·신뢰도는 원문 그대로다.
 * 고정 오늘은 2026-07-16 목요일 12:00(KST). 해당 주(7/12~18)와 앞뒤에 걸친 기간 중
 * 종료된 16건과 진행 중인 6건을 골라, 가운데에 겹친 일정과 임박 목록의 남은 일수를 함께 볼 수 있게 했다.
 * 원본 선택 범위: 시작 2026-06-01~07-16, 종료 2026-07-09~07-24(모두 KST, 기간을 잘라내지 않음).
 *
 * v2 → 당시 ScheduleItem 옮김: game 객체의 name을 game/gameName으로, UUID id는 아래와 같이
 * 기존 게임 허브의 같은 게임 canonical id로 대응했다. game.imageUrl=null은 해당 게임의 원본 그림 경로로,
 * reliability의 reviewStatus/confidence/basisType은 최상위로 옮겼다. sourceTier/detectedAt은 당시
 * ScheduleItem에서 쓰지 않으므로 제외했다. ISO 기간은 Date로 복원하고, tone은 원본 categoryPresentation을 쓴다.
 * rewards=null은 당시 선택 필드의 생략으로 옮겼고 보상 항목·환산값은 재계산하지 않았다.
 *
 * ff8cafaa-a58d-4e25-a513-88e5ef05d9c0 → genshin-impact
 * 273165f6-81d3-415e-a3e8-b525d36ac06e → honkai-star-rail
 * 1f3f7483-82c0-4d16-ab7c-ee073318e159 → zenless-zone-zero
 * 27fd26be-b433-40f4-9c50-2c23f306effd → wuthering-waves
 * 282fd1bd-7933-498e-af5a-2e913d033e51 → arknights-endfield
 *
 * 게임 그림은 저장소 주인의 결정으로 서비스 화면 안에서만 쓴다.
 * 원본 40c516b의 public/games/{canonical id}.webp에서 실제 표시되는 5개만 복사하고,
 * 게임 허브 최대 표시 40px의 2배인 80×80 WebP(quality 80)로 줄였다. 합계 10,958 bytes.
 * 서버 조회·인증·저장소와 연결하지 않으며, 현재 시각을 읽지 않는다.
 */
import type { ScheduleItem } from "./entities/event/model/types";

export const INITIAL_TODAY_ISO = "2026-07-16T12:00:00+09:00";

export const SAMPLE_ITEMS: ScheduleItem[] = [
  {
    "id": "69304f60-3e53-4835-b429-7e28b43781ed",
    "gameId": "honkai-star-rail",
    "game": "붕괴: 스타레일",
    "gameName": "붕괴: 스타레일",
    "gameImageUrl": "/images/projects/oshi-calendar/games/honkai-star-rail.webp",
    "title": "BladeFitCheck",
    "categoryId": "redeem",
    "startAt": new Date("2026-05-31T15:00:00.000Z"),
    "endAt": new Date("2026-07-14T22:00:00.000Z"),
    "tone": "lime",
    "rewardValuation": null,
    "reviewStatus": "needs_review",
    "confidence": "low",
    "basisType": "community_estimate"
  },
  {
    "id": "f0f54f68-af33-4e96-8038-e8adc6d0a586",
    "gameId": "honkai-star-rail",
    "game": "붕괴: 스타레일",
    "gameName": "붕괴: 스타레일",
    "gameImageUrl": "/images/projects/oshi-calendar/games/honkai-star-rail.webp",
    "title": "픽셀 비행기 대난투",
    "categoryId": "event",
    "startAt": new Date("2026-06-01T03:00:00.000Z"),
    "endAt": new Date("2026-07-14T19:59:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "성옥",
        "amount": 1240
      },
      {
        "name": "자가 성형 수지",
        "amount": 1
      },
      {
        "name": "운명의 발자취",
        "amount": 2
      },
      {
        "name": "여행자의 가이드",
        "amount": 38
      },
      {
        "name": "정제한 에테르",
        "amount": 30
      },
      {
        "name": "유실된 수정",
        "amount": 34
      },
      {
        "name": "신용 포인트",
        "amount": 885000
      }
    ],
    "rewardValuation": {
      "basis": {
        "as_of": "2026-07-28",
        "policy": "best_repeatable_permanent_topup",
        "currency": "KRW",
        "platform": "pc",
        "price_krw": 119000,
        "valid_from": "2026-07-28",
        "region_code": "KR",
        "package_code": "pc_krw_119000",
        "rate_version": "starrail:pc_krw_119000:2026-07-28",
        "base_paid_quantity": 6480,
        "paid_currency_code": "oneiric_shard",
        "recurring_bonus_quantity": 1600,
        "repeat_purchase_quantity": 8080
      },
      "currency": "KRW",
      "rounding": "final_total_nearest_krw",
      "qualifier": "approximate",
      "amount_krw": 18262,
      "components": [
        {
          "name": "성옥",
          "unit": "개",
          "quantity": 1240,
          "amount_krw": 18262,
          "reward_code": "stellar_jade",
          "display_order": 1,
          "amount_krw_exact": 18262.376238,
          "valuation_category": "shared_gacha",
          "paid_currency_equivalent": 1240
        }
      ],
      "excluded_items": [
        {
          "name": "자가 성형 수지",
          "reason": "no_cash_valuation_rule",
          "quantity": 1,
          "reward_code": "unmapped_64ba45e662f6",
          "display_order": 2
        },
        {
          "name": "운명의 발자취",
          "reason": "no_cash_valuation_rule",
          "quantity": 2,
          "reward_code": "unmapped_a1c89e1ee9fb",
          "display_order": 3
        },
        {
          "name": "여행자의 가이드",
          "reason": "no_cash_valuation_rule",
          "quantity": 38,
          "reward_code": "unmapped_12e2bf82da9e",
          "display_order": 4
        },
        {
          "name": "정제한 에테르",
          "reason": "no_cash_valuation_rule",
          "quantity": 30,
          "reward_code": "unmapped_a45ec7680146",
          "display_order": 5
        },
        {
          "name": "유실된 수정",
          "reason": "no_cash_valuation_rule",
          "quantity": 34,
          "reward_code": "unmapped_bc4ca8b5c400",
          "display_order": 6
        },
        {
          "name": "신용 포인트",
          "reason": "no_cash_valuation_rule",
          "quantity": 885000,
          "reward_code": "unmapped_b0505345da0a",
          "display_order": 7
        }
      ],
      "schema_version": 1,
      "valuation_scope": "guaranteed_cash_linked_gacha_rewards",
      "amount_krw_exact": 18262.376238,
      "valued_item_count": 1,
      "excluded_item_count": 6
    },
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "21a25dd0-c089-4fef-a4e8-7db4a26d4ed9",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "과거를 찾아서",
    "categoryId": "update",
    "startAt": new Date("2026-06-05T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "amber",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "57b6978a-6a48-47e5-aef5-04ea61927792",
    "gameId": "zenless-zone-zero",
    "game": "젠레스 존 제로",
    "gameName": "젠레스 존 제로",
    "gameImageUrl": "/images/projects/oshi-calendar/games/zenless-zone-zero.webp",
    "title": "리두로의 귀환, 새로운 장",
    "categoryId": "event",
    "startAt": new Date("2026-06-06T12:30:00.000Z"),
    "endAt": new Date("2026-07-16T19:59:59.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "폴리크롬",
        "amount": 340
      }
    ],
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "low",
    "basisType": "community_estimate"
  },
  {
    "id": "73b7d132-b3fa-4249-8827-34b58a8f492e",
    "gameId": "wuthering-waves",
    "game": "명조: 워더링 웨이브",
    "gameName": "명조: 워더링 웨이브",
    "gameImageUrl": "/images/projects/oshi-calendar/games/wuthering-waves.webp",
    "title": "스펙트럴 트리거",
    "categoryId": "pickup",
    "startAt": new Date("2026-06-08T00:43:00.000Z"),
    "endAt": new Date("2026-07-09T03:59:00.000Z"),
    "tone": "orange",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "community_estimate"
  },
  {
    "id": "76d645e5-2d70-4170-9c06-cff9b3d25e89",
    "gameId": "wuthering-waves",
    "game": "명조: 워더링 웨이브",
    "gameName": "명조: 워더링 웨이브",
    "gameImageUrl": "/images/projects/oshi-calendar/games/wuthering-waves.webp",
    "title": "신비한 경지 도전 · 꿈을 찾는 자",
    "categoryId": "event",
    "startAt": new Date("2026-06-08T03:00:00.000Z"),
    "endAt": new Date("2026-07-08T19:59:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "별의 소리",
        "amount": 800
      },
      {
        "name": "심연의 문을 두드리며",
        "amount": 1
      },
      {
        "name": "특급 튜너",
        "amount": 60
      },
      {
        "name": "특급 공명 촉진제",
        "amount": 20
      },
      {
        "name": "특급 비밀음파 통",
        "amount": 20
      },
      {
        "name": "특급 에너지 코어",
        "amount": 20
      },
      {
        "name": "클램 코인",
        "amount": 838888
      }
    ],
    "rewardValuation": {
      "basis": {
        "as_of": "2026-07-28",
        "policy": "best_repeatable_permanent_topup",
        "currency": "KRW",
        "platform": "pc",
        "price_krw": 119000,
        "valid_from": "2026-07-28",
        "region_code": "KR",
        "package_code": "pc_krw_119000",
        "rate_version": "wuthering-waves:pc_krw_119000:2026-07-28",
        "base_paid_quantity": 6480,
        "paid_currency_code": "lunite",
        "recurring_bonus_quantity": 1600,
        "repeat_purchase_quantity": 8080
      },
      "currency": "KRW",
      "rounding": "final_total_nearest_krw",
      "qualifier": "approximate",
      "amount_krw": 11782,
      "components": [
        {
          "name": "별의 소리",
          "unit": "개",
          "quantity": 800,
          "amount_krw": 11782,
          "reward_code": "astrite",
          "display_order": 1,
          "amount_krw_exact": 11782.178218,
          "valuation_category": "shared_gacha",
          "paid_currency_equivalent": 800
        }
      ],
      "excluded_items": [
        {
          "name": "심연의 문을 두드리며",
          "reason": "no_cash_valuation_rule",
          "quantity": 1,
          "reward_code": "unmapped_905d5d21aa99",
          "display_order": 2
        },
        {
          "name": "특급 튜너",
          "reason": "no_cash_valuation_rule",
          "quantity": 60,
          "reward_code": "unmapped_eadeef58b6ad",
          "display_order": 3
        },
        {
          "name": "특급 공명 촉진제",
          "reason": "no_cash_valuation_rule",
          "quantity": 20,
          "reward_code": "unmapped_9b661c014b88",
          "display_order": 4
        },
        {
          "name": "특급 비밀음파 통",
          "reason": "no_cash_valuation_rule",
          "quantity": 20,
          "reward_code": "unmapped_f5209ba450a1",
          "display_order": 5
        },
        {
          "name": "특급 에너지 코어",
          "reason": "no_cash_valuation_rule",
          "quantity": 20,
          "reward_code": "unmapped_bc4ef6feebfb",
          "display_order": 6
        },
        {
          "name": "클램 코인",
          "reason": "no_cash_valuation_rule",
          "quantity": 838888,
          "reward_code": "unmapped_36d39035f9c1",
          "display_order": 7
        }
      ],
      "schema_version": 1,
      "valuation_scope": "guaranteed_cash_linked_gacha_rewards",
      "amount_krw_exact": 11782.178218,
      "valued_item_count": 1,
      "excluded_item_count": 6
    },
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "official_derived"
  },
  {
    "id": "368d28e0-e048-4bef-9d4f-bbc5f5e4b133",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "연무 알고리즘",
    "categoryId": "event",
    "startAt": new Date("2026-06-12T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "오로베릴",
        "amount": 1200
      },
      {
        "name": "존속의 흔적",
        "amount": 6
      },
      {
        "name": "고급 육성 선택 상자 I",
        "amount": 8
      },
      {
        "name": "고급 인지 매개체",
        "amount": 12
      }
    ],
    "rewardValuation": {
      "basis": {
        "as_of": "2026-07-28",
        "policy": "best_repeatable_permanent_topup",
        "currency": "KRW",
        "platform": "pc",
        "price_krw": 93000,
        "valid_from": "2026-07-28",
        "region_code": "KR",
        "package_code": "pc_krw_93000",
        "rate_version": "endfield:pc_krw_93000:2026-07-28",
        "base_paid_quantity": 194,
        "paid_currency_code": "origeometry",
        "recurring_bonus_quantity": 48,
        "repeat_purchase_quantity": 242
      },
      "currency": "KRW",
      "rounding": "final_total_nearest_krw",
      "qualifier": "approximate",
      "amount_krw": 6149,
      "components": [
        {
          "name": "오로베릴",
          "unit": "개",
          "quantity": 1200,
          "amount_krw": 6149,
          "reward_code": "oroberyl",
          "display_order": 1,
          "amount_krw_exact": 6148.760331,
          "valuation_category": "character_gacha",
          "paid_currency_equivalent": 16
        }
      ],
      "excluded_items": [
        {
          "name": "존속의 흔적",
          "reason": "no_cash_valuation_rule",
          "quantity": 6,
          "reward_code": "unmapped_eaafce1c5388",
          "display_order": 2
        },
        {
          "name": "고급 육성 선택 상자 I",
          "reason": "no_cash_valuation_rule",
          "quantity": 8,
          "reward_code": "unmapped_i",
          "display_order": 3
        },
        {
          "name": "고급 인지 매개체",
          "reason": "no_cash_valuation_rule",
          "quantity": 12,
          "reward_code": "unmapped_645c80efc992",
          "display_order": 4
        }
      ],
      "schema_version": 1,
      "valuation_scope": "guaranteed_cash_linked_gacha_rewards",
      "amount_krw_exact": 6148.760331,
      "valued_item_count": 1,
      "excluded_item_count": 3
    },
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "2f85f1cc-5519-43de-b6c0-d6cbb3e344cd",
    "gameId": "zenless-zone-zero",
    "game": "젠레스 존 제로",
    "gameName": "젠레스 존 제로",
    "gameImageUrl": "/images/projects/oshi-calendar/games/zenless-zone-zero.webp",
    "title": "날 선 그림자와의 협력",
    "categoryId": "event",
    "startAt": new Date("2026-06-19T02:00:00.000Z"),
    "endAt": new Date("2026-07-12T19:59:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "폴리크롬",
        "amount": 360
      },
      {
        "name": "조율 튜너",
        "amount": 1
      },
      {
        "name": "오리지널 칩",
        "amount": 60
      },
      {
        "name": "선임 조사원 기록",
        "amount": 18
      },
      {
        "name": "「Bangboo」 시스템 컨트롤",
        "amount": 18
      },
      {
        "name": "데니",
        "amount": 120000
      }
    ],
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "community_estimate"
  },
  {
    "id": "6f9cacab-08ef-4242-8fa0-218efeb50545",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "위기 협약 재점화 실험 작전",
    "categoryId": "event",
    "startAt": new Date("2026-06-19T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "오로베릴",
        "amount": 2000
      },
      {
        "name": "스티커 · 위기 협약",
        "amount": 1
      },
      {
        "name": "고급 육성 선택 상자 I",
        "amount": 10
      }
    ],
    "rewardValuation": {
      "basis": {
        "as_of": "2026-07-28",
        "policy": "best_repeatable_permanent_topup",
        "currency": "KRW",
        "platform": "pc",
        "price_krw": 93000,
        "valid_from": "2026-07-28",
        "region_code": "KR",
        "package_code": "pc_krw_93000",
        "rate_version": "endfield:pc_krw_93000:2026-07-28",
        "base_paid_quantity": 194,
        "paid_currency_code": "origeometry",
        "recurring_bonus_quantity": 48,
        "repeat_purchase_quantity": 242
      },
      "currency": "KRW",
      "rounding": "final_total_nearest_krw",
      "qualifier": "approximate",
      "amount_krw": 10248,
      "components": [
        {
          "name": "오로베릴",
          "unit": "개",
          "quantity": 2000,
          "amount_krw": 10248,
          "reward_code": "oroberyl",
          "display_order": 1,
          "amount_krw_exact": 10247.933884,
          "valuation_category": "character_gacha",
          "paid_currency_equivalent": 26.66666667
        }
      ],
      "excluded_items": [
        {
          "name": "스티커 · 위기 협약",
          "reason": "no_cash_valuation_rule",
          "quantity": 1,
          "reward_code": "unmapped_df3c1662a4e1",
          "display_order": 2
        },
        {
          "name": "고급 육성 선택 상자 I",
          "reason": "no_cash_valuation_rule",
          "quantity": 10,
          "reward_code": "unmapped_i",
          "display_order": 3
        }
      ],
      "schema_version": 1,
      "valuation_scope": "guaranteed_cash_linked_gacha_rewards",
      "amount_krw_exact": 10247.933884,
      "valued_item_count": 1,
      "excluded_item_count": 2
    },
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "e205dd50-d377-484e-8255-7aac9ebf105e",
    "gameId": "honkai-star-rail",
    "game": "붕괴: 스타레일",
    "gameName": "붕괴: 스타레일",
    "gameImageUrl": "/images/projects/oshi-calendar/games/honkai-star-rail.webp",
    "title": "진령 놀이공원",
    "categoryId": "event",
    "startAt": new Date("2026-06-24T04:00:00.000Z"),
    "endAt": new Date("2026-07-14T19:59:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "성옥",
        "amount": 500
      },
      {
        "name": "운명의 발자취",
        "amount": 1
      },
      {
        "name": "여행 가이드",
        "amount": 24
      },
      {
        "name": "정제한 에테르",
        "amount": 20
      },
      {
        "name": "유실된 수정덩이",
        "amount": 16
      },
      {
        "name": "파구사의 술",
        "amount": 15
      },
      {
        "name": "신용 포인트",
        "amount": 180000
      }
    ],
    "rewardValuation": {
      "basis": {
        "as_of": "2026-07-28",
        "policy": "best_repeatable_permanent_topup",
        "currency": "KRW",
        "platform": "pc",
        "price_krw": 119000,
        "valid_from": "2026-07-28",
        "region_code": "KR",
        "package_code": "pc_krw_119000",
        "rate_version": "starrail:pc_krw_119000:2026-07-28",
        "base_paid_quantity": 6480,
        "paid_currency_code": "oneiric_shard",
        "recurring_bonus_quantity": 1600,
        "repeat_purchase_quantity": 8080
      },
      "currency": "KRW",
      "rounding": "final_total_nearest_krw",
      "qualifier": "approximate",
      "amount_krw": 7364,
      "components": [
        {
          "name": "성옥",
          "unit": "개",
          "quantity": 500,
          "amount_krw": 7364,
          "reward_code": "stellar_jade",
          "display_order": 1,
          "amount_krw_exact": 7363.861386,
          "valuation_category": "shared_gacha",
          "paid_currency_equivalent": 500
        }
      ],
      "excluded_items": [
        {
          "name": "운명의 발자취",
          "reason": "no_cash_valuation_rule",
          "quantity": 1,
          "reward_code": "unmapped_a1c89e1ee9fb",
          "display_order": 2
        },
        {
          "name": "여행 가이드",
          "reason": "no_cash_valuation_rule",
          "quantity": 24,
          "reward_code": "unmapped_b659b9743126",
          "display_order": 3
        },
        {
          "name": "정제한 에테르",
          "reason": "no_cash_valuation_rule",
          "quantity": 20,
          "reward_code": "unmapped_a45ec7680146",
          "display_order": 4
        },
        {
          "name": "유실된 수정덩이",
          "reason": "no_cash_valuation_rule",
          "quantity": 16,
          "reward_code": "unmapped_40dd1b2dde52",
          "display_order": 5
        },
        {
          "name": "파구사의 술",
          "reason": "no_cash_valuation_rule",
          "quantity": 15,
          "reward_code": "unmapped_70dd8c1edc3a",
          "display_order": 6
        },
        {
          "name": "신용 포인트",
          "reason": "no_cash_valuation_rule",
          "quantity": 180000,
          "reward_code": "unmapped_b0505345da0a",
          "display_order": 7
        }
      ],
      "schema_version": 1,
      "valuation_scope": "guaranteed_cash_linked_gacha_rewards",
      "amount_krw_exact": 7363.861386,
      "valued_item_count": 1,
      "excluded_item_count": 6
    },
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "24d0900e-fd09-4dac-9f84-c224524f3d81",
    "gameId": "wuthering-waves",
    "game": "명조: 워더링 웨이브",
    "gameName": "명조: 워더링 웨이브",
    "gameImageUrl": "/images/projects/oshi-calendar/games/wuthering-waves.webp",
    "title": "매트릭스 리폼",
    "categoryId": "event",
    "startAt": new Date("2026-06-24T20:00:00.000Z"),
    "endAt": new Date("2026-07-08T19:59:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "별의 소리",
        "amount": 400
      },
      {
        "name": "특급 공명 촉진제",
        "amount": 6
      },
      {
        "name": "특급 에너지 코어",
        "amount": 4
      },
      {
        "name": "특급 비밀음파 통",
        "amount": 4
      },
      {
        "name": "응소 고급 물자 상자 · 라하이 로이",
        "amount": 21
      },
      {
        "name": "고급 습유물 밀봉 상자 · 라하이 로이",
        "amount": 52
      },
      {
        "name": "클램 코인",
        "amount": 480000
      }
    ],
    "rewardValuation": {
      "basis": {
        "as_of": "2026-07-28",
        "policy": "best_repeatable_permanent_topup",
        "currency": "KRW",
        "platform": "pc",
        "price_krw": 119000,
        "valid_from": "2026-07-28",
        "region_code": "KR",
        "package_code": "pc_krw_119000",
        "rate_version": "wuthering-waves:pc_krw_119000:2026-07-28",
        "base_paid_quantity": 6480,
        "paid_currency_code": "lunite",
        "recurring_bonus_quantity": 1600,
        "repeat_purchase_quantity": 8080
      },
      "currency": "KRW",
      "rounding": "final_total_nearest_krw",
      "qualifier": "approximate",
      "amount_krw": 5891,
      "components": [
        {
          "name": "별의 소리",
          "unit": "개",
          "quantity": 400,
          "amount_krw": 5891,
          "reward_code": "astrite",
          "display_order": 1,
          "amount_krw_exact": 5891.089109,
          "valuation_category": "shared_gacha",
          "paid_currency_equivalent": 400
        }
      ],
      "excluded_items": [
        {
          "name": "특급 공명 촉진제",
          "reason": "no_cash_valuation_rule",
          "quantity": 6,
          "reward_code": "unmapped_9b661c014b88",
          "display_order": 2
        },
        {
          "name": "특급 에너지 코어",
          "reason": "no_cash_valuation_rule",
          "quantity": 4,
          "reward_code": "unmapped_bc4ef6feebfb",
          "display_order": 3
        },
        {
          "name": "특급 비밀음파 통",
          "reason": "no_cash_valuation_rule",
          "quantity": 4,
          "reward_code": "unmapped_f5209ba450a1",
          "display_order": 4
        },
        {
          "name": "응소 고급 물자 상자 · 라하이 로이",
          "reason": "no_cash_valuation_rule",
          "quantity": 21,
          "reward_code": "unmapped_a1b272ae577b",
          "display_order": 5
        },
        {
          "name": "고급 습유물 밀봉 상자 · 라하이 로이",
          "reason": "no_cash_valuation_rule",
          "quantity": 52,
          "reward_code": "unmapped_571823b159b7",
          "display_order": 6
        },
        {
          "name": "클램 코인",
          "reason": "no_cash_valuation_rule",
          "quantity": 480000,
          "reward_code": "unmapped_36d39035f9c1",
          "display_order": 7
        }
      ],
      "schema_version": 1,
      "valuation_scope": "guaranteed_cash_linked_gacha_rewards",
      "amount_krw_exact": 5891.089109,
      "valued_item_count": 1,
      "excluded_item_count": 6
    },
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "community_estimate"
  },
  {
    "id": "175739ea-f369-434b-a2c4-1ffae7cfd6b8",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "죄를 쫓는 자",
    "categoryId": "pickup",
    "startAt": new Date("2026-06-26T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "orange",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "3705efc7-ceae-4a21-b01e-0389d172b8ae",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "단죄의 야상곡",
    "categoryId": "event",
    "startAt": new Date("2026-06-26T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "단죄의 야상곡 헤드헌팅 허가증",
        "amount": 5
      }
    ],
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "7bb72cde-a506-409f-82ea-62f87bd9c426",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "망자의 춤",
    "categoryId": "event",
    "startAt": new Date("2026-06-26T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "green",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "0909df49-74b5-4f1d-b9af-40183bfe5a46",
    "gameId": "genshin-impact",
    "game": "원신",
    "gameName": "원신",
    "gameImageUrl": "/images/projects/oshi-calendar/games/genshin-impact.webp",
    "title": "귀환",
    "categoryId": "pickup",
    "startAt": new Date("2026-07-01T03:00:00.000Z"),
    "endAt": new Date("2026-07-21T09:59:00.000Z"),
    "tone": "orange",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "community_estimate"
  },
  {
    "id": "59934456-e0d4-4336-86c6-8288da71593e",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "기억의 흔적 · 분노의 외침",
    "categoryId": "event",
    "startAt": new Date("2026-07-02T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "오로베릴",
        "amount": 1200
      },
      {
        "name": "고급 인지 매개체",
        "amount": 15
      },
      {
        "name": "무기 점검 세트",
        "amount": 30
      },
      {
        "name": "프로토콜 디스크 세트",
        "amount": 6
      },
      {
        "name": "중형 모형 틀",
        "amount": 6
      },
      {
        "name": "탈로시안 화폐",
        "amount": 90000
      },
      {
        "name": "프로토콜 프리즘 세트",
        "amount": 24
      },
      {
        "name": "고급 육성 선택 상자 I",
        "amount": 10
      }
    ],
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "9a9ff296-702b-4a68-991c-acc36d332fa9",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "칼리의 무릉 동화",
    "categoryId": "event",
    "startAt": new Date("2026-07-02T04:00:00.000Z"),
    "endAt": new Date("2026-07-15T22:00:00.000Z"),
    "tone": "green",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "official_derived"
  },
  {
    "id": "0dcf82bd-075d-4ce9-bce6-e2f222606ca0",
    "gameId": "honkai-star-rail",
    "game": "붕괴: 스타레일",
    "gameName": "붕괴: 스타레일",
    "gameImageUrl": "/images/projects/oshi-calendar/games/honkai-star-rail.webp",
    "title": "기묘한 영역 이벤트",
    "categoryId": "event",
    "startAt": new Date("2026-07-02T20:00:00.000Z"),
    "endAt": new Date("2026-07-12T19:59:00.000Z"),
    "tone": "green",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "3aea9c6b-4ce6-4417-813b-80666ddeb8ac",
    "gameId": "zenless-zone-zero",
    "game": "젠레스 존 제로",
    "gameName": "젠레스 존 제로",
    "gameImageUrl": "/images/projects/oshi-calendar/games/zenless-zone-zero.webp",
    "title": "절름발이 까마귀 기문록",
    "categoryId": "event",
    "startAt": new Date("2026-07-03T02:00:00.000Z"),
    "endAt": new Date("2026-07-19T19:59:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "폴리크롬",
        "amount": 300
      },
      {
        "name": "방부 티켓",
        "amount": 5
      },
      {
        "name": "선임 조사원 기록",
        "amount": 15
      },
      {
        "name": "오리지널 칩",
        "amount": 24
      },
      {
        "name": "데니",
        "amount": 50000
      }
    ],
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "9333a63f-3463-4b9e-9853-9f6a1d8febf2",
    "gameId": "wuthering-waves",
    "game": "명조: 워더링 웨이브",
    "gameName": "명조: 워더링 웨이브",
    "gameImageUrl": "/images/projects/oshi-calendar/games/wuthering-waves.webp",
    "title": "3.5 버전 Discord 출석 이벤트",
    "categoryId": "event",
    "startAt": new Date("2026-07-10T15:00:00.000Z"),
    "endAt": new Date("2026-07-24T14:59:59.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "별의 소리",
        "amount": 100
      }
    ],
    "rewardValuation": {
      "basis": {
        "as_of": "2026-07-28",
        "policy": "best_repeatable_permanent_topup",
        "currency": "KRW",
        "platform": "pc",
        "price_krw": 119000,
        "valid_from": "2026-07-28",
        "region_code": "KR",
        "package_code": "pc_krw_119000",
        "rate_version": "wuthering-waves:pc_krw_119000:2026-07-28",
        "base_paid_quantity": 6480,
        "paid_currency_code": "lunite",
        "recurring_bonus_quantity": 1600,
        "repeat_purchase_quantity": 8080
      },
      "currency": "KRW",
      "rounding": "final_total_nearest_krw",
      "qualifier": "approximate",
      "amount_krw": 1473,
      "components": [
        {
          "name": "별의 소리",
          "unit": "개",
          "quantity": 100,
          "amount_krw": 1473,
          "reward_code": "astrite",
          "display_order": 1,
          "amount_krw_exact": 1472.772277,
          "valuation_category": "shared_gacha",
          "paid_currency_equivalent": 100
        }
      ],
      "excluded_items": [],
      "schema_version": 1,
      "valuation_scope": "guaranteed_cash_linked_gacha_rewards",
      "amount_krw_exact": 1472.772277,
      "valued_item_count": 1,
      "excluded_item_count": 0
    },
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "community_estimate"
  },
  {
    "id": "bf97d5a2-0603-454a-a5cd-358a16c6a3c8",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "결 전용 통신",
    "categoryId": "event",
    "startAt": new Date("2026-07-14T05:00:00.000Z"),
    "endAt": new Date("2026-07-16T03:59:00.000Z"),
    "tone": "green",
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "high",
    "basisType": "official_derived"
  },
  {
    "id": "a1ec5337-102f-4512-acd7-64cd02d85ad3",
    "gameId": "arknights-endfield",
    "game": "명일방주: 엔드필드",
    "gameName": "명일방주: 엔드필드",
    "gameImageUrl": "/images/projects/oshi-calendar/games/arknights-endfield.webp",
    "title": "새로운 미래를 향해, 함께 나아가요!",
    "categoryId": "event",
    "startAt": new Date("2026-07-15T15:00:00.000Z"),
    "endAt": new Date("2026-07-22T15:00:00.000Z"),
    "tone": "green",
    "rewards": [
      {
        "name": "20달러 기프트 카드(한국 지역은 동일 가치 보상으로 대체)",
        "amount": 30
      },
      {
        "name": "아이폰 17 512GB",
        "amount": 2
      }
    ],
    "rewardValuation": null,
    "reviewStatus": "verified",
    "confidence": "medium",
    "basisType": "community_estimate"
  }
];
