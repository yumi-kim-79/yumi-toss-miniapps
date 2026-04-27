import { useEffect, useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { FixedBottomCTA, ListRow, Top } from "@toss/tds-mobile";
import config from "../../granite.config.ts";
import { getRecords } from "../lib/gyeongjoDb";
import { aggregateByPerson, normalizeName } from "../lib/personSummary";
import type { GyeongjoRecord } from "../types";

interface Props {
  userId: string;
  onAdd: () => void;
  onDetail: (personName: string) => void;
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

export default function Home({ userId, onAdd, onDetail }: Props) {
  const [records, setRecords] = useState<GyeongjoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRecords(userId)
      .then((rs) => {
        if (!cancelled) {
          setRecords(rs);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const stats = useMemo(() => {
    let totalGave = 0;
    let totalReceived = 0;
    for (const r of records) {
      if (r.direction === "gave") totalGave += r.amount;
      else totalReceived += r.amount;
    }
    return {
      totalGave,
      totalReceived,
      balance: totalReceived - totalGave,
    };
  }, [records]);

  const summaries = useMemo(() => aggregateByPerson(records), [records]);

  const filteredSummaries = useMemo(() => {
    const q = normalizeName(searchInput);
    if (!q) return summaries;
    return summaries.filter((s) =>
      normalizeName(s.counterpartyName).includes(q),
    );
  }, [summaries, searchInput]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: adaptive.greyBackground,
        paddingBottom: 120,
      }}
    >
      <Top
        title={
          <Top.TitleParagraph size={28}>💐 경조사 가계부</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            주고받은 마음을 잊지 않게.
          </Top.SubtitleParagraph>
        }
      />

      <div
        style={{
          margin: "0 24px 16px",
          backgroundColor: BRAND,
          padding: "20px 24px",
          borderRadius: 16,
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>보낸 마음</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
              {formatAmount(stats.totalGave)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>받은 마음</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
              {formatAmount(stats.totalReceived)}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.8 }}>현재 잔고</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            {formatBalance(stats.balance)}
          </div>
        </div>
      </div>

      {records.length > 0 && (
        <div style={{ padding: "0 24px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "10px 14px",
              border: `1px solid ${adaptive.hairlineBorder}`,
            }}
          >
            <input
              type="text"
              placeholder="이름으로 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
                color: adaptive.grey800,
                fontFamily: "inherit",
              }}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: adaptive.grey500,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "0 4px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          padding: "8px 24px",
          fontSize: 14,
          fontWeight: 600,
          color: adaptive.grey700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>주고받은 사람</span>
        {summaries.length > 0 && (
          <span style={{ fontSize: 13, color: adaptive.grey500 }}>
            총 {summaries.length}명
          </span>
        )}
      </div>

      {loading ? null : records.length === 0 ? (
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: adaptive.grey600,
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          아직 기록이 없어요.
          <br />첫 기록을 남겨보세요.
        </div>
      ) : filteredSummaries.length === 0 ? (
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: adaptive.grey600,
            fontSize: 15,
          }}
        >
          검색 결과가 없어요.
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff" }}>
          {filteredSummaries.map((s) => {
            const balanceColor =
              s.balance < 0
                ? "#DC2626"
                : s.balance > 0
                  ? BRAND
                  : adaptive.grey500;
            return (
              <ListRow
                key={normalizeName(s.counterpartyName)}
                onClick={() => onDetail(s.counterpartyName)}
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={<span>{s.counterpartyName}</span>}
                    bottom={
                      <span style={{ color: adaptive.grey600 }}>
                        {s.recordCount}건
                      </span>
                    }
                  />
                }
                right={
                  <ListRow.Texts
                    type="Right2RowTypeA"
                    top={
                      <span style={{ color: balanceColor, fontWeight: 600 }}>
                        {formatBalance(s.balance)}
                      </span>
                    }
                    bottom={
                      <span style={{ color: adaptive.grey500 }}>
                        {formatDate(s.lastEventDate)}
                      </span>
                    }
                  />
                }
              />
            );
          })}
        </div>
      )}

      <FixedBottomCTA onClick={onAdd}>기록 추가</FixedBottomCTA>
    </div>
  );
}
