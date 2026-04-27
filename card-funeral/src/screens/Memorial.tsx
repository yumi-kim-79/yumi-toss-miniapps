import { useEffect, useMemo, useState } from "react";
import { adaptive } from "@toss/tds-colors";
import { ListRow, Top } from "@toss/tds-mobile";
import { getFunerals } from "../lib/cardDb";
import type { Funeral } from "../types";

interface Props {
  userId: string;
  onBack: () => void;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function Memorial({ userId, onBack }: Props) {
  const [funerals, setFunerals] = useState<Funeral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFunerals(userId)
      .then((rs) => {
        if (!cancelled) {
          setFunerals(rs);
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

  const totalLoss = useMemo(
    () => funerals.reduce((sum, f) => sum + f.totalAnnualFee, 0),
    [funerals],
  );

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
          <Top.TitleParagraph size={22}>💐 추모관</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            먼저 떠난 카드들을 기억해요.
          </Top.SubtitleParagraph>
        }
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

      {funerals.length > 0 && (
        <div
          style={{
            margin: "0 24px 8px",
            backgroundColor: "#fff",
            padding: "20px 24px",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 13, color: adaptive.grey600 }}>
            누적 연회비 손해
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: adaptive.grey800,
            }}
          >
            ₩{totalLoss.toLocaleString("ko-KR")}
          </span>
          <span style={{ fontSize: 12, color: adaptive.grey500, marginTop: 4 }}>
            지금까지 {funerals.length}장의 카드를 떠나보냈어요.
          </span>
        </div>
      )}

      {loading ? null : funerals.length === 0 ? (
        <div
          style={{
            padding: "60px 24px",
            textAlign: "center",
            color: adaptive.grey600,
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          아직 추모할 카드가 없어요.
          <br />
          모두 살아 있어 다행이에요.
        </div>
      ) : (
        <div style={{ marginTop: 12, backgroundColor: "#fff" }}>
          {funerals.map((f) => (
            <ListRow
              key={f.id}
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top={
                    <span>
                      🪦 {f.cardName}
                    </span>
                  }
                  bottom={
                    <span style={{ color: adaptive.grey600 }}>
                      {f.issuer}
                    </span>
                  }
                />
              }
              right={
                <ListRow.Texts
                  type="Right2RowTypeA"
                  top={
                    <span style={{ fontWeight: 600 }}>
                      ₩{f.totalAnnualFee.toLocaleString("ko-KR")}
                    </span>
                  }
                  bottom={
                    <span style={{ color: adaptive.grey500 }}>
                      {formatDate(f.funeralDate)}
                    </span>
                  }
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
