import type { CardStatus } from "../types";

type EulogyParams = {
  cardName: string;
  durationMonths: number;
  totalLoss: number;
};
type EulogyVariant = (params: EulogyParams) => string;

const eulogies: EulogyVariant[] = [
  ({ cardName, durationMonths }) =>
    `${cardName}이(가) ${durationMonths}개월의 짧은 생을 마감했습니다.`,
  ({ cardName, totalLoss }) =>
    `${cardName}, 잘 가요. ${totalLoss.toLocaleString("ko-KR")}원의 추억을 남기고.`,
  ({ cardName, durationMonths }) =>
    `${cardName}님은 ${durationMonths}개월 동안 지갑 한구석을 묵묵히 지켰습니다.`,
  ({ cardName, totalLoss }) =>
    `고(故) ${cardName}, ${totalLoss.toLocaleString("ko-KR")}원어치의 인사를 받으며 떠나갑니다.`,
  ({ cardName }) => `${cardName}이(가) 마침내 안식에 들었습니다.`,
  ({ cardName, durationMonths }) =>
    `잘 가요 ${cardName}. ${durationMonths}개월 동안 고마웠어요.`,
  ({ cardName, totalLoss }) =>
    `${cardName}이(가) ${totalLoss.toLocaleString("ko-KR")}원을 남기고 깊은 잠에 들었어요.`,
  ({ cardName }) => `${cardName}이(가) 가만히, 그러나 분명히, 떠났습니다.`,
];

export function getEulogy(
  cardName: string,
  durationMonths: number,
  totalLoss: number,
): string {
  const idx = Math.floor(Math.random() * eulogies.length);
  return eulogies[idx]({ cardName, durationMonths, totalLoss });
}

const statusComments: Record<CardStatus, string[]> = {
  active: [
    "잘 쓰고 있어요. 이 카드는 살아있어요.",
    "오늘도 활발해요.",
    "아직 건강합니다.",
  ],
  dormant: [
    "조금 쉬고 있어요. 깨워볼까요?",
    "한동안 사용이 뜸했어요.",
    "잠시 휴식 중이에요.",
  ],
  critical: [
    "위중합니다. 마지막 인사를 준비할 때예요.",
    "곧 잠들 것 같아요.",
    "심상치 않아요. 결단의 시간이 다가옵니다.",
  ],
  dead: [
    "이미 잠들었어요. 장례를 치러주세요.",
    "이 카드는 이제 추모할 시간이에요.",
    "더는 깨어나지 않을 것 같아요.",
  ],
};

export function getStatusComment(status: CardStatus): string {
  const variants = statusComments[status];
  const idx = Math.floor(Math.random() * variants.length);
  return variants[idx];
}
