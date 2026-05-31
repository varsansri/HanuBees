import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import HexGrid from "@/components/HexGrid";
import Features from "@/components/Features";
import Marquee from "@/components/Marquee";
import { ShaderBackground, Scene3D } from "@/components/ClientOnly";

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <Nav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      >
        <ShaderBackground />
        <HexGrid />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 20%, rgba(6,6,15,0.7) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-5xl">
          <div
            className="fade-up flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-[0.15em] uppercase"
            style={{
              background: "rgba(245,166,35,0.12)",
              border: "1px solid rgba(245,166,35,0.3)",
              color: "var(--amber-light)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--amber)" }}
            />
            Now live — Hanubees.com
          </div>

          <Logo size="lg" />

          <h1 className="font-berthold fade-up-d1 text-6xl md:text-8xl lg:text-[10rem] leading-none text-white">
            Where Ideas
            <br />
            <span className="text-gradient">Sting Different</span>
          </h1>

          <p
            className="fade-up-d2 max-w-xl text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif" }}
          >
            Hanubees crafts digital experiences with precision and soul —
            fluid interfaces, immersive 3D, and design that feels alive.
          </p>

          <div className="fade-up-d3 flex flex-col sm:flex-row items-center gap-4 mt-4">
            <a href="#services" className="btn-amber px-8 py-4 text-base">
              Explore Work
            </a>
            <a
              href="#about"
              className="px-8 py-4 text-base font-semibold transition-colors"
              style={{
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Learn More →
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span
            className="text-xs tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}
          >
            Scroll
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────── */}
      <Marquee />

      {/* ── 3D / About ───────────────────────────────────── */}
      <section
        id="about"
        className="relative min-h-screen flex flex-col md:flex-row items-center justify-center gap-16 px-6 md:px-16 py-32 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 50%, rgba(245,166,35,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="flex-1 max-w-lg z-10">
          <p
            className="text-sm font-medium tracking-[0.2em] mb-4 uppercase"
            style={{ color: "var(--amber)", fontFamily: "'Inter', sans-serif" }}
          >
            About Hanubees
          </p>
          <h2 className="font-berthold text-5xl md:text-7xl text-white mb-6 leading-tight">
            The Hive
            <br />
            <span className="text-gradient">Mentality</span>
          </h2>
          <p
            className="leading-relaxed mb-8"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif" }}
          >
            Like a hive, we believe in collective intelligence — bringing
            together design, technology, and storytelling to create something
            greater than the sum of its parts.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}
          >
            Every project is built with care, crafted with intention, and
            delivered with the kind of precision only passion can produce.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              ["100+", "Projects"],
              ["5★", "Rating"],
              ["2026", "Founded"],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="font-berthold text-3xl text-gradient">{num}</div>
                <div
                  className="text-xs mt-1 tracking-wider uppercase"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-md" style={{ height: 480 }}>
          <Scene3D />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <Features />

      {/* ── Contact CTA ──────────────────────────────────── */}
      <section
        id="contact"
        className="relative py-40 px-6 flex flex-col items-center justify-center text-center overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(245,166,35,0.08) 0%, transparent 70%)",
          }}
        />
        <p
          className="text-sm font-medium tracking-[0.2em] mb-6 uppercase"
          style={{ color: "var(--amber)", fontFamily: "'Inter', sans-serif" }}
        >
          Ready to build?
        </p>
        <h2 className="font-berthold text-5xl md:text-8xl text-white mb-8 max-w-4xl leading-none">
          Let&apos;s Make
          <br />
          <span className="text-gradient">Something Sweet</span>
        </h2>
        <p
          className="mb-12 max-w-md"
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}
        >
          Drop us a message and we&apos;ll get back to you within 24 hours.
        </p>
        <div
          className="glass w-full max-w-lg p-8 flex flex-col gap-4 text-left"
          style={{ filter: "none" }}
        >
          {(["Your Name", "Email Address"] as const).map((ph) => (
            <input
              key={ph}
              type={ph === "Email Address" ? "email" : "text"}
              placeholder={ph}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontFamily: "'Inter', sans-serif",
                color: "white",
              }}
            />
          ))}
          <textarea
            placeholder="Tell us about your project…"
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button className="btn-amber w-full py-4 text-base mt-2">
            Send Message →
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        className="py-10 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <Logo size="sm" />
        <p
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}
        >
          © 2026 Hanubees.com · All rights reserved
        </p>
        <div
          className="flex gap-6 text-xs"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}
        >
          {["Privacy", "Terms", "Contact"].map((t) => (
            <a key={t} href="#home" className="hover:opacity-80 transition-opacity">
              {t}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
