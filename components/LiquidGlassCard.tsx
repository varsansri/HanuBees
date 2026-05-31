"use client";

import { useRef, useEffect, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export default function LiquidGlassCard({ children, className = "", intensity = 1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const filterId = `liquid-${Math.random().toString(36).slice(2, 7)}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * intensity * 8;
      el.style.setProperty("--tx", `${x}px`);
      el.style.setProperty("--ty", `${y}px`);
    };
    const onLeave = () => {
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [intensity]);

  return (
    <>
      {/* SVG filter for liquid distortion */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.012"
              numOctaves="4"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={12 * intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div
        ref={ref}
        className={`glass ${className}`}
        style={{
          transform: "translate(var(--tx, 0px), var(--ty, 0px))",
          transition: "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
          filter: `url(#${filterId})`,
        }}
      >
        {children}
      </div>
    </>
  );
}
