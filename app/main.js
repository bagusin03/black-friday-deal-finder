// Deal Beacon: renders the list and deal pages, wires the search box and
// filters, and keeps the URL hash in sync with the controls.
//
//   #/            the deal list, with search and filters
//   #/deal/<id>   one deal, with its evidence and its same-store comparison
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { CHECKED_LABEL, deals } from "./data.js";
import { dealPage, listPage, missingPage } from "./views.js";
import {
  SORTS,
  applyFilters,
  findPairs,
  optionList,
  pairMate,
  readState,
  sortDeals,
  stateHash,
} from "./filters.js";

const app = document.getElementById("app");
const controls = document.getElementById("controls");

const categories = [...new Set(deals.map((d) => d.category))].sort();
const stores = [...new Set(deals.map((d) => d.store))].sort();
const verdicts = [
  ["new-low", "New low"],
  ["strong", "Strong price"],
  ["solid", "Solid deal"],
  ["routine", "Routine sale"],
];

function renderControls(state) {
  controls.innerHTML = `<div class="control-row">
  <label class="search-label">Search
    <input id="q" type="search" placeholder="Try “Dyson”, “TV” or “Kohl's”" value="${state.q.replace(/"/g, "&quot;")}">
  </label>
  <label>Category
    <select id="cat">${optionList(categories, state.cat, "All categories")}</select>
  </label>
  <label>Store
    <select id="store">${optionList(stores, state.store, "All stores")}</select>
  </label>
  <label>Discount
    <select id="min">
      <option value="0"${state.min === 0 ? " selected" : ""}>Any discount</option>
      <option value="30"${state.min === 30 ? " selected" : ""}>30% off or more</option>
      <option value="50"${state.min === 50 ? " selected" : ""}>50% off or more</option>
    </select>
  </label>
  <label>Verdict
    <select id="verdict">${optionList(
      verdicts.map(([v]) => v),
      state.verdict,
      "Any verdict",
    )}</select>
  </label>
  <label>Sort
    <select id="sort">${Object.entries(SORTS)
      .map(([v, label]) => `<option value="${v}"${v === state.sort ? " selected" : ""}>${label}</option>`)
      .join("")}</select>
  </label>
  <button id="clear" type="button">Clear filters</button>
</div>
<p class="control-note">All ${deals.length} prices checked ${CHECKED_LABEL} · ${stores.length} stores · ${categories.length} categories. Discounts are the difference of the two prices on each card.</p>`;

  const read = () => ({
    q: controls.querySelector("#q").value,
    cat: controls.querySelector("#cat").value,
    store: controls.querySelector("#store").value,
    min: Number(controls.querySelector("#min").value),
    verdict: controls.querySelector("#verdict").value,
    sort: controls.querySelector("#sort").value,
  });

  controls.querySelector("#q").addEventListener("input", () => {
    location.hash = stateHash(read());
  });
  for (const id of ["cat", "store", "min", "verdict", "sort"]) {
    controls.querySelector(`#${id}`).addEventListener("change", () => {
      location.hash = stateHash(read());
    });
  }
  controls.querySelector("#clear").addEventListener("click", () => {
    location.hash = "#/";
  });
}

function render() {
  window.__shotReady = false;
  const state = readState();
  if (state.route === "deal") {
    const found = deals.find((d) => d.id === state.id);
    document.title = `${found ? found.title : "Not found"} | Deal Beacon`;
    controls.innerHTML = "";
    app.innerHTML = found ? dealPage(found, pairMate(deals, found)) : missingPage();
  } else {
    document.title = "Deal Beacon — Black Friday 2026 deal finder";
    renderControls(state);
    const shown = sortDeals(applyFilters(deals, state), state.sort);
    app.innerHTML = listPage({ shown, total: deals.length, pairs: findPairs(shown) });
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
