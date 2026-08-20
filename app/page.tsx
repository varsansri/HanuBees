import Link from "next/link";
import { DesignPreview } from "@/components/design-preview";
import { ArrowRight, ArrowUpRight } from "@/components/site-shell";
import { ThemePreview } from "@/components/theme-preview";
import { liquidGlassDesigns } from "@/lib/design-library";
import { themes, themesInProgress } from "@/lib/theme-library";

const capabilities = [
  {
    number: "01",
    title: "Websites with a point of view",
    description:
      "Strategy, art direction, UX, and development shaped into one clear digital presence.",
    tags: ["Brand sites", "Editorial", "Launches"],
  },
  {
    number: "02",
    title: "Shopify beyond the theme",
    description:
      "Custom storefront systems that make products easier to understand, want, and buy.",
    tags: ["Shopify", "Conversion", "Theme systems"],
  },
  {
    number: "03",
    title: "Useful digital products",
    description:
      "Focused interfaces for tools, platforms, and applications where clarity earns trust.",
    tags: ["Web apps", "UI systems", "Prototypes"],
  },
];

const directions = [
  {
    index: "A/01",
    title: "A high-touch launch for a small-batch object brand.",
    type: "Commerce direction",
    tone: "amber",
  },
  {
    index: "A/02",
    title: "Turning a complex service into one obvious next step.",
    type: "Service direction",
    tone: "blue",
  },
  {
    index: "A/03",
    title: "A product interface that teaches itself in one screen.",
    type: "Product direction",
    tone: "green",
  },
];

export default function Home() {
  const featuredTheme = themes[0];
  const studioSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Hanubees",
    url: "https://www.hanubees.com",
    description:
      "Web design and development studio specializing in websites, Shopify experiences, and interface systems.",
    email: "hello@hanubees.com",
    areaServed: "Worldwide",
    knowsAbout: [
      "Web design",
      "Web development",
      "Shopify development",
      "User interface design",
    ],
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema) }}
      />

      <section className="home-hero shell">
        <div className="home-hero__copy">
          <p className="eyebrow">
            <span className="status-dot" /> Independent digital studio
          </p>
          <h1>
            Websites worth
            <span>remembering.</span>
          </h1>
          <p className="home-hero__intro">
            Hanubees designs and builds expressive websites, focused commerce,
            and useful digital products—then shares the best interface ideas in
            our public lab.
          </p>
          <div className="button-row">
            <a href="mailto:hello@hanubees.com" className="button button--dark">
              Start a project <ArrowUpRight />
            </a>
            <Link href="/design" className="button button--ghost">
              Explore the Design Library <ArrowRight />
            </Link>
          </div>
        </div>

        <div className="home-hero__visual">
          <div className="hero-note hero-note--top">
            <span>Currently collecting</span>
            <strong>Liquid interfaces</strong>
          </div>
          <DesignPreview kind="product-card" compact label="Lab build / 01" />
          <div className="hero-note hero-note--bottom">
            <strong>10</strong>
            <span>free Shopify builds, live now</span>
          </div>
        </div>
      </section>

      <div className="signal-strip" aria-hidden="true">
        <div>
          <span>Strategy</span><i />
          <span>Design</span><i />
          <span>Development</span><i />
          <span>Shopify</span><i />
          <span>Useful experiments</span><i />
          <span>Strategy</span><i />
          <span>Design</span><i />
          <span>Development</span><i />
        </div>
      </div>

      <section className="section shell" id="work">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">Selected directions</p>
            <h2>Distinct by design. Useful on purpose.</h2>
          </div>
          <p>
            Early-stage concepts showing the kind of commercial problems we
            like to solve. No borrowed client logos. No pretend case studies.
          </p>
        </div>

        <div className="direction-grid">
          {directions.map((direction) => (
            <article className="direction-card" key={direction.index}>
              <div className={`direction-art direction-art--${direction.tone}`}>
                <span className="direction-art__label">{direction.index}</span>
                <div className="direction-window">
                  <div className="direction-window__bar"><i /><i /><i /></div>
                  <div className="direction-window__body">
                    <span />
                    <strong>
                      {direction.index === "A/01"
                        ? "FORM"
                        : direction.index === "A/02"
                          ? "CLEAR"
                          : "FLOW"}
                    </strong>
                    <small>Hanubees direction study</small>
                  </div>
                </div>
              </div>
              <div className="direction-card__body">
                <p>{direction.type}</p>
                <h3>{direction.title}</h3>
                <span className="round-arrow"><ArrowUpRight /></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--dark" id="services">
        <div className="shell">
          <div className="section-heading section-heading--split section-heading--light">
            <div>
              <p className="eyebrow eyebrow--light">What we build</p>
              <h2>One partner from first thought to final pixel.</h2>
            </div>
            <p>
              Small, senior, and direct. We connect the idea, the interface,
              and the code so the finished experience feels like one thing.
            </p>
          </div>

          <div className="capability-list">
            {capabilities.map((capability) => (
              <article key={capability.number}>
                <span>{capability.number}</span>
                <div>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                </div>
                <ul>
                  {capability.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section lab-feature">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">The Hanubees Design Library</p>
              <h2>See it. Understand it. Put it to work.</h2>
            </div>
            <div>
              <p>
                A growing collection of live interface ideas, rebuilt for real
                websites—not a screenshot dump and not another inspiration
                search engine.
              </p>
              <Link href="/design" className="text-link text-link--large">
                Enter the lab <ArrowRight />
              </Link>
            </div>
          </div>

          <div className="lab-shelf">
            {liquidGlassDesigns.slice(0, 3).map((design) => (
              <article key={design.slug}>
                <div>
                  <DesignPreview kind={design.preview} compact label={`${design.number} / Live build`} />
                </div>
                <div>
                  <span>{design.component}</span>
                  <h3>{design.shortTitle}</h3>
                  <Link href={`/design/${design.slug}`} aria-label={`Open ${design.title}`}>
                    <ArrowUpRight />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="lab-index">
            <div><strong>01</strong><span>Visual idea</span></div>
            <i />
            <div><strong>02</strong><span>Working preview</span></div>
            <i />
            <div><strong>03</strong><span>Shopify adaptation</span></div>
            <i />
            <div><strong>04</strong><span>Free starter code</span></div>
          </div>
        </div>
      </section>

      <section className="section theme-section" id="themes">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">
                <span className="status-dot" /> Hanubees Themes
              </p>
              <h2>Explore our themes.</h2>
            </div>
            <div>
              <p>
                Not screenshots and not a starter kit—complete, working
                storefronts you can open right now, read the code of, and put
                your own products into.
              </p>
              {featuredTheme && (
                <Link
                  href={`/theme/${featuredTheme.slug}`}
                  className="text-link text-link--large"
                >
                  Open the {featuredTheme.name} theme <ArrowRight />
                </Link>
              )}
            </div>
          </div>

          {themes.map((theme) => (
            <article className="theme-feature" key={theme.slug}>
              <Link
                href={`/theme/${theme.slug}`}
                className="theme-feature__preview"
                aria-label={`Open the ${theme.name} theme`}
              >
                <ThemePreview
                  path={`/theme/${theme.slug}`}
                  label={`Theme ${theme.number} / ${theme.name}`}
                />
                <span className="theme-feature__open">
                  Open live theme <ArrowUpRight />
                </span>
              </Link>

              <div className="theme-feature__body">
                <p className="theme-feature__meta">
                  <span>{theme.number}</span>
                  {theme.category}
                  <i />
                  {theme.stack}
                </p>
                <h3>{theme.name}</h3>
                <p className="theme-feature__tagline">{theme.tagline}</p>
                <p className="theme-feature__desc">{theme.description}</p>

                <ul className="theme-feature__points">
                  {theme.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>

                <div className="theme-chips">
                  {theme.sections.map((section) => (
                    <span key={section}>{section}</span>
                  ))}
                </div>

                <div className="button-row">
                  <Link href={`/theme/${theme.slug}`} className="button button--dark">
                    View the theme <ArrowUpRight />
                  </Link>
                  <a
                    className="button button--ghost"
                    href={`mailto:hello@hanubees.com?subject=${encodeURIComponent(
                      `${theme.name} theme`,
                    )}`}
                  >
                    Build on this <ArrowRight />
                  </a>
                </div>
              </div>
            </article>
          ))}

          <div className="theme-queue">
            {themesInProgress.map((theme) => (
              <article key={theme.title}>
                <p className={`theme-queue__status theme-queue__status--${theme.tone}`}>
                  <i />
                  {theme.status}
                </p>
                <h3>{theme.title}</h3>
                <p>{theme.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell home-principle">
        <p className="eyebrow">Our working principle</p>
        <blockquote>
          “Trend” gets attention. <em>Judgment</em> makes it useful.
        </blockquote>
        <div>
          <p>
            We study what people are saving and sharing, then rebuild the idea
            with clearer behavior, original code, and a real commercial use.
          </p>
          <a className="button button--dark" href="mailto:hello@hanubees.com">
            Build something together <ArrowUpRight />
          </a>
        </div>
      </section>
    </main>
  );
}
