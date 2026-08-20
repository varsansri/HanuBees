# Motion and interaction guide

Unruled uses motion in four layers.

## 1. Entrance hierarchy

The campaign image settles from a slight scale while headline lines rise from
clipped wrappers. The delays communicate reading order. Keep the entire entrance
below 1.4 seconds.

## 2. Intent feedback

Product photography scales only after hover intent. Buttons shift by a few
pixels and avoid spring physics, which keeps the storefront feeling precise.

## 3. Spatial transitions

The menu and product drawer enter from the side they occupy. Search enters from
the top. Escape closes all three and page scrolling is locked only while an
overlay is open.

## 4. Scroll reveals

An IntersectionObserver adds the reveal class once. The observer disconnects
from completed elements. Content is hidden only after JavaScript confirms that
the observer exists, so the page remains readable without hydration.

## Reduced motion

Do not remove the prefers-reduced-motion block. It reduces all durations, stops
looping marquees after one iteration, exposes scroll content immediately, and
removes the pointer spotlight.

## Browser fallback

Backdrop blur and :has() are enhancements. The theme has opaque base colors, so
content and contrast remain intact if blur is not rendered. For legacy browsers
without :has(), use a route-specific layout instead of relying on the two rules
that hide the Hanubees studio header and footer.
