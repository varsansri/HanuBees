# Content replacement guide

## Brand layer

Search for UNRULED, Drop 001, and Campaign 001 in unruled-home.tsx. Keep the
wordmark short enough to remain stable in the centered masthead. If the
replacement is longer than ten characters, reduce the ur-logo font size or use
an SVG brand mark with an accessible text label.

## Hero

The hero expects a landscape image with four subjects or a similarly balanced
composition. Keep the visual center relatively calm because the headline sits
over it. The current asset is 3:2 and deliberately crops on narrow screens.

Recommended source:

- 2400 x 1600 pixels or larger
- sRGB color
- no baked-in headline or navigation
- protected subject detail in dark clothing

## Products

Edit unruledProducts in unruled-data.ts. Each item needs:

- stable id
- display name
- small edition or badge
- numeric price
- local or allowed remote image
- descriptive alt
- short color

The horizontal mobile shelf is intentional. Four to six products work best.
For larger catalogs, replace it with pagination or a dedicated collection page.

## Story sections

Mission and vision images are landscape 4:3 assets. Copy should stay below
roughly 70 words so the alternating rows retain their visual rhythm.

## Commerce wiring

addToBag updates local demo state. Replace it with the cart mutation used by
your platform and keep the same immediate status announcement for screen-reader
and visual feedback.
