"use client";

export default function HexGrid() {
  const cols = 9;
  const rows = 5;
  const hexes = Array.from({ length: cols * rows }, (_, i) => i);

  return (
    <div className="absolute inset-0 -z-5 overflow-hidden opacity-20 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 900 500"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="hex-pattern"
            x="0"
            y="0"
            width="100"
            height="86.6"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1.1)"
          >
            <polygon
              points="50,0 100,25 100,75 50,100 0,75 0,25"
              fill="none"
              stroke="#f5a623"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      </svg>
    </div>
  );
}
