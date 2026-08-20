"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { unruledProducts, type UnruledProduct } from "@/components/theme/unruled-data";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.7-4.1 2.8-6.1 6.5-6.1s5.8 2 6.5 6.1" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8.5h14l-1 11H6z" />
      <path d="M9 9V6.8C9 4.7 10.1 3.5 12 3.5s3 1.2 3 3.3V9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h13M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  );
}

function ProductCard({
  product,
  index,
  onOpen,
  onAdd,
}: {
  product: UnruledProduct;
  index: number;
  onOpen: (product: UnruledProduct) => void;
  onAdd: (product: UnruledProduct) => void;
}) {
  return (
    <article className="ur-product" data-reveal style={{ "--delay": `${index * 90}ms` } as CSSProperties}>
      <button
        className="ur-product__media"
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="(max-width: 720px) 76vw, (max-width: 1100px) 43vw, 25vw"
        />
        <span className="ur-product__edition">{product.edition}</span>
        <span className="ur-product__view">View piece</span>
      </button>

      <div className="ur-product__info">
        <div>
          <p>{product.name}</p>
          <span>{product.color}</span>
        </div>
        <strong>${product.price}</strong>
      </div>

      <button className="ur-product__add" type="button" onClick={() => onAdd(product)}>
        Quick add <ArrowIcon />
      </button>
    </article>
  );
}

export function UnruledHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<UnruledProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".unruled");
    const items = Array.from(document.querySelectorAll<HTMLElement>(".unruled [data-reveal]"));
    root?.classList.add("ur-motion-ready");

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return () => root?.classList.remove("ur-motion-ready");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      root?.classList.remove("ur-motion-ready");
    };
  }, []);

  useEffect(() => {
    const modalOpen = menuOpen || searchOpen || Boolean(selectedProduct);
    const previousOverflow = document.body.style.overflow;
    if (modalOpen) document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setSelectedProduct(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, searchOpen, selectedProduct]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2400);
  }

  function addToBag(product: UnruledProduct) {
    setCartCount((count) => count + 1);
    setSelectedProduct(null);
    showNotice(`${product.name} / size ${selectedSize} added to bag`);
  }

  function openProduct(product: UnruledProduct) {
    setSelectedSize("M");
    setSelectedProduct(product);
  }

  function updateHeroPointer(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    event.currentTarget.style.setProperty("--pointer-x", `${x}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y}%`);
  }

  return (
    <div className="unruled">
      <a className="ur-skip" href="#ur-main">Skip to collection</a>

      <div className="ur-announcement" aria-label="Store announcement">
        <div className="ur-announcement__track">
          {[0, 1].map((copy) => (
            <span aria-hidden={copy === 1} key={copy}>
              DROP 001 IS LIVE <i /> 240 GSM COTTON <i /> WORLDWIDE SHIPPING <i /> MADE OUTSIDE THE LINES <i />
            </span>
          ))}
        </div>
      </div>

      <header className="ur-header">
        <div className="ur-header__inner">
          <button
            type="button"
            className="ur-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>

          <nav className="ur-nav ur-nav--left" aria-label="Store navigation">
            <a href="#drop">Shop</a>
            <a href="#story">Story</a>
            <a href="#journal">Journal</a>
          </nav>

          <a className="ur-logo" href="#ur-main" aria-label="Unruled home">
            UNR<span>U</span>LED
          </a>

          <div className="ur-actions">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search">
              <SearchIcon />
            </button>
            <a href="#journal" aria-label="Account"><AccountIcon /></a>
            <button type="button" onClick={() => showNotice(cartCount ? `${cartCount} item${cartCount === 1 ? "" : "s"} in your demo bag` : "Your demo bag is empty")} aria-label={`Bag with ${cartCount} items`}>
              <BagIcon />
              <span className={cartCount ? "is-active" : ""}>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="ur-main">
        <section className="ur-hero" onPointerMove={updateHeroPointer}>
          <div className="ur-hero__media" aria-hidden="true">
            <Image
              src="/themes/unruled/hero-campaign.png"
              alt=""
              fill
              priority
              sizes="100vw"
            />
            <span className="ur-hero__split" />
            <span className="ur-hero__spotlight" />
          </div>

          <div className="ur-hero__copy">
            <p className="ur-hero__index">Campaign 001 / 2026</p>
            <h1 aria-label="Move past the frame">
              <span className="ur-word"><i>MOVE</i></span>
              <span className="ur-word"><i>PAST</i></span>
              <span className="ur-word"><i>THE FRAME</i></span>
            </h1>
            <p className="ur-hero__sub">Uniforms for independent minds.<br />Built heavy. Worn loose.</p>
            <a className="ur-button ur-button--light" href="#drop">
              Enter drop 001 <ArrowIcon />
            </a>
          </div>

          <p className="ur-hero__scroll"><span /> Scroll to disrupt</p>
        </section>

        <section className="ur-intro" id="drop">
          <p className="ur-kicker" data-reveal>Drop 001 / Limited release</p>
          <h2 data-reveal>BUILT TO REFUSE<br />THE DEFAULT.</h2>
          <p className="ur-intro__body" data-reveal>
            Four heavyweight layers. Four original back prints. No noise between
            the idea and the garment. Cut oversized and produced in deliberately
            small runs.
          </p>

          <div className="ur-products">
            {unruledProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onOpen={openProduct}
                onAdd={addToBag}
              />
            ))}
          </div>
        </section>

        <div className="ur-marquee" aria-label="Collection details">
          <div>
            {[0, 1].map((copy) => (
              <span aria-hidden={copy === 1} key={copy}>
                <b>+</b> LIMITED RUN <b>+</b> HEAVYWEIGHT FLEECE <b>+</b> ORIGINAL ART <b>+</b> CUT OVERSIZED <b>+</b> UNRULED SINCE NOW
              </span>
            ))}
          </div>
        </div>

        <section className="ur-story" id="story">
          <article className="ur-story__row ur-story__row--copy-first">
            <div className="ur-story__copy" data-reveal>
              <p className="ur-kicker">01 / The mission</p>
              <h2>MAKE ROOM<br />FOR YOURSELF.</h2>
              <p>
                Unruled is a study in presence: substantial fabric, exact cuts,
                and artwork that reads from across the room. Clothes should not
                decide who you are. They should leave enough space for you to do it.
              </p>
              <a href="#journal">Read the field notes <ArrowIcon /></a>
            </div>
            <div className="ur-story__image" data-reveal>
              <Image
                src="/themes/unruled/editorial-mission.png"
                alt="Model wearing an oversized black zip hoodie in a gray studio"
                fill
                sizes="(max-width: 800px) 100vw, 58vw"
              />
              <span>Quiet volume / 01</span>
            </div>
          </article>

          <article className="ur-story__row">
            <div className="ur-story__image ur-story__image--mono" data-reveal>
              <Image
                src="/themes/unruled/editorial-vision.png"
                alt="Two models in minimal monochrome streetwear"
                fill
                sizes="(max-width: 800px) 100vw, 58vw"
              />
              <span>Against sameness / 02</span>
            </div>
            <div className="ur-story__copy" data-reveal>
              <p className="ur-kicker">02 / The vision</p>
              <h2>LESS TREND.<br />MORE SIGNAL.</h2>
              <p>
                We work in a narrow palette and a wide point of view. Every drop
                is designed to live together, age honestly, and remain useful
                after the algorithm changes its mind.
              </p>
              <a href="#journal">See how it is made <ArrowIcon /></a>
            </div>
          </article>
        </section>

        <section className="ur-journal" id="journal">
          <div className="ur-journal__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div data-reveal>
            <p className="ur-kicker">Field transmissions</p>
            <h2>DROP NOTES,<br />NOT SPAM.</h2>
            <p>Early access, studio process, and the occasional unfinished idea.</p>
            <form onSubmit={(event) => { event.preventDefault(); showNotice("You are on the list"); }}>
              <label htmlFor="ur-email">Email address</label>
              <input id="ur-email" type="email" required placeholder="YOU@DOMAIN.COM" />
              <button type="submit" aria-label="Join the list"><ArrowIcon /></button>
            </form>
          </div>
        </section>
      </main>

      <footer className="ur-footer">
        <div className="ur-footer__top">
          <a className="ur-logo ur-logo--footer" href="#ur-main">UNR<span>U</span>LED</a>
          <p>Clothes for moving past the frame.</p>
        </div>
        <div className="ur-footer__grid">
          <div><span>Explore</span><a href="#drop">Drop 001</a><a href="#story">Story</a><a href="#journal">Journal</a></div>
          <div><span>Support</span><a href="#journal">Sizing</a><a href="#journal">Shipping</a><a href="#journal">Returns</a></div>
          <div><span>Follow</span><a href="#journal">Instagram</a><a href="#journal">Are.na</a><a href="#journal">TikTok</a></div>
          <div><span>Location</span><p>Designed everywhere.<br />Made in small runs.</p></div>
        </div>
        <div className="ur-footer__bottom">
          <span>&copy; 2026 UNRULED</span>
          <span>Original Hanubees theme demo</span>
          <a href="#ur-main">Back to top &uarr;</a>
        </div>
      </footer>

      {menuOpen && (
        <div className="ur-overlay" role="presentation" onMouseDown={() => setMenuOpen(false)}>
          <aside className="ur-menu" role="dialog" aria-modal="true" aria-label="Store menu" onMouseDown={(event) => event.stopPropagation()}>
            <button className="ur-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><CloseIcon /></button>
            <p>Navigate / 001</p>
            <nav>
              <a href="#drop" onClick={() => setMenuOpen(false)}><span>01</span> Shop</a>
              <a href="#story" onClick={() => setMenuOpen(false)}><span>02</span> Story</a>
              <a href="#journal" onClick={() => setMenuOpen(false)}><span>03</span> Journal</a>
            </nav>
            <small>Independent objects for independent minds.</small>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="ur-overlay ur-overlay--search" role="presentation" onMouseDown={() => setSearchOpen(false)}>
          <section className="ur-search" role="dialog" aria-modal="true" aria-label="Search products" onMouseDown={(event) => event.stopPropagation()}>
            <button className="ur-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><CloseIcon /></button>
            <p>Search the current drop</p>
            <label htmlFor="ur-search-field">What are you looking for?</label>
            <div><SearchIcon /><input id="ur-search-field" autoFocus type="search" placeholder="TYPE TO SEARCH" /></div>
            <span>Try “hoodie”, “black”, or “limited”.</span>
          </section>
        </div>
      )}

      {selectedProduct && (
        <div className="ur-overlay" role="presentation" onMouseDown={() => setSelectedProduct(null)}>
          <aside className="ur-drawer" role="dialog" aria-modal="true" aria-labelledby="ur-product-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="ur-close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product"><CloseIcon /></button>
            <div className="ur-drawer__image">
              <Image src={selectedProduct.image} alt={selectedProduct.alt} fill sizes="(max-width: 680px) 100vw, 520px" />
            </div>
            <div className="ur-drawer__body">
              <p>{selectedProduct.edition}</p>
              <h2 id="ur-product-title">{selectedProduct.name}</h2>
              <strong>${selectedProduct.price}</strong>
              <span>{selectedProduct.color} / 240 GSM brushed cotton</span>
              <fieldset>
                <legend>Select size</legend>
                <div>
                  {["S", "M", "L", "XL"].map((size) => (
                    <button key={size} type="button" className={selectedSize === size ? "is-selected" : ""} onClick={() => setSelectedSize(size)}>{size}</button>
                  ))}
                </div>
              </fieldset>
              <button className="ur-button ur-button--dark" type="button" onClick={() => addToBag(selectedProduct)}>
                Add size {selectedSize} to bag <ArrowIcon />
              </button>
              <small>Free worldwide shipping. 14-day returns.</small>
            </div>
          </aside>
        </div>
      )}

      <div className={`ur-toast${notice ? " is-visible" : ""}`} role="status" aria-live="polite">
        <span /> {notice}
      </div>
    </div>
  );
}
