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
4. ⏳ **오늘의 환승 동전** (coin-saver) - 대기 (V1만 출시, V2는 SDK 답변 후 결정)

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
- **앱 등록**: life-wage (웹앱), 추가 앱은 콘솔에서 차례로 등록 필요
- **컬렉션 prefix**:
  - `wage_*` - 내 인생 시급
  - `card_*` - 내 카드 장례식 (예정)
  - `gyeongjo_*` - 경조사 가계부 (예정)
  - `coin_*` - 환승 동전 (예정)
- **보안 규칙**: 현재 임시 개방 (allow read, write: if true)
  - ⚠️ 출시 전 반드시 Firebase Anonymous Auth 도입 후 잠가야 함
  - userId 단위로 본인 데이터만 read/write 허용 규칙으로 변경

## 사용자 식별 전략
- 토스 SDK의 `getAnonymousKey()` 사용 (로그인 없는 익명 키)
- 브라우저 환경(개발용)에서는 `dev_xxxxxxxx` 형식 localStorage fallback
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
- mycloud-5ce96 동일 키 사용. 현재는 APP_ID도 life-wage와 공유 중
- ⚠️ 출시 전 Firebase 콘솔에서 card-funeral 별도 웹앱 등록 후 APP_ID 갱신 필요

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
- mycloud-5ce96 동일 키 사용. 현재는 APP_ID도 life-wage와 공유 중
- ⚠️ 출시 전 Firebase 콘솔에서 gyeongjo-book 별도 웹앱 등록 후 APP_ID 갱신 필요

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

## 진행 중인 외부 작업
- ⏳ **사업자 등록**: 홈택스 신청 예정 (정보통신업/응용소프트웨어 개발 및 공급업, 간이과세자)
- ⏳ **앱인토스 SDK 결제내역 API 권한 문의**: 커뮤니티 글 작성됨, 운영진 보류 검토 대기
  - 답변 결과에 따라 4번 앱(환승 동전)의 V2 구현 여부 결정

## 다음 세션 시작 시
1. 이 PROGRESS.md 먼저 읽기
2. 마지막으로 git log 확인하여 최신 상태 파악
3. 다음 작업할 앱 폴더로 cd
4. docs/skills/ 의 apps-in-toss.md, tds-mobile.md 참고

## 출시 전 체크리스트 (모든 앱 공통)
- [ ] Node 24로 업그레이드 (granite build/deploy 위해)
- [ ] Firebase Auth Anonymous 도입 + 보안 규칙 잠그기
- [ ] 사업자 등록 완료
- [ ] 콘솔에서 각 앱 등록 + API 키 발급
- [ ] 토스 샌드박스 실기기 테스트
- [ ] 출시 검수 신청 (영업일 7일 소요)
- [ ] (2번 앱) 카드사 해지 정보(전화번호/앱 경로) 출시 전 각 카드사 공식 사이트에서 최종 검증
- [ ] (2번 앱) Firebase 콘솔에서 card-funeral 별도 웹앱 등록 후 APP_ID 갱신
- [ ] (3번 앱) Firebase 콘솔에서 gyeongjo-book 별도 웹앱 등록 후 APP_ID 갱신
- [ ] (3번 앱) Home 검색 영역 일반 `<input>` 처리 부분 출시 전 TDS `SearchField` 컴포넌트로 재시도
