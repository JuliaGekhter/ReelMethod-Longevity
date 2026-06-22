/* Shape The Wave Longevity™ — Membership Browser
 * Loads plan data and powers search / filter / sort / price controls.
 * Data is fetched from data/memberships.json when served over http,
 * and falls back to the inlined FALLBACK_PLANS when opened via file://.
 */

const FALLBACK_PLANS = [
  { source: "Original", name: "VIP Aesthetic Elite", price: 749, recurrence: "Monthly", discount: null, annualizedPrice: 8988, benefits: "Botox (40u) monthly, full facial, IV therapy, 1 Morpheus Mini every 2 months" },
  { source: "Original", name: "VIP Wellness Platinum", price: 799, recurrence: "Monthly", discount: null, annualizedPrice: 9588, benefits: "Tirzepatide, BHRT, IV therapy, consult, labs, priority scheduling" },
  { source: "Original", name: "VIP All-Inclusive", price: 999, recurrence: "Monthly", discount: null, annualizedPrice: 11988, benefits: "All from Total Transformation + 1 Morpheus8 Premium per month + extras" },
  { source: "Original", name: "Essential Wellness", price: 114, recurrence: "Monthly", discount: null, annualizedPrice: 1368, benefits: "1 Lipo or B12 shot, Tanita scan, lifestyle consult (with basic lab)" },
  { source: "Original", name: "Hormone Optimization", price: 299, recurrence: "Monthly", discount: null, annualizedPrice: 3588, benefits: "TRT or BHRT cream/injection, labs, consults" },
  { source: "Original", name: "Weight Loss & Peptide Plan", price: 399, recurrence: "Monthly", discount: null, annualizedPrice: 4788, benefits: "Tirzepatide or Sermorelin, supplies, labs" },
  { source: "Original", name: "Aesthetic Glow Plan", price: 349, recurrence: "Monthly", discount: null, annualizedPrice: 4188, benefits: "Botox (20 units) OR signature facial" },
  { source: "Original", name: "Total Transformation Plan", price: 549, recurrence: "Monthly", discount: null, annualizedPrice: 6588, benefits: "Morpheus8, peptide, Botox, Lipo, labs, facial (>$1200 value)" },
  { source: "Original", name: "Peptide Performance Plan", price: 399, recurrence: "Monthly", discount: null, annualizedPrice: 4788, benefits: "Tirzepatide/Sermorelin Rx, injections, consult" },
  { source: "Original", name: "Total Transformation Bundle", price: 649, recurrence: "Monthly", discount: null, annualizedPrice: 7788, benefits: "Peptide Rx + Botox + Lipo + labs + facial" },
  { source: "Original", name: "Youth & Longevity Club", price: 749, recurrence: "Quarterly", discount: null, annualizedPrice: 2996, benefits: "Sermorelin, skin treatment, supplement credit" },
  { source: "Original", name: "Couples Vitality Membership", price: 998, recurrence: "Monthly", discount: null, annualizedPrice: 11976, benefits: "2x BHRT + injections + labs" },
  { source: "Original", name: "Supplement Subscription", price: 149, recurrence: "Monthly", discount: null, annualizedPrice: 1788, benefits: "3 supplements shipped monthly" },
  { source: "New (6/19)", name: "Mental Health Membership", price: 249, recurrence: "Monthly", discount: null, annualizedPrice: 2988, benefits: "Counseling/therapy (2x/mo), psychiatric consult, medication management" },
  { source: "New (6/19)", name: "Total Wellness Membership", price: 499, recurrence: "Monthly", discount: null, annualizedPrice: 5988, benefits: "Hormones + GLP-1 + IV Therapy + Labs (2x/yr)" },
  { source: "New (6/19)", name: "Beauty & Boost Bundle", price: 349, recurrence: "Monthly", discount: null, annualizedPrice: 4188, benefits: "Morpheus8 (quarterly), Botox (quarterly), IV Therapy (monthly)" },
  { source: "New (6/19)", name: "Longevity Essentials", price: 299, recurrence: "Monthly", discount: null, annualizedPrice: 3588, benefits: "Labs (2x/yr), HRT or Weight Loss, Monthly Check-in" },
  { source: "New (6/19)", name: "Mental & Physical Reset Plan", price: 399, recurrence: "Monthly", discount: null, annualizedPrice: 4788, benefits: "Counseling (2x/mo), Semaglutide, IV Therapy" },
  { source: "New (6/19)", name: "Shape the Wave Monthly", price: 495, recurrence: "Monthly", discount: null, annualizedPrice: 5940, benefits: "Personalized Coaching Support twice a month, Labs quarterly and service discounts" },
  { source: "New (6/19)", name: "Shape the Wave Quarterly", price: 393, recurrence: "Quarterly", discount: "5%", annualizedPrice: 1410.75, benefits: "Personalized Coaching Support twice a month, Labs quarterly and service discounts" },
  { source: "New (6/19)", name: "Shape the Wave Annual", price: 1495, recurrence: "Annual", discount: "10%", annualizedPrice: 5940, benefits: "Personalized Coaching Support twice a month, Labs quarterly and service discounts" }
];

const els = {
  grid: document.getElementById("grid"),
  summary: document.getElementById("summary"),
  empty: document.getElementById("empty"),
  search: document.getElementById("search"),
  recurrence: document.getElementById("recurrence"),
  source: document.getElementById("source"),
  sort: document.getElementById("sort"),
  maxPrice: document.getElementById("maxPrice"),
  maxPriceOut: document.getElementById("maxPriceOut"),
};

let allPlans = [];

const usd = (n) =>
  n == null ? "—" : "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

const FEATURED_PLAN = "Shape the Wave Monthly";

function cardHtml(plan) {
  const isNew = plan.source && plan.source.startsWith("New");
  const isFeatured = plan.name === FEATURED_PLAN;
  const cadence = plan.recurrence ? `/ ${plan.recurrence.toLowerCase()}` : "";
  const discount = plan.discount
    ? `<span class="discount">${escapeHtml(plan.discount)} off</span>`
    : "";
  const benefits = plan.benefits
    ? `<p class="benefits">${escapeHtml(plan.benefits)}</p>`
    : `<p class="benefits empty-benefit">Benefits to be finalized.</p>`;
  const annual =
    plan.annualizedPrice != null
      ? `<div class="annualized">≈ ${usd(plan.annualizedPrice)} / year</div>`
      : "";

  return `
    <article class="card${isFeatured ? " featured" : ""}">
      ${isFeatured ? `<span class="popular-tag">★ Most popular</span>` : ""}
      <div class="card-top">
        <h2>${escapeHtml(plan.name)}</h2>
        <span class="badge ${isNew ? "new" : ""}">${isNew ? "New" : "Original"}</span>
      </div>
      <div class="price-row">
        <span class="price">${usd(plan.price)}</span>
        <span class="cadence">${cadence}</span>
        ${discount}
      </div>
      ${benefits}
      ${annual}
    </article>`;
}

function applyFilters() {
  const q = els.search.value.trim().toLowerCase();
  const rec = els.recurrence.value;
  const src = els.source.value;
  const maxPrice = Number(els.maxPrice.value);

  let plans = allPlans.filter((p) => {
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.benefits && p.benefits.toLowerCase().includes(q));
    const matchesRec = !rec || p.recurrence === rec;
    const matchesSrc = !src || p.source === src;
    const matchesPrice = p.price <= maxPrice;
    return matchesQuery && matchesRec && matchesSrc && matchesPrice;
  });

  switch (els.sort.value) {
    case "price-desc":
      plans.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      plans.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      plans.sort((a, b) => a.price - b.price);
  }

  render(plans);
}

function render(plans) {
  els.grid.innerHTML = plans.map(cardHtml).join("");
  els.empty.hidden = plans.length > 0;

  if (plans.length) {
    const prices = plans.map((p) => p.price);
    els.summary.innerHTML =
      `Showing <strong>${plans.length}</strong> of <strong>${allPlans.length}</strong> plans · ` +
      `from <strong>${usd(Math.min(...prices))}</strong> to <strong>${usd(Math.max(...prices))}</strong>`;
  } else {
    els.summary.textContent = "";
  }
}

function wireControls() {
  let t;
  els.search.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(applyFilters, 150);
  });
  els.recurrence.addEventListener("change", applyFilters);
  els.source.addEventListener("change", applyFilters);
  els.sort.addEventListener("change", applyFilters);
  els.maxPrice.addEventListener("input", () => {
    els.maxPriceOut.textContent = usd(Number(els.maxPrice.value));
    applyFilters();
  });
}

async function loadPlans() {
  try {
    const res = await fetch("data/memberships.json", { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return data.plans;
  } catch (_) {
    // Opened via file:// or fetch blocked — use the inlined copy.
    return FALLBACK_PLANS;
  }
}

async function init() {
  allPlans = await loadPlans();
  const maxP = Math.max(...allPlans.map((p) => p.price));
  els.maxPrice.max = String(maxP);
  els.maxPrice.value = String(maxP);
  els.maxPriceOut.textContent = usd(maxP);
  wireControls();
  applyFilters();
}

init();
