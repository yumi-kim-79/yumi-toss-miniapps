import { adaptive } from "@toss/tds-colors";
import type { CardStatus } from "../types";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function getCardStatus(lastUsedDate: Date): CardStatus {
  const months = (Date.now() - lastUsedDate.getTime()) / MONTH_MS;
  if (months < 1) return "active";
  if (months < 3) return "dormant";
  if (months < 6) return "critical";
  return "dead";
}

export function getMonthsSinceUsed(lastUsedDate: Date): number {
  return (Date.now() - lastUsedDate.getTime()) / MONTH_MS;
}

export interface StatusInfo {
  emoji: string;
  label: string;
  description: string;
  color: string;
}

const STATUS_INFO: Record<CardStatus, StatusInfo> = {
  active: {
    emoji: "✅",
    label: "활동중",
    description: "잘 쓰고 계세요",
    color: adaptive.green500,
  },
  dormant: {
    emoji: "😐",
    label: "휴면",
    description: "조금 쉬고 있어요",
    color: adaptive.yellow500,
  },
  critical: {
    emoji: "💀",
    label: "위중",
    description: "곧 죽을 것 같아요",
    color: adaptive.orange500,
  },
  dead: {
    emoji: "🪦",
    label: "사망",
    description: "이미 잠들었어요",
    color: adaptive.red500,
  },
};

export function getStatusInfo(status: CardStatus): StatusInfo {
  return STATUS_INFO[status];
}
