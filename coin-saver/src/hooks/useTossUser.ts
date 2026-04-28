import { useEffect, useState } from "react";
import { getAnonymousKey } from "@apps-in-toss/web-framework";
import { signInAnonymously } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const DEV_TOSS_KEY_STORAGE = "coin_dev_toss_key";
const MAPPING_COLLECTION = "coin_user_mapping";

function getOrCreateDevTossKey(): string {
  const existing = localStorage.getItem(DEV_TOSS_KEY_STORAGE);
  if (existing) return existing;
  const newKey = `dev_${Math.random().toString(36).slice(2, 12)}`;
  localStorage.setItem(DEV_TOSS_KEY_STORAGE, newKey);
  return newKey;
}

async function resolveTossAnonymousKey(): Promise<string> {
  try {
    const result = await getAnonymousKey();
    if (result && result !== "ERROR" && result.type === "HASH") {
      return result.hash;
    }
  } catch {
    // 토스 SDK 미가용 환경 (브라우저 dev 등): fallback으로 진행
  }
  return getOrCreateDevTossKey();
}

async function ensureUserMapping(
  firebaseUid: string,
  tossAnonymousKey: string,
): Promise<void> {
  const ref = doc(db, MAPPING_COLLECTION, firebaseUid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    tossAnonymousKey,
    createdAt: Timestamp.now(),
  });
}

export function useTossUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const tossKey = await resolveTossAnonymousKey();
        const cred = await signInAnonymously(auth);
        if (cancelled) return;
        const firebaseUid = cred.user.uid;
        await ensureUserMapping(firebaseUid, tossKey);
        if (cancelled) return;
        setUserId(firebaseUid);
      } catch (err) {
        console.error("[useTossUser] Firebase Anonymous Auth 실패", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { userId, loading };
}
