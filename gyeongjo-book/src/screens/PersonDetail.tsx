import { useEffect, useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { FixedBottomCTA, ListRow, Top } from "@toss/tds-mobile";
import config from "../../granite.config.ts";
import { getRecords } from "../lib/gyeongjoDb";
import { getEventEmoji, getEventLabel } from "../lib/eventTypes";
import { getBalanceCopy } from "../lib/gyeongjoCopy";
import { normalizeName } from "../lib/personSummary";
import type { GyeongjoRecord } from "../types";

interface Props {
  userId: string;
  personName: string;
  onBack: () => void;
  onAddRecord: (prefilledName: string) => void;
}

const BRAND = config.brand.primaryColor;

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatAmount(n: number): string {
  return `₩${n.toLocaleString("ko-KR")}`;
}

function formatBalance(balance: number): string {
  if (balance === 0) return "±₩0";
  const sign = balance > 0 ? "+" : "-";
  return `${sign}₩${Math.abs(balance).toLocaleString("ko-KR")}`;
}

export default function PersonDetail({
  userId,
  personName,
  onBack,
  onAddRecord,
}: Props) {
  const [records, setRecords] = useState<GyeongjoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const targetKey = normalizeName(personName);
    getRecords(userId)
      .then((rs) => {
        if (!cancelled) {
          setRecords(
            rs
              .filter((r) => normalizeName(r.counterpartyName) === targetKey)
              .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime()),
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, personName]);

  const stats = useMemo(() => {
    let totalGave = 0;
    let totalReceived = 0;
    let gaveCount = 0;
    let receivedCount = 0;
    for (const r of records) {
      if (r.direction === "gave") {
        totalGave += r.amount;
        gaveCount += 1;
      } else {
        totalReceived += r.amount;
        receivedCount += 1;
      }
    }
    return {
      totalGave,
      totalReceived,
      gaveCount,
      receivedCount,
      balance: totalReceived - totalGave,
    };
  }, [records]);

  const copy = useMemo(
    () => getBalanceCopy(personName, stats.balance),
    [personName, stats.balance],
  );

  const balanceColor =
    stats.balance < 0
      ? "#DC2626"
      : stats.balance > 0
        ? BRAND
        : adaptive.grey500;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: adaptive.greyBackground,
        paddingBottom: 140,
      }}
    >
      <Top
        title={<Top.TitleParagraph size={22}>{personName}</Top.TitleParagraph>}
        right={
          <Top.RightButton
            color="dark"
            variant="weak"
            size="small"
            onClick={onBack}
          >
            뒤로
          </Top.RightButton>
        }
      />

      <div style={{ padding: "0 24px 16px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: balanceColor,
          }}
        >
          {formatBalance(stats.balance)}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: adaptive.grey600,
            lineHeight: 1.5,
          }}
        >
          {copy}
        </div>
      </div>

      <div
        style={{
          margin: "0 24px",
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Row
          label="보낸 돈"
          value={`${formatAmount(stats.totalGave)} (${stats.gaveCount}건)`}
        />
        <Row
          label="받은 돈"
          value={`${formatAmount(stats.totalReceived)} (${stats.receivedCount}건)`}
        />
      </div>

      <div
        style={{
          padding: "20px 24px 8px",
          fontSize: 14,
          fontWeight: 600,
          color: adaptive.grey700,
        }}
      >
        거래 내역
      </div>

      {loading ? null : records.length === 0 ? (
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: adaptive.grey600,
            fontSize: 15,
          }}
        >
          아직 기록이 없어요.
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff" }}>
          {records.map((r) => {
            const emoji = getEventEmoji(r.eventType);
            const label = getEventLabel(r.eventType);
            const sign = r.direction === "gave" ? "-" : "+";
            const color = r.direction === "gave" ? "#DC2626" : BRAND;
            return (
              <ListRow
                key={r.id}
                contents={
                  r.memo ? (
                    <ListRow.Texts
                      type="3RowTypeA"
                      top={
                        <span>
                          {emoji} {label}
                        </span>
                      }
                      middle={
                        <span style={{ color: adaptive.grey600 }}>
                          {r.memo}
                        </span>
                      }
                      bottom={
                        <span style={{ color: adaptive.grey500 }}>
                          {formatDate(r.eventDate)}
                        </span>
                      }
                    />
                  ) : (
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={
                        <span>
                          {emoji} {label}
                        </span>
                      }
                      bottom={
                        <span style={{ color: adaptive.grey500 }}>
                          {formatDate(r.eventDate)}
                        </span>
                      }
                    />
                  )
                }
                right={
                  <ListRow.Texts
                    type="Right1RowTypeA"
                    top={
                      <span style={{ color, fontWeight: 600 }}>
                        {sign}
                        {formatAmount(r.amount)}
                      </span>
                    }
                  />
                }
              />
            );
          })}
        </div>
      )}

      <FixedBottomCTA onClick={() => onAddRecord(personName)}>
        이 사람 기록 추가
      </FixedBottomCTA>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 15,
      }}
    >
      <span style={{ color: adaptive.grey600 }}>{label}</span>
      <span style={{ color: adaptive.grey800, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
