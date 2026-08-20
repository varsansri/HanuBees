import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/code-block";
import { DesignCard } from "@/components/design-card";
import { DesignPreview } from "@/components/design-preview";
import { ArrowRight, Breadcrumbs } from "@/components/site-shell";
import { getDesign, liquidGlassDesigns } from "@/lib/design-library";

export const dynamicParams = false;

export function generateStaticParams() {
  return liquidGlassDesigns.map((design) => ({ slug: design.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const design = getDesign(slug);

  if (!design) return {};

  return {
    title: `${design.title} — Free Code & Preview`,
    description: design.seoDescription,
    alternates: { canonical: `/design/${design.slug}` },
    keywords: design.keywords,
    openGraph: {
      title: design.title,
      description: design.seoDescription,
      url: `/design/${design.slug}`,
      type: "article",
    },
  };
}

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const design = getDesign(slug);

  if (!design) notFound();

  const currentIndex = liquidGlassDesigns.findIndex((item) => item.slug === slug);
  const related = [1, 2].map(
    (offset) => liquidGlassDesigns[(currentIndex + offset) % liquidGlassDesigns.length],
  );

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: design.title,
    description: design.seoDescription,
    url: `https://www.hanubees.com/design/${design.slug}`,
    author: { "@type": "Organization", name: "Hanubees" },
    publisher: { "@type": "Organization", name: "Hanubees" },
    proficiencyLevel: design.difficulty,
    dependencies: "A Shopify Online Store 2.0 theme and access to theme code",
    about: design.keywords,
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article>
        <header className="detail-hero shell">
          <Breadcrumbs
            items={[
              { label: "Design Library", href: "/design" },
              { label: "Liquid Glass for Shopify", href: "/design/liquid-glass-shopify" },
              { label: design.shortTitle },
            ]}
          />
          <div className="detail-hero__grid">
            <div>
              <p className="eyebrow">
                <span className="status-dot" /> Free Shopify build · {design.number}
              </p>
              <h1>{design.title}</h1>
              <p className="detail-hero__intro">{design.description}</p>
              <div className="detail-facts">
                <div><span>Difficulty</span><strong>{design.difficulty}</strong></div>
                <div><span>Build time</span><strong>{design.buildTime}</strong></div>
                <div><span>Format</span><strong>Liquid + CSS</strong></div>
              </div>
            </div>
            <aside className="detail-hero__aside">
              <span>Best for</span>
              <p>{design.bestFor}</p>
              <a href="#starter-code" className="button button--dark">
                Jump to free code <ArrowRight />
              </a>
            </aside>
          </div>
        </header>

        <section className="detail-preview shell" aria-labelledby="preview-heading">
          <div className="detail-section-label">
            <div><span>01</span><h2 id="preview-heading">Try the interaction</h2></div>
            <p>This is a working browser preview. Click, type, or change the visible controls.</p>
          </div>
          <DesignPreview kind={design.preview} label={`${design.title} / responsive concept`} />
        </section>

        <section className="detail-notes shell" aria-labelledby="build-heading">
          <div className="detail-section-label">
            <div><span>02</span><h2 id="build-heading">How this build works</h2></div>
            <p>Use the visual system; adapt the markup to the product data and interaction patterns already present in your theme.</p>
          </div>
          <div className="detail-notes__grid">
            <article>
              <p className="eyebrow">Core techniques</p>
              <ol>
                {design.techniques.map((technique, index) => (
                  <li key={technique}><span>0{index + 1}</span><strong>{technique}</strong></li>
                ))}
              </ol>
            </article>
            <article>
              <p className="eyebrow">Good Shopify placements</p>
              <ul>
                {design.placements.map((placement) => <li key={placement}>{placement}<span>↗</span></li>)}
              </ul>
            </article>
            <aside>
              <p className="eyebrow">Keep it usable</p>
              <p>
                Test the component over both light and dark product images. A
                semi-opaque fallback color matters more than the blur itself,
                especially on older browsers and lower-power mobile devices.
              </p>
            </aside>
          </div>
        </section>

        <section className="detail-code section--dark" id="starter-code" aria-labelledby="code-heading">
          <div className="shell">
            <div className="detail-section-label detail-section-label--light">
              <div><span>03</span><h2 id="code-heading">Copy the starter</h2></div>
              <p>Original Hanubees markup and CSS. Paste it into a duplicated theme, connect your section settings, then test before publishing.</p>
            </div>
            <CodeBlock code={design.code} />
            <div className="code-usage-note">
              <strong>Before going live</strong>
              <p>
                Theme structures differ. Confirm product forms, variant IDs,
                cart updates, keyboard focus, image loading, and mobile spacing
                in your actual Shopify theme. The snippet is a clear starting
                layer, not a blind one-click install.
              </p>
            </div>
          </div>
        </section>

        <section className="detail-seo shell">
          <p className="eyebrow">Why this belongs in a storefront</p>
          <div>
            <h2>{design.shortTitle}: visual polish tied to a familiar shopping job.</h2>
            <p>
              The strongest use of liquid glass in Shopify is not as a site-wide
              skin. It is a way to separate a compact interactive layer from rich
              product imagery while keeping the page feeling connected. On a
              {" "}{design.component.toLowerCase()}, that can make hierarchy feel
              lighter without removing the labels, prices, and actions a shopper
              expects.
            </p>
            <p>
              Use the effect as progressive enhancement. The component should
              still make sense with blur removed, motion reduced, and a product
              image at its brightest possible crop. That constraint is what turns
              a shareable visual trend into durable interface design.
            </p>
          </div>
        </section>
      </article>

      <section className="section related-section">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div><p className="eyebrow">Continue the collection</p><h2>Two more useful glass surfaces.</h2></div>
            <Link className="text-link text-link--large" href="/design/liquid-glass-shopify">
              View all 10 <ArrowRight />
            </Link>
          </div>
          <div className="library-grid library-grid--two">
            {related.map((item) => <DesignCard design={item} key={item.slug} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
