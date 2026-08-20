type GarmentKind = "tee" | "jeans" | "jacket" | "shirt" | "hoodie" | "pants";

const paths: Record<GarmentKind, string> = {
  tee: "M62 26 92 14l16 8 16-8 30 12 10 34-22 9-4-8v92H78V61l-4 8-22-9z",
  shirt:
    "M62 26 92 14l14 12 14-12 30 12 10 34-22 9-4-8v92H78V61l-4 8-22-9zM106 26v112",
  hoodie:
    "M58 34 90 18a16 16 0 0 0 32 0l32 16 12 40-24 10-4-9v90H74V75l-4 9-24-10z M90 18c0 16 32 16 32 0",
  jeans: "M70 20h72l8 44-6 100h-30l-8-84-8 84H68l-6-100z",
  pants: "M68 20h76l6 40-8 104h-32l-6-88-6 88H66l-8-104z",
  jacket:
    "M60 28 92 14l14 10 14-10 32 14 12 38-24 10-4-8v88H76V66l-4 8-24-10z M106 24v112 M92 40h28",
};

export function Garment({ kind, tone = "rgba(255,255,255,.34)" }: { kind: GarmentKind; tone?: string }) {
  return (
    <svg className="kart-garment" viewBox="0 0 212 200" aria-hidden="true">
      <path d={paths[kind]} fill={tone} stroke="rgba(0,0,0,.16)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Model({ tone = "rgba(28,26,24,.42)" }: { tone?: string }) {
  return (
    <svg className="kart-model" viewBox="0 0 180 360" aria-hidden="true">
      <g fill={tone}>
        <circle cx="90" cy="46" r="26" />
        <path d="M56 82h68l20 22-12 96H48l-12-96z" />
        <path d="M52 200h76l-6 156h-26l-6-96-6 96H58z" />
      </g>
    </svg>
  );
}

export function SceneProps({ kind, accent }: { kind: "stairs" | "arch"; accent: string }) {
  if (kind === "stairs") {
    return (
      <svg className="kart-scene-props" viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="none">
        <path d="M240 300V210h40v-40h40v-40h40v170z" fill={accent} />
        <circle cx="86" cy="88" r="40" fill="rgba(255,255,255,.32)" />
        <path d="M20 300c0-70 22-104 60-118" stroke="rgba(255,255,255,.4)" strokeWidth="10" fill="none" />
      </svg>
    );
  }
  return (
    <svg className="kart-scene-props" viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="none">
      <path d="M40 300V150a48 48 0 0 1 96 0v150z" fill="rgba(255,255,255,.28)" />
      <path d="M270 300V170a44 44 0 0 1 88 0v130z" fill={accent} opacity=".8" />
      <circle cx="330" cy="86" r="34" fill="rgba(255,255,255,.34)" />
      <path d="M150 300h60v-60h-60z" fill="rgba(0,0,0,.12)" />
    </svg>
  );
}

export function Tree({ left, scale = 1 }: { left: string; scale?: number }) {
  return (
    <span className="kart-tree" style={{ left, transform: `scale(${scale})` }} aria-hidden="true">
      <span className="kart-tree__crown" />
      <span className="kart-tree__trunk" />
    </span>
  );
}
