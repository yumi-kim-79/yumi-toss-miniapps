import { useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { FixedBottomCTA, TextField, Top, useToast } from "@toss/tds-mobile";
import { saveUserWage } from "../lib/wageDb";
import type { WageUser } from "../types";

interface Props {
  userId: string;
  onComplete: (wage: WageUser) => void;
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

export default function Onboarding({ userId, onComplete }: Props) {
  const [salary, setSalary] = useState("");
  const [hours, setHours] = useState("176");
  const [submitting, setSubmitting] = useState(false);
  const { openToast } = useToast();

  const salaryNum = parseNumber(salary);
  const hoursNum = parseNumber(hours);
  const previewWage =
    salaryNum > 0 && hoursNum > 0 ? Math.round(salaryNum / hoursNum) : 0;

  const handleSubmit = async () => {
    if (salaryNum <= 0) {
      openToast("월 실수령액을 입력해주세요.");
      return;
    }
    if (hoursNum <= 0) {
      openToast("월 근무시간을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const hourlyWage = await saveUserWage(userId, salaryNum, hoursNum);
      onComplete({
        monthlySalary: salaryNum,
        monthlyHours: hoursNum,
        hourlyWage,
      });
    } catch {
      openToast("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: 120, minHeight: "100vh" }}>
      <Top
        title={
          <Top.TitleParagraph size={28}>
            당신의 시급은{"\n"}얼마인가요?
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            월 실수령액과 근무시간을 알려주시면{"\n"}당신의 시간 가치를 보여드릴게요.
          </Top.SubtitleParagraph>
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
          label="월 실수령액"
          labelOption="sustain"
          placeholder="예: 3,000,000"
          value={formatNumber(salary)}
          suffix="원"
          onChange={(e) => setSalary(e.target.value)}
        />
        <TextField
          variant="box"
          label="월 근무시간"
          labelOption="sustain"
          placeholder="예: 176"
          value={hours}
          suffix="시간"
          help="기본값은 176시간 (주 40시간 × 4.4주)"
          onChange={(e) => setHours(e.target.value.replace(/\D/g, ""))}
        />

        {previewWage > 0 && (
          <div
            style={{
              marginTop: 8,
              padding: "20px 24px",
              borderRadius: 16,
              backgroundColor: adaptive.greyOpacity100,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 13, color: adaptive.grey600 }}>
              나의 시급
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: adaptive.grey800,
              }}
            >
              {previewWage.toLocaleString("ko-KR")}원
            </span>
          </div>
        )}
      </div>

      <FixedBottomCTA
        onClick={handleSubmit}
        loading={submitting}
        disabled={salaryNum <= 0 || hoursNum <= 0}
      >
        시작하기
      </FixedBottomCTA>
    </div>
  );
}
