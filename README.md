# ThriftOps Shopify CSV Builder

Serverless browser application for converting Raw Input + optional ThriftOps Intelligence + Google Sheet Helper rules into Shopify product CSV.

## Deploy to Cloudflare Pages

1. Create new Cloudflare Pages project.
2. Upload `index.html` or connect this folder through GitHub.
3. No build command required.
4. Output directory: `/`.

## Rules

- Raw Input required; ThriftOps optional.
- Numeric Raw Input Price has priority.
- If Raw price missing/non-numeric, ThriftOps Suggested Price is used.
- Tier/Condition minimums enforced for suggested pricing.
- UNKNOWN/CUT LABEL defaults Tier 2 when AI Tier unavailable.
- Increase first, round upward to Rs.50.
- Discount second, round upward to Rs.50.
- Discount > 0: pre-discount increased price becomes Compare At Price.
- Longest SKU prefix match wins.
- Studio image: `[SKU]_studio.jpg`; original image: `[SKU]_original.jpg`.

## Note

App tries live public Google Sheet CSV first. If browser/CORS/network blocks it, upload `Helper.xlsx` in Helper Rules input.

## Rule updates
- Google Helper category heading: `Category Types` (legacy `New Types` also accepted).
- Description always shows Helper `Category Types` as first Type, even when ThriftOps is uploaded.
- Tags include current date (`DD-Mmm-YY`), `Sheet1`, Supplier, Helper Season, Helper RK Type, and Wholesaler.
- Default Supplier: `Rashid`; default Wholesaler: `Waheed` when Raw Input values are blank.
- `Season (product.metafields.custom.season)` comes from Helper Season.
- `RK_Type (product.metafields.custom.rk_type)` comes from Helper RK Type.

## v6 fixes
- Shopify Type and first description Type use Helper Category Types, matched by exact SKU prefix before hyphen.
- ThriftOps AI Type used only in AI description and title when present; otherwise title is Brand (SKU).
- Unmatched SKU prefix shows red UNMAPPED SKU CODE in preview and ERROR status; no inferred Type.


## v7: Live Google Sheet sync
Deploy full folder to Cloudflare Pages **using Git integration or Wrangler** so `functions/api/helper.js` runs as Pages Function. Static drag-and-drop HTML alone does NOT deploy function routes.

Commands (from project directory):
```sh
npx wrangler pages deploy . --project-name thriftops-shopify-builder
```

The app calls same-origin `/api/helper`, which fetches the published Google Sheet as CSV, parses duplicate headers, validates Code/Category Types, and returns JSON. Refresh Google Sheet Rules reloads latest values. On error, Helper.xlsx upload remains fallback.

Test: `https://YOUR-PAGES-DOMAIN/api/helper` should return JSON containing `rows`. If 404 or HTML, Pages Function was not deployed. Public Google Sheet must remain published to web.
