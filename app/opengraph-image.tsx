import { ImageResponse } from "next/og";
import { profile } from "@/content/content";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0e0e0c", color: "#f2ede4", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 6, color: "#9a958b" }}>
          <span>{profile.role.toUpperCase()}</span>
          <span>{profile.location.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 150, fontWeight: 900, lineHeight: 0.9, letterSpacing: -4 }}>
          <span>{profile.heroLines[0]}</span>
          <span style={{ color: "#ff5b1f" }}>{profile.heroLines.slice(1).join(" ")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <div style={{ width: 16, height: 16, borderRadius: 99, background: "#ff5b1f" }} />
          {profile.availability}
        </div>
      </div>
    ),
    size,
  );
}
