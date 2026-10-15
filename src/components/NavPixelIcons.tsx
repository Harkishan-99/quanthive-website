import React from "react";

export function NavIconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="nav-pixel-icon" aria-hidden="true">
      <div className="nav-pixel-icon__scanlines" />
      <div className="nav-pixel-icon__glyph">{children}</div>
    </div>
  );
}

/** Pixelated AI Sparkle / Cluster (Agentic BI style) */
export function AgenticBIIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges">
      {/* Central sparkling cross */}
      <rect x="7" y="5" width="2" height="2" />
      <rect x="7" y="9" width="2" height="2" />
      <rect x="5" y="7" width="2" height="2" />
      <rect x="9" y="7" width="2" height="2" />
      {/* Outer cardinal pixels */}
      <rect x="2" y="7" width="2" height="2" />
      <rect x="12" y="7" width="2" height="2" />
      <rect x="7" y="2" width="2" height="2" />
      <rect x="7" y="12" width="2" height="2" />
      {/* Corner satellites */}
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
    </svg>
  );
}

/** Pixelated Robot / Agent Antenna (AI Agents style) */
export function AIAgentsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges">
      {/* Antenna tip & stem */}
      <rect x="7" y="2" width="2" height="2" />
      <rect x="7" y="4" width="2" height="1" />
      {/* Head crown */}
      <rect x="4" y="5" width="8" height="1" />
      {/* Visor & eyes */}
      <rect x="3" y="6" width="3" height="2" />
      <rect x="10" y="6" width="3" height="2" />
      {/* Mouth / chin */}
      <rect x="4" y="8" width="8" height="1" />
      {/* Neck */}
      <rect x="7" y="9" width="2" height="1" />
      {/* Shoulders */}
      <rect x="2" y="10" width="12" height="2" />
      {/* Base baseboard */}
      <rect x="4" y="12" width="8" height="1" />
    </svg>
  );
}

/** Pixelated Viewfinder / Radar Scanner (Spotlight style) */
export function SpotlightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges">
      {/* Square viewfinder frame */}
      <rect x="3" y="3" width="10" height="2" />
      <rect x="3" y="11" width="10" height="2" />
      <rect x="3" y="5" width="2" height="6" />
      <rect x="11" y="5" width="2" height="6" />
      {/* Internal focal radar sweep */}
      <rect x="7" y="7" width="2" height="2" />
      {/* Detached targeting pixel in lower right corner */}
      <rect x="13" y="13" width="2" height="2" />
    </svg>
  );
}

/** Pixelated Code / Component Blocks (Embedding style) */
export function EmbeddingIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges">
      {/* Top bracket / data row */}
      <rect x="2" y="3" width="4" height="2" />
      <rect x="8" y="3" width="6" height="2" />
      {/* Mid connector bus */}
      <rect x="2" y="7" width="12" height="2" />
      {/* Lower bracket / data row */}
      <rect x="2" y="11" width="6" height="2" />
      <rect x="10" y="11" width="4" height="2" />
    </svg>
  );
}

/** Pixelated Vertical Data Bars (Integrations style) */
export function IntegrationsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges">
      {/* Baseline */}
      <rect x="2" y="13" width="12" height="1" />
      {/* Bar 1: short */}
      <rect x="3" y="8" width="2" height="5" />
      {/* Bar 2: tall */}
      <rect x="7" y="3" width="2" height="10" />
      {/* Bar 3: medium */}
      <rect x="11" y="6" width="2" height="7" />
    </svg>
  );
}

/** Pixelated CLI / Terminal Prompt (CLI style) */
export function CLIIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges">
      {/* Chevron `>` */}
      <rect x="2" y="3" width="2" height="2" />
      <rect x="4" y="5" width="2" height="2" />
      <rect x="6" y="7" width="2" height="2" />
      <rect x="4" y="9" width="2" height="2" />
      <rect x="2" y="11" width="2" height="2" />
      {/* Cursor `_` */}
      <rect x="9" y="11" width="5" height="2" />
    </svg>
  );
}

/** Corner Pixel Decor for Promo Cards */
export function PromoPixelDecor({
  variant = "cyan-purple",
}: {
  variant?: "cyan-purple" | "emerald-lime";
}) {
  const isCyan = variant === "cyan-purple";
  return (
    <div
      className={`promo-pixel-decor ${
        isCyan ? "promo-pixel-decor--cyan" : "promo-pixel-decor--emerald"
      }`}
      aria-hidden="true"
    >
      <div className="promo-pixel-cluster promo-pixel-cluster--tr">
        <span className="px px-1" />
        <span className="px px-2" />
        <span className="px px-3" />
        <span className="px px-4" />
      </div>
      <div className="promo-pixel-cluster promo-pixel-cluster--br">
        <span className="px px-5" />
        <span className="px px-6" />
        <span className="px px-7" />
      </div>
    </div>
  );
}
