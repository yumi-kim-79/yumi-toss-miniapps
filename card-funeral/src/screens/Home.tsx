import { useEffect, useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { FixedBottomCTA, ListRow, Top } from "@toss/tds-mobile";
import config from "../../granite.config.ts";
import { getCards } from "../lib/cardDb";
import { getCardStatus, getStatusInfo } from "../lib/cardStatus";
import type { Card } from "../types";

interface Props {
  userId: string;
  onAdd: () => void;
  onDetail: (card: Card) => void;
  onMemorial: () => void;
}

const BRAND = config.brand.primaryColor;

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function Home({ userId, onAdd, onDetail, onMemorial }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCards(userId)
      .then((rs) => {
        if (!cancelled) {
          setCards(rs);
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
    let dyingCount = 0;
    let deadFee = 0;
    for (const c of cards) {
      const status = getCardStatus(c.lastUsedDate);
      if (status === "critical" || status === "dead") {
        dyingCount += 1;
        if (status === "dead") deadFee += c.annualFee;
      }
    }
    return { dyingCount, deadFee };
  }, [cards]);

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
          <Top.TitleParagraph size={28}>🪦 내 카드 장례식</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            안 쓰는 카드를 찾아내고, 떠나보내세요.
          </Top.SubtitleParagraph>
        }
        right={
          <Top.RightButton
            color="dark"
            variant="weak"
            size="small"
            onClick={onMemorial}
          >
            추모관
          </Top.RightButton>
        }
      />

      <div
        style={{
          margin: "0 24px 8px",
          backgroundColor: BRAND,
          padding: "20px 24px",
          borderRadius: 16,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>위중·사망 카드</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>
            {stats.dyingCount}장
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>이미 죽은 연회비</div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>
            ₩{stats.deadFee.toLocaleString("ko-KR")}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "16px 24px 8px",
          fontSize: 14,
          fontWeight: 600,
          color: adaptive.grey700,
        }}
      >
        내 카드
      </div>

      {loading ? null : cards.length === 0 ? (
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: adaptive.grey600,
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          등록된 카드가 없어요.
          <br />첫 카드를 등록해보세요.
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff" }}>
          {cards.map((card) => {
            const status = getCardStatus(card.lastUsedDate);
            const info = getStatusInfo(status);
            return (
              <ListRow
                key={card.id}
                onClick={() => onDetail(card)}
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={
                      <span>
                        {info.emoji} {card.cardName}
                      </span>
                    }
                    bottom={
                      <span style={{ color: adaptive.grey600 }}>
                        {card.issuer}
                      </span>
                    }
                  />
                }
                right={
                  <ListRow.Texts
                    type="Right2RowTypeA"
                    top={
                      <span style={{ color: info.color, fontWeight: 600 }}>
                        {info.label}
                      </span>
                    }
                    bottom={
                      <span style={{ color: adaptive.grey500 }}>
                        {formatDate(card.lastUsedDate)}
                      </span>
                    }
                  />
                }
              />
            );
          })}
        </div>
      )}

      <FixedBottomCTA onClick={onAdd}>카드 추가</FixedBottomCTA>
    </div>
  );
}
