import { useEffect, useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import {
  Button,
  ListRow,
  Result,
  TextField,
  useToast,
} from "@toss/tds-mobile";
import config from "../../granite.config.ts";
import { addRecord, getRecords } from "../lib/wageDb";
import { formatHours, getCopyForAmount } from "../lib/wageCopy";
import type { WageRecord, WageUser } from "../types";

interface Props {
  userId: string;
  wage: WageUser;
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

function startOfMonth(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatRecordDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function Home({ userId, wage }: Props) {
  const [records, setRecords] = useState<WageRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { openToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setRecordsLoading(true);
    getRecords(userId)
      .then((rs) => {
        if (!cancelled) {
          setRecords(rs);
          setRecordsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setRecordsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const amountNum = parseNumber(amount);

  const previewCopy = useMemo(() => {
    if (amountNum <= 0) return "";
    return getCopyForAmount(amountNum, wage.hourlyWage);
  }, [amountNum, wage.hourlyWage]);

  const monthHours = useMemo(() => {
    const since = startOfMonth();
    return records
      .filter((r) => r.createdAt.getTime() >= since)
      .reduce((sum, r) => sum + r.hoursWorth, 0);
  }, [records]);

  const handleSubmit = async () => {
    if (amountNum <= 0) {
      openToast("금액을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await addRecord(userId, amountNum, wage.hourlyWage, memo.trim());
      const fresh = await getRecords(userId);
      setRecords(fresh);
      setAmount("");
      setMemo("");
      openToast("기록했어요");
    } catch {
      openToast("저장에 실패했어요. 다시 시도해주세요.");
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
      <div
        style={{
          backgroundColor: BRAND,
          padding: "32px 24px 28px",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 6 }}>
          당신의 시급
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2 }}>
          {wage.hourlyWage.toLocaleString("ko-KR")}원
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 18 }}>
          이번 달 사라진 인생
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>
          {monthHours > 0 ? formatHours(monthHours) : "아직 없어요"}
        </div>
      </div>

      <div
        style={{
          padding: "20px 24px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <TextField
          variant="box"
          label="얼마 썼어요?"
          labelOption="sustain"
          placeholder="예: 25,000"
          suffix="원"
          value={formatNumber(amount)}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          variant="box"
          label="어디에 썼어요? (선택)"
          labelOption="sustain"
          placeholder="예: 점심"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        {previewCopy && (
          <div
            style={{
              padding: "18px 20px",
              backgroundColor: `${BRAND}14`,
              borderLeft: `3px solid ${BRAND}`,
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: adaptive.grey800,
              lineHeight: 1.5,
            }}
          >
            {previewCopy}
          </div>
        )}

        <Button
          display="block"
          size="xlarge"
          onClick={handleSubmit}
          loading={submitting}
          disabled={amountNum <= 0}
        >
          기록하기
        </Button>
      </div>

      <div style={{ marginTop: 20 }}>
        <div
          style={{
            padding: "12px 24px 8px",
            fontSize: 14,
            fontWeight: 600,
            color: adaptive.grey700,
          }}
        >
          최근 기록
        </div>
        {recordsLoading ? null : records.length === 0 ? (
          <Result
            title="아직 기록이 없어요"
            description="첫 기록을 남겨보세요."
          />
        ) : (
          <div style={{ backgroundColor: "#fff" }}>
            {records.slice(0, 20).map((r) => (
              <ListRow
                key={r.id}
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={<>{r.amount.toLocaleString("ko-KR")}원</>}
                    bottom={
                      <span style={{ color: adaptive.grey600 }}>
                        {r.memo || "메모 없음"}
                      </span>
                    }
                  />
                }
                right={
                  <ListRow.Texts
                    type="Right2RowTypeA"
                    top={<>{formatHours(r.hoursWorth)}</>}
                    bottom={
                      <span style={{ color: adaptive.grey500 }}>
                        {formatRecordDate(r.createdAt)}
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
