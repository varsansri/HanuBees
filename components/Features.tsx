"use client";

import LiquidGlassCard from "./LiquidGlassCard";

const features = [
  {
    icon: "⬡",
    title: "Precision Crafted",
    desc: "Every detail is designed with purpose. We build experiences that feel natural, alive, and exactly right.",
  },
  {
    icon: "✦",
    title: "Liquid Design",
    desc: "Fluid interfaces that respond to your touch. UI that flows like nature — smooth, organic, alive.",
  },
  {
    icon: "◈",
    title: "Future Forward",
    desc: "Powered by cutting-edge WebGL, shader tech, and 3D — your product stands apart from the crowd.",
  },
];

export default function Features() {
  return (
    <section id="services" className="relative py-32 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-sm font-medium tracking-[0.2em] text-amber-400 mb-4 uppercase">
          What We Do
        </p>
        <h2 className="font-berthold text-4xl md:text-6xl text-center text-white mb-20">
          Built Different
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <LiquidGlassCard
              key={i}
              className={`p-8 fade-up-d${i + 1}`}
              intensity={0.8}
            >
              <div
                className="text-5xl mb-6"
                style={{ color: "var(--amber)" }}
              >
                {f.icon}
              </div>
              <h3 className="font-berthold text-2xl text-white mb-3">
                {f.title}
              </h3>
              <p className="text-white/60 leading-relaxed text-sm">
                {f.desc}
              </p>
            </LiquidGlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
