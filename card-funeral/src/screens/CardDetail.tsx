import { useState } from "react";
import { adaptive } from "@toss/tds-colors";
import {
  CTAButton,
  FixedBottomCTA,
  Top,
  useToast,
} from "@toss/tds-mobile";
import { updateCardLastUsed } from "../lib/cardDb";
import { getCardStatus, getStatusInfo } from "../lib/cardStatus";
import { getIssuerInfo } from "../lib/cardIssuerData";
import { getStatusComment } from "../lib/funeralCopy";
import type { Card } from "../types";

interface Props {
  card: Card;
  onBack: () => void;
  onUpdate: () => void;
  onFuneral: () => void;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function CardDetail({
  card,
  onBack,
  onUpdate,
  onFuneral,
}: Props) {
  const status = getCardStatus(card.lastUsedDate);
  const info = getStatusInfo(status);
  const issuerInfo = getIssuerInfo(card.issuer);
  const [updating, setUpdating] = useState(false);
  const [comment] = useState(() => getStatusComment(status));
  const { openToast } = useToast();

  const handleRefresh = async () => {
    setUpdating(true);
    try {
      await updateCardLastUsed(card.id, new Date());
      openToast("마지막 사용일을 오늘로 갱신했어요.");
      onUpdate();
    } catch {
      openToast("갱신에 실패했어요. 다시 시도해주세요.");
      setUpdating(false);
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
        title={<Top.TitleParagraph size={22}>카드 상세</Top.TitleParagraph>}
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

      <div
        style={{
          padding: "8px 24px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, lineHeight: 1 }}>{info.emoji}</div>
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: info.color,
            fontWeight: 700,
          }}
        >
          {info.label}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 22,
            fontWeight: 700,
            color: adaptive.grey800,
          }}
        >
          {card.cardName}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: adaptive.grey600,
            lineHeight: 1.5,
          }}
        >
          {comment}
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
        <Row label="카드사" value={card.issuer} />
        <Row
          label="연회비"
          value={`${card.annualFee.toLocaleString("ko-KR")}원`}
        />
        <Row label="마지막 사용일" value={formatDate(card.lastUsedDate)} />
        <Row label="등록일" value={formatDate(card.registeredAt)} />
      </div>

      <div
        style={{
          margin: "20px 24px 0",
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: adaptive.grey800,
            marginBottom: 12,
          }}
        >
          {card.issuer}카드 해지하기
        </div>
        {issuerInfo ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <div>
              <span style={{ color: adaptive.grey600 }}>전화 상담 </span>
              <a
                href={`tel:${issuerInfo.tel.replace(/-/g, "")}`}
                style={{
                  color: adaptive.blue500,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {issuerInfo.tel}
              </a>
            </div>
            <div style={{ color: adaptive.grey700 }}>
              <span style={{ color: adaptive.grey600 }}>앱 경로 </span>
              {issuerInfo.appPath}
            </div>
            <div style={{ fontSize: 12, color: adaptive.grey500 }}>
              ⓘ {issuerInfo.notes} (안내 정보는 변경될 수 있어요)
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: 14,
              color: adaptive.grey600,
              lineHeight: 1.5,
            }}
          >
            해당 카드사의 해지 정보가 등록되어 있지 않아요. 카드 뒷면에 적힌
            고객센터 번호로 문의해주세요.
          </div>
        )}
      </div>

      <FixedBottomCTA.Double
        leftButton={
          <CTAButton
            color="dark"
            variant="weak"
            onClick={handleRefresh}
            loading={updating}
          >
            최근 사용일 갱신
          </CTAButton>
        }
        rightButton={
          <CTAButton color="danger" onClick={onFuneral}>
            🪦 장례식 치르기
          </CTAButton>
        }
      />
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
