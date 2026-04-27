import type { GyeongjoRecord } from "../types";
import { normalizeName } from "./personSummary";

export function getExistingNames(records: GyeongjoRecord[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const r of records) {
    const key = normalizeName(r.counterpartyName);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(r.counterpartyName);
  }
  return result;
}

export function filterNames(allNames: string[], input: string): string[] {
  const normalizedInput = normalizeName(input);
  if (!normalizedInput) return [];

  const startsWith: string[] = [];
  const includes: string[] = [];
  for (const name of allNames) {
    const normalized = normalizeName(name);
    if (normalized === normalizedInput) continue;
    if (normalized.startsWith(normalizedInput)) {
      startsWith.push(name);
    } else if (normalized.includes(normalizedInput)) {
      includes.push(name);
    }
  }
  return [...startsWith, ...includes].slice(0, 6);
}
