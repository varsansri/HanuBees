import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { InteractiveThemePreview } from "@/components/interactive-theme-preview";
import { ArrowRight, ArrowUpRight, Breadcrumbs } from "@/components/site-shell";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Unruled Streetwear Storefront - Live Preview & Theme Download",
  description:
    "Preview the interactive Unruled streetwear storefront, inspect its kinetic type and responsive motion, and download the source, editable theme folder, and project abstract.",
  alternates: { canonical: "/design/unruled-streetwear-storefront" },
  keywords: [
    "streetwear website theme",
    "fashion ecommerce website design",
    "monochrome ecommerce theme",
    "animated fashion storefront",
    "Next.js fashion theme",
  ],
  openGraph: {
    title: "Unruled - Interactive streetwear storefront theme",
    description:
      "Live preview, original source, editable theme folder, and project abstract.",
    url: "/design/unruled-streetwear-storefront",
    type: "article",
    images: [
      {
        url: "/themes/unruled/hero-campaign.png",
        width: 1536,
        height: 1024,
        alt: "Unruled monochrome fashion campaign",
      },
    ],
  },
};

const starterCode = [
  '<section className="ur-hero" onPointerMove={updateHeroPointer}>',
  '  <div className="ur-hero__media" aria-hidden="true">',
  '    <Image src="/hero-campaign.png" alt="" fill priority sizes="100vw" />',
  '    <span className="ur-hero__split" />',
  '    <span className="ur-hero__spotlight" />',
  '  </div>',
  '',
  '  <div className="ur-hero__copy">',
  '    <p>Campaign 001 / 2026</p>',
  '    <h1 aria-label="Move past the frame">',
  '      <span><i>MOVE</i></span>',
  '      <span><i>PAST</i></span>',
  '      <span><i>THE FRAME</i></span>',
  '    </h1>',
  '    <a href="#drop">Enter drop 001</a>',
  '  </div>',
  '</section>',
  '',
  '.ur-word { display:block; overflow:hidden; }',
  '.ur-word i {',
  '  display:block;',
  '  transform:translateY(112%) rotate(2deg);',
  '  animation:word-in 900ms cubic-bezier(.2,.75,.2,1) forwards;',
  '}',
  '@keyframes word-in { to { transform:none; } }',
  '@media (prefers-reduced-motion:reduce) {',
  '  .ur-word i { animation-duration:.01ms; }',
  '}',
].join("\n");

const deliverables = [
  {
    number: "01",
    title: "Preview source",
    description:
      "The source behind the live browser build, with the page component, data, motion styles, and project assets.",
    href: "/downloads/unruled/unruled-preview-source.zip",
    label: "Download preview code",
  },
  {
    number: "02",
    title: "Editable theme",
    description:
      "A clean theme folder with design tokens, section map, content guide, editable components, and original campaign assets.",
    href: "/downloads/unruled/unruled-editable-theme.zip",
    label: "Download theme folder",
  },
  {
    number: "03",
    title: "Project abstract",
    description:
      "A short visual and technical brief covering the design idea, information architecture, motion rules, and browser notes.",
    href: "/downloads/unruled/unruled-project-abstract.pdf",
    label: "Download abstract PDF",
  },
] as const;

export default function UnruledLibraryEntryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "Unruled Streetwear Storefront Theme",
    description:
      "An original responsive fashion storefront theme with an interactive preview and downloadable source.",
    codeRepository: "https://www.hanubees.com/design/unruled-streetwear-storefront",
    programmingLanguage: ["TypeScript", "CSS", "React"],
    runtimePlatform: "Next.js 16",
    author: { "@type": "Organization", name: "Hanubees" },
  };

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <header className={`${styles.hero} shell`}>
        <Breadcrumbs
          items={[
            { label: "Design Library", href: "/design" },
            { label: "Full-site themes", href: "/design#site-themes" },
            { label: "Unruled" },
          ]}
        />

        <div className={styles.heroGrid}>
          <div>
            <p className="eyebrow"><span className="status-dot" /> Theme 002 / Live build</p>
            <h1>Unruled.<span>Monochrome streetwear storefront.</span></h1>
            <p className={styles.intro}>
              A high-impact fashion homepage rebuilt from a supplied visual
              reference as an original, fully responsive site: cinematic
              photography, oversized kinetic type, tactile product cards, and
              smooth interactions with no borrowed branding or code.
            </p>
            <div className={styles.actions}>
              <a href="/theme/unruled" target="_blank" rel="noreferrer">
                Open full-screen preview <ArrowUpRight />
              </a>
              <a href="#downloads">Get the complete package <ArrowRight /></a>
            </div>
          </div>

          <aside className={styles.aside}>
            <span>Build profile</span>
            <dl>
              <div><dt>Category</dt><dd>Fashion / Streetwear</dd></div>
              <div><dt>Format</dt><dd>Full-site theme</dd></div>
              <div><dt>Stack</dt><dd>Next.js / React / CSS</dd></div>
              <div><dt>Assets</dt><dd>7 original images</dd></div>
              <div><dt>Motion</dt><dd>CSS-first + reduced mode</dd></div>
              <div><dt>Browsers</dt><dd>Modern evergreen</dd></div>
            </dl>
          </aside>
        </div>
      </header>

      <section className={`${styles.previewSection} shell`} aria-labelledby="preview-heading">
        <div className={styles.sectionHeading}>
          <div><span>01 / Live preview</span><h2 id="preview-heading">Use it before you download it.</h2></div>
          <p>
            This is the real theme route, not a video or screenshot. Change the
            viewport, open the menu, search, inspect a product, select a size,
            and test the demo bag.
          </p>
        </div>
        <InteractiveThemePreview path="/theme/unruled" title="Unruled theme" />
      </section>

      <section className={`${styles.deliverables} shell`} id="downloads" aria-labelledby="downloads-heading">
        <div className={styles.sectionHeading}>
          <div><span>02 / Three-part release</span><h2 id="downloads-heading">Everything inside one design.</h2></div>
          <p>
            Use the live build to judge the experience, the source to understand
            it, and the editable folder to turn it into your own project.
          </p>
        </div>

        <div className={styles.deliverableGrid}>
          {deliverables.map((item) => (
            <article className={styles.deliverableCard} key={item.number}>
              <span>{item.number} / Included</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.href} download>
                {item.label} <ArrowRight />
              </a>
            </article>
          ))}
        </div>

        <p className={styles.ownershipNote}>
          The supplied screenshot was used as a visual composition reference.
          The Unruled name, copy, component code, interactions, garment artwork,
          and all seven shipped campaign images are original to this Hanubees build.
        </p>
      </section>

      <section className={`${styles.system} shell`} aria-labelledby="system-heading">
        <div className={styles.sectionHeading}>
          <div><span>03 / Editable system</span><h2 id="system-heading">A mood you can actually tune.</h2></div>
          <p>
            Tokens keep the visual language centralized. Motion is layered in
            progressively, so the page remains readable without JavaScript and
            calm when a visitor prefers reduced motion.
          </p>
        </div>

        <div className={styles.systemGrid}>
          <article className={styles.palette}>
            <h3>Palette + type</h3>
            <p>Five core colors and system-first typography keep the theme fast, portable, and easy to rebrand.</p>
            <div className={styles.swatches}>
              <span><i /><small>#050505</small></span>
              <span><i /><small>#F2F0EA</small></span>
              <span><i /><small>#9D9C97</small></span>
              <span><i /><small>#E8FF45</small></span>
              <span><i /><small>#B54F2C</small></span>
            </div>
          </article>

          <article className={styles.motion}>
            <h3>Motion hierarchy</h3>
            <p>Movement supports hierarchy, product feedback, and spatial understanding rather than decorating every surface.</p>
            <ol>
              <li><strong>Hero line reveal</strong><span>900ms / enter</span></li>
              <li><strong>Product image hover</strong><span>800ms / intent</span></li>
              <li><strong>Drawer transition</strong><span>520ms / spatial</span></li>
              <li><strong>Story reveal</strong><span>Observer / once</span></li>
            </ol>
          </article>
        </div>
      </section>

      <section className={styles.codeSection} aria-labelledby="code-heading">
        <div className="shell">
          <div className={styles.sectionHeading}>
            <div><span>04 / Inspect the code</span><h2 id="code-heading">The headline is real HTML.</h2></div>
            <p>
              Branding and typography stay selectable and editable. Photography
              carries the atmosphere; semantic markup and CSS carry the interface.
            </p>
          </div>
          <CodeBlock code={starterCode} />
          <div className={styles.codeNote}>
            <strong>Performance rule</strong>
            <p>
              The interactive layer is isolated to one client component. Layout,
              metadata, download links, and library content remain server-rendered,
              while product state and preview controls hydrate only where needed.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.next} shell`}>
        <span>Collection source 01 / Complete</span>
        <h2>One reference rebuilt. Twenty-eight remain untouched.</h2>
        <Link href="/design">Return to the Design Library <ArrowRight /></Link>
      </section>
    </main>
  );
}
