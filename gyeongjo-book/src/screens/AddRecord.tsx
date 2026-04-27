import { useEffect, useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import {
  FixedBottomCTA,
  SegmentedControl,
  TextField,
  Top,
  useToast,
} from "@toss/tds-mobile";
import { addRecord, getRecords } from "../lib/gyeongjoDb";
import { EVENT_TYPES } from "../lib/eventTypes";
import { filterNames, getExistingNames } from "../lib/nameAutocomplete";
import type { Direction, EventType } from "../types";

interface Props {
  userId: string;
  prefilledName?: string;
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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddRecord({
  userId,
  prefilledName,
  onCancel,
  onComplete,
}: Props) {
  const [name, setName] = useState(prefilledName ?? "");
  const [direction, setDirection] = useState<Direction>("gave");
  const [amount, setAmount] = useState("");
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [eventDate, setEventDate] = useState(todayISO());
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [allNames, setAllNames] = useState<string[]>([]);
  const { openToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    getRecords(userId)
      .then((rs) => {
        if (!cancelled) setAllNames(getExistingNames(rs));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const amountNum = useMemo(() => parseNumber(amount), [amount]);
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && amountNum > 0 && !!eventDate;

  const nameSuggestions = useMemo(() => {
    if (!name || prefilledName) return [];
    return filterNames(allNames, name);
  }, [allNames, name, prefilledName]);

  const handleSubmit = async () => {
    if (!trimmedName) {
      openToast("상대방 이름을 입력해주세요.");
      return;
    }
    if (amountNum <= 0) {
      openToast("금액을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await addRecord(
        userId,
        trimmedName,
        amountNum,
        direction,
        eventType,
        new Date(eventDate + "T00:00:00"),
        memo.trim(),
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
        paddingBottom: 140,
      }}
    >
      <Top
        title={<Top.TitleParagraph size={22}>기록 남기기</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            누구와, 얼마를 주고받으셨나요?
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
        <div>
          <TextField
            variant="box"
            label="상대방 이름"
            labelOption="sustain"
            placeholder="예: 김철수"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameSuggestions.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 8,
              }}
            >
              {nameSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setName(s)}
                  style={{
                    border: `1px solid ${adaptive.hairlineBorder}`,
                    backgroundColor: "#fff",
                    color: adaptive.grey700,
                    fontSize: 13,
                    padding: "6px 12px",
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: 13,
              color: adaptive.grey700,
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            방향
          </div>
          <SegmentedControl
            value={direction}
            onChange={(v) => setDirection(v as Direction)}
          >
            <SegmentedControl.Item value="gave">줬어요</SegmentedControl.Item>
            <SegmentedControl.Item value="received">
              받았어요
            </SegmentedControl.Item>
          </SegmentedControl>
        </div>

        <TextField
          variant="box"
          label="금액"
          labelOption="sustain"
          placeholder="예: 50,000"
          suffix="원"
          value={formatNumber(amount)}
          onChange={(e) => setAmount(e.target.value)}
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
            경조사 종류
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {EVENT_TYPES.map((e) => {
              const selected = eventType === e.value;
              return (
                <button
                  key={e.value}
                  onClick={() => setEventType(e.value)}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    border: selected
                      ? `1.5px solid #059669`
                      : `1px solid ${adaptive.hairlineBorder}`,
                    backgroundColor: selected ? "#05966914" : "#fff",
                    color: selected ? "#059669" : adaptive.grey700,
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: selected ? 600 : 500,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{e.emoji}</span>
                  <span>{e.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
            경조사 날짜
          </label>
          <input
            type="date"
            value={eventDate}
            max={todayISO()}
            onChange={(e) => setEventDate(e.target.value)}
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

        <TextField
          variant="box"
          label="메모 (선택)"
          labelOption="sustain"
          placeholder="예: 동기 모임에서 만남"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <FixedBottomCTA
        onClick={handleSubmit}
        loading={submitting}
        disabled={!canSubmit}
      >
        기록하기
      </FixedBottomCTA>
    </div>
  );
}
