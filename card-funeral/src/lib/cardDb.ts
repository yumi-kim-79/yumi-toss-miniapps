import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Card, CardIssuer, Funeral } from "../types";

const CARDS_COLLECTION = "card_cards";
const FUNERALS_COLLECTION = "card_funerals";
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export async function addCard(
  userId: string,
  cardName: string,
  issuer: CardIssuer,
  annualFee: number,
  lastUsedDate: Date,
): Promise<string> {
  const ref = await addDoc(collection(db, CARDS_COLLECTION), {
    userId,
    cardName,
    issuer,
    annualFee,
    lastUsedDate: Timestamp.fromDate(lastUsedDate),
    registeredAt: Timestamp.now(),
  });
  return ref.id;
}

export async function getCards(userId: string): Promise<Card[]> {
  const q = query(
    collection(db, CARDS_COLLECTION),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId as string,
        cardName: data.cardName as string,
        issuer: data.issuer as CardIssuer,
        annualFee: data.annualFee as number,
        lastUsedDate: (data.lastUsedDate as Timestamp).toDate(),
        registeredAt: (data.registeredAt as Timestamp).toDate(),
      };
    })
    .sort((a, b) => a.lastUsedDate.getTime() - b.lastUsedDate.getTime());
}

export async function updateCardLastUsed(
  cardId: string,
  newDate: Date,
): Promise<void> {
  await updateDoc(doc(db, CARDS_COLLECTION, cardId), {
    lastUsedDate: Timestamp.fromDate(newDate),
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  await deleteDoc(doc(db, CARDS_COLLECTION, cardId));
}

export async function holdFuneral(card: Card): Promise<void> {
  const elapsedMonths = (Date.now() - card.registeredAt.getTime()) / MONTH_MS;
  const yearsHeld = Math.max(1, Math.ceil(elapsedMonths / 12));
  const totalAnnualFee = card.annualFee * yearsHeld;

  await addDoc(collection(db, FUNERALS_COLLECTION), {
    userId: card.userId,
    cardName: card.cardName,
    issuer: card.issuer,
    totalAnnualFee,
    funeralDate: Timestamp.now(),
  });
  await deleteDoc(doc(db, CARDS_COLLECTION, card.id));
}

export async function getFunerals(userId: string): Promise<Funeral[]> {
  const q = query(
    collection(db, FUNERALS_COLLECTION),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId as string,
        cardName: data.cardName as string,
        issuer: data.issuer as CardIssuer,
        totalAnnualFee: data.totalAnnualFee as number,
        funeralDate: (data.funeralDate as Timestamp).toDate(),
      };
    })
    .sort((a, b) => b.funeralDate.getTime() - a.funeralDate.getTime());
}
