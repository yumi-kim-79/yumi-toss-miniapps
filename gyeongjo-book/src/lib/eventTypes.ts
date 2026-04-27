import type { EventType } from "../types";

export interface EventTypeMeta {
  value: EventType;
  label: string;
  emoji: string;
}

export const EVENT_TYPES: EventTypeMeta[] = [
  { value: "wedding", label: "결혼식", emoji: "💐" },
  { value: "funeral", label: "장례식", emoji: "🕯️" },
  { value: "baby", label: "돌잔치", emoji: "🎂" },
  { value: "other", label: "기타", emoji: "🎁" },
];

export function getEventLabel(eventType: EventType): string {
  return EVENT_TYPES.find((e) => e.value === eventType)?.label ?? "기타";
}

export function getEventEmoji(eventType: EventType): string {
  return EVENT_TYPES.find((e) => e.value === eventType)?.emoji ?? "🎁";
}
