import { Timestamp } from "firebase/firestore";

export interface CoinUser {
  userId: string;
  totalSaved: number;
  createdAt: Timestamp;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  paymentAmount: number;
  savedCoin: number;
  roundedTo: number;
  memo: string;
  createdAt: Timestamp;
}
