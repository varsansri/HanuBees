import type { Metadata } from "next";
import Link from "next/link";
import { DesignCard } from "@/components/design-card";
import { DesignPreview } from "@/components/design-preview";
import { ArrowRight, Breadcrumbs } from "@/components/site-shell";
import { liquidGlassDesigns } from "@/lib/design-library";

export const metadata: Metadata = {
  title: "Liquid Glass Shopify Components — 10 Free Builds",
  description:
    "Explore 10 original liquid glass Shopify components with working previews, practical build guides, and free Liquid and CSS starter code.",
  alternates: { canonical: "/design/liquid-glass-shopify" },
  keywords: [
    "liquid glass Shopify",
    "Shopify glassmorphism components",
    "liquid glass UI examples",
    "Shopify design inspiration",
  ],
  openGraph: {
    title: "Liquid Glass for Shopify — 10 Working Components",
    description:
      "Live storefront previews, clear implementation guidance, and original starter code.",
    url: "/design/liquid-glass-shopify",
  },
};

const faqs = [
  {
    question: "Does liquid glass work in every Shopify theme?",
    answer:
      "The visual CSS works in modern themes, but selectors and product data need to be connected to your theme's existing markup. Start in a duplicated theme and test the cart, variants, keyboard navigation, and mobile layout before publishing.",
  },
  {
    question: "Will backdrop blur make a Shopify store slow?",
    answer:
      "Used on a few small surfaces, backdrop-filter is usually reasonable. Avoid large full-screen animated blur layers, keep shadows modest, and provide a solid translucent background so the component remains readable when blur is unavailable.",
  },
  {
    question: "Can I use these snippets in a commercial store?",
    answer:
      "These Hanubees starter snippets are provided to adapt into your own storefront. Product imagery, fonts, brand assets, and code from third-party themes or repositories are not included.",
  },
];

export default function LiquidGlassCollectionPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Liquid Glass for Shopify",
    url: "https://www.hanubees.com/design/liquid-glass-shopify",
    description:
      "Ten original liquid glass components for Shopify with live previews and implementation guides.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: liquidGlassDesigns.length,
      itemListElement: liquidGlassDesigns.map((design, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.hanubees.com/design/${design.slug}`,
        name: design.title,
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="collection-hero shell">
        <Breadcrumbs items={[{ label: "Design lab", href: "/design" }, { label: "Liquid Glass for Shopify" }]} />
        <div className="collection-hero__grid">
          <div>
            <p className="eyebrow"><span className="status-dot" /> Collection 001 · 10 free builds</p>
            <h1>Liquid Glass<br /><em>for Shopify.</em></h1>
            <p className="collection-hero__intro">
              Translucent, dimensional storefront components rebuilt to do a
              job—not just imitate an operating-system trend.
            </p>
            <div className="button-row">
              <a className="button button--dark" href="#components">Browse all components <ArrowRight /></a>
              <span className="collection-hero__note">Original code · No sign-up</span>
            </div>
          </div>
          <div className="collection-hero__visual">
            <DesignPreview kind="announcement-bar" compact label="Collection preview / interactive" />
          </div>
        </div>
      </section>

      <section className="collection-context shell">
        <p>What makes the effect work</p>
        <div>
          <article><span>01</span><h2>Transparency with contrast</h2><p>A glass surface is only useful when the text and controls remain clear over whatever sits behind it.</p></article>
          <article><span>02</span><h2>Depth with restraint</h2><p>One sharp edge, one soft highlight, and one believable shadow often do more than five decorative layers.</p></article>
          <article><span>03</span><h2>Motion with a reason</h2><p>Movement should confirm an action or reveal hierarchy—not make checkout feel like a title sequence.</p></article>
        </div>
      </section>

      <section className="section shell" id="components">
        <div className="section-heading section-heading--split">
          <div><p className="eyebrow">The complete shelf</p><h2>Ten places the visual idea becomes useful.</h2></div>
          <p>Open any component for the full-screen preview, build notes, SEO-focused explanation, and copy-ready Shopify starter.</p>
        </div>
        <div className="library-grid">
          {liquidGlassDesigns.map((design) => <DesignCard design={design} key={design.slug} />)}
        </div>
      </section>

      <section className="section section--dark collection-editorial">
        <div className="shell collection-editorial__grid">
          <div>
            <p className="eyebrow eyebrow--light">Use the trend intelligently</p>
            <h2>Glass is the treatment.<br />Commerce is the job.</h2>
          </div>
          <div>
            <p>
              Keep it for navigation, overlays, product context, and compact
              controls. Avoid putting long body copy on unpredictable imagery,
              blurring the entire viewport, or hiding familiar shopping actions
              behind visual novelty.
            </p>
            <ul>
              <li><span>Do</span> test contrast over the brightest product image.</li>
              <li><span>Do</span> keep a readable fallback background.</li>
              <li><span>Avoid</span> animating blur during scroll.</li>
              <li><span>Avoid</span> glass on every section of the page.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section shell faq-section">
        <div><p className="eyebrow">Practical questions</p><h2>Before you paste the CSS.</h2></div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary><span>0{index + 1}</span>{faq.question}<b>+</b></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="next-collection shell">
        <span>Collection 002 · In progress</span>
        <h2>Kinetic type for product stories.</h2>
        <Link href="/design">See the publishing roadmap <ArrowRight /></Link>
      </section>
    </main>
  );
}
