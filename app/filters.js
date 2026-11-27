// Search, filter and sort state. The state lives in the URL hash so a
// filtered view can be linked and screenshotted: #/?q=dyson&cat=Kitchen
// &store=Amazon&min=50&verdict=strong&sort=discount, or #/deal/<id>.
import { dealScore, percentOff } from "./views.js";

export const SORTS = {
  score: "Best deal first",
  discount: "Biggest discount",
  saving: "Biggest saving",
  price: "Lowest price",
  name: "Name A–Z",
};

export function readState() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  return {
    route: path.startsWith("deal/") ? "deal" : "list",
    id: path.startsWith("deal/") ? decodeURIComponent(path.slice(5)) : null,
    q: params.get("q") || "",
    cat: params.get("cat") || "",
    store: params.get("store") || "",
    min: Number(params.get("min") || 0),
    verdict: params.get("verdict") || "",
    sort: SORTS[params.get("sort")] ? params.get("sort") : "score",
  };
}

export function stateHash(state) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.cat) params.set("cat", state.cat);
  if (state.store) params.set("store", state.store);
  if (state.min) params.set("min", String(state.min));
  if (state.verdict) params.set("verdict", state.verdict);
  if (state.sort && state.sort !== "score") params.set("sort", state.sort);
  const query = params.toString();
  return `#/${query ? "?" + query : ""}`;
}

export function applyFilters(deals, state) {
  const q = state.q.trim().toLowerCase();
  return deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category} ${d.note}`.toLowerCase().includes(q)) return false;
    if (state.cat && d.category !== state.cat) return false;
    if (state.store && d.store !== state.store) return false;
    if (state.min && percentOff(d) < state.min) return false;
    if (state.verdict && d.verdict !== state.verdict) return false;
    return true;
  });
}

export function sortDeals(deals, sort) {
  const list = [...deals];
  if (sort === "discount") list.sort((a, b) => percentOff(b) - percentOff(a) || b.was - b.price - (a.was - a.price));
  else if (sort === "saving") list.sort((a, b) => (b.was - b.price) - (a.was - a.price));
  else if (sort === "price") list.sort((a, b) => a.price - b.price);
  else if (sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
  else list.sort((a, b) => dealScore(b) - dealScore(a) || percentOff(b) - percentOff(a));
  return list;
}

// Group deals that share a "pair" key: the same product at two stores.
export function findPairs(deals) {
  const byKey = new Map();
  for (const d of deals) {
    if (!d.pair) continue;
    if (!byKey.has(d.pair)) byKey.set(d.pair, []);
    byKey.get(d.pair).push(d);
  }
  return [...byKey.values()].filter((group) => group.length === 2);
}

export function pairMate(deals, deal) {
  if (!deal.pair) return null;
  return deals.find((d) => d.pair === deal.pair && d.id !== deal.id) || null;
}

export function optionList(values, current, allLabel) {
  const all = `<option value="">${allLabel}</option>`;
  return all + values.map((v) => `<option value="${v}"${v === current ? " selected" : ""}>${v}</option>`).join("");
}
