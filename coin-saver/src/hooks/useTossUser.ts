import { useEffect, useState } from "react";
import { getAnonymousKey } from "@apps-in-toss/web-framework";

const DEV_USER_KEY = "coin_dev_user_id";

function getOrCreateDevUserId(): string {
  const existing = localStorage.getItem(DEV_USER_KEY);
  if (existing) return existing;
  const newId = `dev_coin_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(DEV_USER_KEY, newId);
  return newId;
}

export function useTossUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await getAnonymousKey();
        if (cancelled) return;
        if (result && result !== "ERROR" && result.type === "HASH") {
          setUserId(result.hash);
        } else {
          setUserId(getOrCreateDevUserId());
        }
      } catch {
        if (!cancelled) setUserId(getOrCreateDevUserId());
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
