"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Garment, Model, SceneProps, Tree } from "./kart-art";
import {
  bestsellers,
  categoryNav,
  discount,
  dropSlides,
  heroSlides,
  inr,
  newArrivals,
  topNav,
  trendingCategories,
  utilityLeft,
  utilityRight,
  type Product,
} from "./kart-data";

/* ---------------------------------- icons --------------------------------- */

const Icon = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M12 20s-7.5-4.7-7.5-10A4.5 4.5 0 0 1 12 7.6 4.5 4.5 0 0 1 19.5 10c0 5.3-7.5 10-7.5 10Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h14l1 13H4z" strokeLinejoin="round" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="m9 5 8 7-8 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
      <path d="M11 18.6h2" strokeLinecap="round" />
    </svg>
  ),
  arrowUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
      <path d="M7 17 17 7m0 0H8m9 0v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ------------------------------- product card ------------------------------ */

function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="kart-card">
      <div className="kart-card__media" style={{ background: product.art }}>
        {product.badge && <span className="kart-card__badge">{product.badge}</span>}
        <Model />
        <Garment kind={product.garment} />
        <span className="kart-card__rating">
          <i className="kart-star">{Icon.star}</i>
          {product.rating.toFixed(1)}
        </span>
      </div>

      <div className="kart-card__row">
        <p className="kart-card__brand">{product.brand}</p>
        <button
          type="button"
          className={`kart-card__wish${saved ? " is-on" : ""}`}
          aria-label={
            saved
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          aria-pressed={saved}
          onClick={() => setSaved((v) => !v)}
        >
          {Icon.heart}
        </button>
      </div>

      <p className="kart-card__title">{product.title}</p>

      <p className="kart-card__price">
        <strong>&#8377;{inr(product.price)}</strong>
        <s>&#8377;{inr(product.mrp)}</s>
        <em>{discount(product)}% OFF</em>
      </p>
    </article>
  );
}

/* ----------------------------------- rail ---------------------------------- */

function ProductRail({ items }: { items: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="kart-rail">
      <button
        type="button"
        className="kart-rail__arrow kart-rail__arrow--prev"
        aria-label="Previous products"
        disabled={atStart}
        onClick={() => nudge(-1)}
      >
        {Icon.chevron}
      </button>

      <div className="kart-rail__track" ref={trackRef} onScroll={sync}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <button
        type="button"
        className="kart-rail__arrow kart-rail__arrow--next"
        aria-label="Next products"
        disabled={atEnd}
        onClick={() => nudge(1)}
      >
        {Icon.chevron}
      </button>
    </div>
  );
}

/* -------------------------------- carousels -------------------------------- */

function useAutoplay(length: number, ms: number) {
  const [index, setIndex] = useState(length > 1 ? 1 : 0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [paused, length, ms]);

  return { index, setIndex, setPaused };
}

function HeroCarousel() {
  const { index, setIndex, setPaused } = useAutoplay(heroSlides.length, 5200);

  /* The reference layout always shows a sliver of the previous and next
     campaign. With only three slides the edges run out, so the set is
     repeated three times and the middle copy is the one we centre on. */
  const loop = [...heroSlides, ...heroSlides, ...heroSlides];
  const active = index + heroSlides.length;

  return (
    <section
      className="kart-hero"
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="kart-hero__viewport">
        <div
          className="kart-hero__track"
          style={{ "--i": active } as CSSProperties}
        >
          {loop.map((slide, i) => (
            <article
              key={`${slide.id}-${i}`}
              className={`kart-slide${i === active ? " is-active" : ""}`}
              style={{
                background: `linear-gradient(180deg, ${slide.sky} 0%, ${slide.wall} 62%)`,
              }}
            >
              <SceneProps kind={slide.prop} accent={slide.accent} />
              <Model tone="rgba(30,26,24,.5)" />

              <div className="kart-slide__copy">
                {slide.kicker && <span className="kart-slide__kicker">{slide.kicker}</span>}
                <h2>
                  <i className="kart-slide__mark">{Icon.arrowUp}</i>
                  {slide.title}
                </h2>
                {slide.price && <strong className="kart-slide__price">{slide.price}</strong>}
                {slide.sub && <p className="kart-slide__sub">{slide.sub}</p>}
              </div>

              {slide.strip && <p className="kart-slide__strip">{slide.strip}</p>}
            </article>
          ))}
        </div>
      </div>

      <Dots count={heroSlides.length} active={index} onSelect={setIndex} label="campaign" />
    </section>
  );
}

function DropCarousel() {
  const { index, setIndex, setPaused } = useAutoplay(dropSlides.length, 6000);

  return (
    <section
      className="kart-drop"
      aria-roledescription="carousel"
      aria-label="Newest drops"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2 className="kart-section-title">NEWEST DROPS OF THE SEASON</h2>

      <div className="kart-drop__viewport">
        <div
          className="kart-drop__track"
          style={{ "--i": index } as CSSProperties}
        >
          {dropSlides.map((slide) => (
            <article
              key={slide.id}
              className="kart-drop__slide"
              style={{ background: `linear-gradient(180deg, ${slide.from}, ${slide.to})` }}
            >
              <span className="kart-drop__ground" />
              <Tree left="12%" scale={1} />
              <Tree left="70%" scale={1.15} />
              <Tree left="46%" scale={0.7} />

              <div className="kart-drop__left">
                <span className="kart-drop__bolt" aria-hidden="true" />
                <span className="kart-drop__script">{slide.script}</span>
                <span className="kart-drop__script kart-drop__script--hi">{slide.scriptTwo}</span>
              </div>

              <div className="kart-drop__figure">
                <Model tone="rgba(26,24,30,.55)" />
                <Garment kind="tee" tone="rgba(255,255,255,.5)" />
              </div>

              <div className="kart-drop__right">
                <span>{slide.right}</span>
                <strong>{slide.rightBold}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Dots count={dropSlides.length} active={index} onSelect={setIndex} label="drop" dark />
    </section>
  );
}

function Dots({
  count,
  active,
  onSelect,
  label,
  dark = false,
}: {
  count: number;
  active: number;
  onSelect: (i: number) => void;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className={`kart-dots${dark ? " kart-dots--dark" : ""}`}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={i === active ? "is-active" : ""}
          aria-label={`Go to ${label} ${i + 1}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}

/* ----------------------------------- page ---------------------------------- */

const footerColumns = [
  {
    title: "CUSTOMER SERVICE",
    links: ["Contact Us", "Track Order", "Returns & Refunds", "FAQs", "Cancellation"],
  },
  { title: "COMPANY", links: ["About Us", "Careers", "Community", "Blog", "Collaborate"] },
  { title: "SHOP", links: ["Men", "Women", "Accessories", "Plus Size", "Clearance"] },
  { title: "POLICIES", links: ["Terms of Use", "Privacy Policy", "Shipping Policy", "Sitemap"] },
];

const rackGarments = [
  { kind: "tee" as const, tone: "#2f2f30" },
  { kind: "pants" as const, tone: "#5a5f42" },
  { kind: "jeans" as const, tone: "#8aa6c6" },
  { kind: "shirt" as const, tone: "#f2f2ee" },
];

export function KartHome() {
  const [audience, setAudience] = useState<"MEN" | "WOMEN">("MEN");

  return (
    <div className="kart">
      <div className="kart-utility">
        <div className="kart-utility__inner">
          <ul>
            {utilityLeft.map((item) => (
              <li key={item}>
                <a href="#kart">
                  {item === "Download App" && <i className="kart-utility__icon">{Icon.phone}</i>}
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            {utilityRight.map((item) => (
              <li key={item}>
                <a href="#kart">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <header className="kart-masthead" id="kart">
        <div className="kart-masthead__inner">
          <a className="kart-logo" href="#kart" aria-label="Hanubees home">
            <span>HANUB</span>
            <i className="kart-logo__eyes" aria-hidden="true">
              <b />
              <b />
            </i>
            <span>S</span>
            <sup>&#174;</sup>
          </a>

          <nav className="kart-masthead__nav" aria-label="Shop by audience">
            {topNav.map((item) => (
              <a key={item} href="#kart">
                {item}
              </a>
            ))}
          </nav>

          <form className="kart-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <i>{Icon.search}</i>
            <input
              type="search"
              name="q"
              placeholder="Search by products"
              aria-label="Search by products"
            />
          </form>

          <div className="kart-actions">
            <a className="kart-actions__login" href="#kart">
              LOGIN
            </a>
            <a href="#kart" aria-label="Wishlist">
              {Icon.heart}
            </a>
            <a href="#kart" aria-label="Bag">
              {Icon.bag}
            </a>
          </div>
        </div>
      </header>

      <nav className="kart-catnav" aria-label="Shop categories">
        <div className="kart-catnav__inner">
          <div className="kart-toggle" role="group" aria-label="Choose department">
            {(["MEN", "WOMEN"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={audience === item ? "is-active" : ""}
                aria-pressed={audience === item}
                onClick={() => setAudience(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="kart-catnav__links">
            {categoryNav.map((item) => (
              <a key={item} href="#kart">
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main>
        <HeroCarousel />

        <section className="kart-strip-wrap">
          <a className="kart-strip" href="#kart">
            <span className="kart-strip__left">
              <strong>GET 10% CASHBACK</strong>
              <small>Valid Only On App Orders</small>
            </span>
            <span className="kart-strip__right">
              <small>USE CODE</small>
              <strong>APPCASH</strong>
            </span>
          </a>
        </section>

        <section className="kart-bestsellers">
          <h2 className="kart-section-title">BESTSELLERS</h2>
          <ProductRail items={bestsellers} />
          <a className="kart-explore" href="#kart">
            Explore All
          </a>
        </section>

        <DropCarousel />

        <section className="kart-offer">
          <div className="kart-offer__rack" aria-hidden="true">
            {rackGarments.map((item) => (
              <span key={item.kind} className="kart-offer__hanger">
                <i />
                <Garment kind={item.kind} tone={item.tone} />
              </span>
            ))}
          </div>

          <div className="kart-offer__copy">
            <p className="kart-offer__level">
              LEVEL <br /> IT UP <i>{Icon.arrowUp}</i>
            </p>
            <p className="kart-offer__deal">
              BUY 3
              <br />
              GET EXTRA
              <br />
              15% OFF
            </p>
            <span className="kart-offer__note">Offer auto-applies at checkout</span>
          </div>
        </section>

        <section className="kart-trending">
          <h2 className="kart-section-title kart-section-title--light">Trending Categories</h2>
          <div className="kart-trending__grid">
            {trendingCategories.map((cat) => (
              <a key={cat.label} className="kart-tile" href="#kart" style={{ background: cat.art }}>
                <Model tone="rgba(24,22,20,.4)" />
                <Garment kind={cat.garment} tone="rgba(255,255,255,.42)" />
                <span>{cat.label}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="kart-arrivals">
          <h2 className="kart-section-title">FRESH THIS WEEK</h2>
          <div className="kart-arrivals__grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <footer className="kart-footer">
        <div className="kart-footer__grid">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#kart">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="kart-footer__app">
            <h3>EXPERIENCE THE APP</h3>
            <div className="kart-footer__badges">
              <span>Google Play</span>
              <span>App Store</span>
            </div>
            <p>100% secure payments &middot; Easy 15-day returns</p>
          </div>
        </div>

        <p className="kart-footer__legal">
          Hanubees Kart theme demo &mdash; an original layout study, not affiliated with any
          existing retailer.
        </p>
      </footer>
    </div>
  );
}
