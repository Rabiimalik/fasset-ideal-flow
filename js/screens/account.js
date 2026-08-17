/* ————————————————————————————————————————————————
   G+H. Intelligence, trust and support — screens 107–117.
   Security within two taps; support inherits context;
   restrictions explain themselves.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, money, fmt, openSheet, closeSheet, toast, statusHero, defRow, toggleRow } = UI;

  /* 109 · Account control hub */
  Screens.account = () => ({
    render() {
      const tier = DB.state.user.tier;
      return `
      ${navrow({ title: t("Your account") })}
      <div class="scr-body">
        <div style="display:flex;align-items:center;gap:14px;padding:16px 0 6px">
          <span class="mono-av" style="width:56px;height:56px;font-size:20px;background:var(--ink);color:var(--on-ink)">${DB.state.user.first[0]}</span>
          <span><div style="font-size:19px;font-weight:var(--w-medium);color:var(--text-strong)">${DB.state.user.name}</div>
          <div class="footnote" dir="ltr" style="text-align:start">${DB.state.user.tag} · ${DB.state.user.phone}</div></span>
        </div>
        ${tier < 2 ? `<button class="nudge-card" data-go="kycStatus"><span class="n-ic">${icon("id", 16)}</span><span style="flex:1"><span class="n-title">${tier < 1 ? "Verify your identity" : "Finish verification"}</span><div class="n-sub">${tier < 1 ? "Turns on your card, accounts and investing." : "One step opens international sending and credit."}</div></span><span class="chev">${icon("chevronRight", 14)}</span></button>` : ""}
        <div class="group-label-m">${t("Security")} & control</div>
        <div class="list-tight">
          ${row({ ic: "shield", title: t("Security"), sub: "Devices, sign-in, Face ID", go: "security", chev: true })}
          ${row({ ic: "chart", title: "Transaction limits", sub: "What applies and how to raise it", go: "limits", chev: true })}
          ${row({ ic: "id", title: "Verification", sub: DB.state.user.tier >= 2 ? "Fully verified" : "See what each level opens", go: "kycStatus", chev: true })}
          ${row({ ic: "lock", title: t("Privacy") + " & data", sub: "What we hold and your rights", go: "privacy", chev: true })}
          ${DB.state.scenario.restricted ? row({ ic: "alert", icTone: "warn", title: "Active restriction", sub: "Outgoing transfers paused · tap for details", go: "restrictions", chev: true }) : row({ ic: "check", icTone: "tint", title: "No restrictions", sub: "Your account is fully open", go: "restrictions", chev: true })}
        </div>
        <div class="group-label-m">Preferences</div>
        <div class="list-tight">
          ${row({ ic: "bell", title: t("Notifications"), sub: "Instant alerts for money moves", go: "notifications", chev: true })}
          ${row({ ic: "langAr", title: "اللغة العربية", sub: DB.state.lang === "ar" ? "Switch to English" : "Switch to Arabic — full right-to-left", act: "lang", chev: true })}
          ${row({ ic: "target", title: "Goals", sub: "Umrah trip · 64% funded", go: "goals", chev: true })}
        </div>
        <div class="group-label-m">Help & legal</div>
        <div class="list-tight">
          ${row({ ic: "headset", title: t("Support"), sub: "Humans, in chat, around the clock", go: "support", chev: true })}
          ${row({ ic: "statements", title: "Statements & documents", sub: "Monthly statements, tax exports", act: "stmt", chev: true })}
          ${row({ ic: "shield", title: "How you're protected in the UAE", sub: "Licences, safeguarding, complaints", go: "regulatory", chev: true })}
          ${row({ ic: "earn", title: "Nudge inventory", sub: "Demo · every contextual moment the app notices", go: "nudges", chev: true })}
        </div>
        <div class="divider-q"></div>
        <button class="btn btn-ghost btn-block" data-act="out">${icon("logout", 15)} Sign out</button>
        <p class="footnote center" style="padding-top:10px">Fasset · prototype build · UAE instance</p>
      </div>`;
    },
    onMount(el) {
      el.querySelector('[data-act="lang"]').addEventListener("click", () => App.setLang(DB.state.lang === "ar" ? "en" : "ar"));
      el.querySelector('[data-act="stmt"]').addEventListener("click", () => toast("Statement archive lives here — demo stub"));
      el.querySelector('[data-act="out"]').addEventListener("click", () => { DB.state.onboarded = false; App.resetTo("welcome"); });
    },
  });

  /* 110 · Security */
  Screens.security = () => ({
    render: () => `
      ${navrow({ title: t("Security") })}
      <div class="scr-body">
        ${pageTitle(t("Security"), "Your money moves only when you say so.")}
        ${toggleRow("faceid", "Face ID for payments", "Every send, buy and reveal", true)}
        ${toggleRow("faceid-open", "Face ID to open the app", "", true)}
        ${toggleRow("alerts", "Alert on every card payment", "The instant it happens", true)}
        <div class="group-label-m">Signed-in devices</div>
        <div class="list-tight">
          ${row({ ic: "phone", title: "iPhone 17 Pro · this device", sub: "Dubai, UAE · now", right: `<span class="status status-active"><i class="dot"></i>Active</span>` })}
          ${row({ ic: "phone", title: "iPad Air", sub: "Dubai, UAE · 3 days ago", right: `<button class="btn btn-ghost btn-sm" data-act="rm">Remove</button>` })}
        </div>
        <div class="group-label-m">If something's wrong</div>
        <div class="list-tight">
          ${row({ ic: "snowflake", title: "Freeze everything", sub: "Card, sends, withdrawals — one switch, instant", act: "freeze-all", chev: true })}
          ${row({ ic: "refresh", title: "Change passcode", act: "pass", chev: true })}
        </div>
      </div>`,
    onMount(el) {
      el.querySelectorAll("[data-toggle]").forEach((sw) => sw.addEventListener("click", () => { sw.classList.toggle("on"); toast("Updated"); }));
      el.querySelector('[data-act="rm"]').addEventListener("click", (e) => { e.stopPropagation(); toast("iPad signed out"); });
      el.querySelector('[data-act="freeze-all"]').addEventListener("click", () => { DB.state.card.frozen = true; toast("Everything frozen — unfreeze any time", "snowflake"); });
      el.querySelector('[data-act="pass"]').addEventListener("click", () => toast("Passcode flow lives here — demo stub"));
    },
  });

  /* 111 · Limits */
  Screens.limits = () => ({
    render() {
      const tier = DB.state.user.tier;
      return `
      ${navrow({ title: t("Limits") })}
      <div class="scr-body">
        ${pageTitle("Transaction limits", "What applies to you right now, and exactly how to raise it.")}
        <div class="def-group">
          ${defRow("Monthly in + out", tier >= 2 ? "150,000 AED" : tier >= 1 ? "35,000 AED" : "3,670 AED lifetime", true)}
          ${defRow("Used this month", "21,880 AED")}
          ${defRow("Card daily", tier >= 1 ? fmt(DB.state.card.limits.daily, 0) + " AED" : "—")}
          ${defRow("Single transfer", tier >= 1 ? "10,000 AED" : "—")}
          ${defRow("ATM daily", tier >= 1 ? fmt(DB.state.card.limits.atm, 0) + " AED" : "—")}
        </div>
        ${tier < 2 ? `<button class="nudge-card" data-go="kycIntro" data-params='{"unlock":"intl"}'>
          <span class="n-ic">${icon("arrowUpRight", 16)}</span>
          <span style="flex:1"><span class="n-title">Raise to 150,000 AED a month</span><div class="n-sub">Confirm your address and tax residency — about a minute.</div></span>
          <span class="chev">${icon("chevronRight", 14)}</span></button>` : `<p class="footnote">You're at the highest standard tier. Need more? Support can arrange reviewed limits.</p>`}
        <div class="group-label-m">Card limits you control</div>
        ${row({ ic: "cards", title: "Adjust card limits", sub: "Daily, per payment, ATM", go: "cardLimits", chev: true })}
      </div>`;
    },
  });

  /* 112 · Privacy and data */
  Screens.privacy = () => ({
    render: () => `
      ${navrow({ title: t("Privacy") })}
      <div class="scr-body">
        ${pageTitle("Privacy & data", "Short version, honestly told.")}
        <div class="list-tight">
          ${row({ ic: "lock", title: "What we hold", sub: "Identity documents, transactions, device info", act: "d" })}
          ${row({ ic: "shield", title: "Why", sub: "UAE law requires it for financial accounts — nothing is sold, ever", act: "d" })}
          ${row({ ic: "download", title: "Download your data", sub: "Everything, machine-readable, in minutes", act: "dl" })}
          ${row({ ic: "close", title: "Close account & erase", sub: "What we must keep by law, and for how long", act: "d" })}
        </div>
        ${toggleRow("mkt", "Product updates", "New features, occasionally — never partner marketing", false)}
      </div>`,
    onMount(el) {
      el.querySelectorAll('[data-act="d"]').forEach((b) => b.addEventListener("click", () => toast("Full policy text lives here")));
      el.querySelector('[data-act="dl"]').addEventListener("click", () => toast("Export started — we'll notify you"));
      el.querySelector("[data-toggle]").addEventListener("click", (e) => { e.currentTarget.classList.toggle("on"); toast("Updated"); });
    },
  });

  /* 113 · Restrictions — why, what, how out, how long */
  Screens.restrictions = () => ({
    render() {
      if (!DB.state.scenario.restricted) return `
        ${navrow({ title: "Restrictions" })}
        <div class="scr-body">
          ${statusHero({ title: "No restrictions", sub: "Your account is fully open. If we ever restrict anything, this screen will say exactly why, what's affected, and how it gets removed." })}
        </div>`;
      return `
        ${navrow({ title: "Restrictions" })}
        <div class="scr-body">
          ${pageTitle("Outgoing transfers paused", "")}
          <div class="def-group">
            ${defRow("Why", "A routine source-of-funds review triggered by a large deposit")}
            ${defRow("Affected", "Sending and withdrawals")}
            ${defRow("Still working", "Cards, deposits, receiving, investing, earning")}
            ${defRow("What removes it", "Usually nothing from you — reviews clear on their own")}
            ${defRow("Typical time", "Under 1 business day", true)}
            ${defRow("Started", "Today, 9:02 AM")}
          </div>
          <div class="list-tight" style="margin-top:8px">
            ${row({ ic: "statements", title: "Speed it up", sub: "Upload a salary slip or bank statement", act: "up", chev: true })}
            ${row({ ic: "headset", title: "Talk to the review team", sub: "They can see your case directly", go: "support", params: { ctx: "restriction" }, chev: true })}
          </div>
        </div>`;
    },
    onMount(el) {
      el.querySelector('[data-act="up"]')?.addEventListener("click", () => {
        toast("Received — review moved to priority");
        setTimeout(() => { DB.state.scenario.restricted = false; App.renderTop("root"); toast("Restriction lifted"); }, 1600);
      });
    },
  });

  /* 114 · Regulatory — clear, brief */
  Screens.regulatory = () => ({
    render: () => `
      ${navrow({ title: "Protection" })}
      <div class="scr-body">
        ${pageTitle("How you're protected", "The UAE version, in plain words.")}
        <div class="list-tight">
          ${row({ ic: "shield", title: "Licensed in the UAE", sub: "Virtual-asset services under VARA (Dubai) · payments with licensed partner banks" })}
          ${row({ ic: "bank", title: "Your cash is safeguarded", sub: "Held at regulated UAE banks, separate from Fasset's own money" })}
          ${row({ ic: "gold", title: "Your assets are yours", sub: "Gold allocated in DMCC vaults · securities via a regulated broker · crypto 1:1, never lent" })}
          ${row({ ic: "statements", title: "Complaints", sub: "Answer in 2 business days, or escalate to the regulator — we show you how", act: "c" })}
        </div>
        <p class="footnote">Investments can lose value and profit rates vary — protection means honesty and segregation, not guaranteed returns.</p>
      </div>`,
    onMount(el) { el.querySelector('[data-act="c"]').addEventListener("click", () => toast("Complaints flow lives here")); },
  });

  /* 115–116 · Support — context-inheriting */
  Screens.support = (p) => {
    const ctxMap = {
      sp1: { label: "Bank transfer arriving · 3,500 AED", agent: "I can see your 3,500 AED transfer from Emirates NBD, sent 10:04 AM. It's cleared the central bank and should land within the hour. I'll watch it and confirm here the moment it does." },
      sf1: { label: "Failed card top-up · 1,000 AED", agent: "I can see your bank declined the 1,000 AED top-up this morning — their fraud filter, not your account. You weren't charged. Aani works instantly if you don't want to retry the card." },
      sc1: { label: "Declined card payment · Netflix", agent: "That Netflix charge was declined because international payments are off on your card. I can see the switch from here — turn it on in Card → Controls, or say the word and I'll walk you through it." },
      restriction: { label: "Account review", agent: "Your outgoing transfers are paused for a routine source-of-funds review — triggered automatically by your salary deposit, nothing you did. It's in the queue and typically clears within a day. A salary slip upload usually halves that." },
    };
    const ctx = ctxMap[p.ctx];
    const txCtx = !ctx && p.ctx ? DB.ledger().find((x) => x.id === p.ctx) : null;
    return {
      render: () => `
        ${navrow({ title: t("Support") })}
        <div class="scr-body">
          ${pageTitle(t("Support"), "A human, in chat, around the clock. Median first reply: 40 seconds.")}
          ${ctx || txCtx ? `<div class="chat-context">${icon("receipt", 15)}<span>About: <strong>${ctx ? ctx.label : `${txCtx.title} · ${fmt(Math.abs(txCtx.amt))} AED`}</strong></span></div>` : ""}
          <div class="chat">
            <span class="msg-meta">Today ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
            ${ctx || txCtx ? `<div class="msg agent">${ctx ? ctx.agent : `I can see the ${txCtx.title} ${txCtx.kind} for ${fmt(Math.abs(txCtx.amt))} AED right here — no need to explain anything. What would you like to know about it?`}</div>` : `<div class="msg agent">Salam ${DB.state.user.first} — I'm Noora. How can I help?</div>`}
          </div>
          <div class="chat-input-row">
            <input class="input" id="ci" placeholder="Write a message">
            <button class="qa" style="flex:none"><i style="width:44px;height:44px" id="cs">${icon("send", 17)}</i></button>
          </div>
        </div>`,
      onMount(el) {
        const input = el.querySelector("#ci"), chat = el.querySelector(".chat");
        function sendMsg() {
          const v = input.value.trim();
          if (!v) return;
          chat.insertAdjacentHTML("beforeend", `<div class="msg me">${v.replace(/</g, "&lt;")}</div>`);
          input.value = "";
          chat.parentElement.scrollTop = 1e6;
          setTimeout(() => {
            chat.insertAdjacentHTML("beforeend", `<div class="msg agent">On it — give me a few seconds. (This is the demo; the real thread continues with a human.)</div>`);
            chat.parentElement.scrollTop = 1e6;
          }, 900);
        }
        el.querySelector("#cs").addEventListener("click", sendMsg);
        input.addEventListener("keydown", (e) => e.key === "Enter" && sendMsg());
      },
    };
  };

  /* 107 · Nudge inventory — every contextual moment, previewable */
  Screens.nudges = () => ({
    render: () => `
      ${navrow({ title: "Intelligence" })}
      <div class="scr-body">
        ${pageTitle("What the app notices", "Each nudge fires on behaviour, never a marketing calendar. One at a time, always dismissible, always actionable where it appears.")}
        <div class="list-tight">
          ${DB.nudges.map((n) => `
            <div class="mrow" style="cursor:default">
              <span class="m-ic">${icon("earn", 16)}</span>
              <span class="m-body"><span class="m-title">${n.name}</span><span class="m-sub" style="white-space:normal">${n.trigger}</span>
              <span class="m-sub" style="white-space:normal;color:var(--text-default);margin-top:4px">"${n.copy}"</span></span>
              ${n.scenario ? `<button class="btn btn-secondary btn-sm" data-prev="${n.scenario}">Preview</button>` : `<span class="tag">always on</span>`}
            </div>`).join("")}
        </div>
      </div>`,
    onMount(el) {
      el.querySelectorAll("[data-prev]").forEach((b) => b.addEventListener("click", () => {
        const sc = b.dataset.prev;
        Object.keys(DB.state.scenario).forEach((k) => { if (k !== "freshAccount") DB.state.scenario[k] = false; });
        DB.state.scenario[sc] = true;
        DB.state.dismissed = {};
        App.setTab("home");
        UI.toast("Scenario applied — this is Home");
      }));
    },
  });

  /* 108 · Goals — creation and reached state */
  Screens.goals = () => ({
    render() {
      const g = DB.state.goals[0];
      const pct = Math.min(1, g.saved / g.target);
      const reached = g.reached || pct >= 1;
      const C = 2 * Math.PI * 52;
      return `
        ${navrow({ title: "Goals" })}
        <div class="scr-body">
          ${pageTitle("Goals", "Put a name on the money — it saves itself.")}
          <div class="card card-pad" style="border-radius:12px;text-align:center">
            <div class="goal-ring">
              <svg width="120" height="120"><circle class="g-bg" cx="60" cy="60" r="52" fill="none" stroke-width="8"/><circle class="g-fg" cx="60" cy="60" r="52" fill="none" stroke-width="8" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
              <span class="g-c"><span class="strong" style="font-size:20px">${Math.round(pct * 100)}%</span><span class="footnote">funded</span></span>
            </div>
            <div style="margin-top:14px"><span class="strong" style="font-size:16px">${g.name}</span>
            <div class="footnote" style="margin-top:3px">${fmt(g.saved, 0)} of ${fmt(g.target, 0)} AED · ${fmt(g.monthly, 0)} AED auto-saves monthly</div></div>
            ${reached ? `<div class="inline-note" style="justify-content:center;color:var(--accent)">${icon("check", 15)}<span>Reached. Move it to spending, keep it earning, or start the next one.</span></div>` : ""}
            <div style="display:flex;gap:8px;justify-content:center;margin-top:14px">
              ${reached ? `<button class="btn btn-primary btn-sm" data-act="use">Use the money</button>` : `<button class="btn btn-primary btn-sm" data-act="top">Top up 350 AED</button>`}
              <button class="btn btn-secondary btn-sm" data-act="edit">Edit</button>
            </div>
          </div>
          <div class="group-label-m">Start another</div>
          <div class="list-tight">
            ${["Rainy day fund", "New car", "Eid gifts"].map((n) => row({ ic: "target", title: n, sub: "Suggested — tap to set amount and date", act: "new", chev: true })).join("")}
          </div>
        </div>`;
    },
    onMount(el) {
      const g = DB.state.goals[0];
      el.querySelector('[data-act="top"]')?.addEventListener("click", () => {
        g.saved = Math.min(g.target, g.saved + 350);
        if (g.saved >= g.target) g.reached = true;
        App.renderTop("root");
        toast(g.reached ? "Goal reached" : "350 AED added to the goal");
      });
      el.querySelector('[data-act="use"]')?.addEventListener("click", () => toast("Moved to your spending balance"));
      el.querySelector('[data-act="edit"]')?.addEventListener("click", () => toast("Goal editor lives here — demo stub"));
      el.querySelectorAll('[data-act="new"]').forEach((b) => b.addEventListener("click", () => toast("Goal creation lives here — name, target, monthly")));
    },
  });
})();
