export function formatHours(hours: number): string {
  if (hours <= 0) return "0분";
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60));
    return `${minutes}분`;
  }
  if (hours < 8) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
  }
  const days = hours / 8;
  if (days < 22) {
    return days < 2
      ? `${days.toFixed(1)}일치`
      : `${Math.round(days)}일치`;
  }
  const months = days / 22;
  return months < 12
    ? `${months.toFixed(1)}개월치`
    : `${(months / 12).toFixed(1)}년치`;
}

type CopyVariant = (label: string) => string;

const ranges: Array<{ max: number; copies: CopyVariant[] }> = [
  {
    max: 5_000,
    copies: [
      (l) => `${l}만 일하면 채워져요. 부담 없죠?`,
      (l) => `${l}이면 회복돼요. 신경 안 쓰셔도 돼요.`,
      (l) => `${l}짜리, 가볍게 넘기세요.`,
    ],
  },
  {
    max: 15_000,
    copies: [
      (l) => `${l} 동안 책상 앞에 앉아 있던 값이에요.`,
      (l) => `${l}어치의 노동이 사라졌어요.`,
      (l) => `점심 한 끼가 ${l}. 한 번쯤은 괜찮죠.`,
    ],
  },
  {
    max: 30_000,
    copies: [
      (l) => `${l}을 맞바꾸셨어요. 그만한 가치가 있었나요?`,
      (l) => `${l} 일해야 채울 수 있는 금액이에요.`,
      (l) => `${l} 동안의 노동이 한 번에 새어나갔어요.`,
    ],
  },
  {
    max: 50_000,
    copies: [
      (l) => `${l}이 사라졌어요. 정말 필요했나요?`,
      (l) => `${l}어치 노동이 휘발됐네요.`,
      (l) => `사무실에서 ${l} 더 버틴 결과물이에요.`,
    ],
  },
  {
    max: 100_000,
    copies: [
      (l) => `${l}을 통째로 보내셨어요.`,
      (l) => `${l}의 노동이 한 번에 증발했어요.`,
      (l) => `${l}을 다시 메꾸려면, 그만큼 또 일해야 해요.`,
    ],
  },
  {
    max: 300_000,
    copies: [
      (l) => `${l}짜리 결정이에요. 정말 후회 없으세요?`,
      (l) => `${l}을 한 번에 태우셨네요.`,
      (l) => `이게 정말 ${l}만큼의 가치가 있나요?`,
    ],
  },
  {
    max: 1_000_000,
    copies: [
      (l) => `${l}을 날려보냈어요. 진심이세요?`,
      (l) => `${l}짜리 충동이라면, 한 번 더 생각해봐요.`,
      (l) => `${l}을 회복하려면, 같은 시간을 또 살아내야 해요.`,
    ],
  },
  {
    max: 3_000_000,
    copies: [
      (l) => `${l}이에요. 인생의 한 챕터를 옮기셨어요.`,
      (l) => `${l}짜리 결정. 정말 괜찮으세요?`,
      (l) => `${l}만큼의 시간을 한 번에 옮기셨어요.`,
    ],
  },
  {
    max: Infinity,
    copies: [
      (l) => `${l}. 인생을 정말 옮기는 결정이에요.`,
      (l) => `${l}을 통째로 거셨네요.`,
      (l) => `${l} — 정말 그만한 가치가 있나요?`,
    ],
  },
];

export function getCopyForAmount(amount: number, hourlyWage: number): string {
  if (hourlyWage <= 0 || amount <= 0) return "";
  const hours = amount / hourlyWage;
  const label = formatHours(hours);
  const range =
    ranges.find((r) => amount < r.max) ?? ranges[ranges.length - 1];
  const idx = Math.floor(Math.random() * range.copies.length);
  return range.copies[idx](label);
}
