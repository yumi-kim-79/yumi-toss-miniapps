import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CoinTransaction } from "../types";
import { calculateCoin } from "./coinLogic";

const USERS_COLLECTION = "coin_users";
const TX_COLLECTION = "coin_transactions";

export async function ensureUser(userId: string): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      userId,
      totalSaved: 0,
      createdAt: Timestamp.now(),
    });
  }
}

export interface AddTransactionResult {
  txId: string;
  savedCoin: number;
  roundedTo: number;
  newTotalSaved: number;
}

export async function addTransaction(
  userId: string,
  paymentAmount: number,
  memo = "",
): Promise<AddTransactionResult> {
  const { savedCoin, roundedTo } = calculateCoin(paymentAmount);
  const userRef = doc(db, USERS_COLLECTION, userId);
  const txRef = doc(collection(db, TX_COLLECTION));

  const newTotalSaved = await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const prevTotal = userSnap.exists()
      ? ((userSnap.data().totalSaved as number) ?? 0)
      : 0;
    const next = prevTotal + savedCoin;

    if (userSnap.exists()) {
      tx.update(userRef, { totalSaved: next });
    } else {
      tx.set(userRef, {
        userId,
        totalSaved: next,
        createdAt: Timestamp.now(),
      });
    }

    tx.set(txRef, {
      userId,
      paymentAmount,
      savedCoin,
      roundedTo,
      memo,
      createdAt: Timestamp.now(),
    });

    return next;
  });

  return { txId: txRef.id, savedCoin, roundedTo, newTotalSaved };
}

export async function getTotalSaved(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!snap.exists()) return 0;
  return (snap.data().totalSaved as number) ?? 0;
}

function mapTx(d: {
  id: string;
  data: () => Record<string, unknown>;
}): CoinTransaction {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId as string,
    paymentAmount: data.paymentAmount as number,
    savedCoin: data.savedCoin as number,
    roundedTo: data.roundedTo as number,
    memo: (data.memo as string) ?? "",
    createdAt: data.createdAt as Timestamp,
  };
}

export async function getTransactions(
  userId: string,
  limitCount?: number,
): Promise<CoinTransaction[]> {
  const q = query(
    collection(db, TX_COLLECTION),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  const sorted = snap.docs
    .map(mapTx)
    .sort(
      (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime(),
    );
  return limitCount ? sorted.slice(0, limitCount) : sorted;
}
