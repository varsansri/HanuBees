"use client";

import { useState } from "react";
import type { PreviewKind } from "@/lib/design-library";

function BagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 8.5h11l1 12h-13l1-12Z" stroke="currentColor" />
      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" />
      <path d="m15 15 5 5" stroke="currentColor" />
    </svg>
  );
}

function ProductArt({ tone = "stone" }: { tone?: "stone" | "lime" | "lilac" }) {
  return (
    <div className={`product-art product-art--${tone}`} aria-hidden="true">
      <span className="product-art__halo" />
      <span className="product-art__bottle">
        <i />
      </span>
      <span className="product-art__shadow" />
    </div>
  );
}

function ProductCardPreview() {
  const [added, setAdded] = useState(false);

  return (
    <div className="demo-product-card">
      <div className="demo-topline">
        <span>FORMA / 01</span>
        <button type="button" aria-label="Save product">
          ♡
        </button>
      </div>
      <ProductArt />
      <div className="demo-product-card__glass">
        <div>
          <span>Daily objects</span>
          <strong>Contour vessel</strong>
        </div>
        <b>$64</b>
        <button type="button" onClick={() => setAdded(true)}>
          {added ? "Added to bag ✓" : "Quick add"}
        </button>
      </div>
    </div>
  );
}

function FloatingNavPreview() {
  const [active, setActive] = useState("New");

  return (
    <div className="demo-floating-nav">
      <div className="demo-orb demo-orb--one" />
      <div className="demo-orb demo-orb--two" />
      <nav aria-label="Demo store">
        <b>Aera</b>
        <div>
          {["New", "Objects", "Journal"].map((item) => (
            <button
              type="button"
              className={active === item ? "is-active" : ""}
              onClick={() => setActive(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <button type="button" aria-label="Open bag">
          <BagIcon /> <span>2</span>
        </button>
      </nav>
      <div className="demo-floating-nav__copy">
        <span>Edition 04</span>
        <strong>{active} forms for quieter rooms.</strong>
      </div>
    </div>
  );
}

function CartDrawerPreview() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="demo-cart">
      <div className="demo-cart__scene">
        <span>Objects with intention.</span>
        <ProductArt tone="lime" />
      </div>
      <aside>
        <header>
          <div>
            <span>Your bag</span>
            <strong>Cart · {quantity}</strong>
          </div>
          <button type="button" aria-label="Close cart">
            ×
          </button>
        </header>
        <div className="demo-cart__item">
          <ProductArt />
          <div>
            <strong>Contour vessel</strong>
            <span>Bone / 400 ml</span>
            <div className="demo-stepper">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          <b>${64 * quantity}</b>
        </div>
        <footer>
          <div>
            <span>Subtotal</span>
            <strong>${64 * quantity}.00</strong>
          </div>
          <button type="button">Continue to checkout</button>
        </footer>
      </aside>
    </div>
  );
}

function MobileMenuPreview() {
  const [open, setOpen] = useState(true);

  return (
    <div className="demo-mobile-menu">
      <div className="demo-phone">
        <div className="demo-phone__hero">
          <div className="demo-phone__nav">
            <b>AVEN</b>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? "×" : "≡"}
            </button>
          </div>
          <span>Objects for everyday rituals</span>
        </div>
        <div className={`demo-mobile-menu__panel ${open ? "is-open" : ""}`}>
          <span>Browse / 04</span>
          <nav aria-label="Demo mobile navigation">
            {[
              ["New arrivals", "12"],
              ["Objects", "26"],
              ["Collections", "08"],
              ["Journal", "14"],
            ].map(([label, count]) => (
              <a href="#preview" onClick={(event) => event.preventDefault()} key={label}>
                <strong>{label}</strong>
                <span>{count} ↗</span>
              </a>
            ))}
          </nav>
          <div className="demo-mobile-menu__foot">Account · Search · USD</div>
        </div>
      </div>
    </div>
  );
}

function SearchOverlayPreview() {
  const [query, setQuery] = useState("Sculptural");

  const products = query.trim()
    ? [
        ["Sculptural lamp", "$180", "lime"],
        ["Soft-edge vessel", "$64", "stone"],
        ["Column candle", "$28", "lilac"],
      ] as const
    : [];

  return (
    <div className="demo-search">
      <div className="demo-search__backdrop">
        <span>New forms</span>
      </div>
      <section role="search">
        <header>
          <span>Search the store</span>
          <button type="button" aria-label="Close search">
            ×
          </button>
        </header>
        <label>
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ‘lamp’"
            aria-label="Search products"
          />
          <kbd>ESC</kbd>
        </label>
        <div className="demo-search__meta">
          <span>{products.length} considered matches</span>
          <button type="button">View all ↗</button>
        </div>
        <div className="demo-search__results">
          {products.length ? (
            products.map(([name, price, tone]) => (
              <article key={name}>
                <ProductArt tone={tone} />
                <strong>{name}</strong>
                <span>{price}</span>
              </article>
            ))
          ) : (
            <p>Start typing to explore the collection.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductGalleryPreview() {
  const [active, setActive] = useState(0);
  const tones = ["stone", "lime", "lilac"] as const;

  return (
    <div className="demo-gallery">
      <div className="demo-gallery__copy">
        <span>FORM / 006</span>
        <strong>Still life, in three considered tones.</strong>
      </div>
      <div className="demo-gallery__stage">
        <ProductArt tone={tones[active]} />
        <span className="demo-gallery__counter">0{active + 1} / 03</span>
        <div className="demo-gallery__thumbs">
          {tones.map((tone, index) => (
            <button
              type="button"
              className={active === index ? "is-active" : ""}
              onClick={() => setActive(index)}
              aria-label={`View product image ${index + 1}`}
              key={tone}
            >
              <ProductArt tone={tone} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCollectionPreview() {
  const [filter, setFilter] = useState("Objects");
  const products = [
    ["Arc lamp", "$180", "lime"],
    ["Contour vessel", "$64", "stone"],
    ["Column set", "$42", "lilac"],
  ] as const;

  return (
    <div className="demo-collection">
      <header>
        <div>
          <span>Curated edit / 03</span>
          <strong>{filter} for slower spaces.</strong>
        </div>
        <div>
          {["Objects", "Lighting", "Softness"].map((item) => (
            <button
              type="button"
              className={filter === item ? "is-active" : ""}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </header>
      <div className="demo-collection__grid">
        {products.map(([name, price, tone], index) => (
          <article key={name}>
            <ProductArt tone={tone} />
            <div>
              <span>0{index + 1}</span>
              <strong>{name}</strong>
              <b>{price}</b>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AnnouncementBarPreview() {
  const messages = [
    "Complimentary delivery over $100",
    "Edition 04 is now available",
    "Designed slowly. Shipped quickly.",
  ];
  const [active, setActive] = useState(0);

  return (
    <div className="demo-announcement">
      <div className="demo-announcement__wash" />
      <aside aria-label="Store announcement">
        <span className="demo-live-dot" />
        <button
          type="button"
          aria-label="Previous announcement"
          onClick={() => setActive((active + messages.length - 1) % messages.length)}
        >
          ←
        </button>
        <p>{messages[active]}</p>
        <a href="#preview" onClick={(event) => event.preventDefault()}>
          Explore ↗
        </a>
        <button
          type="button"
          aria-label="Next announcement"
          onClick={() => setActive((active + 1) % messages.length)}
        >
          →
        </button>
      </aside>
      <div className="demo-announcement__title">
        <span>A quiet study in</span>
        <strong>useful form.</strong>
      </div>
    </div>
  );
}

function QuickViewPreview() {
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);

  return (
    <div className="demo-quick-view">
      <div className="demo-quick-view__underlay">
        <span>Collection / 04</span>
      </div>
      <section role="dialog" aria-label="Quick view for Cloud knit">
        <button className="demo-quick-view__close" type="button" aria-label="Close quick view">
          ×
        </button>
        <div className="demo-quick-view__art">
          <div className="demo-knit" aria-hidden="true">
            <span />
          </div>
          <span>01 / 04</span>
        </div>
        <div className="demo-quick-view__content">
          <span>Soft structure</span>
          <h3>Cloud knit</h3>
          <strong>$120</strong>
          <p>Air-spun cotton with an easy, architectural drape.</p>
          <div className="demo-sizes" aria-label="Choose a size">
            {["XS", "S", "M", "L"].map((item) => (
              <button
                type="button"
                className={size === item ? "is-active" : ""}
                onClick={() => setSize(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="button" className="demo-add" onClick={() => setAdded(true)}>
            {added ? `Added · size ${size} ✓` : "Add to bag"}
          </button>
        </div>
      </section>
    </div>
  );
}

function TestimonialPreview() {
  const quotes = [
    ["It feels less like a product and more like part of the room.", "Mara L.", "Contour vessel"],
    ["The shape is quiet, but everyone notices it.", "Aisha R.", "Arc lamp"],
    ["Beautifully useful. Exactly the balance I wanted.", "Noor T.", "Column set"],
  ];
  const [active, setActive] = useState(0);
  const [quote, name, product] = quotes[active];

  return (
    <div className="demo-testimonial">
      <div className="demo-testimonial__art">
        <ProductArt tone="lilac" />
      </div>
      <figure>
        <div className="demo-stars" aria-label="5 out of 5 stars">
          ★★★★★
        </div>
        <blockquote>“{quote}”</blockquote>
        <figcaption>
          <span className="demo-avatar">{name.charAt(0)}</span>
          <div>
            <strong>{name}</strong>
            <span>Verified customer</span>
          </div>
          <span>{product}</span>
        </figcaption>
        <div className="demo-testimonial__controls">
          <span>0{active + 1} / 03</span>
          <div>
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setActive((active + quotes.length - 1) % quotes.length)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setActive((active + 1) % quotes.length)}
            >
              →
            </button>
          </div>
        </div>
      </figure>
    </div>
  );
}

function PreviewContent({ kind }: { kind: PreviewKind }) {
  switch (kind) {
    case "product-card":
      return <ProductCardPreview />;
    case "floating-nav":
      return <FloatingNavPreview />;
    case "cart-drawer":
      return <CartDrawerPreview />;
    case "mobile-menu":
      return <MobileMenuPreview />;
    case "search-overlay":
      return <SearchOverlayPreview />;
    case "product-gallery":
      return <ProductGalleryPreview />;
    case "featured-collection":
      return <FeaturedCollectionPreview />;
    case "announcement-bar":
      return <AnnouncementBarPreview />;
    case "quick-view":
      return <QuickViewPreview />;
    case "testimonial-card":
      return <TestimonialPreview />;
  }
}

export function DesignPreview({
  kind,
  compact = false,
  label,
}: {
  kind: PreviewKind;
  compact?: boolean;
  label?: string;
}) {
  return (
    <div
      className={`design-preview ${compact ? "design-preview--compact" : ""}`}
      id="preview"
    >
      <div className="design-preview__chrome">
        <div>
          <span />
          <span />
          <span />
        </div>
        <p>{label ?? "Live preview"}</p>
        <span className="design-preview__live">Live</span>
      </div>
      <div className="design-preview__viewport">
        <PreviewContent kind={kind} />
      </div>
    </div>
  );
}
