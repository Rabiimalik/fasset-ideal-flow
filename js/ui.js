/* ————————————————————————————————————————————————
   UI helpers — one consistent component per job.
   Money is typeset, not dumped; sheets ride the drawer curve;
   every list row, status hero and keypad is built here once.
   ———————————————————————————————————————————————— */

(function () {
  const t = DB.t;

  function fmt(n, dec = 2) {
    return Number(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  /* suffix-code money (AED, USDT…): dim the code, keep digits solid */
  function money(n, ccy = "AED", { sign = false, dec = 2 } = {}) {
    const neg = n < 0;
    const s = fmt(Math.abs(n), dec).split(".");
    const signStr = neg ? "−" : sign ? "+" : "";
    return `<span class="money">${signStr}${s[0]}${s[1] !== undefined ? `<span class="money-dec">.${s[1]}</span>` : ""}<span class="money-ccy">${ccy}</span></span>`;
  }
  /* symbol money ($): symbol solid and full-size, identical to digits */
  function moneyUsd(n, dec = 2) {
    const s = fmt(Math.abs(n), dec).split(".");
    return `<span class="money">${n < 0 ? "−" : ""}$${s[0]}<span class="money-dec">.${s[1]}</span></span>`;
  }
  /* hero figure with per-digit assembly */
  function heroMoney(n, ccy = "AED") {
    const s = fmt(Math.abs(n)).split(".");
    const digits = [...s[0]].map((ch, i) => `<span class="dg" style="animation-delay:${i * 22}ms">${ch}</span>`).join("");
    const decDigits = [...s[1]].map((ch, i) => `<span class="dg" style="animation-delay:${(s[0].length + i) * 22}ms">${ch}</span>`).join("");
    return `<div class="hero-money" dir="ltr">${digits}<span class="money-dec">.${""}${decDigits}</span><span class="money-ccy">${ccy}</span></div>`;
  }

  /* ————— generic building blocks ————— */

  function navrow(opts = {}) {
    const { title = "", right = "", back = true, close = false, always = false } = opts;
    return `<div class="navrow">
      ${back ? `<button class="icon-btn" data-back aria-label="${t("Back")}"><span class="flip-rtl" style="display:inline-flex">${icon("chevronLeft", 18)}</span></button>` : `<span style="width:40px"></span>`}
      <span class="nav-title ${always ? "always" : ""}">${title}</span>
      <span style="display:flex;gap:2px">${right}${close ? `<button class="icon-btn" data-back aria-label="Close">${icon("close", 16)}</button>` : ""}</span>
    </div>`;
  }

  function pageTitle(title, sub) {
    return `<div><h1 class="page-title">${title}</h1>${sub ? `<p class="page-sub2">${sub}</p>` : ""}</div>`;
  }

  function row({ ic, icTone = "", img, av, title, sub, right = "", chev = false, act, go, params, cls = "" }) {
    const attrs = [
      act ? `data-act="${act}"` : "",
      go ? `data-go="${go}"` : "",
      params ? `data-params='${JSON.stringify(params)}'` : "",
    ].join(" ");
    const lead = img ? `<span class="pcard small" style="width:44px;border-radius:6px;background-image:url('${img}')"></span>`
      : av ? `<span class="mono-av">${av}</span>`
      : ic ? `<span class="m-ic ${icTone}">${icon(ic, 17)}</span>` : "";
    return `<button class="mrow ${cls}" ${attrs}>
      ${lead}
      <span class="m-body"><span class="m-title">${title}</span>${sub ? `<span class="m-sub">${sub}</span>` : ""}</span>
      ${right ? `<span class="m-right">${right}</span>` : ""}
      ${chev ? `<span class="chev">${icon("chevronRight", 14)}</span>` : ""}
    </button>`;
  }

  function txRow(tx) {
    /* people and merchants get initials; system moves keep a quiet icon */
    const icons = { deposit: "plus", buy: "own", sell: "own", yield: "leaf", reward: "earn", withdraw: "bank" };
    const isNamed = ["card", "send", "receive"].includes(tx.kind);
    const initials = tx.title.replace(/[^A-Za-z ]/g, "").trim().split(/\s+/).slice(0, 1).join("").slice(0, 2).toUpperCase() || "•";
    const failed = tx.status === "failed", pending = tx.status === "pending";
    const amtCls = failed || pending ? "pending" : tx.amt > 0 ? "positive" : "";
    let amount = tx.pts ? `+${tx.amt} pts` : money(tx.amt, "AED", { sign: tx.amt > 0 });
    if (failed) amount = `<s style="opacity:0.55">${amount}</s>`;
    const under = failed ? `<span class="status status-failed"><i class="dot"></i>Declined</span>`
      : pending ? `<span class="status status-pending"><i class="dot"></i>On its way</span>`
      : `<span class="m-when">${tx.when === "Today" || tx.when === "Yesterday" ? tx.time : tx.when}</span>`;
    return row({
      av: isNamed ? initials : undefined,
      ic: isNamed ? undefined : icons[tx.kind] || "activity",
      icTone: !isNamed && tx.amt > 0 && tx.status === "completed" ? "tint" : "",
      title: tx.title, sub: tx.sub,
      right: `<span class="m-amt ${amtCls}">${amount}</span>${under}`,
      go: "txDetail", params: { id: tx.id },
    });
  }

  function defRow(k, v, strong = false) {
    return `<div class="def-row"><span class="def-label">${k}</span><span class="def-value ${strong ? "strong" : ""}">${v}</span></div>`;
  }

  function copyRow(k, v, mono = false) {
    return `<button class="copy-row" data-copy="${String(v).replace(/<[^>]*>/g, "")}">
      <span style="flex:1;min-width:0"><span class="c-k">${k}</span><div class="c-v ${mono ? "mono" : ""}">${v}</div></span>
      ${icon("copy", 15)}
    </button>`;
  }

  function statusHero({ tone = "", ic = "check", title, sub, pulse = false }) {
    return `<div class="status-hero">
      <span class="status-orb ${tone}">${pulse ? `<span class="pulse-dot"><i></i><i></i><i></i></span>` : icon(ic, 30)}</span>
      <h1>${title}</h1>
      ${sub ? `<p class="st-sub">${sub}</p>` : ""}
    </div>`;
  }

  function toggleRow(id, title, sub, on) {
    return `<div class="dev-row"><span><span class="d-t">${title}</span>${sub ? `<div class="d-s">${sub}</div>` : ""}</span>
      <button class="switch ${on ? "on" : ""}" data-toggle="${id}" role="switch" aria-checked="${on}"><span class="knob"></span></button></div>`;
  }

  /* ————— sheet ————— */
  let sheetEl = null;
  function openSheet({ title = "", body = "", foot = "", onMount, plain = false }) {
    closeSheet(true);
    const host = document.getElementById("sheet-host");
    host.innerHTML = `<div class="sheet-wrap">
      <div class="sheet-scrim" data-sheet-close></div>
      <div class="sheet" role="dialog" aria-modal="true">
        <div class="sheet-grab"><i></i></div>
        ${title ? `<div class="sheet-head"><h2>${title}</h2><button class="icon-btn" data-sheet-close style="width:34px;height:34px">${icon("close", 15)}</button></div>` : ""}
        <div class="sheet-body ${plain ? "plain" : ""}">${body}</div>
        ${foot ? `<div class="sheet-foot">${foot}</div>` : ""}
      </div></div>`;
    sheetEl = host.firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => sheetEl.classList.add("open")));
    if (onMount) onMount(sheetEl);
    return sheetEl;
  }
  function closeSheet(instant = false) {
    const host = document.getElementById("sheet-host");
    if (!host.firstElementChild) return;
    const el = host.firstElementChild;
    if (instant) { host.innerHTML = ""; return; }
    el.classList.remove("open");
    setTimeout(() => { if (host.firstElementChild === el) host.innerHTML = ""; }, 140);
  }

  /* ————— toast ————— */
  let toastTimer = null;
  function toast(msg, ic = "check") {
    let el = document.getElementById("toast");
    el.innerHTML = `${icon(ic, 15)}<span>${msg}</span>`;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  /* ————— fake QR (deterministic from seed) ————— */
  function qrSvg(seed) {
    let h = 2166136261;
    for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const N = 21; let cells = "";
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="none" stroke="#111" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#111"/>`;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (!inF && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1" fill="#111"/>`;
    }
    return `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" shape-rendering="crispEdges">${cells}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</svg>`;
  }

  /* ————— sparkline ————— */
  function spark(seed = 1, w = 340, hgt = 76, up = true) {
    let h = seed * 2654435761 % 4294967296;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const n = 28; let pts = []; let v = 0.55;
    for (let i = 0; i < n; i++) { v += (rnd() - (up ? 0.42 : 0.58)) * 0.14; v = Math.max(0.08, Math.min(0.95, v)); pts.push(v); }
    const step = w / (n - 1);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${(i * step).toFixed(1)} ${(hgt - p * hgt).toFixed(1)}`).join(" ");
    const area = `${d} L${w} ${hgt} L0 ${hgt} Z`;
    return `<div class="spark"><svg viewBox="0 0 ${w} ${hgt}" preserveAspectRatio="none" style="height:${hgt}px">
      <defs><linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity="0.14"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient></defs>
      <path class="ar" d="${area}"/><path class="ln draw" d="${d}"/></svg></div>`;
  }

  /* ————— shared amount-entry screen — centered, chip-driven ————— */
  /* cfg: { navTitle, destLine/destIcon/destLocked, sourceLine/sourceLabel/sourceIcon/sourceLocked,
            sub, ccy, quote(n)->html, cta, min, max, chips, overMax(n), onConfirm(n), onSource } */
  function amountScreen(cfg) {
    let val = "";
    function amountNum() { return parseFloat(val || "0"); }
    function displayHtml() {
      const shown = val === "" ? "0" : val;
      const parts = shown.split(".");
      const intFmt = parts[0] === "" ? "0" : Number(parts[0]).toLocaleString("en-US");
      return `${intFmt}${parts.length > 1 ? "." + parts[1] : ""}`;
    }
    const chipBtn = (label, ic, attrs, chev) => `<button class="chip-lg" ${attrs}>${ic ? icon(ic, 14) : ""}<span>${label}</span>${chev ? icon("chevronDown", 11) : ""}</button>`;
    function render() {
      return `
        ${navrow({ title: cfg.navTitle || cfg.title || "", always: true })}
        <div class="scr-body amt-screen">
          <div class="amt-chips-top">
            ${cfg.destLine ? chipBtn(cfg.destLine, cfg.destIcon, cfg.destLocked ? "" : "data-back", !cfg.destLocked) : ""}
            ${cfg.sourceLine ? chipBtn(`${cfg.sourceLabel || "From"} · ${cfg.sourceLine}`, cfg.sourceIcon, `data-act="source"`, !cfg.sourceLocked) : ""}
            ${cfg.sub ? `<p class="amt-note">${cfg.sub}</p>` : ""}
          </div>
          <div style="flex:1.1"></div>
          <div class="amt-display ${val === "" ? "placeholder" : ""}" id="amt">${displayHtml()}</div>
          <div class="amt-ccy-under">${cfg.ccy || "AED"}</div>
          <div class="amt-sub" id="amt-sub">${cfg.quote ? cfg.quote(amountNum()) : ""}</div>
          <div style="flex:1"></div>
          ${cfg.chips ? `<div class="amt-chips">${cfg.chips.map((c) => `<button class="amt-chip" data-chip="${c}">${typeof c === "number" ? fmt(c, 0) : c}</button>`).join("")}</div>` : ""}
          <div class="keypad">${["1","2","3","4","5","6","7","8","9",".","0","⌫"].map((k) => `<button class="key" data-key="${k}">${k === "⌫" ? icon("chevronLeft", 18) : k}</button>`).join("")}</div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="amt-cta" disabled>${cfg.cta || t("Continue")}</button></div>
        </div>`;
    }
    function onMount(el) {
      const amtEl = el.querySelector("#amt"), subEl = el.querySelector("#amt-sub"), cta = el.querySelector("#amt-cta");
      function refresh() {
        amtEl.classList.toggle("placeholder", val === "");
        amtEl.innerHTML = displayHtml();
        const n = amountNum();
        if (cfg.quote) subEl.innerHTML = cfg.quote(n);
        const max = cfg.max === undefined ? Infinity : cfg.max;
        const ok = n >= (cfg.min || 0.01) && n <= max;
        if (n > max && cfg.overMax) subEl.innerHTML = cfg.overMax(n);
        cta.disabled = !ok;
      }
      el.querySelectorAll("[data-key]").forEach((k) => k.addEventListener("click", () => {
        const key = k.dataset.key;
        if (key === "⌫") val = val.slice(0, -1);
        else if (key === ".") { if (!val.includes(".")) val = (val || "0") + "."; }
        else {
          const next = val + key;
          const [, dec] = next.split(".");
          if (dec && dec.length > 2) return;
          if (next.replace(".", "").length > 9) { amtEl.classList.remove("shake"); void amtEl.offsetWidth; amtEl.classList.add("shake"); return; }
          val = next === "0" ? "0" : next.replace(/^0(?=\d)/, "");
        }
        refresh();
      }));
      el.querySelectorAll("[data-chip]").forEach((c) => c.addEventListener("click", () => {
        const v = c.dataset.chip;
        val = v === "Max" ? String(cfg.max ?? "") : String(v);
        refresh();
      }));
      cta.addEventListener("click", () => cfg.onConfirm(amountNum()));
      if (cfg.onSource) el.querySelector('[data-act="source"]')?.addEventListener("click", cfg.onSource);
      refresh();
    }
    return { render, onMount };
  }

  /* ————— Face ID auth sheet — one auth component everywhere ————— */
  function authSheet(onDone, label = "Confirm with Face ID") {
    openSheet({
      body: `<div class="status-hero" style="padding-top:26px">
          <span class="faceid-orb" id="fid">${icon("faceid", 34)}</span>
          <h1 style="font-size:18px">${label}</h1>
          <p class="st-sub">Look at your phone to approve.</p>
        </div><div style="height:18px"></div>`,
      onMount(el) {
        setTimeout(() => {
          const orb = el.querySelector("#fid");
          if (!orb) return;
          orb.classList.add("ok");
          orb.innerHTML = icon("check", 34);
          setTimeout(() => { closeSheet(); onDone(); }, 420);
        }, 900);
      },
    });
  }

  window.UI = { fmt, money, moneyUsd, heroMoney, navrow, pageTitle, row, txRow, defRow, copyRow, statusHero, toggleRow, openSheet, closeSheet, toast, qrSvg, spark, amountScreen, authSheet };
})();
