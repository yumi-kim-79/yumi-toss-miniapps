import { useMemo, useState } from "react";
import { FixedBottomCTA, useToast } from "@toss/tds-mobile";
import { holdFuneral } from "../lib/cardDb";
import { getEulogy } from "../lib/funeralCopy";
import type { Card } from "../types";

interface Props {
  card: Card;
  onComplete: () => void;
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export default function Funeral({ card, onComplete }: Props) {
  const { openToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { monthsHeld, totalLoss, eulogy } = useMemo(() => {
    const elapsedMonths = Math.max(
      1,
      Math.round((Date.now() - card.registeredAt.getTime()) / MONTH_MS),
    );
    const yearsHeld = Math.max(1, Math.ceil(elapsedMonths / 12));
    const loss = card.annualFee * yearsHeld;
    return {
      monthsHeld: elapsedMonths,
      totalLoss: loss,
      eulogy: getEulogy(card.cardName, elapsedMonths, loss),
    };
  }, [card.id, card.cardName, card.registeredAt, card.annualFee]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await holdFuneral(card);
      onComplete();
    } catch {
      openToast("장례 처리에 실패했어요. 다시 시도해주세요.");
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0d10",
        color: "#fff",
        paddingBottom: 140,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 32px 140px",
      }}
    >
      <div style={{ fontSize: 120, lineHeight: 1 }}>🪦</div>

      <div
        style={{
          marginTop: 32,
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.6,
          color: "#e5e5e5",
        }}
      >
        {eulogy}
      </div>

      <div
        style={{
          marginTop: 40,
          width: "100%",
          maxWidth: 320,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Stat label="이 카드와 함께한 시간" value={`${monthsHeld}개월`} />
        <Stat
          label="남기고 간 연회비"
          value={`₩${totalLoss.toLocaleString("ko-KR")}`}
        />
      </div>

      <FixedBottomCTA
        onClick={handleConfirm}
        loading={submitting}
        background="none"
        containerStyle={{ backgroundColor: "transparent" }}
      >
        확인했어요
      </FixedBottomCTA>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 15,
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
      <span style={{ color: "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
