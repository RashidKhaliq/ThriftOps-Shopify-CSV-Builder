# ThriftOps Shopify CSV Builder v9

## Setup
Deploy as **Cloudflare Pages** Git-connected project. Framework `None`, output directory `.`. Pages Functions `functions/api/helper.js` (Google Helper Sheet proxy) and `functions/api/suggest.js` (optional Autocomplete) are included. `workers.dev` Workers Static Assets deployment **does not** automatically expose Pages Functions. Local test: `npx wrangler pages dev .`.

## Inputs
- Raw Input XLSX/CSV required; map fields.
- BeThrifted Intelligence XLSX/CSV optional.
- OTS Intelligence XLSX/CSV optional.
- Helper Rules loaded from Google Sheet or XLSX fallback.
- Helper **Code** matches SKU prefix before first hyphen. `Category Types`, `Season`, `Gender`, `RK Types` retained.
- **Required for strict taxonomy**: add columns `Shopify Product Category`, `Google Product Category` to Google Helper Sheet, with valid Shopify taxonomy and Google taxonomy paths or IDs for each SKU prefix. Unmapped rows blocked from export. `Age Group` optional override.

## Dual-store exports
- Owner Mode `BeThrifted` / `OTS`: Supplier equals owner for BOTH CSVs; owner original image CDN used.
- Store studio image URLs use respective CDN and `SKU_studio.jpg`, `SKU_2_studio.jpg` ... `SKU_5_studio.jpg`; original owner image appended as final image row. Shopify CSV first row includes product data and first studio image, subsequent rows contain only Handle + Image Src/Position/Alt Text. Preview displays Original / BeThrifted / OTS.
- BeThrifted title `Brand (SKU)`; description BeThrifted AI Details paragraph only.
- OTS title `Brand (SKU) AI Type`, fallback Helper Category Types. OTS description Color, Color Details, Fabric, Measurements, raw Category, AI Type, AI Details, Styling Tips, Pairing Tips, Notable; no Condition.
- Both use same Shopify field headers, 19 custom metafields, pricing rules, Google Shopping columns, and distinct SEO templates.
- Export either CSV or ZIP with both CSVs. Strict validation blocks export until taxonomy and required data mapped.
- SEO edit controls for selected SKU + store. Google Autocomplete optional, unofficial and may fail; no API key needed.

## Google Shopping
Gender: male/female/unisex. Age: newborn/infant/toddler/kids/adult. UK sizes treated as adult only with adult Gender context; Boys/Girls default kids; 14+ years adult. Condition `used`. MPN and Custom Product blank (don't fabricate manufacturer identifiers). Custom Labels: season, condition grade, supplier, category, price band. Google Shopping legacy CSV columns may require separate feed mapping for Google & YouTube channel.

## Notes
- Verify Shopify CSV field compatibility and metafield definitions against store before production imports.
- Shopify Product Category and Google Product Category taxonomies differ; use exact valid values, never invented ones.
- Studio/original CDN files must exist; application doesn't upload images to Shopify.
- Data processing local to browser except Helper and optional keyword fetch.
