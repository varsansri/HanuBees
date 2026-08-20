import type { Metadata } from "next";
import Link from "next/link";
import { DesignPreview } from "@/components/design-preview";
import { ArrowRight, ArrowUpRight } from "@/components/site-shell";
import { futureCollections, liquidGlassDesigns } from "@/lib/design-library";

export const metadata: Metadata = {
  title: "Design Lab — Free UI previews and build guides",
  description:
    "Explore the Hanubees Design Lab: original, working interface previews with practical build guides for Shopify and modern websites.",
  alternates: { canonical: "/design" },
  openGraph: {
    title: "Hanubees Design Lab",
    description:
      "Working interface ideas, Shopify adaptations, and free starter code.",
    url: "/design",
  },
};

export default function DesignLabPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Hanubees Design Lab",
    url: "https://www.hanubees.com/design",
    description:
      "A curated library of original interface previews and practical website implementation guides.",
    hasPart: liquidGlassDesigns.map((design) => ({
      "@type": "CreativeWork",
      name: design.title,
      url: `https://www.hanubees.com/design/${design.slug}`,
    })),
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <section className="lab-hero shell">
        <div className="lab-hero__copy">
          <p className="eyebrow"><span className="status-dot" /> Hanubees Design Lab</p>
          <h1>Interfaces worth stealing <em>ideas</em> from.</h1>
          <p>
            We find visual ideas people cannot stop sharing, rebuild them with
            original code, and show exactly where they become useful on a real
            website.
          </p>
          <div className="lab-hero__stats">
            <div><strong>10</strong><span>working builds</span></div>
            <div><strong>01</strong><span>live collection</span></div>
            <div><strong>Free</strong><span>starter code</span></div>
          </div>
        </div>
        <div className="lab-hero__preview">
          <DesignPreview kind="floating-nav" compact label="Interaction study / live" />
          <span className="lab-hero__tag">No screenshots. Try the controls.</span>
        </div>
      </section>

      <section className="section shell current-collection">
        <div className="collection-poster">
          <div className="collection-poster__copy">
            <div>
              <p className="eyebrow eyebrow--light">Collection 001 · Live now</p>
              <h2>Liquid Glass<br />for Shopify</h2>
            </div>
            <div>
              <p>
                Ten high-utility storefront components that use translucency,
                depth, and motion without making the shopping experience harder.
              </p>
              <Link className="button button--light" href="/design/liquid-glass-shopify">
                Open all 10 builds <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="collection-poster__objects" aria-hidden="true">
            <span className="glass-disc glass-disc--one" />
            <span className="glass-disc glass-disc--two" />
            <span className="glass-pane glass-pane--one" />
            <span className="glass-pane glass-pane--two" />
            <strong>LG/01</strong>
          </div>
        </div>

        <div className="collection-index">
          {liquidGlassDesigns.map((design) => (
            <Link href={`/design/${design.slug}`} key={design.slug}>
              <span>{design.number}</span>
              <strong>{design.shortTitle}</strong>
              <small>{design.difficulty} · {design.buildTime}</small>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--warm">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">The library rule</p>
              <h2>Save the effect. Learn the decision.</h2>
            </div>
            <p>
              Every entry has to earn its page with a live build, a specific
              use case, implementation guidance, and code you can inspect.
            </p>
          </div>
          <div className="library-rule-grid">
            <article><span>01</span><h3>Curated signal</h3><p>A visual direction that is actively being saved, shared, or discussed.</p></article>
            <article><span>02</span><h3>Original rebuild</h3><p>Our own markup, behavior, and art direction—not copied repository code.</p></article>
            <article><span>03</span><h3>Real placement</h3><p>A direct answer to where the idea belongs in Shopify or a modern site.</p></article>
            <article><span>04</span><h3>One canonical page</h3><p>No SEO clones. One strong URL that can accumulate links, updates, and trust.</p></article>
          </div>
        </div>
      </section>

      <section className="section shell future-shelves">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">Next on the shelf</p>
            <h2>Four directions, forty-four useful reasons to return.</h2>
          </div>
          <p>
            These are the next collections in the publishing system. They stay
            broad enough to grow and narrow enough to own a recognizable idea.
          </p>
        </div>
        <div className="future-grid">
          {futureCollections.map((collection, index) => (
            <article className={`future-card future-card--${collection.tone}`} key={collection.title}>
              <span>0{index + 2} / Upcoming</span>
              <h3>{collection.title}</h3>
              <p>{collection.description}</p>
              <small>{collection.count}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
