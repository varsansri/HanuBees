export type PreviewKind =
  | "product-card"
  | "floating-nav"
  | "cart-drawer"
  | "mobile-menu"
  | "search-overlay"
  | "product-gallery"
  | "featured-collection"
  | "announcement-bar"
  | "quick-view"
  | "testimonial-card";

export type DesignItem = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  component: string;
  preview: PreviewKind;
  description: string;
  seoDescription: string;
  difficulty: "Easy" | "Intermediate";
  buildTime: string;
  bestFor: string;
  placements: string[];
  techniques: string[];
  keywords: string[];
  code: string;
};

export const liquidGlassDesigns: DesignItem[] = [
  {
    slug: "liquid-glass-product-card-shopify",
    number: "01",
    title: "Liquid Glass Shopify Product Card",
    shortTitle: "Product card",
    component: "Product card",
    preview: "product-card",
    description:
      "A translucent product tile with a floating price, soft refraction, and a fast add-to-cart action.",
    seoDescription:
      "Build a liquid glass product card for Shopify with original Liquid and CSS. Includes a live preview, accessible markup, and copy-ready starter code.",
    difficulty: "Easy",
    buildTime: "15 min",
    bestFor: "Fashion, beauty, and premium DTC storefronts",
    placements: ["Collection grid", "Featured products", "Related products"],
    techniques: [
      "Layered translucent backgrounds",
      "Accessible product and price markup",
      "A lightweight add-to-cart form",
    ],
    keywords: [
      "liquid glass Shopify product card",
      "glassmorphism product card",
      "Shopify product card CSS",
    ],
    code: `{% comment %} Hanubees — Liquid Glass Product Card {% endcomment %}
<article class="hb-glass-product">
  <a href="{{ product.url }}" class="hb-glass-product__media">
    {{ product.featured_image
      | image_url: width: 900
      | image_tag: loading: 'lazy', alt: product.title
    }}
  </a>

  <div class="hb-glass-product__panel">
    <div>
      <p class="hb-glass-product__eyebrow">{{ product.vendor }}</p>
      <h3><a href="{{ product.url }}">{{ product.title }}</a></h3>
    </div>
    <strong>{{ product.price | money }}</strong>

    {% form 'product', product %}
      <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
      <button type="submit" {% unless product.available %}disabled{% endunless %}>
        {% if product.available %}Quick add{% else %}Sold out{% endif %}
      </button>
    {% endform %}
  </div>
</article>

<style>
.hb-glass-product { position:relative; overflow:hidden; border-radius:28px; background:#e8e5df; }
.hb-glass-product__media { display:block; aspect-ratio:4/5; }
.hb-glass-product__media img { width:100%; height:100%; object-fit:cover; }
.hb-glass-product__panel {
  position:absolute; inset:auto 12px 12px; display:grid; grid-template-columns:1fr auto;
  gap:14px; align-items:end; padding:16px; border:1px solid rgba(255,255,255,.5);
  border-radius:20px; color:#171714; background:rgba(255,255,255,.56);
  box-shadow:0 18px 50px rgba(28,28,24,.16); backdrop-filter:blur(18px) saturate(150%);
}
.hb-glass-product__panel h3 { margin:3px 0 0; font-size:16px; }
.hb-glass-product__eyebrow { margin:0; opacity:.58; font-size:11px; text-transform:uppercase; letter-spacing:.12em; }
.hb-glass-product button { grid-column:1/-1; width:100%; padding:12px; border:0; border-radius:12px; color:#fff; background:#171714; cursor:pointer; }
</style>`,
  },
  {
    slug: "liquid-glass-floating-navigation-shopify",
    number: "02",
    title: "Liquid Glass Floating Navigation for Shopify",
    shortTitle: "Floating navigation",
    component: "Navigation",
    preview: "floating-nav",
    description:
      "A compact storefront header that floats above the page, blurs naturally, and keeps core actions close.",
    seoDescription:
      "Create a liquid glass floating navigation bar for Shopify with responsive Liquid and CSS, plus a polished live preview and implementation notes.",
    difficulty: "Intermediate",
    buildTime: "25 min",
    bestFor: "Editorial shops and image-led homepages",
    placements: ["Theme header", "Landing pages", "Collection pages"],
    techniques: [
      "Sticky positioning without layout shift",
      "Progressive backdrop-filter enhancement",
      "Responsive navigation labels",
    ],
    keywords: [
      "liquid glass Shopify navigation",
      "floating Shopify header",
      "glassmorphism navbar Shopify",
    ],
    code: `<header class="hb-float-nav">
  <a href="{{ routes.root_url }}" class="hb-float-nav__brand">{{ shop.name }}</a>
  <nav aria-label="Primary navigation">
    {% for link in linklists.main-menu.links limit: 4 %}
      <a href="{{ link.url }}">{{ link.title }}</a>
    {% endfor %}
  </nav>
  <a href="{{ routes.cart_url }}" aria-label="Open cart">Bag ({{ cart.item_count }})</a>
</header>

<style>
.hb-float-nav {
  position:sticky; z-index:30; top:16px; width:min(94%, 980px); margin:16px auto;
  display:flex; align-items:center; justify-content:space-between; gap:24px; padding:12px 16px;
  border:1px solid rgba(255,255,255,.55); border-radius:999px;
  background:rgba(248,248,244,.58); box-shadow:0 14px 40px rgba(20,20,16,.1);
  backdrop-filter:blur(22px) saturate(160%);
}
.hb-float-nav a { color:inherit; text-decoration:none; font-size:13px; }
.hb-float-nav__brand { font-weight:700; }
.hb-float-nav nav { display:flex; gap:22px; }
@media (max-width:700px) { .hb-float-nav nav { display:none; } }
</style>`,
  },
  {
    slug: "liquid-glass-cart-drawer-shopify",
    number: "03",
    title: "Liquid Glass Shopify Cart Drawer",
    shortTitle: "Cart drawer",
    component: "Cart drawer",
    preview: "cart-drawer",
    description:
      "A tactile side cart with translucent depth, clear totals, and an uncluttered checkout path.",
    seoDescription:
      "Learn how to style a Shopify cart drawer with a liquid glass effect, readable layers, and conversion-focused checkout hierarchy.",
    difficulty: "Intermediate",
    buildTime: "30 min",
    bestFor: "Stores that use AJAX cart updates",
    placements: ["Global cart drawer", "Product pages", "Quick-add flows"],
    techniques: [
      "Readable glass-on-image contrast",
      "Drawer overlay and focus states",
      "Prominent checkout hierarchy",
    ],
    keywords: [
      "liquid glass Shopify cart drawer",
      "Shopify glassmorphism cart",
      "modern Shopify cart drawer CSS",
    ],
    code: `<aside class="hb-glass-cart" role="dialog" aria-modal="true" aria-labelledby="hb-cart-title">
  <header>
    <div><small>Your bag</small><h2 id="hb-cart-title">Cart · {{ cart.item_count }}</h2></div>
    <button type="button" aria-label="Close cart">×</button>
  </header>

  {% for item in cart.items %}
    <div class="hb-glass-cart__item">
      {{ item.image | image_url: width: 180 | image_tag: loading: 'lazy' }}
      <div><a href="{{ item.url }}">{{ item.product.title }}</a><small>{{ item.variant.title }}</small></div>
      <strong>{{ item.final_line_price | money }}</strong>
    </div>
  {% endfor %}

  <footer>
    <span>Subtotal</span><strong>{{ cart.total_price | money }}</strong>
    <button name="checkout" form="cart">Continue to checkout</button>
  </footer>
</aside>

<style>
.hb-glass-cart { width:min(430px, 94vw); padding:22px; border-left:1px solid rgba(255,255,255,.55); background:rgba(242,241,235,.72); backdrop-filter:blur(28px) saturate(145%); }
.hb-glass-cart header,.hb-glass-cart footer { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:14px; }
.hb-glass-cart__item { display:grid; grid-template-columns:68px 1fr auto; gap:14px; align-items:center; margin:24px 0; }
.hb-glass-cart__item img { width:68px; height:82px; object-fit:cover; border-radius:14px; }
.hb-glass-cart__item small { display:block; opacity:.55; margin-top:4px; }
.hb-glass-cart footer button { flex:0 0 100%; padding:15px; border:0; border-radius:14px; color:white; background:#171714; }
</style>`,
  },
  {
    slug: "liquid-glass-mobile-menu-shopify",
    number: "04",
    title: "Liquid Glass Shopify Mobile Menu",
    shortTitle: "Mobile menu",
    component: "Mobile menu",
    preview: "mobile-menu",
    description:
      "A full-height mobile navigation with soft glass panels and large, thumb-friendly category links.",
    seoDescription:
      "Build a liquid glass mobile menu for Shopify using semantic navigation, spacious touch targets, and lightweight responsive CSS.",
    difficulty: "Easy",
    buildTime: "20 min",
    bestFor: "Mobile-first apparel and lifestyle stores",
    placements: ["Theme header", "Mobile drawer", "Campaign landing pages"],
    techniques: [
      "Comfortable 48px touch targets",
      "Semantic disclosure controls",
      "Mobile-safe viewport sizing",
    ],
    keywords: [
      "liquid glass Shopify mobile menu",
      "Shopify mobile navigation design",
      "glass mobile menu CSS",
    ],
    code: `<details class="hb-mobile-menu">
  <summary aria-label="Open menu"><span></span><span></span></summary>
  <div class="hb-mobile-menu__panel">
    <p>Browse</p>
    <nav aria-label="Mobile navigation">
      {% for link in linklists.main-menu.links %}
        <a href="{{ link.url }}"><span>{{ link.title }}</span><span>↗</span></a>
      {% endfor %}
    </nav>
    <a class="hb-mobile-menu__account" href="{{ routes.account_url }}">Account</a>
  </div>
</details>

<style>
.hb-mobile-menu summary { display:grid; gap:5px; width:44px; height:44px; place-content:center; border-radius:50%; background:rgba(255,255,255,.65); cursor:pointer; }
.hb-mobile-menu summary::-webkit-details-marker { display:none; }
.hb-mobile-menu summary span { width:18px; height:1px; background:currentColor; }
.hb-mobile-menu__panel { position:fixed; inset:72px 12px 12px; z-index:40; padding:28px; border:1px solid rgba(255,255,255,.6); border-radius:28px; background:rgba(239,239,233,.76); backdrop-filter:blur(28px) saturate(150%); }
.hb-mobile-menu__panel nav a { display:flex; justify-content:space-between; padding:18px 0; border-bottom:1px solid rgba(20,20,16,.12); color:inherit; font-size:clamp(24px, 8vw, 42px); text-decoration:none; }
.hb-mobile-menu__account { display:inline-block; margin-top:30px; color:inherit; }
</style>`,
  },
  {
    slug: "liquid-glass-search-overlay-shopify",
    number: "05",
    title: "Liquid Glass Shopify Search Overlay",
    shortTitle: "Search overlay",
    component: "Predictive search",
    preview: "search-overlay",
    description:
      "A calm predictive-search layer that lets products and suggestions remain readable over storefront imagery.",
    seoDescription:
      "Create a liquid glass predictive search overlay for Shopify with an accessible search form and clean product result layout.",
    difficulty: "Intermediate",
    buildTime: "30 min",
    bestFor: "Large product catalogs and visual storefronts",
    placements: ["Global header", "Mobile search", "Collection discovery"],
    techniques: [
      "Native Shopify predictive search endpoint",
      "Search-as-you-type result layout",
      "Accessible dialog labeling",
    ],
    keywords: [
      "liquid glass Shopify search",
      "Shopify predictive search overlay",
      "glassmorphism search UI",
    ],
    code: `<section class="hb-glass-search" role="search" aria-label="Store search">
  <form action="{{ routes.search_url }}" method="get">
    <label for="hb-search">What are you looking for?</label>
    <div class="hb-glass-search__field">
      <input id="hb-search" name="q" type="search" placeholder="Search the collection" autocomplete="off">
      <button type="submit">Search</button>
    </div>
  </form>
  <div id="hb-search-results" aria-live="polite"></div>
</section>

<style>
.hb-glass-search { width:min(760px, calc(100% - 32px)); margin:auto; padding:26px; border:1px solid rgba(255,255,255,.55); border-radius:28px; background:rgba(250,250,247,.62); box-shadow:0 28px 90px rgba(25,24,20,.18); backdrop-filter:blur(30px) saturate(155%); }
.hb-glass-search label { display:block; margin-bottom:14px; font-size:13px; opacity:.6; }
.hb-glass-search__field { display:flex; gap:10px; }
.hb-glass-search input { flex:1; min-width:0; padding:16px; border:1px solid rgba(20,20,16,.14); border-radius:15px; background:rgba(255,255,255,.52); font:inherit; }
.hb-glass-search button { padding:0 20px; border:0; border-radius:15px; color:white; background:#171714; }
</style>`,
  },
  {
    slug: "liquid-glass-product-gallery-shopify",
    number: "06",
    title: "Liquid Glass Shopify Product Gallery",
    shortTitle: "Product gallery",
    component: "Product gallery",
    preview: "product-gallery",
    description:
      "A spacious image gallery with glass thumbnails, a floating counter, and clear visual focus.",
    seoDescription:
      "Build a modern liquid glass product gallery for Shopify with responsive images, glass thumbnail controls, and accessible selection states.",
    difficulty: "Intermediate",
    buildTime: "35 min",
    bestFor: "High-consideration products with detailed photography",
    placements: ["Product template", "Lookbook", "Quick-view modal"],
    techniques: [
      "Responsive Shopify image filters",
      "Active thumbnail states",
      "Stable media aspect ratios",
    ],
    keywords: [
      "liquid glass Shopify product gallery",
      "Shopify image gallery CSS",
      "glass thumbnail gallery",
    ],
    code: `<div class="hb-glass-gallery" data-gallery>
  <div class="hb-glass-gallery__stage">
    {% for media in product.media %}
      {{ media.preview_image | image_url: width: 1400 | image_tag: loading: 'lazy', class: 'hb-gallery-image' }}
    {% endfor %}
    <span class="hb-glass-gallery__count">01 / {{ product.media.size | prepend: '0' }}</span>
  </div>
  <div class="hb-glass-gallery__thumbs" aria-label="Product media">
    {% for media in product.media %}
      <button type="button" aria-label="View image {{ forloop.index }}">
        {{ media.preview_image | image_url: width: 180 | image_tag: loading: 'lazy' }}
      </button>
    {% endfor %}
  </div>
</div>

<style>
.hb-glass-gallery { position:relative; }
.hb-glass-gallery__stage { position:relative; overflow:hidden; border-radius:30px; background:#e7e5df; }
.hb-gallery-image { width:100%; aspect-ratio:4/5; object-fit:cover; }
.hb-glass-gallery__stage .hb-gallery-image:not(:first-of-type) { display:none; }
.hb-glass-gallery__count,.hb-glass-gallery__thumbs { border:1px solid rgba(255,255,255,.5); background:rgba(255,255,255,.52); backdrop-filter:blur(16px); }
.hb-glass-gallery__count { position:absolute; right:14px; top:14px; padding:9px 12px; border-radius:999px; font-size:12px; }
.hb-glass-gallery__thumbs { display:flex; gap:8px; position:absolute; left:50%; bottom:14px; padding:7px; border-radius:18px; transform:translateX(-50%); }
.hb-glass-gallery__thumbs button { overflow:hidden; width:48px; height:58px; padding:0; border:0; border-radius:11px; }
.hb-glass-gallery__thumbs img { width:100%; height:100%; object-fit:cover; }
</style>`,
  },
  {
    slug: "liquid-glass-featured-collection-shopify",
    number: "07",
    title: "Liquid Glass Shopify Featured Collection",
    shortTitle: "Featured collection",
    component: "Collection section",
    preview: "featured-collection",
    description:
      "A horizontally flowing collection shelf with glass filters and layered product information.",
    seoDescription:
      "Create a liquid glass featured collection section for Shopify with horizontally scrollable cards and usable category controls.",
    difficulty: "Easy",
    buildTime: "25 min",
    bestFor: "Homepages, seasonal edits, and product launches",
    placements: ["Homepage", "Collection landing page", "Campaign page"],
    techniques: [
      "Theme-editor collection settings",
      "Mobile scroll snapping",
      "Progressive hover treatments",
    ],
    keywords: [
      "liquid glass Shopify featured collection",
      "Shopify collection section design",
      "glass product carousel",
    ],
    code: `<section class="hb-glass-collection">
  <header>
    <div><p>Curated edit</p><h2>{{ section.settings.heading }}</h2></div>
    <a href="{{ section.settings.collection.url }}">View all ↗</a>
  </header>
  <div class="hb-glass-collection__track">
    {% for product in section.settings.collection.products limit: 6 %}
      <article>
        <a href="{{ product.url }}">
          {{ product.featured_image | image_url: width: 700 | image_tag: loading: 'lazy' }}
          <div><span>{{ product.title }}</span><strong>{{ product.price | money }}</strong></div>
        </a>
      </article>
    {% endfor %}
  </div>
</section>

<style>
.hb-glass-collection header { display:flex; justify-content:space-between; align-items:end; margin-bottom:22px; }
.hb-glass-collection header p { margin:0; opacity:.55; font-size:12px; text-transform:uppercase; letter-spacing:.14em; }
.hb-glass-collection h2 { margin:5px 0 0; font-size:clamp(28px, 5vw, 58px); }
.hb-glass-collection__track { display:grid; grid-auto-flow:column; grid-auto-columns:min(78vw, 310px); gap:14px; overflow-x:auto; scroll-snap-type:x mandatory; }
.hb-glass-collection article { position:relative; overflow:hidden; border-radius:24px; scroll-snap-align:start; }
.hb-glass-collection article img { width:100%; aspect-ratio:4/5; object-fit:cover; }
.hb-glass-collection article div { position:absolute; inset:auto 10px 10px; display:flex; justify-content:space-between; padding:14px; border-radius:15px; background:rgba(255,255,255,.58); backdrop-filter:blur(15px); }
</style>`,
  },
  {
    slug: "liquid-glass-announcement-bar-shopify",
    number: "08",
    title: "Liquid Glass Shopify Announcement Bar",
    shortTitle: "Announcement bar",
    component: "Announcement bar",
    preview: "announcement-bar",
    description:
      "A slim floating announcement pill for promotions that stays premium instead of looking like an ad banner.",
    seoDescription:
      "Add a floating liquid glass announcement bar to Shopify with clear promotion copy, accessible links, and a compact mobile layout.",
    difficulty: "Easy",
    buildTime: "10 min",
    bestFor: "Shipping offers, launches, and limited drops",
    placements: ["Above header", "Campaign page", "Product template"],
    techniques: [
      "Compact responsive messaging",
      "High-contrast promotional links",
      "Reduced-motion friendly animation",
    ],
    keywords: [
      "liquid glass Shopify announcement bar",
      "floating announcement bar Shopify",
      "Shopify promo bar CSS",
    ],
    code: `<aside class="hb-glass-notice" aria-label="Store announcement">
  <span class="hb-glass-notice__dot" aria-hidden="true"></span>
  <p>{{ section.settings.message }}</p>
  {% if section.settings.link != blank %}
    <a href="{{ section.settings.link }}">{{ section.settings.link_label }} ↗</a>
  {% endif %}
</aside>

<style>
.hb-glass-notice { width:max-content; max-width:calc(100% - 24px); margin:10px auto; display:flex; align-items:center; gap:10px; padding:9px 13px; border:1px solid rgba(255,255,255,.55); border-radius:999px; background:rgba(255,255,255,.56); box-shadow:0 10px 28px rgba(20,20,16,.08); backdrop-filter:blur(16px) saturate(155%); font-size:12px; }
.hb-glass-notice p { margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hb-glass-notice a { color:inherit; font-weight:700; white-space:nowrap; }
.hb-glass-notice__dot { width:7px; height:7px; border-radius:50%; background:#b6f36a; box-shadow:0 0 0 4px rgba(182,243,106,.2); }
</style>`,
  },
  {
    slug: "liquid-glass-quick-view-shopify",
    number: "09",
    title: "Liquid Glass Shopify Quick View",
    shortTitle: "Quick view",
    component: "Quick-view modal",
    preview: "quick-view",
    description:
      "A focused product modal with airy glass surfaces, variant selection, and one decisive purchase action.",
    seoDescription:
      "Build a liquid glass Shopify quick-view modal with accessible dialog structure, product variants, and a conversion-ready add-to-cart action.",
    difficulty: "Intermediate",
    buildTime: "35 min",
    bestFor: "Collection-led stores and product discovery",
    placements: ["Collection grid", "Search results", "Recommendation shelf"],
    techniques: [
      "Native dialog semantics",
      "Clear variant selection states",
      "Focus-visible interaction styling",
    ],
    keywords: [
      "liquid glass Shopify quick view",
      "Shopify product quick view modal",
      "glassmorphism ecommerce modal",
    ],
    code: `<dialog class="hb-quick-view" id="quick-view-{{ product.id }}">
  <form method="dialog"><button class="hb-quick-view__close" aria-label="Close">×</button></form>
  <div class="hb-quick-view__grid">
    {{ product.featured_image | image_url: width: 900 | image_tag: loading: 'lazy' }}
    <div class="hb-quick-view__content">
      <p>{{ product.vendor }}</p><h2>{{ product.title }}</h2><strong>{{ product.price | money }}</strong>
      {% form 'product', product %}
        <label for="hb-variant-{{ product.id }}">Choose an option</label>
        <select id="hb-variant-{{ product.id }}" name="id">
          {% for variant in product.variants %}<option value="{{ variant.id }}">{{ variant.title }}</option>{% endfor %}
        </select>
        <button type="submit">Add to bag</button>
      {% endform %}
    </div>
  </div>
</dialog>

<style>
.hb-quick-view { width:min(900px, calc(100% - 24px)); padding:10px; border:1px solid rgba(255,255,255,.6); border-radius:30px; background:rgba(246,246,241,.72); box-shadow:0 40px 120px rgba(15,15,12,.28); backdrop-filter:blur(30px) saturate(150%); }
.hb-quick-view::backdrop { background:rgba(18,18,16,.34); backdrop-filter:blur(6px); }
.hb-quick-view__grid { display:grid; grid-template-columns:1.1fr .9fr; gap:10px; }
.hb-quick-view__grid > img { width:100%; height:100%; max-height:640px; object-fit:cover; border-radius:22px; }
.hb-quick-view__content { padding:clamp(24px, 5vw, 60px); align-self:center; }
.hb-quick-view__content select,.hb-quick-view__content button { width:100%; margin-top:12px; padding:14px; border-radius:13px; }
.hb-quick-view__content button { border:0; color:white; background:#171714; }
@media (max-width:700px) { .hb-quick-view__grid { grid-template-columns:1fr; } }
</style>`,
  },
  {
    slug: "liquid-glass-testimonial-card-shopify",
    number: "10",
    title: "Liquid Glass Shopify Testimonial Card",
    shortTitle: "Testimonial card",
    component: "Social proof",
    preview: "testimonial-card",
    description:
      "An editorial review card that layers social proof over product imagery without sacrificing readability.",
    seoDescription:
      "Create a liquid glass testimonial card for Shopify with readable review content, product context, and responsive CSS.",
    difficulty: "Easy",
    buildTime: "15 min",
    bestFor: "Beauty, wellness, fashion, and product storytelling",
    placements: ["Homepage", "Product template", "Brand story page"],
    techniques: [
      "Editorial quote hierarchy",
      "Readable translucent surfaces",
      "Theme-editor block content",
    ],
    keywords: [
      "liquid glass Shopify testimonial",
      "Shopify review card design",
      "glassmorphism testimonial card",
    ],
    code: `<figure class="hb-glass-quote">
  <div class="hb-glass-quote__rating" aria-label="5 out of 5 stars">★★★★★</div>
  <blockquote>“{{ block.settings.quote }}”</blockquote>
  <figcaption>
    {% if block.settings.avatar %}{{ block.settings.avatar | image_url: width: 96 | image_tag: loading: 'lazy' }}{% endif %}
    <div><strong>{{ block.settings.name }}</strong><span>Verified customer</span></div>
    <span>{{ block.settings.product_title }}</span>
  </figcaption>
</figure>

<style>
.hb-glass-quote { max-width:560px; margin:0; padding:clamp(24px, 5vw, 46px); border:1px solid rgba(255,255,255,.58); border-radius:28px; background:rgba(255,255,255,.56); box-shadow:0 24px 70px rgba(20,20,16,.13); backdrop-filter:blur(22px) saturate(150%); }
.hb-glass-quote__rating { color:#9a6d00; letter-spacing:.16em; }
.hb-glass-quote blockquote { margin:24px 0 34px; font-size:clamp(24px, 4vw, 42px); line-height:1.08; letter-spacing:-.035em; }
.hb-glass-quote figcaption { display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; font-size:13px; }
.hb-glass-quote figcaption img { width:42px; height:42px; border-radius:50%; object-fit:cover; }
.hb-glass-quote figcaption span { display:block; opacity:.55; }
</style>`,
  },
];

export function getDesign(slug: string) {
  return liquidGlassDesigns.find((design) => design.slug === slug);
}

export const futureCollections = [
  {
    title: "Kinetic type",
    description: "Text reveals, elastic headlines, marquees, and scroll-led editorial motion.",
    count: "12 planned",
    tone: "coral",
  },
  {
    title: "Image transitions",
    description: "Product reveals, clip-path galleries, direction-aware hovers, and page transitions.",
    count: "10 planned",
    tone: "blue",
  },
  {
    title: "Conversion motion",
    description: "Carts, quick adds, variant pickers, and micro-interactions built to stay useful.",
    count: "14 planned",
    tone: "violet",
  },
  {
    title: "Spatial commerce",
    description: "Layered product scenes, depth, 3D-feeling layouts, and immersive storytelling.",
    count: "8 planned",
    tone: "green",
  },
] as const;
