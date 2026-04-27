export interface CoinResult {
  roundedTo: number;
  savedCoin: number;
}

export function calculateCoin(paymentAmount: number, unit = 1000): CoinResult {
  if (
    !Number.isFinite(paymentAmount) ||
    paymentAmount <= 0 ||
    !Number.isFinite(unit) ||
    unit <= 0
  ) {
    return { roundedTo: 0, savedCoin: 0 };
  }

  const remainder = paymentAmount % unit;
  if (remainder === 0) {
    return { roundedTo: paymentAmount, savedCoin: 0 };
  }

  const roundedTo = paymentAmount + (unit - remainder);
  return { roundedTo, savedCoin: roundedTo - paymentAmount };
}

export function formatKRW(amount: number): string {
  return amount.toLocaleString("ko-KR");
}
