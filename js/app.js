/* ————————————————————————————————————————————————
   App shell — stack router, tab bar, delegation,
   and the prototype control panel (the hidden drawer).
   ———————————————————————————————————————————————— */

(function () {
  const t = DB.t;
  const Screens = (window.Screens = window.Screens || {});
  let stack = []; // [{name, params, scroll}]

  const TAB_ROOTS = { home: "home", move: "move", earn: "earn", own: "own" };

  function top() { return stack[stack.length - 1]; }

  function renderTop(mode = "push") {
    const host = document.getElementById("screen-host");
    const entry = top();
    const def = Screens[entry.name];
    if (!def) { console.warn("missing screen", entry.name); return; }
    const scr = typeof def === "function" ? def(entry.params || {}) : def;
    host.innerHTML = `<div class="app-screen ${mode === "root" ? "root" : ""}">${scr.render ? scr.render() : scr.html}</div>`;
    const el = host.firstElementChild;
    updateTabbar();
    bindCommon(el);
    if (scr.onMount) scr.onMount(el, entry.params || {});
    const body = el.querySelector(".scr-body");
    if (body && entry.scroll) body.scrollTop = entry.scroll;
    if (body) body.addEventListener("scroll", () => {
      entry.scroll = body.scrollTop;
      const nr = el.querySelector(".navrow");
      if (nr) nr.classList.toggle("condensed", body.scrollTop > 46);
    }, { passive: true });
  }

  function go(name, params, { replace = false } = {}) {
    UI.closeSheet(true);
    if (replace) stack.pop();
    stack.push({ name, params });
    renderTop("push");
  }

  function back(fallback) {
    UI.closeSheet(true);
    if (stack.length <= 1) { if (fallback) return go(fallback, {}, { replace: true }); return; }
    stack.pop();
    renderTop("root");
  }

  /* pop everything down to the current tab root */
  function backToRoot() {
    UI.closeSheet(true);
    stack = [stack[0]];
    renderTop("root");
  }

  function setTab(tab) {
    UI.closeSheet(true);
    DB.state.tab = tab;
    stack = [{ name: TAB_ROOTS[tab] }];
    renderTop("root");
  }

  function resetTo(name, params) {
    UI.closeSheet(true);
    stack = [{ name, params }];
    renderTop("root");
  }

  function updateTabbar() {
    const bar = document.getElementById("tabbar");
    const entry = top();
    const isRootTab = stack.length === 1 && TAB_ROOTS[DB.state.tab] === entry.name && Object.keys(TAB_ROOTS).includes(DB.state.tab) && DB.state.onboarded;
    const hide = !DB.state.onboarded || entry.hideTabs || !isRootTab;
    bar.style.display = hide ? "none" : "flex";
    if (hide) return;
    const tabs = [
      { id: "home", ic: "home", label: t("Home") },
      { id: "move", ic: "move", label: t("Move") },
      { id: "earn", ic: "earn", label: t("Earn") },
      { id: "own", ic: "own", label: t("Own") },
    ];
    bar.innerHTML = tabs.map((tb) => `<button class="tab-item ${DB.state.tab === tb.id ? "active" : ""}" data-tab="${tb.id}">${icon(tb.ic, 19)}<span>${tb.label}</span></button>`).join("");
    bar.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
  }

  /* ————— shared delegation: data-go / data-back / data-copy / data-sheet-close ————— */
  function bindCommon(scope) {
    scope.addEventListener("click", (e) => {
      const goEl = e.target.closest("[data-go]");
      if (goEl && scope.contains(goEl)) {
        const params = goEl.dataset.params ? JSON.parse(goEl.dataset.params) : {};
        go(goEl.dataset.go, params);
        return;
      }
      const backEl = e.target.closest("[data-back]");
      if (backEl) { back(); return; }
      const rootEl = e.target.closest("[data-back-root]");
      if (rootEl) { backToRoot(); return; }
      const tabEl = e.target.closest("[data-set-tab]");
      if (tabEl) { setTab(tabEl.dataset.setTab); return; }
      const copyEl = e.target.closest("[data-copy]");
      if (copyEl) {
        const txt = copyEl.dataset.copy;
        if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {});
        UI.toast("Copied");
        return;
      }
    });
  }

  /* sheet-host + toast-level delegation */
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-sheet-close]")) UI.closeSheet();
    const goEl = e.target.closest("#sheet-host [data-go]");
    if (goEl) {
      const params = goEl.dataset.params ? JSON.parse(goEl.dataset.params) : {};
      UI.closeSheet(true);
      go(goEl.dataset.go, params);
    }
    const copyEl = e.target.closest("#sheet-host [data-copy]");
    if (copyEl) { if (navigator.clipboard) navigator.clipboard.writeText(copyEl.dataset.copy).catch(() => {}); UI.toast("Copied"); }
  });

  /* ————— language / direction ————— */
  function setLang(lang) {
    DB.state.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    renderTop("root");
  }

  /* ————— prototype control panel ————— */
  function openDevPanel() {
    const s = DB.state.scenario;
    const jump = [
      ["Welcome", "welcome"], ["Walkthrough", "walkthrough"], ["Sign up", "signup"], ["OTP", "otp"],
      ["Country", "country"], ["Create account", "createAccount"], ["Verify prompt", "kycOffer"],
      ["Home", "home"], ["Activity", "activity"], ["Move hub", "move"], ["Add money", "addmoney"],
      ["Send", "send"], ["Receive", "receive"], ["Withdraw", "withdraw"], ["Convert", "convert"], ["Card hub", "card"],
      ["Card decline", "cardDeclineDetail"], ["AED account", "acctAED"], ["USD account", "acctUSD"],
      ["Credit", "credit"], ["Earn hub", "earn"], ["OWN points", "points"], ["Redeem", "redeem"],
      ["Yield list", "yieldList"], ["Own hub", "own"], ["Explore", "explore"], ["Holdings", "holdings"],
      ["Verification", "kycIntro"], ["KYC status", "kycStatus"], ["Nudge inventory", "nudges"],
      ["Goals", "goals"], ["Account hub", "account"], ["Security", "security"], ["Restrictions", "restrictions"],
      ["Regulatory", "regulatory"], ["Support", "support"], ["Notifications", "notifications"],
    ];
    UI.openSheet({
      title: "Prototype controls",
      body: `
        <p class="footnote" style="padding-bottom:6px">Demo states for the buildathon team. Flip a state, then look at Home.</p>
        ${UI.toggleRow("pendingDeposit", "Pending deposit", "3,500 AED bank transfer in flight", s.pendingDeposit)}
        ${UI.toggleRow("failedDeposit", "Failed deposit", "Card top-up declined by the bank", s.failedDeposit)}
        ${UI.toggleRow("cardDeclined", "Card payment declined", "Netflix blocked by a control", s.cardDeclined)}
        ${UI.toggleRow("rewardReady", "Rewards ready to redeem", "3,376 OWN points available", s.rewardReady)}
        ${UI.toggleRow("idleCash", "Idle cash nudge", "Available balance unused for 14 days", s.idleCash)}
        ${UI.toggleRow("restricted", "Account restriction", "Outgoing transfers paused for review", s.restricted)}
        ${UI.toggleRow("freshAccount", "New user · zero balance", "Tier 0, nothing funded yet", s.freshAccount)}
        ${UI.toggleRow("kycTier2", "Fully verified (tier 2)", "Address + tax confirmed", DB.state.user.tier >= 2)}
        ${UI.toggleRow("arabic", "Arabic · RTL", "العربية — يقلب الاتجاه بالكامل", DB.state.lang === "ar")}
        <div class="group-label-m">Jump to a screen</div>
        <div class="dev-jump">${jump.map(([label, r]) => `<button data-jump="${r}">${label}</button>`).join("")}</div>
        <div class="divider-q"></div>
        <button class="btn btn-secondary btn-block" id="dev-reset">Reset the demo</button>
        <div style="height:8px"></div>`,
      onMount(el) {
        el.querySelectorAll("[data-toggle]").forEach((sw) => sw.addEventListener("click", () => {
          const id = sw.dataset.toggle;
          if (id === "arabic") { setLang(DB.state.lang === "ar" ? "en" : "ar"); UI.closeSheet(); return; }
          if (id === "kycTier2") { DB.state.user.tier = DB.state.user.tier >= 2 ? 1 : 2; }
          else {
            s[id] = !s[id];
            if (id === "freshAccount" && s[id]) DB.state.user.tier = 0;
            if (id === "freshAccount" && !s[id]) DB.state.user.tier = Math.max(DB.state.user.tier, 1);
          }
          DB.state.dismissed = {};
          sw.classList.toggle("on");
          renderTop("root");
        }));
        el.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => {
          UI.closeSheet(true);
          const r = b.dataset.jump;
          const preOnboarding = ["welcome", "walkthrough", "signup", "otp", "country", "createAccount", "kycOffer"].includes(r);
          DB.state.onboarded = !preOnboarding;
          if (["home", "move", "earn", "own"].includes(r)) setTab(r);
          else { stack = [{ name: "home" }]; go(r); }
        }));
        el.querySelector("#dev-reset").addEventListener("click", () => {
          Object.keys(s).forEach((k) => (s[k] = false));
          s.rewardReady = true;
          DB.state.user.tier = 1;
          DB.state.dismissed = {};
          DB.state.onboarded = false;
          setLang("en");
          UI.closeSheet(true);
          resetTo("welcome");
        });
      },
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "`" || (e.key === "d" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); openDevPanel(); }
  });

  /* keep the device at true iPhone 16 proportions — scale to fit the window */
  function fitDevice() {
    const dev = document.querySelector(".device");
    if (!dev) return;
    if (window.matchMedia("(max-width: 480px), (max-height: 620px)").matches) { dev.style.transform = ""; return; }
    const scale = Math.min(1, (window.innerHeight - 36) / 872, (window.innerWidth - 36) / 413);
    dev.style.transform = scale < 1 ? `scale(${scale})` : "";
  }

  /* ————— boot ————— */
  function boot() {
    document.getElementById("dev-fab").addEventListener("click", openDevPanel);
    fitDevice();
    window.addEventListener("resize", fitDevice);
    const clock = document.getElementById("sb-time");
    if (clock) {
      const tick = () => { const d = new Date(); clock.textContent = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, ""); };
      tick(); setInterval(tick, 20000);
    }
    DB.state.onboarded = false;
    resetTo("welcome");
  }

  window.App = { go, back, backToRoot, setTab, resetTo, renderTop, setLang, openDevPanel };
  document.addEventListener("DOMContentLoaded", boot);
})();
