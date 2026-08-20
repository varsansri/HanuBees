# Unruled

## Monochrome streetwear storefront / Hanubees theme 002

Unruled translates a compact visual reference into a complete responsive
commerce homepage. The rebuilt site preserves the reference's useful design
decisions—monochrome campaign imagery, centered oversized type, a four-piece
product row, ticker rhythm, and alternating editorial stories—while replacing
all branding, copy, code, people, and garment graphics with original work.

### Experience goal

Make a small fashion drop feel deliberate and culturally specific without
making shopping actions unfamiliar.

### Page architecture

1. Campaign announcement
2. Sticky brand masthead
3. Cinematic kinetic-type hero
4. Four-piece limited drop
5. Collection ticker
6. Mission editorial
7. Vision editorial
8. Newsletter capture
9. Utility footer

### Interaction set

- responsive menu
- search overlay
- product quick-view drawer
- size selection
- demo cart count and status feedback
- pointer spotlight
- product image hover
- scroll-once content reveals
- reduced-motion mode

### Technical profile

- Next.js 16 App Router
- React 19
- TypeScript
- route-scoped plain CSS
- next/image local asset optimization
- no external font request
- no animation runtime dependency

### Original asset set

- one four-model campaign hero
- four product-card photographs
- two editorial photographs

### Browser strategy

Core content and commerce hierarchy are server-renderable and readable without
animation. Backdrop blur, pointer light, and continuous tickers are progressive
enhancements. Responsive behavior is validated at desktop and 390-pixel mobile
widths, with a dedicated tablet preview mode in the Design Library.
