type CopyVariant = (name: string, diffLabel: string) => string;

const NEGATIVE_COPIES: CopyVariant[] = [
  (name) => `${name}님은 다음에 챙겨주실 차례예요.`,
  (name, diff) => `${name}님과 ${diff} 차이가 있어요.`,
  (name, diff) => `${name}님께 ${diff} 더 보내셨어요.`,
];

const POSITIVE_COPIES: CopyVariant[] = [
  (name) => `${name}님께 마음의 빚이 있네요.`,
  (name, diff) => `${name}님께 ${diff} 더 받으셨어요.`,
  (name) => `${name}님께 답례를 준비할 때예요.`,
];

const ZERO_COPIES: CopyVariant[] = [
  (name) => `${name}님과 정확히 균형을 이뤘어요.`,
  (name) => `${name}님과는 똑같이 주고받으셨네요.`,
];

function formatAmount(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function getBalanceCopy(name: string, balance: number): string {
  const diff = formatAmount(Math.abs(balance));
  let pool: CopyVariant[];
  if (balance < 0) pool = NEGATIVE_COPIES;
  else if (balance > 0) pool = POSITIVE_COPIES;
  else pool = ZERO_COPIES;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx](name, diff);
}
