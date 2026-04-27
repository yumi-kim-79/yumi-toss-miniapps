export type CardIssuer =
  | "신한"
  | "삼성"
  | "현대"
  | "KB"
  | "우리"
  | "하나"
  | "롯데"
  | "NH"
  | "기타";

export type CardStatus = "active" | "dormant" | "critical" | "dead";

export interface Card {
  id: string;
  userId: string;
  cardName: string;
  issuer: CardIssuer;
  annualFee: number;
  lastUsedDate: Date;
  registeredAt: Date;
}

export interface Funeral {
  id: string;
  userId: string;
  cardName: string;
  issuer: CardIssuer;
  totalAnnualFee: number;
  funeralDate: Date;
}
