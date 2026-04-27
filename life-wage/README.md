# 내 인생 시급 (life-wage)

내가 쓴 돈을 시급으로 환산해서 "이 돈, 몇 시간/며칠 일한 값일까?"를 즉시 알려주는 앱인토스 미니앱.

## 주요 기능
- 월 실수령액 + 월 근무시간 입력으로 시급 자동 계산
- 금액 입력 시 즉시 시간 환산 + 9구간 카피 멘트 미리보기
- 이번 달 누적 "사라진 시간" 표시
- 최근 기록 리스트 (최근 20건)

## 개발 / 빌드

```bash
npm install            # 의존성 설치
npm run dev            # granite dev (vite + metro 동반, 8081 포트 사용)
npx vite --port 5173   # vite 단독 실행 (metro 충돌 회피용)
npm run build          # ait build (배포 번들)
npm run lint
npm run format
```

> `granite dev`는 metro 번들러용으로 8081 포트를 추가로 잡습니다. 다른 React Native 프로젝트가 8081을 쓰고 있을 땐 `npx vite`만 단독으로 띄워서 웹 단독 검증이 가능합니다.

## 환경 변수

`.env.local`에 다음 6개 키가 필요합니다 (Firebase Console → 프로젝트 설정 → 웹앱에서 발급):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 디렉토리 구조

```
life-wage/
├── granite.config.ts        # 앱인토스 설정 (브랜드 색, 앱 이름)
├── vite.config.ts
├── index.html
├── public/
├── src/
│   ├── App.tsx              # Onboarding <-> Home 라우팅
│   ├── main.tsx             # TDS Provider 부착
│   ├── types.ts             # WageUser, WageRecord
│   ├── hooks/
│   │   └── useTossUser.ts   # getAnonymousKey + dev fallback
│   ├── lib/
│   │   ├── firebase.ts      # initializeApp + getFirestore
│   │   ├── wageDb.ts        # Firestore CRUD (wage_users, wage_records)
│   │   └── wageCopy.ts      # 9구간 카피 + formatHours
│   └── screens/
│       ├── Onboarding.tsx   # 시급 등록
│       └── Home.tsx         # 메인 화면
└── docs/skills/             # 앱인토스 / TDS 참조 문서
```

## 데이터 스키마

Firestore 컬렉션:
- `wage_users/{userId}` — `{ monthlySalary, monthlyHours, hourlyWage }`
- `wage_records/*` — `{ userId, amount, hoursWorth, memo, createdAt }`

`userId`는 토스 SDK `getAnonymousKey()`의 hash 또는 dev fallback (`dev_xxxxxxxx`).

> 컬렉션 prefix는 `wage_`. 같은 Firebase 프로젝트에 다른 미니앱이 들어가도 충돌하지 않도록 분리되어 있습니다.
