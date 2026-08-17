/* ————————————————————————————————————————————————
   B. Home — screens 9–17. One total first, one
   recommendation at a time, activity across everything.
   Carries the account info from the reference screen:
   total balance + change, sub-balances, USD account, card,
   quick actions, Fasset Tag, invite & earn.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, txRow, money, moneyUsd, heroMoney, fmt, openSheet, toast, statusHero } = UI;
  let hideBalance = false;

  Screens.home = () => ({
    render() {
      const b = DB.totals();
      const zero = DB.state.scenario.freshAccount;
      const nba = DB.nextBestAction();
      const ledger = DB.ledger().slice(0, 4);
      const initials = DB.state.user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

      const balHtml = hideBalance
        ? `<div class="hero-money" dir="ltr">•••••<span class="money-ccy">AED</span></div>`
        : heroMoney(b.total);

      return `
        <div class="navrow" style="min-height:52px;padding:6px 16px 0">
          <button class="icon-btn" data-go="account" style="width:44px;height:44px" aria-label="${t("Your account")}"><span class="av-tint">${initials}</span></button>
          <span></span>
          <button class="icon-btn notif-btn has-unread" data-go="notifications" aria-label="${t("Notifications")}">${icon("bell", 18)}</button>
        </div>
        <div class="scr-body with-tabbar">
          <div style="padding-top:10px">
            <div class="hero-label">${t("Total balance")}
              <button data-act="toggle-bal" class="icon-btn" style="width:26px;height:26px;color:var(--text-faint)">${icon(hideBalance ? "eyeOff" : "eye", 14)}</button>
            </div>
            ${balHtml}
            <div class="hero-delta">${zero ? `Your account is open and working.` : hideBalance ? "" : `<span class="up">+412.60 AED</span> ${t("Today").toLowerCase()} · <button class="inv-link" data-set-tab="own">${t("Invested")} ${fmt(b.invested, 0)} AED</button>`}</div>
          </div>

          ${zero ? "" : `<div style="margin:16px -20px 0">${UI.spark(9, 393, 68)}</div>`}

          <div class="act-row">
            <button class="btn btn-accent" data-go="addmoney">${icon("plus", 15)} ${t("Add money")}</button>
            ${zero
              ? `<button class="btn btn-secondary" data-go="receive">${icon("arrowDownLeft", 15)} ${t("Receive")}</button>
                 <button class="btn btn-secondary" data-go="referral">${icon("gift", 15)} Invite</button>`
              : `<button class="btn btn-secondary" data-go="send">${icon("send", 14)} ${t("Send")}</button>
                 <button class="btn btn-secondary" data-go="convert">${icon("refresh", 14)} Convert</button>`}
          </div>

          ${DB.state.scenario.restricted ? `
            <button class="nudge-strip warn" data-go="restrictions">
              <i class="nd"></i><span class="nt">Outgoing transfers are paused · a routine review</span>
              <span class="chev">${icon("chevronRight", 13)}</span>
            </button>` : ""}

          ${nba ? `
            <button class="nudge-strip ${nba.tone}" data-act="nba">
              <i class="nd"></i><span class="nt">${nba.title}</span>
              <span class="n-x2" data-act="nba-x" role="button" aria-label="Dismiss">${icon("close", 11)}</span>
              <span class="chev">${icon("chevronRight", 13)}</span>
            </button>` : ""}

          ${zero ? "" : `
          <div class="bal-cards">
            <button class="bcard tint" data-act="cash"><span class="bc-k">${icon("wallet", 13)} Cash</span><span class="bc-v" style="display:block">${hideBalance ? "•••" : money(13424.08, "AED", { dec: 0 })}</span></button>
            <button class="bcard" data-go="acctUSD"><span class="bc-k">${icon("globe", 13)} USD account</span><span class="bc-v" style="display:block">${hideBalance ? "•••" : moneyUsd(1360.4)}</span></button>
            <button class="bcard dark" data-set-tab="own"><span class="bc-k">${icon("own", 13)} ${t("Invested")}</span><span class="bc-v" style="display:block">${hideBalance ? "•••" : money(b.invested, "AED", { dec: 0 })}</span></button>
            <button class="bcard" data-go="positionDetail" data-params='{"id":"p-usd"}'><span class="bc-k">${icon("leaf", 13)} ${t("Earning")} · 4.2%</span><span class="bc-v" style="display:block">${hideBalance ? "•••" : money(b.earning, "AED", { dec: 0 })}</span></button>
            <button class="bcard" data-go="points"><span class="bc-k">${icon("earn", 13)} ${t("Rewards")}</span><span class="bc-v" style="display:block">${hideBalance ? "•••" : fmt(DB.points, 0) + " pts"}</span></button>
          </div>`}

          <div class="section-head" style="margin-top:26px"><h2 style="font-size:16px;font-weight:var(--w-medium)">${t("Activity")}</h2><a class="link" data-go="activity" style="margin-inline-start:auto;cursor:pointer">${t("See all")}</a></div>
          ${zero ? `<div class="empty" style="padding:36px 0">Nothing yet — your first top-up will appear here.</div>`
          : `<div class="list-tight">${ledger.map(txRow).join("")}</div>`}
        </div>`;
    },
    onMount(el) {
      el.querySelector('[data-act="toggle-bal"]').addEventListener("click", () => { hideBalance = !hideBalance; App.renderTop("root"); });
      const nba = DB.nextBestAction();
      const nbaEl = el.querySelector('[data-act="nba"]');
      if (nbaEl && nba) {
        nbaEl.addEventListener("click", (e) => {
          if (e.target.closest('[data-act="nba-x"]')) { DB.state.dismissed[nba.id] = true; App.renderTop("root"); return; }
          App.go(nba.go, nba.params || {});
        });
      }
      el.querySelector('[data-act="cash"]')?.addEventListener("click", () => openSheet({
        title: "Cash",
        body: `<div class="list-tight">
            ${row({ ic: "wallet", title: "AED balance", sub: "Spend, send, invest from here", right: money(13424.08) })}
            ${row({ ic: "bank", title: "AED account details", sub: "IBAN for salary and transfers", go: "acctAED", chev: true })}
            ${row({ ic: "send", title: t("Your Fasset Tag"), sub: `${DB.state.user.tag} · ${t("Pay friends as easily as sending a message.")}`, go: "receiveDetails", params: { m: "tag" }, chev: true })}
            ${row({ ic: "bank", title: t("Withdraw"), sub: "Back to any bank, free", go: "withdraw", chev: true })}
          </div>`,
      }));
    },
  });

  /* 16 · Full activity — filterable across every product */
  Screens.activity = () => {
    let filter = "all", q = "";
    const FILTERS = [["all", "All"], ["in", "In"], ["out", "Out"], ["card", "Card"], ["invest", "Investing"], ["rewards", "Rewards"]];
    const match = (tx) => {
      if (q && !(tx.title + " " + (tx.sub || "")).toLowerCase().includes(q.toLowerCase())) return false;
      switch (filter) {
        case "in": return tx.amt > 0 && ["deposit", "receive", "yield"].includes(tx.kind);
        case "out": return ["send", "withdraw"].includes(tx.kind);
        case "card": return tx.kind === "card";
        case "invest": return ["buy", "sell", "yield"].includes(tx.kind);
        case "rewards": return tx.kind === "reward";
        default: return true;
      }
    };
    return {
      render() {
        const groups = [];
        DB.ledger().filter(match).forEach((tx) => {
          let g = groups.find((x) => x.when === tx.when);
          if (!g) groups.push((g = { when: tx.when, txs: [] }));
          g.txs.push(tx);
        });
        return `
          ${navrow({ title: t("Activity") })}
          <div class="scr-body">
            ${pageTitle(t("Activity"), "Everything, across your whole account.")}
            <div class="tx-search" style="margin-bottom:4px">${icon("search", 14)}<input class="tx-search-input" id="q" placeholder="Search merchants, people, assets" value="${q}"></div>
            <div class="seg" style="margin-top:12px">${FILTERS.map(([id, l]) => `<button class="seg-btn ${filter === id ? "active" : ""}" data-f="${id}">${l}</button>`).join("")}</div>
            <div id="tx-list">
            ${groups.length === 0 ? `<div class="empty">Nothing matches that.</div>`
              : groups.map((g) => `<div class="group-label-m">${g.when}</div><div class="list-tight">${g.txs.map(txRow).join("")}</div>`).join("")}
            </div>
          </div>`;
      },
      onMount(el) {
        el.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.f; App.renderTop("root"); }));
        const qi = el.querySelector("#q");
        qi.addEventListener("input", () => { q = qi.value; App.renderTop("root"); setTimeout(() => { const n = document.querySelector("#q"); if (n) { n.focus(); n.setSelectionRange(q.length, q.length); } }, 0); });
      },
    };
  };

  /* 17 · Activity detail — receipt, route, fee, support entry */
  Screens.txDetail = (params) => ({
    render() {
      const tx = DB.ledger().find((x) => x.id === params.id) || DB.ledger()[0];
      const failed = tx.status === "failed", pending = tx.status === "pending";
      const amtStr = tx.pts ? `+${tx.amt} pts` : money(tx.amt, "AED", { sign: tx.amt > 0 });
      return `
        ${navrow({ title: tx.title })}
        <div class="scr-body">
          ${statusHero({
            tone: failed ? "neg" : pending ? "warn" : tx.amt > 0 ? "" : "quiet",
            ic: failed ? "alert" : pending ? "clock" : "check",
            pulse: pending,
            title: amtStr,
            sub: `${tx.title} · ${tx.when} ${tx.time}`,
          })}
          ${failed && tx.declineReason === "intl" ? `
            <button class="nudge-card neg" data-go="cardDeclineDetail"><span class="n-ic">${icon("alert", 16)}</span>
              <span style="flex:1"><span class="n-title">Why it was declined</span><div class="n-sub">International payments are switched off on your card. Turn them on and try again.</div></span>
              <span class="chev">${icon("chevronRight", 14)}</span></button>` : ""}
          ${failed && tx.kind === "deposit" ? `
            <button class="nudge-card neg" data-go="depositFailed"><span class="n-ic">${icon("alert", 16)}</span>
              <span style="flex:1"><span class="n-title">Why it failed</span><div class="n-sub">Your bank declined the charge. See ways to fix it.</div></span>
              <span class="chev">${icon("chevronRight", 14)}</span></button>` : ""}
          <div class="def-group" style="margin-top:20px">
            ${UI.defRow("Status", `<span class="status status-${tx.status}"><i class="dot"></i>${tx.status === "completed" ? "Completed" : tx.status === "pending" ? "On its way" : "Didn't go through"}</span>`)}
            ${tx.route ? UI.defRow("Route", tx.route) : ""}
            ${tx.rate ? UI.defRow("Rate", tx.rate) : ""}
            ${tx.fee !== undefined ? UI.defRow("Fee", tx.fee === 0 ? "Free" : money(tx.fee)) : ""}
            ${UI.defRow("Category", tx.cat || "General")}
            ${UI.defRow("Reference", `FST-2026-${tx.id.toUpperCase()}84${tx.id.length}`)}
            ${tx.kind === "card" ? UI.defRow("Card", "Fasset Plus ·· 4821") : ""}
          </div>
          <div class="divider-q"></div>
          <div class="list-tight">
            ${tx.kind === "card" && tx.status === "completed" ? row({ ic: "refresh", title: "Dispute this payment", sub: "If you don't recognise it", act: "dispute" }) : ""}
            ${row({ ic: "receipt", title: "Download receipt", sub: "PDF with full details", act: "receipt" })}
            ${row({ ic: "headset", title: "Get help with this", sub: "Support sees this exact payment", go: "support", params: { ctx: tx.id } })}
          </div>
        </div>`;
    },
    onMount(el) {
      el.querySelector('[data-act="receipt"]')?.addEventListener("click", () => toast("Receipt saved"));
      el.querySelector('[data-act="dispute"]')?.addEventListener("click", () => toast("We'll walk you through it in chat", "headset"));
    },
  });

  /* 117 · Notifications */
  Screens.notifications = () => ({
    render: () => `
      ${navrow({ title: t("Notifications") })}
      <div class="scr-body">
        ${pageTitle(t("Notifications"))}
        <div class="list-tight">
          ${row({ ic: "leaf", icTone: "tint", title: "Your savings earned 2.31 AED", sub: "Today 6:00 AM · profit share added", go: "positionDetail", params: { id: "p-usd" } })}
          ${row({ ic: "cards", title: "Careem · 24.50 AED", sub: "Today 9:12 AM · Fasset Plus", go: "txDetail", params: { id: "t1" } })}
          ${row({ ic: "earn", icTone: "tint", title: "96 OWN points added", sub: "Aug 14 · card spending this week", go: "points" })}
          ${row({ ic: "arrowDownLeft", title: "Omar paid you 180.00 AED", sub: "Aug 12 · dinner split", go: "txDetail", params: { id: "t9" } })}
          ${row({ ic: "shield", title: "New sign-in on iPhone 17", sub: "Aug 10 · Dubai, UAE · that was you?", go: "security" })}
        </div>
        <p class="footnote center" style="padding-top:18px">Alerts are sent the moment things happen — payments, declines, deposits, profit.</p>
      </div>`,
  });
})();
