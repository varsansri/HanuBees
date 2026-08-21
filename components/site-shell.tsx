import Link from "next/link";

export function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path d="M5 15 15 5M7 5h8v8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark" aria-label="Hanubees">
      <span className="brand-mark__symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && <span className="brand-mark__word">Hanubees</span>}
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="site-header__brand">
          <BrandMark />
        </Link>

        <nav className="site-header__nav" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/design#site-themes">Themes</Link>
          <Link href="/design">
            Design Library <span className="nav-live">12</span>
          </Link>
        </nav>

        <a className="header-cta" href="mailto:hello@hanubees.com">
          Start a project
          <ArrowUpRight />
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="shell">
        <div className="site-footer__top">
          <p className="eyebrow eyebrow--light">Have a useful problem?</p>
          <a href="mailto:hello@hanubees.com" className="footer-contact">
            Let&apos;s make it clear,
            <br /> fast, and memorable.
            <ArrowUpRight />
          </a>
        </div>

        <div className="site-footer__bottom">
          <Link href="/" aria-label="Hanubees home">
            <BrandMark />
          </Link>
          <p>
            Websites, commerce, and a growing library of interfaces worth
            keeping.
          </p>
          <div className="site-footer__links">
            <Link href="/design">Design Library</Link>
            <a href="mailto:hello@hanubees.com">Email</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
