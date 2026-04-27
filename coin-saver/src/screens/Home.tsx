import { useEffect, useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import {
  Button,
  ListRow,
  Result,
  TextField,
  Top,
  useToast,
} from "@toss/tds-mobile";
import config from "../../granite.config.ts";
import { addTransaction, getTotalSaved, getTransactions } from "../lib/coinDb";
import { calculateCoin, formatKRW } from "../lib/coinLogic";
import {
  getInstantCopy,
  getMilestoneCopy,
  getPreviewCopy,
} from "../lib/coinCopy";
import type { CoinTransaction } from "../types";

interface Props {
  userId: string;
}

const BRAND = config.brand.primaryColor;

function formatNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

function parseNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function formatTxDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function Home({ userId }: Props) {
  const [totalSaved, setTotalSaved] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [milestoneCopy, setMilestoneCopy] = useState("");
  const { openToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getTotalSaved(userId), getTransactions(userId, 20)])
      .then(([total, txs]) => {
        if (cancelled) return;
        setTotalSaved(total);
        setTransactions(txs);
        setMilestoneCopy(getMilestoneCopy(total));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const amountNum = parseNumber(amount);

  const preview = useMemo(() => {
    const { roundedTo, savedCoin } = calculateCoin(amountNum);
    return {
      roundedTo,
      savedCoin,
      copy: getPreviewCopy(amountNum, roundedTo, savedCoin),
    };
  }, [amountNum]);

  const handleSubmit = async () => {
    if (amountNum <= 0) {
      openToast("결제 금액을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await addTransaction(userId, amountNum, memo.trim());
      const txs = await getTransactions(userId, 20);
      setTransactions(txs);
      setTotalSaved(result.newTotalSaved);
      setMilestoneCopy(getMilestoneCopy(result.newTotalSaved));
      setAmount("");
      setMemo("");
      openToast(getInstantCopy(result.savedCoin));
    } catch {
      openToast("저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: adaptive.greyBackground,
        paddingBottom: 40,
      }}
    >
      <Top
        title={
          <Top.TitleParagraph size={28}>
            🪙 오늘의 환승 동전
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            잔돈으로 시작하는 작은 적금.
          </Top.SubtitleParagraph>
        }
      />

      <div
        style={{
          margin: "0 24px 16px",
          backgroundColor: BRAND,
          padding: "28px 24px",
          borderRadius: 20,
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(245, 158, 11, 0.25)",
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1 }}>🐷</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 14 }}>
          지금까지 모은 동전
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            marginTop: 4,
            letterSpacing: "-0.5px",
          }}
        >
          ₩{formatKRW(totalSaved)}
        </div>
        {milestoneCopy && (
          <div
            style={{
              fontSize: 14,
              marginTop: 16,
              padding: "10px 16px",
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: 10,
              fontWeight: 500,
            }}
          >
            {milestoneCopy}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "12px 24px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: adaptive.grey800,
            marginBottom: 4,
          }}
        >
          방금 얼마 쓰셨어요?
        </div>
        <TextField
          variant="box"
          label="결제 금액"
          labelOption="sustain"
          placeholder="예: 6,300"
          suffix="원"
          value={formatNumber(amount)}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          variant="box"
          label="메모 (선택)"
          labelOption="sustain"
          placeholder="예: 스타벅스"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        {amountNum > 0 && (
          <div
            style={{
              padding: "16px 18px",
              backgroundColor: `${BRAND}14`,
              borderLeft: `3px solid ${BRAND}`,
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: adaptive.grey800,
              lineHeight: 1.5,
            }}
          >
            {preview.copy}
          </div>
        )}

        <Button
          display="block"
          size="xlarge"
          onClick={handleSubmit}
          loading={submitting}
          disabled={amountNum <= 0}
        >
          동전 떨어뜨리기
        </Button>
      </div>

      <div style={{ marginTop: 24 }}>
        <div
          style={{
            padding: "12px 24px 8px",
            fontSize: 14,
            fontWeight: 600,
            color: adaptive.grey700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>최근 동전</span>
          {transactions.length > 0 && (
            <span style={{ fontSize: 13, color: adaptive.grey500 }}>
              최근 {transactions.length}건
            </span>
          )}
        </div>
        {loading ? null : transactions.length === 0 ? (
          <Result
            title="아직 떨어진 동전이 없어요"
            description="첫 결제를 기록해 보세요."
          />
        ) : (
          <div style={{ backgroundColor: "#fff" }}>
            {transactions.map((t) => (
              <ListRow
                key={t.id}
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={<>{formatKRW(t.paymentAmount)}원</>}
                    bottom={
                      <span style={{ color: adaptive.grey600 }}>
                        {t.memo || "메모 없음"}
                      </span>
                    }
                  />
                }
                right={
                  <ListRow.Texts
                    type="Right2RowTypeA"
                    top={
                      <span style={{ color: BRAND, fontWeight: 700 }}>
                        +{formatKRW(t.savedCoin)}원
                      </span>
                    }
                    bottom={
                      <span style={{ color: adaptive.grey500 }}>
                        {formatTxDate(t.createdAt.toDate())}
                      </span>
                    }
                  />
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
