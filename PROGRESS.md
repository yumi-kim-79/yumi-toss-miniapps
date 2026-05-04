# 앱인토스 미니앱 4종 개발 - 진행 현황

## 프로젝트 개요
- **목표**: 앱인토스에 4개의 선점 가능한 미니앱 출시
- **개발자**: 유성 (yumi-kim-79)
- **계정**: 김유미님 워크스페이스 "앱몬스터" (workspace ID: 38745)
- **GitHub**: yumi-kim-79
- **Firebase**: mycloud-5ce96 프로젝트 공용 사용 (다른 앱들과 컬렉션 prefix로 분리)

## 4개 앱 로드맵
1. ✅ **내 인생 시급** (life-wage) - V1 완성 (수동 입력 기반)
2. ✅ **내 카드 장례식** (card-funeral) - V1 완성
3. ✅ **경조사 가계부** (gyeongjo-book) - V1 완성
4. ✅ **오늘의 환승 동전** (coin-saver) - V1 완성 (V2는 SDK 결제내역 권한 답변 후 결정)

## 공통 기술 스택
- **프레임워크**: create-ait-app (앱인토스 React 기반 템플릿)
- **SDK**: @apps-in-toss/web-framework v2.4.7
- **UI**: @toss/tds-mobile (TDS Mobile 컴포넌트)
- **상태 관리**: React 18 hooks
- **백엔드**: Firebase Firestore
- **빌드**: Vite 6
- **언어**: TypeScript 5.7

## Firebase 설정
- **프로젝트 ID**: mycloud-5ce96
- **앱 등록**: 4개 앱 모두 별도 웹앱 등록 완료 (2026-05-04)
  - life-wage: `1:534353428772:web:6f781190613f6bcf1eb3b1`
  - card-funeral: `1:534353428772:web:43df02cdab8c52741eb3b1`
  - gyeongjo-book: `1:534353428772:web:55ca399d7746f9571eb3b1`
  - coin-saver: `1:534353428772:web:468914f92d21f18b1eb3b1`
- **컬렉션 prefix**:
  - `wage_*` - 내 인생 시급
  - `card_*` - 내 카드 장례식 (예정)
  - `gyeongjo_*` - 경조사 가계부 (예정)
  - `coin_*` - 환승 동전
- **보안 규칙**: 통합 관리 (`~/yumi-toss/firestore.rules`)
  - mycloud-5ce96 프로젝트의 모든 영역(Aitory/FitMeal/MyCloud/4개 미니앱) 통합 규칙
  - 본인 식별: `request.auth.uid == userId` (각 앱) / `isOwner()` (MyCloud 전용 UID)
  - 매핑 컬렉션 4개 (wage/card/gyeongjo/coin _user_mapping) 포함
  - 기본 거부(`match /{document=**}`)로 미식별 컬렉션 차단
  - 배포: 콘솔 수동 게시 (Phase B) → 안정화 후 `firebase deploy --only firestore:rules` 이관

### 보안 규칙 메모
- **기본 거부 규칙은 재귀 와일드카드**라 명시되지 않은 모든 서브컬렉션이 차단됨. 향후 서브컬렉션(예: `card_cards/{cardId}/history/*`) 추가 시 firestore.rules에 명시적 `match` 규칙 추가 필요.
- **매핑 컬렉션은 본인만 read/write**. Firebase Anonymous Auth는 디바이스 단위로 동일 UID가 영속되므로 토스 anonymousKey 역검색 불필요. 매핑 문서는 감사/디버깅 목적.

## 사용자 식별 전략
- **Firebase Anonymous Auth**가 1차 식별자 (`auth.currentUser.uid` → `userId`)
- 토스 SDK `getAnonymousKey()`는 매핑용으로만 사용 (디바이스 식별 보조)
- 첫 진입 시 `{앱}_user_mapping/{firebaseUid}` 문서에 토스 키 기록
- 브라우저 환경(개발용)에서는 토스 SDK 실패 시 `dev_xxxxxxxx` localStorage fallback 키를 매핑 문서에 기록
- 보안 규칙은 Firebase UID(=`userId`) 기준으로 본인 데이터만 허용
- src/hooks/useTossUser.ts 참조

## 1번 앱 "내 인생 시급" 완료 사항
### 디렉토리: ~/yumi-toss/life-wage

### 구현된 화면
- **Onboarding**: 월 실수령액 + 월 근무시간 입력 → 시급 자동 계산
- **Home**: 시급 표시 + 이번 달 누적 + 금액 입력 + 카피 미리보기 + 최근 기록

### 주요 파일
- src/types.ts - WageUser, WageRecord 타입
- src/hooks/useTossUser.ts - 토스 익명 키 + dev fallback
- src/lib/firebase.ts - Firestore 초기화
- src/lib/wageDb.ts - saveUserWage, getUserWage, addRecord, getRecords
- src/lib/wageCopy.ts - 9구간 × 2~3 변형 카피 + formatHours
- src/screens/Onboarding.tsx
- src/screens/Home.tsx
- src/App.tsx - 라우팅 (Onboarding ↔ Home)
- granite.config.ts - brand.primaryColor #F06292

### 환경변수 (.env.local)
- VITE_FIREBASE_API_KEY 외 6개 (mycloud-5ce96 라이브 키 채워짐)

### 검증 완료
- ✅ tsc --noEmit 0 errors
- ✅ vite build 성공
- ✅ 브라우저 동작 확인 (Onboarding → Home → 기록 추가 → Firestore 저장)
- ✅ 카피 9구간 자연스러움 검토 완료

## 2번 앱 "내 카드 장례식" 완료 사항
### 디렉토리: ~/yumi-toss/card-funeral

### 구현된 화면 (5개)
- **Home**: 카드 리스트 + 위중·사망 카드 통계 + 추모관 진입
- **AddCard**: 카드 별명 / 카드사(SegmentedControl 9종) / 연회비 / 마지막 사용일 등록
- **CardDetail**: 카드 상세 + 카드사별 해지 가이드 + 사용일 갱신 / 장례식 진입 (Double CTA)
- **Funeral**: 다크 톤 추모 화면 + 추모사(랜덤) + 누적 연회비 손해 표시
- **Memorial**: 추모관 — 떠나보낸 카드 리스트 + 누적 손해 합계

### 주요 파일
- src/types.ts - CardIssuer, CardStatus, Card, Funeral
- src/hooks/useTossUser.ts - 1번 앱 동일 패턴 (dev_card_xxx prefix)
- src/lib/firebase.ts - 1번 앱과 동일
- src/lib/cardStatus.ts - 1·3·6개월 컷오프 4단계 상태 (active/dormant/critical/dead)
- src/lib/cardDb.ts - addCard, getCards, updateCardLastUsed, deleteCard, holdFuneral, getFunerals
- src/lib/cardIssuerData.ts - 8개 카드사 해지 가이드 (전화번호/앱 경로/주의사항)
- src/lib/funeralCopy.ts - 추모사 8개 변형 + 상태별 코멘트 3개씩
- src/screens/Home.tsx, AddCard.tsx, CardDetail.tsx, Funeral.tsx, Memorial.tsx
- src/App.tsx - useState 기반 5개 화면 라우팅
- granite.config.ts - brand.primaryColor `#1F2937` (다크 톤, 1번 앱과 시각적 구분)

### Firestore 컬렉션 (prefix: `card_`)
- `card_cards/{cardId}`: { userId, cardName, issuer, annualFee, lastUsedDate, registeredAt } — status는 lastUsedDate 기준으로 클라이언트에서 동적 계산
- `card_funerals/{funeralId}`: { userId, cardName, issuer, totalAnnualFee, funeralDate }

### 환경변수 (.env.local)
- mycloud-5ce96 동일 키 사용. APP_ID는 별도 웹앱 등록 완료 (`...:web:43df02cdab8c52741eb3b1`)

### 검증 완료
- ✅ tsc --noEmit 0 errors
- ✅ vite build 성공 (91 modules, 1.59s)
- ✅ 브라우저 동작 확인 (Home → AddCard → CardDetail → Funeral → Memorial 전체 흐름)

## 3번 앱 "경조사 가계부" 완료 사항
### 디렉토리: ~/yumi-toss/gyeongjo-book

### 구현된 화면 (3개)
- **Home**: 그린 통계 카드(보낸/받은/잔고) + 이름 검색 + 사람별 ListRow (잔고 색 분기)
- **AddRecord**: 이름 입력 + 자동완성 chip + 줬어요/받았어요 + 금액 + 4종 이벤트 + 날짜 + 메모
- **PersonDetail**: 큰 잔고 + 따뜻한 카피 + 정산 요약 + 거래 내역 + "이 사람 기록 추가" CTA

### 주요 파일
- src/types.ts - EventType, Direction, GyeongjoRecord, PersonSummary
- src/hooks/useTossUser.ts - 1·2번 동일 패턴 (dev_gyeongjo_xxx prefix)
- src/lib/firebase.ts - 1번 앱과 100% 동일
- src/lib/eventTypes.ts - 4종 이벤트 메타 (결혼식/장례식/돌잔치/기타) + 헬퍼
- src/lib/gyeongjoDb.ts - addRecord, getRecords, getRecordsByPerson, deleteRecord
- src/lib/personSummary.ts - normalizeName(공백 무시), aggregateByPerson (음수 잔고 우선 → 최근 거래순)
- src/lib/nameAutocomplete.ts - getExistingNames, filterNames (startsWith → includes 우선순위)
- src/lib/gyeongjoCopy.ts - 잔고 음수/양수/0 따뜻한 멘트 풀 (1·2번 톤과 차별화)
- src/screens/Home.tsx, AddRecord.tsx, PersonDetail.tsx
- src/App.tsx - discriminated union 라우팅 (home | add | detail), prefilledName 전달
- granite.config.ts - brand.primaryColor `#059669` (emerald-600, 따뜻한 그린)

### Firestore 컬렉션 (prefix: `gyeongjo_`)
- `gyeongjo_records/{recordId}`: { userId, counterpartyName, amount, direction(gave/received), eventType, eventDate, memo, createdAt } — 단일 컬렉션, 사람별 집계는 클라이언트에서 동적 계산

### 환경변수 (.env.local)
- mycloud-5ce96 동일 키 사용. APP_ID는 별도 웹앱 등록 완료 (`...:web:55ca399d7746f9571eb3b1`)

### 차별화 포인트
- 컬러: `#059669` 그린 (1번 핑크 / 2번 다크 톤과 시각적 구분)
- 톤: 따뜻하고 비판하지 않는 멘트 (1번 도발 / 2번 블랙 코미디와 대비)
- UX: 이름 자동완성 chip + 정규화(`김 철수` === `김철수`) + 잔고 음수/양수/0 색 분기

### 알려진 이슈 / 후속 검토
- 검색 인풋: TDS `SearchField`의 `value/onChange` prop 인터페이스 확인 못해 일반 `<input>`으로 대체. 출시 전 TDS 컴포넌트 재시도 필요

### 검증 완료
- ✅ tsc --noEmit 0 errors
- ✅ vite build 성공 (90 modules, 1.60s)
- ✅ 브라우저 동작 확인 (빈 상태 → 첫 기록 → 자동완성 → 사람별 집계 → PersonDetail 흐름)

## 4번 앱 "오늘의 환승 동전" 완료 사항
### 디렉토리: ~/yumi-toss/coin-saver

### 구현된 화면 (1개)
- **Home**: 골드 저금통 카드(🐷 + 누적 동전 + 마일스톤 멘트) + 결제 입력(실시간 미리보기) + 최근 동전 리스트(최대 20)

### 주요 파일
- src/types.ts - CoinUser, CoinTransaction
- src/hooks/useTossUser.ts - 1·2·3번 동일 패턴 (dev_coin_xxx prefix)
- src/lib/firebase.ts - 1번 앱과 100% 동일
- src/lib/coinLogic.ts - calculateCoin (1000원 단위 올림 차액) + 음수/NaN/0 방어 + formatKRW
- src/lib/coinDb.ts - ensureUser, addTransaction (runTransaction으로 totalSaved 원자적 누적), getTotalSaved, getTransactions
- src/lib/coinCopy.ts - 5단계 마일스톤 카피(0/1k/10k/50k/100k+) + 즉시 멘트 + 미리보기 멘트
- src/screens/Home.tsx
- src/App.tsx - 단일 화면(useTossUser → ensureUser → Home)
- granite.config.ts - brand.primaryColor `#F59E0B` (amber-500, 골드)

### Firestore 컬렉션 (prefix: `coin_`)
- `coin_users/{userId}`: { userId, totalSaved, createdAt } — 누적 동전 캐시 (트랜잭션으로 원자적 갱신)
- `coin_transactions/{txId}`: { userId, paymentAmount, savedCoin, roundedTo, memo, createdAt } — 클라이언트 정렬

### 환경변수 (.env.local)
- mycloud-5ce96 동일 키 사용. APP_ID는 별도 웹앱 등록 완료 (`...:web:468914f92d21f18b1eb3b1`)

### 차별화 포인트
- 컬러: `#F59E0B` 골드 (1번 핑크 / 2번 다크 / 3번 그린과 시각적 구분)
- 톤: 밝고 경쾌함, 동전·돼지저금통 모티프 (1번 도발 / 2번 블랙코미디 / 3번 따뜻함과 대비)
- 기술: 4개 앱 중 유일하게 누적 카운터(`totalSaved`) 보유 → `runTransaction`으로 race condition 방지

### V2 메모
- 앱인토스 SDK 결제내역 권한 답변 대기 중
- 권한 받으면: 자동 동전 떨어뜨리기 (수동 입력 → 결제 후크 자동) + 푸시 알림 가능
- 답변 결과에 따라 V2 스코프 결정

### 검증 완료
- ✅ tsc --noEmit 0 errors
- ✅ vite build 성공 (87 modules, 1.74s)
- ✅ 브라우저 동작 확인 (입력 → 미리보기 → 동전 떨어뜨리기 → 누적 갱신 → 리스트 반영)

## 🎉 V1 시리즈 완성 (2026-04-27)
4개 앱 모두 V1 완성. 각각 독립 디렉토리·컬러·톤·Firestore prefix로 구성됐고, 1·2·3·4번 모두 tsc + vite build 통과 후 브라우저에서 골든패스 확인 완료.

### 4개 앱 요약
| # | 앱 | 디렉토리 | 화면 | 컬러 | 톤 | Firestore prefix |
|---|---|---|---|---|---|---|
| 1 | 내 인생 시급 | life-wage | 2 (Onboarding/Home) | `#F06292` 핑크 | 도발 | `wage_*` |
| 2 | 내 카드 장례식 | card-funeral | 5 (Home/AddCard/CardDetail/Funeral/Memorial) | `#1F2937` 다크 | 블랙코미디 | `card_*` |
| 3 | 경조사 가계부 | gyeongjo-book | 3 (Home/AddRecord/PersonDetail) | `#059669` 그린 | 따뜻함 | `gyeongjo_*` |
| 4 | 오늘의 환승 동전 | coin-saver | 1 (Home) | `#F59E0B` 골드 | 경쾌함 | `coin_*` |

### 다음 페이즈 (출시 준비)
1. **사업자 등록**: 홈택스 신청 진행
2. **Firebase Auth Anonymous 도입 + 보안 규칙 잠그기**: 4개 앱 공통
3. **각 앱 콘솔 입점**: Firebase 콘솔에서 별도 웹앱 등록(2·3·4번) + 앱인토스 콘솔 등록 + API 키 발급
4. **토스 샌드박스 실기기 테스트**
5. **출시 검수 신청** (영업일 7일 소요)

### V2 검토 항목 (앱별)
- **1번(시급)**: 토스 SDK 결제내역 자동 연동 → 수동 입력 제거. 시급 자동 갱신(연봉 변동 시).
- **2번(카드)**: 토스 카드 사용 데이터 자동 동기화 → "마지막 사용일" 자동 갱신. 카드사 해지 정보 정기 업데이트 자동화.
- **3번(경조사)**: 캘린더 연동(이벤트 알림). 봉투 인쇄/이미지 출력. 통계 그래프.
- **4번(동전)**: 토스 SDK 결제내역 자동 연동 → 결제 후크로 자동 동전 떨어뜨리기 + 푸시 알림 (권한 답변 대기 중).

## 보안 인증 적용 현황 (2026-04-28)

### Firebase Anonymous Auth 4개 앱 적용 완료
4개 앱 모두 `useTossUser.ts`를 신 패턴으로 통일:
- `signInAnonymously(auth)`로 Firebase UID 발급 (이게 이제 `userId`)
- 토스 SDK `getAnonymousKey()`는 매핑 보조용 (`{앱}_user_mapping/{firebaseUid}` 문서에 기록)
- 토스 SDK 미가용(브라우저 dev) 시 `dev_xxxxxxxx` localStorage fallback 키를 매핑에 기록
- `firebase.ts`에 `getAuth(app)` 추가 (`auth` 익스포트)

### 통합 firestore.rules
- 위치: `~/yumi-toss/firestore.rules` (`firebase.json`, `firestore.indexes.json` 동반)
- mycloud-5ce96 프로젝트의 모든 영역(Aitory/FitMeal/MyCloud/4개 미니앱) 통합 규칙
- 4개 앱: `request.auth.uid == userId` (본인 데이터만 read/write)
- 매핑 컬렉션 4개(`wage_user_mapping`, `card_user_mapping`, `gyeongjo_user_mapping`, `coin_user_mapping`) 본인만 read/write
- MyCloud 전용 UID 헬퍼 `isOwner()`
- 기본 거부(`match /{document=**}`)로 미식별 컬렉션 차단
- 배포: 콘솔 수동 게시(Phase B) → 안정화 후 `firebase deploy --only firestore:rules` 이관

### 검증 진행 상황
- ✅ **1번 life-wage**: 브라우저 검증 통과 (Firebase UID 매핑 정상)
- ✅ **2번 card-funeral**: tsc + vite build 통과 (브라우저 재검증 대기)
- ✅ **3번 gyeongjo-book**: tsc + vite build 통과 (브라우저 재검증 대기)
- ✅ **4번 coin-saver**: tsc + vite build 통과 (브라우저 재검증 대기)

### 통합 보안 규칙 v2 콘솔 게시 (2026-04-28)
- ✅ Firebase 콘솔에 v2 게시 완료
- ✅ 4개 영역 동작 검증 통과 — life-wage / Aitory / FitMeal AI / MyCloud
- ✅ `~/yumi-toss/firestore.rules` 동기화 완료 (콘솔 게시본과 일치)
- 주요 변경 (v1 → v2):
  - FitMeal AI: Session #32-Fix4 운영 규칙 정확히 반영
    - `fitmeal_users` read → 인증 사용자 전체 (공개 프로필 지원)
    - `fitmeal_user_blocks` → get/list 분리 (블록 검사 단일 조회 허용)
  - Aitory: 운영 규칙 미확인이라 임시로 인증 사용자 read/write 허용 → 정밀화 TODO

## 메모 / 별도 이슈
- **FitMeal AI Storage `/capture` 권한 에러** (2026-04-28 발견)
  - 에러: `[firebase_storage/unauthorized]` / 사용자: `kakao:4860766164`
  - 원인 추정: 카카오 사용자 권한 또는 잘못된 경로 업로드
  - **이 파일(Firestore rules)과 무관** — Storage 규칙은 별도 시스템
  - FitMeal 자체 이슈로 별도 처리 예정
- **Storage `/media` 경로 보안 강화 검토 필요**
  - 현재: `allow read, write: if request.auth != null` (모든 인증 사용자)
  - 권장: 본인 폴더만 read/write 허용 패턴
  - FitMeal/MyCloud 영향 — 별도 작업
- **Aitory 운영 규칙 정밀화 필요**
  - 현재: 임시로 인증 사용자 read/write 허용
  - TODO: Aitory 레포의 정확한 보안 규칙 확인 후 통합 규칙 v3 작성
- **GitHub Pages 인덱스 페이지 제목/설명 중복** (2026-05-04 발견)
  - `_config.yml`의 `title`/`description`과 `legal/index.md` 본문 헤더가 양쪽에서 표시됨
  - 검수 통과에는 영향 없음 — 출시 후 정리 예정
- **약관 연령 수정 완료** (2026-05-04): 만 14세 → 만 19세 일괄 변경
  - 토스 앱인토스 콘솔 자체가 만 19세 이상 대상이라 약관 일치 필요했음 (`/prepare/console-workspace.md` 명시)
  - 8개 약관 파일 + `legal/index.md` 일괄 수정
  - "아동" → "미성년자" 함께 변경 (만 19세 미만은 법적으로 미성년자 표현이 정확)
  - GitHub Pages 자동 재배포로 약관 URL 8개는 그대로 유효 (URL 변경 없음)

## 진행 중인 외부 작업
- ✅ **사업자 등록 완료** (2026-04-28): 일반과세자, 업종 = 응용 소프트웨어 개발 + 광고 대행업
- ⏳ **앱인토스 SDK 결제내역 API 권한 문의**: 커뮤니티 글 작성됨, 운영진 보류 검토 대기
  - 답변 결과에 따라 4번 앱(환승 동전)의 V2 구현 여부 결정

## 출시 준비물 현황
- ✅ 통합 보안 규칙 v2 콘솔 게시 (2026-04-28)
- ✅ Firebase Anonymous Auth 4개 앱 적용 (2026-04-28, 1번 브라우저 검증 / 2·3·4번 빌드만)
- ✅ 사업자 등록 (2026-04-28: 일반과세자, 응용 SW 개발 + 광고 대행업)
- ✅ 약관 8벌 작성 완료 (2026-05-04, `legal/` 디렉토리)
- ✅ 약관 인덱스 페이지 (`legal/index.md`, 검수자 친화 랜딩)
- ✅ **GitHub Pages 호스팅 검증 완료 (2026-05-04)** — `_config.yml`로 `legal/`만 빌드, jekyll-theme-cayman 적용, permalink: pretty 정상 동작
- ✅ **앱 설명 문구 V1 작성 (2026-05-04)** — `marketing/app-descriptions.md`
  - 4개 앱 × 5가지 텍스트 자산 (한국어명·영문명·부제·상세설명·키워드)
  - 영문명: LifeWage / CardFuneral / GiftLedger / CoinSaver (모두 15자 이내, 명사형)
  - 4개 앱 톤 차별화 (도발·블랙코미디·따뜻함·경쾌함)
- ✅ **앱 아이콘 V1 + 썸네일 V1 생성 (2026-05-04)** — Claude SVG → sharp PNG 변환, `assets/` 디렉토리
  - 아이콘 4개: 600×600 PNG, 불투명 배경, 각진 모서리 (토스 가이드 준수)
  - 썸네일 4개: 1100×800 PNG, 좌측 모티프 + 우측 한글 타이틀+부제
  - 한글 텍스트 + ₩ 기호 렌더링 검증 통과 (Apple SD Gothic Neo fallback)
  - V2에서 진짜 디자인으로 교체 예정 (출시 통과 우선)
- ✅ **카드사 정보 1차 검증 완료 (2026-05-04)** — Claude web search + 사용자 확인
  - 신한 전화번호 갱신: `1599-8000` → `1544-7000` (V1 잘못 박제)
  - NH농협 전화번호 갱신: `1644-2009` → `1644-4000` (V1 잘못 박제)
  - 우리 앱 이름 표기 갱신: `우리원카드` → `우리WON카드`
  - 6/8 카드사(삼성/현대/KB/우리/하나/롯데) 전화번호 정확성 확인
  - 앱 메뉴 경로는 변경 가능성 있어 V2에서 사용자 피드백 기반 갱신 예정 — 약관 면책 조항(card-funeral-terms 제11조 4항)으로 보호
- ✅ **Node 24 업그레이드 + Firebase 별도 웹앱 4개 등록 (2026-05-04)**
  - Node 22 → 24.15.0 (granite/ait deploy 호환)
  - Firebase 콘솔에서 card-funeral / gyeongjo-book / coin-saver 별도 웹앱 등록 완료
  - 4개 앱 `.env.local`의 `VITE_FIREBASE_APP_ID` 갱신 (life-wage는 기존 유지)
  - 4개 앱 모두 Node 24 환경에서 빌드 검증 통과 (tsc 0 errors + vite build 성공)
  - 빌드 결과: life-wage 1614 KB / card-funeral 1624 KB / gyeongjo-book 1620 KB / coin-saver 1622 KB (gzip ~483 KB)

### 약관 URL 박제 (2026-05-04 검증 완료)

랜딩 페이지: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/

**1. 인생 시급 (life-wage)**
- 개인정보처리방침: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/life-wage-privacy
- 이용약관: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/life-wage-terms

**2. 카드 장례식 (card-funeral)**
- 개인정보처리방침: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/card-funeral-privacy
- 이용약관: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/card-funeral-terms

**3. 경조사 가계부 (gyeongjo-book)**
- 개인정보처리방침: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/gyeongjo-book-privacy
- 이용약관: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/gyeongjo-book-terms

**4. 환승 동전 (coin-saver)**
- 개인정보처리방침: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/coin-saver-privacy
- 이용약관: https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/coin-saver-terms

> URL 형식: `https://yumi-kim-79.github.io/yumi-toss-miniapps/legal/{앱명}-{privacy|terms}` (확장자 없음)
> 콘솔 등록 시 위 URL 그대로 사용.

## 다음 작업 (2026-05-04 갱신)
1. ~~약관 작성~~ ✅ 완료 (legal/ 8벌)
2. ~~GitHub Pages 활성화~~ ✅ 완료
3. ~~약관 URL 검증~~ ✅ 완료 (8개 URL 박제됨)
4. ~~카드사 정보 검증~~ ✅ 완료 (전화번호 8/8 확인, 신한·NH 갱신, 앱 경로는 약관 면책)
5. ~~앱 아이콘~~ ✅ V1 완료 (4개 600×600 PNG + 4개 1100×800 썸네일, V2 교체는 출시 후)
6. ~~앱 설명 문구~~ ✅ V1 완료 (`marketing/app-descriptions.md`, 4개 × 5가지 자산)
7. ~~Node 24 업그레이드 + Firebase 콘솔 별도 웹앱 등록(2·3·4번)~~ ✅ 완료 (2026-05-04)
8. **스크린샷** (4개 × 5장, 반나절~1일) — 실기기 또는 시뮬레이터 캡처
9. **4개 앱 재검증** (1시간) — v2 보안 규칙 + 신 Auth 패턴으로 골든패스 다시. DevTools에서 `permission-denied` 없는지.
10. **앱인토스 콘솔 등록 + 출시 검수 신청** (영업일 7일) ⭐ **최종 단계**

## 다음 세션 시작 시
1. 이 PROGRESS.md 먼저 읽기
2. 마지막으로 git log 확인하여 최신 상태 파악
3. 다음 작업할 앱 폴더로 cd
4. docs/skills/ 의 apps-in-toss.md, tds-mobile.md 참고

## 출시 전 체크리스트 (모든 앱 공통)
- [x] Node 24로 업그레이드 (2026-05-04: v24.15.0, 4개 앱 빌드 검증 통과)
- [x] Firebase Auth Anonymous 도입 + 보안 규칙 잠그기 (2026-04-28: firestore.rules 통합 작성, 4개 앱 useTossUser 신 패턴 적용 — 1번 브라우저 검증 통과, 2·3·4번 빌드 통과)
- [x] 사업자 등록 완료 (2026-04-28: 일반과세자 / 응용 소프트웨어 개발 + 광고 대행업)
- [ ] 콘솔에서 각 앱 등록 + API 키 발급
- [ ] 토스 샌드박스 실기기 테스트
- [ ] 출시 검수 신청 (영업일 7일 소요)
- [x] 서비스 이용약관 + 개인정보 처리방침 작성 (2026-05-04: 8벌 + GitHub Pages 호스팅 완료)
- [ ] (2번 앱) 카드사 해지 정보(전화번호/앱 경로) 출시 전 각 카드사 공식 사이트에서 최종 검증
- [x] (2번 앱) Firebase 콘솔에서 card-funeral 별도 웹앱 등록 후 APP_ID 갱신 (2026-05-04)
- [x] (3번 앱) Firebase 콘솔에서 gyeongjo-book 별도 웹앱 등록 후 APP_ID 갱신 (2026-05-04)
- [ ] (3번 앱) Home 검색 영역 일반 `<input>` 처리 부분 출시 전 TDS `SearchField` 컴포넌트로 재시도
- [x] (4번 앱) Firebase 콘솔에서 coin-saver 별도 웹앱 등록 후 APP_ID 갱신 (2026-05-04)
- [ ] Storage `/media` 경로 보안 강화 검토 (FitMeal/MyCloud 영향)
- [ ] Aitory 정확한 운영 규칙 확인 후 firestore.rules v3 갱신
