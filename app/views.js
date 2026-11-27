// HTML for every page, built from the deal data. Every value is escaped
// before it goes into the page, so a deal's text can never break the markup.

export const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const usd = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const savings = (d) => Math.round((d.was - d.price) * 100) / 100;

// Deal score 0-100: mostly the discount, partly the dollars saved, so a
// $1,100 saving on a treadmill can outrank a cheap 80%-off comforter.
export const dealScore = (d) =>
  Math.round(0.65 * percentOff(d) + 0.35 * Math.min(savings(d) / 400, 1) * 100);

export const VERDICTS = {
  "new-low": { label: "New low", hint: "Lowest price reported for this listing" },
  strong: { label: "Strong price", hint: "A big, well-evidenced cut" },
  solid: { label: "Solid deal", hint: "A worthwhile cut" },
  routine: { label: "Routine sale", hint: "A small cut from list price" },
};

const checkLine = (d) =>
  `Checked ${escape(d.checkedLabel || "27 Nov 2026, 13:30 WIB")} · ${escape(d.source)}`;

export function dealCard(d) {
  const v = VERDICTS[d.verdict];
  return `<article class="card" data-id="${escape(d.id)}">
  <div class="card-top">
    <span class="store">${escape(d.store)}</span>
    <span class="cat">${escape(d.category)}</span>
    <span class="verdict v-${escape(d.verdict)}" title="${escape(v.hint)}">${escape(v.label)}</span>
  </div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h3>
  <div class="prices">
    <span class="price">${usd(d.price)}</span>
    <s class="was">${usd(d.was)}</s>
    <span class="off">-${percentOff(d)}%</span>
  </div>
  <p class="save">You save ${usd(savings(d))} · Deal score ${dealScore(d)}/100</p>
  <p class="note">${escape(d.note)}</p>
  <p class="checked">${checkLine(d)}</p>
  <div class="card-actions">
    <a class="shop" href="${escape(d.url)}" rel="noopener" target="_blank">Shop at ${escape(d.store)} &rarr;</a>
    <a class="details" href="#/deal/${encodeURIComponent(d.id)}">Details</a>
  </div>
</article>`;
}

export function dealRows(deals) {
  if (deals.length === 0) {
    return `<p class="empty">No deal matches those filters. Clear the search or pick another category, store or discount.</p>`;
  }
  return `<div class="grid">${deals.map(dealCard).join("")}</div>`;
}

// The same product at two stores, side by side, with the cheaper one marked.
export function compareStrip(pairs) {
  if (pairs.length === 0) return "";
  const blocks = pairs
    .map(([a, b]) => {
      const cheap = a.price <= b.price ? a : b;
      const dear = cheap === a ? b : a;
      return `<section class="compare">
  <h2>Same product, two stores: ${escape(a.title)}</h2>
  <div class="compare-row">
    <div class="compare-cell ${cheap === a ? "winner" : ""}">
      <span class="store">${escape(a.store)}</span>
      <span class="price">${usd(a.price)}</span>
      <s>${usd(a.was)}</s>
      ${cheap === a ? `<span class="win-badge">Cheapest</span>` : ""}
      <a href="${escape(a.url)}" rel="noopener" target="_blank">Shop at ${escape(a.store)} &rarr;</a>
    </div>
    <div class="compare-vs">vs</div>
    <div class="compare-cell ${cheap === b ? "winner" : ""}">
      <span class="store">${escape(b.store)}</span>
      <span class="price">${usd(b.price)}</span>
      <s>${usd(b.was)}</s>
      ${cheap === b ? `<span class="win-badge">Cheapest</span>` : ""}
      <a href="${escape(b.url)}" rel="noopener" target="_blank">Shop at ${escape(b.store)} &rarr;</a>
    </div>
  </div>
  <p class="compare-note">${escape(cheap.store)} wins by ${usd(Math.round((dear.price - cheap.price) * 100) / 100)} on the same product.</p>
</section>`;
    })
    .join("");
  return `<div class="compare-wrap">${blocks}</div>`;
}

export function listPage({ shown, total, pairs }) {
  return `<section class="results-head">
  <h2>Showing ${shown.length} of ${total} deals</h2>
  <p>Sorted by deal score unless you pick another order. Every price was checked today, 27 Nov 2026, and each card says where it was read.</p>
</section>
${dealRows(shown)}
${compareStrip(pairs)}`;
}

export function dealPage(d, other) {
  const v = VERDICTS[d.verdict];
  const same = other
    ? `<section class="compare">
  <h2>Same product at ${escape(other.store)}</h2>
  <p>${escape(other.store)} lists it at <strong>${usd(other.price)}</strong> (usually ${usd(other.was)}), ${usd(Math.round(Math.abs(other.price - d.price) * 100) / 100)} ${other.price > d.price ? "more" : "less"} than here. <a href="${escape(other.url)}" rel="noopener" target="_blank">See it at ${escape(other.store)} &rarr;</a></p>
</section>`
    : "";
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <div class="card-top">
    <span class="store">${escape(d.store)}</span>
    <span class="cat">${escape(d.category)}</span>
    <span class="verdict v-${escape(d.verdict)}" title="${escape(v.hint)}">${escape(v.label)}</span>
  </div>
  <h1>${escape(d.title)}</h1>
  <div class="prices big">
    <span class="price">${usd(d.price)}</span>
    <s class="was">${usd(d.was)}</s>
    <span class="off">-${percentOff(d)}%</span>
  </div>
  <p class="save">You save ${usd(savings(d))} · Deal score ${dealScore(d)}/100</p>
  <dl class="facts">
    <div><dt>Store</dt><dd>${escape(d.store)}</dd></div>
    <div><dt>Category</dt><dd>${escape(d.category)}</dd></div>
    <div><dt>Sale price</dt><dd>${usd(d.price)}</dd></div>
    <div><dt>Usual price</dt><dd>${usd(d.was)}</dd></div>
    <div><dt>Discount</dt><dd>${percentOff(d)}% off, ${usd(savings(d))} saved</dd></div>
    <div><dt>Verdict</dt><dd><strong>${escape(v.label)}</strong> — ${escape(v.hint)}. ${escape(d.note)}</dd></div>
    <div><dt>Price checked</dt><dd>27 Nov 2026, 13:30 WIB</dd></div>
    <div><dt>Read in</dt><dd>${escape(d.source)}</dd></div>
  </dl>
  <p><a class="shop big-shop" href="${escape(d.url)}" rel="noopener" target="_blank">Shop at ${escape(d.store)} &rarr;</a></p>
  <p class="fine">Prices can change or sell out. The link opens the product search at ${escape(d.store)} so you can see the live price before you buy.</p>
</article>
${same}`;
}

export function missingPage() {
  return `<h1>Deal not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
