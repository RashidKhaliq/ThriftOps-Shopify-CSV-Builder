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


## v10 fixes
- Manual field mapping persists across dropdown changes; Sheet # accepts Sheet / Sheet No / Sheet Number / Sheet Name; defaults Sheet1.
- Taxonomy editor: enter exact Shopify and Google category paths/IDs by SKU prefix; browser localStorage persists overrides. Strict validation retained.
- Compare At Price equals sale price when discount 0, per user request. Note Shopify may not show a crossed-out price when values match.


## v11 Owner and admin tags
Both Shopify exports include product owner tag `Supplier_BeThrifted` or `Supplier_OTS` based on Owner Mode (not destination store). Also include `StoreRole_Owner` or `StoreRole_Reseller` relative to exported store, plus `Inventory_OneOfOne` for single-quantity thrift inventory. Existing descriptive tags retained. Shopify tags are not inherently admin-only: storefront visibility depends on theme, collection filters, search, and integrations.


## v12 Taxonomy Dropdowns
- Official Shopify Standard Product Taxonomy and Google Product Taxonomy retrieved via Cloudflare Pages `/api/taxonomies`.
- Searchable dropdowns for each SKU prefix. No guessed categories; invalid manual entries rejected when official lists load.
- Official catalog loading needs internet and deployed Pages Functions or `npx wrangler pages dev .`.
- Browser localStorage retains selections. If catalog fetch fails, manual entry remains available and should be verified.


## v13: Grouped Helper Category Types + Official Taxonomy Fix
- OTS HTML `Category:` uses **Helper Category Types** (identical to Shopify `Type`), not raw Category.
- Taxonomy editor groups by **distinct Helper Category Types**; SKU prefixes of same type share a single mapping. Saved in browser `thriftops_category_taxonomy_v13`. Older code-level overrides retained as fallback.
- Shopify release `categories.en.txt.gz` parsed using official `gid://shopify/TaxonomyCategory/... : path` format. If release download is blocked, fall back to official repository raw text. Google official taxonomy path/id downloaded separately. Partial list availability supported.
- Google SEO Suggestions editor appears once per distinct uploaded Helper Category Type. Each category has its own editable query, Fetch, suggestion selection, and Apply; saved in `thriftops_category_keywords_v13`. Selected keyword affects SEO descriptions of products within that category in both store CSVs using distinct templates. Category-specific manual SEO edits still take precedence.
- No automatic taxonomy guessing. Strict unmapped export blocking remains.
- Deploy complete project under Cloudflare Pages Functions; ensure `/api/taxonomies` and `/api/suggest` routes exist.
