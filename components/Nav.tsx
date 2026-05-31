"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = ["Home", "About", "Services", "Contact"];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(6,6,15,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}
    >
      <Logo size="sm" />

      <nav className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-sm font-medium tracking-wider text-white/70 hover:text-white transition-colors duration-200"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {link}
          </a>
        ))}
      </nav>

      <a
        href="#contact"
        className="btn-amber px-5 py-2 text-sm"
      >
        Get Started
      </a>
    </header>
  );
}
