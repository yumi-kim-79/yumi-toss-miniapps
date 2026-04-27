import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Direction, EventType, GyeongjoRecord } from "../types";

const RECORDS_COLLECTION = "gyeongjo_records";

export async function addRecord(
  userId: string,
  counterpartyName: string,
  amount: number,
  direction: Direction,
  eventType: EventType,
  eventDate: Date,
  memo = "",
): Promise<string> {
  const ref = await addDoc(collection(db, RECORDS_COLLECTION), {
    userId,
    counterpartyName,
    amount,
    direction,
    eventType,
    eventDate: Timestamp.fromDate(eventDate),
    memo,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

function mapDoc(d: {
  id: string;
  data: () => Record<string, unknown>;
}): GyeongjoRecord {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId as string,
    counterpartyName: data.counterpartyName as string,
    amount: data.amount as number,
    direction: data.direction as Direction,
    eventType: data.eventType as EventType,
    eventDate: (data.eventDate as Timestamp).toDate(),
    memo: (data.memo as string) ?? "",
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}

export async function getRecords(userId: string): Promise<GyeongjoRecord[]> {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(mapDoc)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getRecordsByPerson(
  userId: string,
  counterpartyName: string,
): Promise<GyeongjoRecord[]> {
  const all = await getRecords(userId);
  return all
    .filter((r) => r.counterpartyName === counterpartyName)
    .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
}

export async function deleteRecord(recordId: string): Promise<void> {
  await deleteDoc(doc(db, RECORDS_COLLECTION, recordId));
}
