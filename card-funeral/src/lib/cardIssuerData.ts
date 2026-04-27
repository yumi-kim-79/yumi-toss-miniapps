import type { CardIssuer } from "../types";

// 출시 전 각 카드사 공식 사이트에서 검증 필요. 일반적인 안내 기준 정보임.
export interface IssuerInfo {
  name: CardIssuer;
  tel: string;
  appPath: string;
  notes: string;
}

export const CARD_ISSUERS: IssuerInfo[] = [
  {
    name: "신한",
    tel: "1599-8000",
    appPath: "신한카드 앱 > 카드관리 > 카드해지",
    notes: "본인인증 필요",
  },
  {
    name: "삼성",
    tel: "1588-8700",
    appPath: "삼성카드 앱 > 마이메뉴 > 카드해지",
    notes: "본인인증 필요",
  },
  {
    name: "현대",
    tel: "1577-6000",
    appPath: "현대카드 앱 > 메뉴 > 카드해지",
    notes: "본인인증 필요",
  },
  {
    name: "KB",
    tel: "1588-1688",
    appPath: "KB Pay 앱 > 카드 > 해지신청",
    notes: "본인인증 필요",
  },
  {
    name: "우리",
    tel: "1588-9955",
    appPath: "우리원카드 앱 > 카드관리 > 해지",
    notes: "본인인증 필요",
  },
  {
    name: "하나",
    tel: "1800-1111",
    appPath: "하나카드 앱 > 메뉴 > 카드해지",
    notes: "본인인증 필요",
  },
  {
    name: "롯데",
    tel: "1588-8100",
    appPath: "롯데카드 앱 > 마이 > 카드해지",
    notes: "본인인증 필요",
  },
  {
    name: "NH",
    tel: "1644-2009",
    appPath: "NH올원페이 앱 > 카드관리 > 해지",
    notes: "본인인증 필요",
  },
];

export const ISSUER_NAMES: CardIssuer[] = [
  "신한",
  "삼성",
  "현대",
  "KB",
  "우리",
  "하나",
  "롯데",
  "NH",
  "기타",
];

export function getIssuerInfo(issuer: CardIssuer): IssuerInfo | undefined {
  return CARD_ISSUERS.find((i) => i.name === issuer);
}
