import type { GyeongjoRecord, PersonSummary } from "../types";

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, "");
}

export function aggregateByPerson(
  records: GyeongjoRecord[],
): PersonSummary[] {
  const map = new Map<string, PersonSummary>();

  for (const r of records) {
    const key = normalizeName(r.counterpartyName);
    if (!key) continue;

    const existing = map.get(key);
    const gaveAdd = r.direction === "gave" ? r.amount : 0;
    const receivedAdd = r.direction === "received" ? r.amount : 0;

    if (existing) {
      existing.totalGave += gaveAdd;
      existing.totalReceived += receivedAdd;
      existing.balance = existing.totalReceived - existing.totalGave;
      existing.recordCount += 1;
      if (r.eventDate.getTime() > existing.lastEventDate.getTime()) {
        existing.lastEventDate = r.eventDate;
        existing.counterpartyName = r.counterpartyName;
      }
    } else {
      map.set(key, {
        counterpartyName: r.counterpartyName,
        totalGave: gaveAdd,
        totalReceived: receivedAdd,
        balance: receivedAdd - gaveAdd,
        recordCount: 1,
        lastEventDate: r.eventDate,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aNeg = a.balance < 0 ? 1 : 0;
    const bNeg = b.balance < 0 ? 1 : 0;
    if (aNeg !== bNeg) return bNeg - aNeg;
    return b.lastEventDate.getTime() - a.lastEventDate.getTime();
  });
}
