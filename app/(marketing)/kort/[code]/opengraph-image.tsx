import { ImageResponse } from "next/og";
import { cardForCode } from "@/lib/retention/share";

/**
 * The card as an image, which is what actually gets seen: a progress card
 * is shared into a chat or a feed, where the link preview is the whole
 * artefact and nobody clicks through.
 *
 * It carries the same four numbers as the page and nothing identifying.
 */
export const alt = "Q86";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { code: string };
}) {
  const card = await cardForCode(params.code);

  const stats = card
    ? ([
        [String(card.streak), "dagars svit"],
        [String(card.attempts), "frågor"],
        [`${Math.round(card.accuracy * 100)} %`, "rätt"],
        [String(card.chapters), "kapitel"],
      ] as const)
    : ([["Q86", "GMAT Focus Quant"]] as const);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf7",
          backgroundImage:
            "linear-gradient(to right, #e9e6dd 1px, transparent 1px), linear-gradient(to bottom, #e9e6dd 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          padding: "72px 80px",
          color: "#17181a",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#5e6268",
          }}
        >
          Q86 · GMAT Focus Quant
        </div>

        <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
          {stats.map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3 }}>
                {value}
              </div>
              <div style={{ fontSize: 26, color: "#5e6268", marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid #17181a",
            paddingTop: 24,
            fontSize: 24,
            color: "#5e6268",
          }}
        >
          <span>Svensk träning · engelska frågor</span>
          <span>q86</span>
        </div>
      </div>
    ),
    size,
  );
}
