/* ————————————————————————————————————————————————
   E. Own — screens 78–90. Holdings organised by outcome
   (Save · Grow · Protect), not by asset class. The user
   chooses what their money should do.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, money, fmt, spark, openSheet, closeSheet, toast, statusHero, defRow, amountScreen, authSheet } = UI;

  const byOutcome = (o) => DB.positions.filter((x) => x.outcome === o && x.value > 0.005);
  const outcomeTotal = (o) => byOutcome(o).reduce((s, x) => s + x.value, 0);

  /* 78 · Own hub — and 90 · empty state */
  Screens.own = () => ({
    render() {
      const total = DB.positions.reduce((s, x) => s + x.value, 0);
      const empty = DB.state.scenario.freshAccount || total < 1;
      if (empty) return `
        <div class="scr-body with-tabbar">
          ${pageTitle(t("Own"), "What your money becomes.")}
          <div class="empty" style="padding:70px 0 24px">You don't own anything here yet.</div>
          <div class="list-tight">
            ${row({ ic: "gold", icTone: "tint", title: "Start with gold", sub: "From 10 AED, vaulted in Dubai", go: "assetDetail", params: { id: "a-gold" }, chev: true })}
            ${row({ ic: "chart", title: "Or one bundle that does it all", sub: "Stocks, sukuk and gold in one purchase", go: "assetDetail", params: { id: "a-bundle-growth" }, chev: true })}
            ${row({ ic: "search", title: `${t("Explore")} everything`, sub: "Gold, stocks, funds, crypto, sukuk", go: "explore", chev: true })}
          </div>
        </div>`;
      return `
        <div class="scr-body with-tabbar">
          ${pageTitle(t("Own"), "")}
          <div class="hero-label">Total holdings</div>
          ${UI.heroMoney(total)}
          <div class="hero-delta"><span class="up">+${fmt(DB.positions.reduce((s, x) => s + (x.value - x.invested), 0))} AED</span> all time · +${fmt(DB.positions.reduce((s, x) => s + (x.value - x.invested), 0) / Math.max(1, DB.positions.reduce((s, x) => s + x.invested, 0)) * 100, 1)}%</div>
          ${spark(7)}
          ${["save", "grow", "protect"].map((o) => {
            const items = byOutcome(o);
            if (!items.length) return "";
            return `
              <button class="mrow" data-go="outcome" data-params='{"o":"${o}"}' style="margin-top:6px">
                <span class="m-ic ${o === "grow" ? "tint" : ""}">${icon(o === "save" ? "leaf" : o === "grow" ? "trendUp" : "shield", 17)}</span>
                <span class="m-body"><span class="m-title">${t(DB.outcomes[o].name)}</span><span class="m-sub">${items.map((x) => x.name).join(" · ")}</span></span>
                <span class="m-right"><span class="m-amt">${money(outcomeTotal(o))}</span></span>
                <span class="chev">${icon("chevronRight", 14)}</span>
              </button>`;
          }).join("")}
          <div class="cta-dock stack-8" style="position:static;margin-top:20px">
            <button class="btn btn-primary btn-hero" data-go="explore">${t("Explore")} — gold, stocks, funds, crypto</button>
            <button class="btn btn-ghost btn-hero" data-go="holdings">All holdings</button>
          </div>
        </div>`;
    },
  });

  /* 79 · Outcome detail */
  Screens.outcome = (p) => ({
    render() {
      const o = DB.outcomes[p.o];
      const items = byOutcome(p.o);
      return `
        ${navrow({ title: t(o.name) })}
        <div class="scr-body">
          ${pageTitle(t(o.name), o.blurb)}
          <div class="hero-label">In ${o.name.toLowerCase()}</div>
          ${UI.heroMoney(outcomeTotal(p.o))}
          <div class="group-label-m">Positions</div>
          <div class="list-tight">
            ${items.map((x) => row({ ic: x.icon, title: x.name, sub: x.sub, right: `<span class="m-amt">${money(x.value)}</span><span class="m-when" style="color:${x.value >= x.invested ? "var(--accent)" : "var(--negative)"}">${x.value >= x.invested ? "+" : ""}${fmt((x.value - x.invested) / x.invested * 100, 1)}%</span>`, go: "positionDetail", params: { id: x.id }, chev: false })).join("")}
          </div>
          <div class="group-label-m">Add to ${o.name.toLowerCase()}</div>
          <div class="list-tight">
            ${DB.catalogue.filter((c) => c.outcome === p.o).slice(0, 3).map((c) => row({ ic: c.icon, title: c.name, sub: c.sub, go: "assetDetail", params: { id: c.id }, chev: true })).join("")}
          </div>
        </div>`;
    },
  });

  /* 80 · Explore */
  Screens.explore = (p) => ({
    render() {
      const groups = [...new Set(DB.catalogue.map((c) => c.group))];
      return `
        ${navrow({ title: t("Explore") })}
        <div class="scr-body">
          ${pageTitle(t("Explore"), p.forRedeem ? "Pick the asset your points become." : "Everything you can own here. No charts to read — each one says what it's for.")}
          ${groups.map((g) => `
            <div class="group-label-m">${g}</div>
            <div class="list-tight">
              ${DB.catalogue.filter((c) => c.group === g).map((c) => row({
                ic: c.icon, title: c.name,
                sub: `${c.sub} · <span class="faint">${c.risk}</span>`,
                go: p.forRedeem ? "redeemAmount" : "assetDetail",
                params: p.forRedeem ? { target: c.id === "a-btc" ? "btc" : c.id === "a-gold" ? "gold" : "bundle" } : { id: c.id },
                chev: true,
              })).join("")}
            </div>`).join("")}
        </div>`;
    },
  });

  /* 81–82 · Bundle / asset detail — same pattern for both */
  Screens.assetDetail = (p) => ({
    render() {
      const a = DB.catalogue.find((x) => x.id === p.id) || DB.catalogue[0];
      const isBundle = a.group === "Bundles";
      return `
        ${navrow({ title: a.name })}
        <div class="scr-body">
          ${pageTitle(a.name, a.blurb)}
          <div class="spread" style="margin-top:2px">
            <span><div class="stat-k">${isBundle ? "Unit price" : "Price"}</div><div class="stat-v" style="font-size:20px">${a.sub.split("·").pop().trim()}</div></span>
            <span class="tag">${a.risk}</span>
          </div>
          ${spark(a.id.length * 3, 340, 84, a.risk !== "High risk")}
          ${isBundle ? `
            <div class="group-label-m">What's inside</div>
            <div class="def-group">
              ${a.id === "a-bundle-growth" ? defRow("World stocks", "60%") + defRow("Sukuk", "20%") + defRow("Gold", "20%")
              : a.id === "a-bundle-income" ? defRow("Investment-grade sukuk", "70%") + defRow("Income funds", "30%")
              : defRow("Vaulted gold", "100%")}
            </div>` : ""}
          <div class="group-label-m">Plain facts</div>
          <div class="def-group">
            ${defRow("Fee", a.fee)}
            ${defRow("Minimum", "10 AED")}
            ${defRow("Sell", "Any time — back in your balance in seconds")}
            ${defRow("Custody", a.group === "Metals" ? "Allocated and vaulted, DMCC Dubai" : a.group === "Crypto" ? "Held 1:1, regulated custody" : "Held in your name via our partner broker")}
          </div>
          ${a.risk === "High risk" ? `<div class="inline-note">${icon("infoCircle", 15)}<span>Prices can drop fast. A common approach is a small, regular amount — not everything at once.</span></div>` : ""}
          <div class="cta-dock"><button class="btn btn-primary btn-hero" data-go="buyAmount" data-params='{"id":"${a.id}"}'>${t("Buy")} ${a.name}</button></div>
        </div>`;
    },
  });

  /* 83 · Amount */
  Screens.buyAmount = (p) => {
    const a = DB.catalogue.find((x) => x.id === p.id) || DB.catalogue[0];
    const gate = DB.state.user.tier < 1;
    if (gate) return {
      render: () => `
        ${navrow({ title: a.name })}
        <div class="scr-body">
          ${statusHero({ tone: "quiet", ic: "id", title: "One step before you invest", sub: "UAE rules ask us to verify identity before you buy assets. Two minutes with your Emirates ID and you're in." })}
          <div class="cta-dock stack-8">
            <button class="btn btn-primary btn-hero" data-go="kycIntro" data-params='{"unlock":"invest"}'>Verify and continue</button>
            <button class="btn btn-ghost btn-hero" data-back>Not now</button>
          </div>
        </div>`,
    };
    return amountScreen({
      navTitle: a.name, title: `${t("Buy")} ${a.name}`, sub: "",
      sourceLabel: "Paying from", sourceLine: "AED balance", sourceIcon: "wallet", sourceLocked: true,
      ccy: "AED", min: 10, max: DB.totals().available, chips: [100, 500, 1000],
      quote(n) {
        if (!n) return `From 10 AED · fee ${a.fee}`;
        const unit = parseFloat(a.sub.replace(/[^0-9.]/g, "")) || 100;
        const qty = n / unit;
        const unitName = a.group === "Metals" ? "g" : a.group === "Bundles" ? "units" : a.group === "Stocks" ? "shares" : a.name === "Bitcoin" ? "BTC" : "ETH";
        return `You'll own <strong>${fmt(qty, a.name === "Bitcoin" ? 6 : 3)} ${unitName}</strong>`;
      },
      overMax: () => `<span style="color:var(--negative)">More than your available balance</span>`,
      cta: "Review",
      onConfirm(n) { App.go("buyReview", { id: p.id, amt: n }); },
    });
  };

  /* 84–85 · Review + confirm */
  Screens.buyReview = (p) => ({
    render() {
      const a = DB.catalogue.find((x) => x.id === p.id) || DB.catalogue[0];
      const feePct = parseFloat(a.fee) || 0.5;
      const fee = a.fee.includes("/yr") ? 0 : p.amt * feePct / 100;
      return `
        ${navrow({ title: "Review" })}
        <div class="scr-body">
          ${pageTitle("Check and buy", "")}
          ${row({ ic: a.icon, title: a.name, sub: a.group })}
          <div class="def-group" style="margin-top:10px">
            ${defRow("Amount", money(p.amt), true)}
            ${defRow("Paying from", "AED balance")}
            ${defRow(a.fee.includes("/yr") ? "Ongoing fee" : "Trade fee", a.fee.includes("/yr") ? a.fee + " · nothing today" : money(fee))}
            ${defRow("Total today", money(p.amt + fee), true)}
            ${defRow("Executed", "Instantly at the live price")}
          </div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="buy">${t("Buy")} · ${fmt(p.amt + fee)} AED</button></div>
        </div>`;
    },
    onMount(el, p) {
      el.querySelector("#buy").addEventListener("click", () => authSheet(() => {
        const a = DB.catalogue.find((x) => x.id === p.id) || DB.catalogue[0];
        DB.state.balances.available -= p.amt;
        DB.state.balances.invested += p.amt;
        const posMap = { "a-gold": "p-gold", "a-btc": "p-btc", "a-bundle-growth": "p-bundle" };
        const pos = DB.positions.find((x) => x.id === posMap[a.id]);
        if (pos) { pos.value += p.amt; pos.invested += p.amt; }
        else DB.positions.push({ id: "p-" + a.id, outcome: a.outcome, name: a.name, sub: a.group, value: p.amt, invested: p.amt, earned: 0, type: "asset", icon: a.icon, feesPaid: 0 });
        DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "buy", title: `Bought ${a.name.toLowerCase()}`, sub: `${fmt(p.amt)} AED`, amt: -p.amt, status: "completed", cat: "Investments" });
        App.go("buySuccess", { id: p.id, amt: p.amt }, { replace: true });
      }, `${t("Buy")} ${a.name}`));
    },
  });

  /* 86 · Success */
  Screens.buySuccess = (p) => ({
    render() {
      const a = DB.catalogue.find((x) => x.id === p.id) || DB.catalogue[0];
      const posMap = { "a-gold": "p-gold", "a-btc": "p-btc", "a-bundle-growth": "p-bundle" };
      const posId = posMap[a.id] || "p-" + a.id;
      return `
        ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
        <div class="scr-body">
          ${statusHero({ title: "You own it", sub: `${fmt(p.amt)} AED of ${a.name} is now in your holdings, under ${DB.outcomes[a.outcome].name}.` })}
          <button class="nudge-card" data-go="positionDetail" data-params='{"id":"${posId}"}'>
            <span class="n-ic">${icon("own", 17)}</span>
            <span style="flex:1"><span class="n-title">See the position</span><div class="n-sub">Value, returns and history — all on one screen.</div></span>
            <span class="chev">${icon("chevronRight", 14)}</span>
          </button>
          <div class="list-tight" style="margin-top:10px">
            ${row({ ic: "refresh", title: "Make it monthly", sub: "Auto-invest the same amount each month", act: "auto" })}
          </div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
        </div>`;
    },
    onMount(el) { el.querySelector('[data-act="auto"]').addEventListener("click", () => toast("Auto-invest set for the 1st of each month", "calendar")); },
  });

  /* 87 · Position detail — performance on the primary screen */
  Screens.positionDetail = (p) => ({
    render() {
      const x = DB.positions.find((y) => y.id === p.id) || DB.positions[0];
      const ret = x.value - x.invested;
      const retPct = x.invested > 0 ? (ret / x.invested) * 100 : 0;
      const isYield = x.type === "yield";
      return `
        ${navrow({ title: x.name })}
        <div class="scr-body">
          ${pageTitle(x.name, x.sub)}
          <div class="hero-label">Worth now</div>
          ${UI.heroMoney(x.value)}
          <div class="hero-delta"><span class="${ret >= 0 ? "up" : "down"}">${ret >= 0 ? "+" : "−"}${fmt(Math.abs(ret))} AED · ${ret >= 0 ? "+" : ""}${fmt(retPct, 1)}%</span> all time</div>
          ${spark(x.id.length * 5, 340, 84, ret >= 0)}
          <div class="stat-strip-m">
            <div><div class="stat-k">You put in</div><div class="stat-v">${money(x.invested)}</div></div>
            <div><div class="stat-k">${isYield ? "Profit earned" : "Total return"}</div><div class="stat-v" style="color:${ret >= 0 ? "var(--accent)" : "var(--negative)"}">${ret >= 0 ? "+" : "−"}${fmt(Math.abs(isYield ? x.earned : ret))} <span class="faint">AED</span></div></div>
            ${x.avg ? `<div><div class="stat-k">Average price</div><div class="stat-v" style="font-size:14px">${x.avg.replace("Avg buy ", "")}</div></div>` : ""}
            ${x.feesPaid !== undefined ? `<div><div class="stat-k">Fees paid, ever</div><div class="stat-v">${money(x.feesPaid)}</div></div>` : ""}
            ${isYield ? `<div><div class="stat-k">Rate now</div><div class="stat-v" style="color:var(--accent)">~4.2%</div><div class="stat-s">variable</div></div><div><div class="stat-k">Next profit</div><div class="stat-v" style="font-size:14px">Tomorrow 6 AM</div></div>` : ""}
          </div>
          ${isYield ? `<div class="inline-note">${icon("infoCircle", 15)}<span>The rate is a profit share and moves with the market — it isn't guaranteed.</span></div>` : ""}
          <div class="qa-row" style="margin-top:20px">
            <button class="qa" data-act="add"><i>${icon("plus", 19)}</i>${t("Add")}</button>
            <button class="qa quiet" data-act="sell"><i>${icon("arrowUpRight", 19)}</i>${isYield ? t("Withdraw") : t("Sell")}</button>
            <button class="qa quiet" data-act="hist"><i>${icon("receipt", 19)}</i>History</button>
          </div>
          ${x.id === "p-gold" ? `<p class="footnote center" style="padding-top:16px">Allocated grams in the DMCC vault, audited quarterly. You can request physical delivery from 100 g.</p>` : ""}
        </div>`;
    },
    onMount(el, p) {
      const x = DB.positions.find((y) => y.id === p.id) || DB.positions[0];
      el.querySelector('[data-act="add"]').addEventListener("click", () => {
        if (x.type === "yield") App.go("yieldAmount", { id: "y-usd" });
        else App.go("buyAmount", { id: { "p-gold": "a-gold", "p-btc": "a-btc", "p-bundle": "a-bundle-growth" }[x.id] || "a-gold" });
      });
      el.querySelector('[data-act="sell"]').addEventListener("click", () => {
        if (x.type === "yield") App.go("yieldWithdraw");
        else App.go("sellFlow", { id: x.id });
      });
      el.querySelector('[data-act="hist"]').addEventListener("click", () => App.go("activity"));
    },
  });

  /* 88 · Sell / reduce */
  Screens.sellFlow = (p) => {
    const x = DB.positions.find((y) => y.id === p.id) || DB.positions[0];
    return amountScreen({
      navTitle: `${t("Sell")} ${x.name.toLowerCase()}`,
      destLine: `${x.name} → AED balance`, destIcon: x.icon, destLocked: true,
      sub: "Money lands in your AED balance in seconds.",
      ccy: "AED", min: 10, max: x.value, chips: [500, "Max"],
      quote: (n) => n ? `Fee 0.5% · you'll receive ${fmt(n * 0.995)} AED` : `Position worth ${fmt(x.value)} AED`,
      overMax: () => `<span style="color:var(--negative)">More than the position holds</span>`,
      cta: "Review",
      onConfirm(n) {
        openSheet({
          title: "Confirm sale",
          body: `<div class="def-group">
              ${defRow("Selling", `${x.name} · ${money(n)}`)}
              ${defRow("Fee", money(n * 0.005))}
              ${defRow("You receive", money(n * 0.995), true)}
              ${defRow("When", "Instantly, at the live price")}
            </div>`,
          foot: `<button class="btn btn-primary" id="sc">${t("Sell")}</button>`,
          onMount(sheet) {
            sheet.querySelector("#sc").addEventListener("click", () => {
              closeSheet(true);
              authSheet(() => {
                x.value -= n; x.invested = Math.max(0, x.invested - n);
                DB.state.balances.invested -= n;
                DB.state.balances.available += n * 0.995;
                DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "sell", title: `Sold ${x.name.toLowerCase()}`, sub: "Instant", amt: n * 0.995, status: "completed", cat: "Investments" });
                App.go("depositSuccess", { amt: n * 0.995, method: "sale" }, { replace: true });
              }, "Confirm sale");
            });
          },
        });
      },
    });
  };

  /* 89 · Holdings list across every asset type */
  Screens.holdings = () => ({
    render: () => `
      ${navrow({ title: t("Holdings") })}
      <div class="scr-body">
        ${pageTitle("All holdings", "Everything you own, whatever kind of thing it is.")}
        <div class="list-tight">
          ${DB.positions.filter((x) => x.value > 0.005).map((x) => row({
            ic: x.icon, title: x.name, sub: `${DB.outcomes[x.outcome].name} · ${x.sub}`,
            right: `<span class="m-amt">${money(x.value)}</span><span class="m-when" style="color:${x.value >= x.invested ? "var(--accent)" : "var(--negative)"}">${x.value >= x.invested ? "+" : ""}${fmt((x.value - x.invested) / Math.max(1, x.invested) * 100, 1)}%</span>`,
            go: "positionDetail", params: { id: x.id },
          })).join("")}
        </div>
      </div>`,
  });
})();
