import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { WageRecord, WageUser } from "../types";

const USERS_COLLECTION = "wage_users";
const RECORDS_COLLECTION = "wage_records";

export async function saveUserWage(
  userId: string,
  monthlySalary: number,
  monthlyHours: number,
): Promise<number> {
  const hourlyWage = Math.round(monthlySalary / monthlyHours);
  const data: WageUser = { monthlySalary, monthlyHours, hourlyWage };
  await setDoc(doc(db, USERS_COLLECTION, userId), data);
  return hourlyWage;
}

export async function getUserWage(userId: string): Promise<WageUser | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!snap.exists()) return null;
  return snap.data() as WageUser;
}

export async function addRecord(
  userId: string,
  amount: number,
  hourlyWage: number,
  memo = "",
): Promise<number> {
  const hoursWorth = amount / hourlyWage;
  await addDoc(collection(db, RECORDS_COLLECTION), {
    userId,
    amount,
    hoursWorth,
    memo,
    createdAt: Timestamp.now(),
  });
  return hoursWorth;
}

export async function getRecords(userId: string): Promise<WageRecord[]> {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId as string,
        amount: data.amount as number,
        hoursWorth: data.hoursWorth as number,
        memo: (data.memo as string) ?? "",
        createdAt: (data.createdAt as Timestamp).toDate(),
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
