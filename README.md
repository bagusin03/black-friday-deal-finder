# Deal Beacon — Black Friday 2026 deal finder

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/bagusin03/black-friday-deal-finder/rank.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/bagusin03/black-friday-deal-finder/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)

Deal Beacon is a static Black Friday deal finder: **50 real deals from 14 stores in 16 categories**, every price checked on Black Friday itself, 27 November 2026, and read from a deals source that names the store.

## What it does

- **Deal list** (`#/`): dense cards, each with the product, store, sale price, usual price, discount, dollars saved, a deal score, an honest verdict (New low / Strong price / Solid deal / Routine sale) with the evidence behind it, the time the price was checked, the source it was read in, and a link to the product at its store.
- **Search and filters that work**: free-text search, plus filters by category, store, discount (30%+ / 50%+) and verdict, and sorting by deal score, biggest discount, biggest saving, lowest price or name. The state lives in the URL hash, so a filtered view can be linked.
- **Same product, two stores**: AirPods Pro 3 (Amazon $149 vs Best Buy $179.99) and the KitchenAid Artisan 5-Qt (Amazon $349.00 vs Belk $349.99) are compared side by side, with the cheaper store marked.
- **Deal pages** (`#/deal/<id>`): the full evidence for one deal — both prices, the discount, the verdict and its reasoning, the check time and source, plus the same product at the other store where one exists.
- **Phone layout**: the grid collapses to one column and the filters stack, tested at 390×844.

## How the prices were checked

Every deal was read on 27 November 2026 from a deals source that names the store: CNN Underscored, TechSpot, Popular Science, RedmondPie, Hunt4Freebies, USA Today, FullCleared, or Nintendo's own holiday announcement. The source is printed on each card and on each deal page. The discount is always the difference of the two prices shown. Where a "was" price is only a list price and the street price was lower, the card says so.

## Running it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

No build step, no network requests: `app/` is plain HTML, CSS and ES modules, and the deals live in `app/data.js`.

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from the vendored `vendor/makefun-frontend.ts`.

Entry for the [make.fun Black Friday deal finder bounty](https://make.fun/c/black-friday-deal-finder-01).
