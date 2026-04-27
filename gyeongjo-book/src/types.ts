export type EventType = "wedding" | "funeral" | "baby" | "other";
export type Direction = "gave" | "received";

export interface GyeongjoRecord {
  id: string;
  userId: string;
  counterpartyName: string;
  amount: number;
  direction: Direction;
  eventType: EventType;
  eventDate: Date;
  memo: string;
  createdAt: Date;
}

export interface PersonSummary {
  counterpartyName: string;
  totalGave: number;
  totalReceived: number;
  balance: number;
  recordCount: number;
  lastEventDate: Date;
}
