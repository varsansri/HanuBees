# Unruled editable theme kit

Unruled is an original, responsive streetwear storefront theme built by
Hanubees. The release is designed around one monochrome campaign, one four-piece
drop, and two editorial story sections.

## What is included

- The exact React component and CSS used by the live preview
- Centralized product content and theme tokens
- Seven original campaign images
- A content replacement guide
- A motion and accessibility guide
- A project abstract

## Quick start

The preview-source package is a minimal Next.js project:

1. Install Node.js 20 or later.
2. Run npm install.
3. Run npm run dev.
4. Open http://localhost:3000.

For an existing Next.js App Router project, copy:

- components/theme/unruled-home.tsx
- components/theme/unruled-data.ts
- app/theme/unruled/theme.css
- the public/themes/unruled image folder

Then render UnruledHome from the route where the theme should appear.

## First edits to make

1. Replace the UNRULED wordmark and campaign copy in unruled-home.tsx.
2. Replace product names, prices, colors, and image paths in
   unruled-data.ts.
3. Change the five visual tokens at the top of theme.css.
4. Connect the quick-add action to your cart or commerce platform.
5. Replace demo links and newsletter handling.

## Accessibility and performance

- All interactive controls are keyboard reachable.
- Escape closes the menu, search overlay, and product drawer.
- Page content remains visible if JavaScript is unavailable.
- prefers-reduced-motion collapses non-essential animation.
- Local images use next/image with responsive size hints.
- The theme uses system fonts and does not wait on external font requests.

The preview intentionally uses demo cart state. Connect product variants,
inventory, checkout, authentication, search, and email collection to the
services already used by your production store.
