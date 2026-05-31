"use client";

interface Props {
  size?: "sm" | "md" | "lg";
}

export default function Logo({ size = "md" }: Props) {
  const sizes = { sm: 28, md: 36, lg: 64 };
  const px = sizes[size];
  const textClass = size === "lg"
    ? "text-4xl"
    : size === "md"
    ? "text-2xl"
    : "text-lg";

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Hexagon bee icon */}
      <svg width={px} height={px} viewBox="0 0 64 64" fill="none">
        {/* Outer hex */}
        <polygon
          points="32,4 56,18 56,46 32,60 8,46 8,18"
          fill="url(#hex-grad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        {/* Inner honeycomb cells */}
        <polygon points="32,16 42,22 42,34 32,40 22,34 22,22" fill="rgba(0,0,0,0.3)" />
        <circle cx="32" cy="28" r="6" fill="url(#bee-grad)" />
        {/* Bee wings hint */}
        <ellipse cx="22" cy="23" rx="5" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(-30 22 23)" />
        <ellipse cx="42" cy="23" rx="5" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(30 42 23)" />
        <defs>
          <linearGradient id="hex-grad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#c17d11" />
          </linearGradient>
          <radialGradient id="bee-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe599" />
            <stop offset="100%" stopColor="#f5a623" />
          </radialGradient>
        </defs>
      </svg>
      {/* Berthold-style wordmark */}
      <span
        className={`font-berthold ${textClass} text-gradient tracking-tight`}
        style={{ lineHeight: 1 }}
      >
        Hanubees
      </span>
    </div>
  );
}
