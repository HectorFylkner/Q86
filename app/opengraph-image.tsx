import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

/**
 * The default Open Graph card, drawn rather than photographed: the same
 * paper ground, grid and display face the site itself uses. A generic
 * stock image would say nothing about the product; a rendered card at
 * least carries the typography.
 *
 * Static, so it is generated once at build time and served from the edge.
 */
export const alt = "Q86 — GMAT Focus Quant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function displayFont(): ArrayBuffer | null {
  // Satori needs the raw bytes; the variable WOFF2 the app uses is not a
  // format it can parse, so fall back to the system stack when the static
  // cut is absent rather than failing the build.
  const file = path.join(process.cwd(), "app", "fonts", "space-grotesk-og.ttf");
  if (!fs.existsSync(file)) return null;
  const buffer = fs.readFileSync(file);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

export default async function Image() {
  const font = displayFont();

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
          fontFamily: font ? "Display" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#5e6268",
            }}
          >
            GMAT Focus · Quantitative Reasoning
          </div>
          <div
            style={{
              marginTop: 34,
              fontSize: 84,
              lineHeight: 1.03,
              fontWeight: 700,
              letterSpacing: -2.5,
              maxWidth: 900,
            }}
          >
            Kvantdelen är inte ett minne. Den är ett mönster.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "2px solid #17181a",
            paddingTop: 26,
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1.5 }}>
            Q86
          </div>
          <div style={{ fontSize: 24, color: "#5e6268" }}>
            Svensk träning · engelska frågor
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Display", data: font, style: "normal", weight: 700 }]
        : undefined,
    },
  );
}
