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
  // Compare
  tray: document.getElementById("compareTray"),
  compareCount: document.getElementById("compareCount"),
  compareChips: document.getElementById("compareChips"),
  compareClear: document.getElementById("compareClear"),
  compareOpen: document.getElementById("compareOpen"),
  compareModal: document.getElementById("compareModal"),
  compareClose: document.getElementById("compareClose"),
  compareTableWrap: document.getElementById("compareTableWrap"),
  // Theme + contact
  themeToggle: document.getElementById("themeToggle"),
  contactForm: document.getElementById("contactForm"),
  contactPlan: document.getElementById("cPlan"),
};

const MAX_COMPARE = 3;
let allPlans = [];
const selected = new Set();

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

  const isSelected = selected.has(plan.name);
  const safeName = escapeHtml(plan.name);

  return `
    <article class="card${isFeatured ? " featured" : ""}${isSelected ? " selected" : ""}">
      ${isFeatured ? `<span class="popular-tag">★ Most popular</span>` : ""}
      <div class="card-top">
        <h2>${safeName}</h2>
        <span class="badge ${isNew ? "new" : ""}">${isNew ? "New" : "Original"}</span>
      </div>
      <div class="price-row">
        <span class="price">${usd(plan.price)}</span>
        <span class="cadence">${cadence}</span>
        ${discount}
      </div>
      ${benefits}
      ${annual}
      <label class="compare-select">
        <input type="checkbox" class="compare-check" data-name="${safeName}" ${isSelected ? "checked" : ""} />
        Compare
      </label>
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

/* ---------- Compare ---------- */
function planByName(name) {
  return allPlans.find((p) => p.name === name);
}

function toggleCompare(name, on) {
  if (on) {
    if (selected.size >= MAX_COMPARE && !selected.has(name)) {
      // Already at the limit — re-render to revert the stray checkbox.
      updateTray();
      applyFilters();
      return;
    }
    selected.add(name);
  } else {
    selected.delete(name);
  }
  updateTray();
  // Reflect the selected ring on cards without losing scroll position.
  els.grid.querySelectorAll(".card").forEach((card) => {
    const cb = card.querySelector(".compare-check");
    if (cb) card.classList.toggle("selected", selected.has(cb.dataset.name));
  });
}

function updateTray() {
  const n = selected.size;
  els.tray.hidden = n === 0;
  els.compareCount.textContent = `${n} selected`;
  els.compareOpen.disabled = n < 2;
  els.compareOpen.textContent = n < 2 ? "Pick 2+ to compare" : `Compare (${n})`;
  els.compareChips.innerHTML = [...selected]
    .map((name) => `<span class="compare-chip">${escapeHtml(name)}</span>`)
    .join("");
}

function renderCompareTable() {
  const plans = [...selected].map(planByName).filter(Boolean);
  const cols = plans
    .map((p) => `<th scope="col">${escapeHtml(p.name)}</th>`)
    .join("");
  const row = (label, fn) =>
    `<tr><th scope="row">${label}</th>${plans
      .map((p) => `<td>${fn(p)}</td>`)
      .join("")}</tr>`;

  els.compareTableWrap.innerHTML = `
    <table class="compare-table">
      <thead><tr><th scope="col"></th>${cols}</tr></thead>
      <tbody>
        ${row("Price", (p) => `<span class="c-price">${usd(p.price)}</span>`)}
        ${row("Billing", (p) => escapeHtml(p.recurrence || "—"))}
        ${row("Annualized", (p) => (p.annualizedPrice != null ? `${usd(p.annualizedPrice)} / yr` : "—"))}
        ${row("Discount", (p) => (p.discount ? escapeHtml(p.discount) + " off" : "—"))}
        ${row("Collection", (p) => escapeHtml(p.source))}
        ${row("Benefits", (p) => escapeHtml(p.benefits || "To be finalized"))}
      </tbody>
    </table>`;
}

function openCompareModal() {
  if (selected.size < 2) return;
  renderCompareTable();
  els.compareModal.hidden = false;
  document.body.style.overflow = "hidden";
  els.compareClose.focus();
}

function closeCompareModal() {
  els.compareModal.hidden = true;
  document.body.style.overflow = "";
}

function clearCompare() {
  selected.clear();
  updateTray();
  applyFilters();
}

function wireCompare() {
  els.grid.addEventListener("change", (e) => {
    const cb = e.target.closest(".compare-check");
    if (cb) toggleCompare(cb.dataset.name, cb.checked);
  });
  els.compareClear.addEventListener("click", clearCompare);
  els.compareOpen.addEventListener("click", openCompareModal);
  els.compareClose.addEventListener("click", closeCompareModal);
  els.compareModal.addEventListener("click", (e) => {
    if (e.target === els.compareModal) closeCompareModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.compareModal.hidden) closeCompareModal();
  });
}

/* ---------- Theme toggle ---------- */
function applyTheme(theme) {
  const isLight = theme === "light";
  document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  if (els.themeToggle) {
    els.themeToggle.setAttribute("aria-pressed", String(isLight));
    els.themeToggle.querySelector("span").textContent = isLight ? "☀️" : "🌙";
  }
}

function initTheme() {
  let saved;
  try {
    saved = localStorage.getItem("stw-theme");
  } catch (_) {
    saved = null;
  }
  const prefersLight =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(saved || (prefersLight ? "light" : "dark"));

  if (!els.themeToggle) return;
  els.themeToggle.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem("stw-theme", next);
    } catch (_) {
      /* storage unavailable — theme just won't persist */
    }
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  const reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => obs.observe(el));
}

/* ---------- Contact form ---------- */
const CONTACT_EMAIL = "hello@shapethewavelongevity.com";

function populateContactPlans() {
  if (!els.contactPlan) return;
  const names = allPlans.map((p) => p.name).sort((a, b) => a.localeCompare(b));
  els.contactPlan.insertAdjacentHTML(
    "beforeend",
    names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("")
  );
}

function setFieldError(input, message) {
  const field = input.closest(".field");
  const err = field ? field.querySelector(".error") : null;
  field && field.classList.toggle("invalid", Boolean(message));
  if (err) err.textContent = message || "";
}

function initContact() {
  const form = els.contactForm;
  if (!form) return;
  const note = document.getElementById("formNote");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;
    const plan = form.elements.plan;
    let ok = true;

    if (!name.value.trim()) {
      setFieldError(name, "Please enter your name.");
      ok = false;
    } else setFieldError(name, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setFieldError(email, "Please enter a valid email.");
      ok = false;
    } else setFieldError(email, "");

    if (!message.value.trim()) {
      setFieldError(message, "Tell us a little about your goals.");
      ok = false;
    } else setFieldError(message, "");

    if (!ok) return;

    const subject = `Membership inquiry from ${name.value.trim()}`;
    const bodyLines = [
      `Name: ${name.value.trim()}`,
      `Email: ${email.value.trim()}`,
      `Plan of interest: ${plan.value || "No preference yet"}`,
      "",
      message.value.trim(),
    ];
    const href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = href;

    if (note) {
      note.textContent = "Your email app should now be open with the details ready to send.";
      note.classList.add("success");
    }
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
  initTheme();
  initReveal();
  allPlans = await loadPlans();
  const maxP = Math.max(...allPlans.map((p) => p.price));
  els.maxPrice.max = String(maxP);
  els.maxPrice.value = String(maxP);
  els.maxPriceOut.textContent = usd(maxP);
  populateContactPlans();
  wireControls();
  wireCompare();
  initContact();
  updateTray();
  applyFilters();
}

init();
