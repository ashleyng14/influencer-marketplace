/* ============================================================
 * Collab — Influencer Marketplace prototype
 * Vanilla JS SPA. Light-gold, minimalist, Apple-style.
 * ============================================================ */

const app = document.getElementById("app");
const navLinks = document.getElementById("nav-links");
const modalRoot = document.getElementById("modal-root");

const state = {
  view: "landing",
  influencerFilter: "all",
  influencerSort: "rating",
  jobFilter: "all",
  reviewsByInfluencer: {},
};

/* ---------- Helpers ---------- */

function fmtFollowers(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "K";
  return String(n);
}
function money(n) { return "$" + n.toLocaleString("en-US"); }
function stars(rating) {
  const full = Math.round(rating);
  let out = "";
  for (let i = 0; i < 5; i++) out += i < full ? "★" : "☆";
  return out;
}

// Real brand logo rendered as a rounded chip (recognizable + consistent).
function platformChip(key, size = 26) {
  const p = PLATFORMS[key];
  if (!p) return "";
  const iconColor = key === "snapchat" ? "#1d1d1f" : "#ffffff";
  const icon = Math.round(size * 0.58);
  return `<span title="${p.label}" class="inline-flex items-center justify-center align-middle shrink-0" style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.28)}px;background:${p.color}">
    <svg viewBox="0 0 24 24" width="${icon}" height="${icon}" fill="${iconColor}" aria-hidden="true"><path d="${p.svg}"/></svg>
  </span>`;
}

// Brand logo rendered in a clean white rounded tile (handles wordmarks + icons).
function brandLogo(job, size = 44) {
  const radius = Math.round(size * 0.32);
  return `<span class="inline-flex items-center justify-center bg-white border border-gold-200/70 shrink-0 overflow-hidden" style="width:${size}px;height:${size}px;border-radius:${radius}px">
    <img src="${job.logo}" alt="${job.brand} logo" class="object-contain" style="max-width:${Math.round(size * 0.72)}px;max-height:${Math.round(size * 0.72)}px" />
  </span>`;
}

function allReviews(inf) {
  return [...(state.reviewsByInfluencer[inf.id] || []), ...inf.reviews];
}
function liveRating(inf) {
  const reviews = allReviews(inf);
  if (!reviews.length) return { rating: 0, count: 0 };
  return { rating: reviews.reduce((a, r) => a + r.rating, 0) / reviews.length, count: reviews.length };
}
function totalReach(inf) { return Object.values(inf.platforms).reduce((a, p) => a + p.followers, 0); }
function minPrice(inf) { return Math.min(...inf.offers.map(o => o.price)); }

/* ---------- Scroll reveal ---------- */

let revealObserver;
function initReveal() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
}

/* ---------- Router ---------- */

function navigate(view) {
  state.view = view;
  closeModal();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function render() {
  renderNav();
  switch (state.view) {
    case "influencer": app.innerHTML = InfluencerView(); break;
    case "business": app.innerHTML = BusinessView(); break;
    default: app.innerHTML = LandingView();
  }
  initReveal();
}
function renderNav() {
  if (state.view === "landing") { navLinks.innerHTML = ""; return; }
  const tabs = [
    { key: "influencer", label: "Find work" },
    { key: "business", label: "Find creators" },
  ];
  navLinks.innerHTML = tabs.map(t => `
    <button onclick="navigate('${t.key}')"
      class="px-3.5 py-1.5 rounded-full transition ${state.view === t.key ? "bg-gold-100 text-gold-800" : "hover:text-ink"}">
      ${t.label}
    </button>`).join("");
}

/* ============================================================
 * LANDING
 * ============================================================ */

function LandingView() {
  const platformOrder = ["instagram", "tiktok", "youtube", "facebook", "snapchat", "twitter"];
  const strip = platformOrder.map(k => `
    <div class="flex items-center gap-3 px-8 shrink-0">
      ${platformChip(k, 30)}
      <span class="text-sm font-medium text-ink-soft">${PLATFORMS[k].label}</span>
    </div>`).join("");

  return `
  <!-- HERO -->
  <section class="relative overflow-hidden">
    <div class="hero-glow absolute inset-0 -z-10"></div>
    <div class="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
      <p class="reveal text-xs font-semibold tracking-[0.2em] uppercase text-gold-700">Collab</p>
      <h1 class="reveal font-display text-5xl md:text-7xl leading-[1.04] tracking-tight mt-5" data-delay="1">
        Where brands and<br><span class="gold-text">creators</span> come together.
      </h1>
      <p class="reveal text-lg md:text-xl text-ink-soft max-w-2xl mx-auto mt-7 font-light" data-delay="2">
        A refined marketplace for influencer collaborations. Transparent pricing,
        package offers across every platform, and reviews you can trust.
      </p>
      <div class="reveal flex items-center justify-center gap-3 mt-10" data-delay="3">
        <button onclick="navigate('influencer')" class="rounded-full bg-ink text-white text-sm font-medium px-6 py-3 hover:bg-black transition">I'm a creator</button>
        <button onclick="navigate('business')" class="rounded-full bg-white border border-gold-300 text-ink text-sm font-medium px-6 py-3 hover:border-gold-500 transition">I'm a business</button>
      </div>
    </div>

    <!-- Platform marquee -->
    <div class="reveal relative w-full overflow-hidden py-8 border-y border-gold-200/60 bg-white/40" data-delay="4">
      <div class="flex w-max marquee">
        ${strip}${strip}
      </div>
    </div>
  </section>

  <!-- ROLE SPLIT -->
  <section class="max-w-6xl mx-auto px-6 py-24">
    <div class="grid md:grid-cols-2 gap-6">
      <button onclick="navigate('influencer')" class="reveal card-hover group text-left rounded-3xl bg-white border border-gold-200/70 p-10 overflow-hidden relative">
        <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-100/70 blur-2xl"></div>
        <span class="font-display text-2xl text-gold-700">01</span>
        <h2 class="font-display text-3xl mt-4">For creators</h2>
        <p class="text-ink-soft mt-3 font-light">Browse open campaigns from brands, filtered to your audience and platforms. Apply in a tap.</p>
        <span class="inline-flex items-center gap-2 mt-8 text-sm font-medium text-gold-800 group-hover:gap-3 transition-all">See available work →</span>
      </button>
      <button onclick="navigate('business')" class="reveal card-hover group text-left rounded-3xl bg-white border border-gold-200/70 p-10 overflow-hidden relative" data-delay="1">
        <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-100/70 blur-2xl"></div>
        <span class="font-display text-2xl text-gold-700">02</span>
        <h2 class="font-display text-3xl mt-4">For businesses</h2>
        <p class="text-ink-soft mt-3 font-light">Discover creators across every platform with clear pricing, package offers, and verified reviews.</p>
        <span class="inline-flex items-center gap-2 mt-8 text-sm font-medium text-gold-800 group-hover:gap-3 transition-all">Browse creators →</span>
      </button>
    </div>
  </section>

  <!-- FEATURE STRIP -->
  <section class="max-w-6xl mx-auto px-6 pb-24">
    <div class="grid md:grid-cols-3 gap-10">
      ${[
        { t: "Every platform", d: "Instagram, TikTok, YouTube, Facebook, Snapchat and X — all in one place." },
        { t: "Transparent pricing", d: "Per-deliverable pricing for stories, reels, shorts and more. No guesswork." },
        { t: "Reviews you trust", d: "Ratings and written feedback from other businesses on every collaboration." },
      ].map((f, i) => `
        <div class="reveal" data-delay="${i + 1}">
          <div class="h-px w-12 bg-gold-400 mb-5"></div>
          <h3 class="font-display text-2xl">${f.t}</h3>
          <p class="text-ink-soft mt-2 font-light">${f.d}</p>
        </div>`).join("")}
    </div>
  </section>

  <!-- BIG STATEMENT -->
  <section class="max-w-4xl mx-auto px-6 py-28 text-center">
    <h2 class="reveal font-display text-4xl md:text-5xl leading-tight tracking-tight">
      Beautifully simple.<br><span class="gold-text">Refined to the detail.</span>
    </h2>
    <p class="reveal text-lg text-ink-soft mt-6 font-light max-w-xl mx-auto" data-delay="1">
      Choose your role to step inside the marketplace.
    </p>
    <div class="reveal flex items-center justify-center gap-3 mt-9" data-delay="2">
      <button onclick="navigate('influencer')" class="rounded-full bg-ink text-white text-sm font-medium px-6 py-3 hover:bg-black transition">Find work</button>
      <button onclick="navigate('business')" class="rounded-full bg-white border border-gold-300 text-ink text-sm font-medium px-6 py-3 hover:border-gold-500 transition">Find creators</button>
    </div>
  </section>`;
}

/* ============================================================
 * INFLUENCER VIEW — open campaigns
 * ============================================================ */

function InfluencerView() {
  const categories = ["all", ...new Set(JOBS.map(j => j.category))];
  const jobs = state.jobFilter === "all" ? JOBS : JOBS.filter(j => j.category === state.jobFilter);
  return `
  <section class="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
    <p class="reveal text-xs font-semibold tracking-[0.2em] uppercase text-gold-700">For creators</p>
    <h1 class="reveal font-display text-4xl md:text-5xl tracking-tight mt-4" data-delay="1">Open campaigns</h1>
    <p class="reveal text-ink-soft mt-4 font-light max-w-xl mx-auto" data-delay="2">Collaborations with leading UAE brands, matched to your audience and platforms.</p>
    <div class="reveal flex flex-wrap justify-center gap-2 mt-8" data-delay="3">
      ${categories.map(c => `
        <button onclick="setJobFilter('${c}')"
          class="px-4 py-1.5 rounded-full text-sm transition border ${state.jobFilter === c ? "bg-ink text-white border-ink" : "bg-white text-ink-soft border-gold-200 hover:border-gold-400"}">
          ${c === "all" ? "All" : c}
        </button>`).join("")}
    </div>
  </section>
  <section class="max-w-6xl mx-auto px-6 pb-24">
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      ${jobs.map((j, i) => JobCard(j, i)).join("")}
    </div>
  </section>`;
}
function setJobFilter(c) { state.jobFilter = c; render(); }

function JobCard(job, i) {
  const daysLeft = Math.max(0, Math.ceil((new Date(job.deadline) - new Date()) / 86400000));
  return `
  <div class="reveal card-hover rounded-3xl bg-white border border-gold-200/70 p-7 flex flex-col" data-delay="${(i % 3) + 1}">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        ${brandLogo(job, 44)}
        <div>
          <p class="font-semibold leading-tight">${job.brand}</p>
          <p class="text-xs text-ink-faint">${job.category}</p>
        </div>
      </div>
      <span class="rounded-full bg-gold-50 text-gold-800 text-xs font-medium px-2.5 py-1 border border-gold-200/70">${daysLeft}d left</span>
    </div>
    <h3 class="font-display text-xl leading-snug mt-5">${job.title}</h3>
    <p class="text-sm text-ink-soft mt-2 font-light">${job.description}</p>
    <div class="flex items-center gap-1.5 mt-4">${job.platforms.map(k => platformChip(k, 24)).join("")}</div>
    <div class="mt-4 space-y-1.5 text-sm text-ink-soft font-light">
      <div class="flex items-center gap-2">📦 ${job.deliverables.join(", ")}</div>
      <div class="flex items-center gap-2">👥 Min ${fmtFollowers(job.minFollowers)} followers</div>
      <div class="flex items-center gap-2">📍 ${job.location}</div>
    </div>
    <div class="mt-6 pt-5 border-t border-gold-100 flex items-center justify-between">
      <div>
        <p class="text-xs text-ink-faint">Budget</p>
        <p class="font-semibold text-gold-800">${money(job.budgetMin)}–${money(job.budgetMax)}</p>
      </div>
      <button onclick="openApply('${job.id}')"
        class="rounded-full bg-ink text-white text-sm font-medium px-5 py-2.5 hover:bg-black transition">Submit portfolio</button>
    </div>
  </div>`;
}

/* ---------- Portfolio submission (creator applies to a campaign) ---------- */

function openApply(jobId) {
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return;
  const platformOpts = job.platforms
    .map(k => `<label class="flex items-center gap-2 text-sm">
        <input type="checkbox" class="apply-platform accent-gold-600" value="${k}" />
        <span class="inline-flex items-center gap-1.5">${platformChip(k, 18)}${PLATFORMS[k].label}</span>
      </label>`).join("");

  modalRoot.innerHTML = `
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 backdrop-blur-md p-4" onclick="if(event.target===this) closeModal()">
    <div class="relative w-full max-w-xl my-8 rounded-[28px] bg-canvas shadow-2xl reveal in">
      <button onclick="closeModal()" class="absolute right-4 top-4 z-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-ink-soft shadow">✕</button>
      <div class="px-8 pt-8 pb-8">
        <div class="flex items-center gap-3">
          ${brandLogo(job, 44)}
          <div>
            <p class="text-xs text-ink-faint">Submit portfolio to</p>
            <h2 class="font-display text-2xl leading-tight">${job.brand}</h2>
          </div>
        </div>
        <p class="text-sm text-ink-soft mt-3 font-light">${job.title}</p>

        <div id="apply-form" class="mt-6 space-y-3">
          <div class="grid sm:grid-cols-2 gap-3">
            <input id="apply-name" type="text" placeholder="Your name"
              class="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300" />
            <input id="apply-handle" type="text" placeholder="Primary handle (e.g. @yourname)"
              class="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300" />
          </div>
          <input id="apply-portfolio" type="url" placeholder="Portfolio or media-kit link"
            class="w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300" />
          <div>
            <p class="text-xs text-ink-faint mb-2">Platforms you'd cover</p>
            <div class="flex flex-wrap gap-x-5 gap-y-2">${platformOpts}</div>
          </div>
          <textarea id="apply-pitch" rows="3" placeholder="Why you're a fit for this campaign"
            class="w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300"></textarea>
          <div class="flex justify-end gap-2 pt-1">
            <button onclick="closeModal()" class="rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:bg-gold-100">Cancel</button>
            <button onclick="submitApply('${job.id}')" class="rounded-full bg-ink text-white text-sm font-medium px-5 py-2 hover:bg-black">Submit portfolio</button>
          </div>
        </div>

        <div id="apply-success" class="hidden text-center py-6">
          <div class="mx-auto h-14 w-14 rounded-full bg-gold-100 flex items-center justify-center text-2xl text-gold-700">✓</div>
          <h3 class="font-display text-2xl mt-4">Portfolio submitted</h3>
          <p class="text-ink-soft mt-2 font-light">${job.brand} will review your work and reach out if it's a match.</p>
          <button onclick="closeModal()" class="mt-6 rounded-full bg-ink text-white text-sm font-medium px-6 py-2.5 hover:bg-black">Done</button>
        </div>
      </div>
    </div>
  </div>`;
  document.body.style.overflow = "hidden";
}

function submitApply(jobId) {
  const name = document.getElementById("apply-name").value.trim();
  const handle = document.getElementById("apply-handle").value.trim();
  const portfolio = document.getElementById("apply-portfolio").value.trim();
  if (!name || !handle || !portfolio) {
    alert("Please add your name, handle and a portfolio link.");
    return;
  }
  document.getElementById("apply-form").classList.add("hidden");
  document.getElementById("apply-success").classList.remove("hidden");
}

/* ============================================================
 * BUSINESS VIEW — creator marketplace
 * ============================================================ */

function BusinessView() {
  const platformKeys = ["all", ...Object.keys(PLATFORMS)];
  let list = [...INFLUENCERS];
  if (state.influencerFilter !== "all") list = list.filter(i => i.platforms[state.influencerFilter]);
  if (state.influencerSort === "rating") list.sort((a, b) => liveRating(b).rating - liveRating(a).rating);
  else if (state.influencerSort === "reach") list.sort((a, b) => totalReach(b) - totalReach(a));
  else if (state.influencerSort === "price") list.sort((a, b) => minPrice(a) - minPrice(b));

  return `
  <section class="max-w-6xl mx-auto px-6 pt-20 pb-8 text-center">
    <p class="reveal text-xs font-semibold tracking-[0.2em] uppercase text-gold-700">For businesses</p>
    <h1 class="reveal font-display text-4xl md:text-5xl tracking-tight mt-4" data-delay="1">Find your creator</h1>
    <p class="reveal text-ink-soft mt-4 font-light max-w-xl mx-auto" data-delay="2">Compare the UAE's top creators across every platform — pricing, packages and reviews.</p>
  </section>
  <section class="reveal max-w-6xl mx-auto px-6 pb-8" data-delay="3">
    <div class="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
      <div class="flex flex-wrap gap-2 items-center">
        ${platformKeys.map(k => `
          <button onclick="setInfluencerFilter('${k}')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition border ${state.influencerFilter === k ? "bg-ink text-white border-ink" : "bg-white text-ink-soft border-gold-200 hover:border-gold-400"}">
            ${k === "all" ? "All platforms" : platformChip(k, 18) + PLATFORMS[k].label}
          </button>`).join("")}
      </div>
      <div class="flex items-center gap-2 text-sm shrink-0">
        <label class="text-ink-faint">Sort</label>
        <select onchange="setInfluencerSort(this.value)" class="rounded-full border border-gold-200 bg-white px-4 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-gold-300">
          <option value="rating" ${state.influencerSort === "rating" ? "selected" : ""}>Top rated</option>
          <option value="reach" ${state.influencerSort === "reach" ? "selected" : ""}>Largest reach</option>
          <option value="price" ${state.influencerSort === "price" ? "selected" : ""}>Lowest price</option>
        </select>
      </div>
    </div>
  </section>
  <section class="max-w-6xl mx-auto px-6 pb-24">
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${list.map((inf, i) => InfluencerCard(inf, i)).join("")}
    </div>
  </section>`;
}
function setInfluencerFilter(k) { state.influencerFilter = k; render(); }
function setInfluencerSort(v) { state.influencerSort = v; render(); }

function InfluencerCard(inf, i) {
  const { rating, count } = liveRating(inf);
  return `
  <button onclick="openInfluencer('${inf.id}')" class="reveal card-hover text-left rounded-3xl bg-white border border-gold-200/70 overflow-hidden" data-delay="${(i % 3) + 1}">
    <div class="relative">
      <div class="h-20 bg-gradient-to-r from-gold-200 via-gold-100 to-gold-300"></div>
      <img src="${inf.avatar}" alt="${inf.name}" class="absolute left-6 -bottom-8 h-20 w-20 rounded-2xl border-4 border-white object-cover" />
      <span class="absolute right-4 top-4 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-ink">★ ${rating.toFixed(1)}</span>
    </div>
    <div class="pt-11 px-6 pb-6">
      <h3 class="font-display text-xl leading-tight">${inf.name}</h3>
      <p class="text-sm text-ink-faint">${inf.handle} · ${inf.location}</p>
      <div class="flex flex-wrap gap-1.5 mt-3">
        ${inf.categories.map(c => `<span class="rounded-full bg-gold-50 text-gold-800 text-xs px-2.5 py-1 border border-gold-200/60">${c}</span>`).join("")}
      </div>
      <div class="flex items-center gap-1.5 mt-4">
        ${Object.keys(inf.platforms).map(k => platformChip(k, 22)).join("")}
      </div>
      <div class="mt-5 pt-4 border-t border-gold-100 flex items-end justify-between">
        <div>
          <p class="text-xs text-ink-faint">From</p>
          <p class="font-semibold text-gold-800">${money(minPrice(inf))}</p>
        </div>
        <div class="text-right">
          <p class="text-gold-500 text-sm leading-none">${stars(rating)}</p>
          <p class="text-xs text-ink-faint mt-1">${count} reviews</p>
        </div>
      </div>
    </div>
  </button>`;
}

/* ============================================================
 * INFLUENCER DETAIL MODAL
 * ============================================================ */

function openInfluencer(id) {
  const inf = INFLUENCERS.find(i => i.id === id);
  if (!inf) return;
  const { rating, count } = liveRating(inf);
  const reviews = allReviews(inf);

  modalRoot.innerHTML = `
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 backdrop-blur-md p-4" onclick="if(event.target===this) closeModal()">
    <div class="relative w-full max-w-3xl my-8 rounded-[28px] bg-canvas shadow-2xl reveal in">
      <button onclick="closeModal()" class="absolute right-4 top-4 z-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-ink-soft shadow">✕</button>
      <div class="h-24 rounded-t-[28px] bg-gradient-to-r from-gold-200 via-gold-100 to-gold-300"></div>
      <div class="px-8 pb-8">
        <div class="flex items-end gap-4 -mt-12">
          <img src="${inf.avatar}" class="h-24 w-24 rounded-3xl border-4 border-white object-cover" />
          <div class="pb-1">
            <h2 class="font-display text-3xl leading-tight">${inf.name}</h2>
            <p class="text-ink-faint">${inf.handle} · ${inf.location}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap mt-4">
          <span class="text-gold-500 font-semibold">${stars(rating)} <span class="text-ink">${rating.toFixed(1)}</span></span>
          <span class="text-ink-faint text-sm">${count} reviews</span>
          <span class="text-gold-300">·</span>
          ${inf.categories.map(c => `<span class="rounded-full bg-gold-50 text-gold-800 text-xs px-2.5 py-1 border border-gold-200/60">${c}</span>`).join("")}
        </div>
        <p class="text-ink-soft mt-4 font-light">${inf.bio}</p>

        <h3 class="font-display text-2xl mt-8">Audience</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          ${Object.entries(inf.platforms).map(([k, v]) => `
            <div class="rounded-2xl border border-gold-200/70 bg-white p-4">
              <div class="flex items-center gap-2">${platformChip(k, 22)}<span class="text-sm font-medium">${PLATFORMS[k].label}</span></div>
              <p class="font-display text-2xl mt-2">${fmtFollowers(v.followers)}</p>
              <p class="text-xs text-ink-faint">${v.engagement}% engagement</p>
            </div>`).join("")}
        </div>

        <h3 class="font-display text-2xl mt-8">Offers & pricing</h3>
        <div class="mt-3 rounded-2xl border border-gold-200/70 bg-white divide-y divide-gold-100">
          ${inf.offers.map(o => {
            const ot = OFFER_TYPES[o.type];
            return `
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                ${platformChip(ot.platform, 26)}
                <div>
                  <p class="font-medium">${ot.label}</p>
                  <p class="text-xs text-ink-faint">Delivery in ${o.deliveryDays} days</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-semibold text-gold-800">${money(o.price)}</span>
                <button onclick="alert('Prototype: booking flow for ${ot.label} would open here.')"
                  class="rounded-full bg-ink text-white text-sm font-medium px-4 py-2 hover:bg-black transition">Book</button>
              </div>
            </div>`;
          }).join("")}
        </div>

        <div class="flex items-center justify-between mt-8">
          <h3 class="font-display text-2xl">Reviews from businesses</h3>
          <button onclick="toggleReviewForm()" class="text-sm font-medium text-gold-800 hover:text-gold-900">+ Write a review</button>
        </div>
        <div id="review-form" class="hidden mt-3 rounded-2xl border border-gold-300 bg-gold-50/60 p-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <input id="rev-business" type="text" placeholder="Your business name"
              class="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300" />
            <select id="rev-rating" class="rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300">
              <option value="5">★★★★★ — Excellent</option>
              <option value="4">★★★★☆ — Good</option>
              <option value="3">★★★☆☆ — Average</option>
              <option value="2">★★☆☆☆ — Poor</option>
              <option value="1">★☆☆☆☆ — Terrible</option>
            </select>
          </div>
          <textarea id="rev-text" rows="3" placeholder="How was your collaboration?"
            class="mt-3 w-full rounded-xl border border-gold-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300"></textarea>
          <div class="flex justify-end gap-2 mt-3">
            <button onclick="toggleReviewForm()" class="rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:bg-gold-100">Cancel</button>
            <button onclick="submitReview('${inf.id}')" class="rounded-full bg-ink text-white text-sm font-medium px-4 py-2 hover:bg-black">Post review</button>
          </div>
        </div>
        <div id="reviews-list" class="space-y-3 mt-4">
          ${reviews.map(ReviewItem).join("")}
        </div>
      </div>
    </div>
  </div>`;
  document.body.style.overflow = "hidden";
}

function ReviewItem(r) {
  return `
  <div class="rounded-2xl border border-gold-200/70 bg-white p-4">
    <div class="flex items-center justify-between">
      <p class="font-medium">${r.business}</p>
      <span class="text-gold-500 text-sm">${stars(r.rating)}</span>
    </div>
    <p class="text-xs text-ink-faint mt-1">${new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
    <p class="text-sm text-ink-soft mt-2 font-light">${r.text}</p>
  </div>`;
}
function toggleReviewForm() { document.getElementById("review-form").classList.toggle("hidden"); }
function submitReview(id) {
  const business = document.getElementById("rev-business").value.trim();
  const rating = parseInt(document.getElementById("rev-rating").value, 10);
  const text = document.getElementById("rev-text").value.trim();
  if (!business || !text) { alert("Please add your business name and a short review."); return; }
  if (!state.reviewsByInfluencer[id]) state.reviewsByInfluencer[id] = [];
  state.reviewsByInfluencer[id].unshift({ business, rating, date: new Date().toISOString().slice(0, 10), text });
  openInfluencer(id);
}
function closeModal() { modalRoot.innerHTML = ""; document.body.style.overflow = ""; }
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- Boot ---------- */
render();
