import { useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import {
  FixedBottomCTA,
  SegmentedControl,
  TextField,
  Top,
  useToast,
} from "@toss/tds-mobile";
import { addCard } from "../lib/cardDb";
import { ISSUER_NAMES } from "../lib/cardIssuerData";
import type { CardIssuer } from "../types";

interface Props {
  userId: string;
  onCancel: () => void;
  onComplete: () => void;
}

function formatNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

function parseNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function defaultLastUsedISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export default function AddCard({ userId, onCancel, onComplete }: Props) {
  const [cardName, setCardName] = useState("");
  const [issuer, setIssuer] = useState<CardIssuer>("신한");
  const [annualFee, setAnnualFee] = useState("");
  const [lastUsedDate, setLastUsedDate] = useState(defaultLastUsedISO());
  const [submitting, setSubmitting] = useState(false);
  const { openToast } = useToast();

  const annualFeeNum = useMemo(() => parseNumber(annualFee), [annualFee]);

  const handleSubmit = async () => {
    const trimmed = cardName.trim();
    if (!trimmed) {
      openToast("카드 별명을 입력해주세요.");
      return;
    }
    if (!lastUsedDate) {
      openToast("마지막 사용일을 선택해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await addCard(
        userId,
        trimmed,
        issuer,
        annualFeeNum,
        new Date(lastUsedDate + "T00:00:00"),
      );
      onComplete();
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
        paddingBottom: 120,
      }}
    >
      <Top
        title={<Top.TitleParagraph size={22}>카드 등록하기</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            지갑 속 잠든 카드의 정보를 알려주세요.
          </Top.SubtitleParagraph>
        }
        right={
          <Top.RightButton
            color="dark"
            variant="weak"
            size="small"
            onClick={onCancel}
          >
            취소
          </Top.RightButton>
        }
      />

      <div
        style={{
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <TextField
          variant="box"
          label="카드 별명"
          labelOption="sustain"
          placeholder="예: 신한 체크"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
        />

        <div>
          <div
            style={{
              fontSize: 13,
              color: adaptive.grey700,
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            카드사
          </div>
          <SegmentedControl
            alignment="fluid"
            value={issuer}
            onChange={(v) => setIssuer(v as CardIssuer)}
          >
            {ISSUER_NAMES.map((name) => (
              <SegmentedControl.Item key={name} value={name}>
                {name}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
        </div>

        <TextField
          variant="box"
          label="연회비"
          labelOption="sustain"
          placeholder="예: 50,000"
          suffix="원"
          value={formatNumber(annualFee)}
          onChange={(e) => setAnnualFee(e.target.value)}
        />

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: "12px 16px",
            border: `1px solid ${adaptive.hairlineBorder}`,
          }}
        >
          <label
            style={{
              fontSize: 13,
              color: adaptive.grey700,
              display: "block",
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            마지막 사용일
          </label>
          <input
            type="date"
            value={lastUsedDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setLastUsedDate(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 16,
              color: adaptive.grey800,
              width: "100%",
              outline: "none",
              padding: 0,
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      <FixedBottomCTA
        onClick={handleSubmit}
        loading={submitting}
        disabled={!cardName.trim()}
      >
        등록하기
      </FixedBottomCTA>
    </div>
  );
}
