function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MILESTONES: { min: number; lines: string[] }[] = [
  {
    min: 100000,
    lines: [
      "10만원 돌파! 진짜 적금이 됐네요. 🎉",
      "이젠 아무도 못 말려요. 계속 가요!",
      "잔돈이 모여 큰돈이 됐어요.",
    ],
  },
  {
    min: 50000,
    lines: [
      "5만원이면 운동화 한 짝값이에요. 👟",
      "이 페이스로면 곧 10만원!",
      "꽤 묵직한 저금통이 됐어요.",
    ],
  },
  {
    min: 10000,
    lines: [
      "만 원이면 점심값이에요. 🍱",
      "꽤 모이고 있어요.",
      "이제 진짜 적금처럼 보이네요.",
    ],
  },
  {
    min: 1000,
    lines: [
      "오, 천 원 돌파!",
      "이미 작은 산이 만들어지고 있어요. ⛰️",
      "잔돈의 위력, 느끼고 있죠?",
    ],
  },
  {
    min: 0,
    lines: [
      "시작이 반이에요! 동전 한 닢부터.",
      "동전이 모이면 산이 됩니다. 🪙",
      "오늘의 첫 동전을 기다려요.",
    ],
  },
];

export function getMilestoneCopy(totalSaved: number): string {
  const m = MILESTONES.find((x) => totalSaved >= x.min);
  return pick((m ?? MILESTONES[MILESTONES.length - 1]).lines);
}

export function getInstantCopy(savedCoin: number): string {
  if (savedCoin <= 0) {
    return "이번엔 동전이 없네요. 다음에 만나요!";
  }
  return `🪙 ${savedCoin.toLocaleString("ko-KR")}원 동전이 떨어졌어요!`;
}

export function getPreviewCopy(
  paymentAmount: number,
  roundedTo: number,
  savedCoin: number,
): string {
  if (paymentAmount <= 0) return "결제 금액을 입력해 주세요.";
  if (savedCoin === 0) {
    return "딱 떨어지네요! 이번엔 동전이 없어요.";
  }
  return `${roundedTo.toLocaleString("ko-KR")}원으로 올림 → 동전 ${savedCoin.toLocaleString("ko-KR")}원이 떨어져요!`;
}
