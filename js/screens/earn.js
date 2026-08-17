/* ————————————————————————————————————————————————
   D. Earn — screens 61–77. One earn rule, one redemption
   logic: points become things you own.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, money, fmt, openSheet, closeSheet, toast, statusHero, defRow, amountScreen, authSheet } = UI;

  const ptsAED = () => DB.points * DB.pointRate;

  /* 61 · Earn hub — everything that earns, in one place */
  Screens.earn = () => ({
    render: () => `
      <div class="scr-body with-tabbar">
        ${pageTitle(t("Earn"), "Points on what you do, profit on what you park.")}
        <button class="card card-pad w-100" data-go="points" style="border-radius:12px;text-align:start;padding:18px">
          <div class="spread">
            <span><div class="stat-k">${t("OWN points")}</div>
            <div class="hero-money" dir="ltr" style="font-size:30px;margin-top:4px">${fmt(DB.points, 0)}<span class="money-ccy">pts</span></div>
            <div class="stat-s" style="margin-top:4px">Worth ${fmt(ptsAED())} AED · earning 1 pt per 10 AED of card spend</div></span>
            <span class="m-ic tint" style="width:44px;height:44px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center">${icon("earn", 20)}</span>
          </div>
        </button>
        ${DB.state.scenario.rewardReady ? `
          <button class="nudge-card" data-go="redeem">
            <span class="n-ic">${icon("own", 17)}</span>
            <span style="flex:1"><span class="n-title">${t("Use points")}</span><div class="n-sub">Turn ${fmt(DB.points, 0)} points into gold, a fund, or spending money.</div></span>
            <span class="chev">${icon("chevronRight", 14)}</span>
          </button>` : ""}

        <div class="group-label-m">Grow your money</div>
        <div class="list-tight">
          ${DB.yieldProducts.map((y) => row({ ic: "leaf", icTone: "tint", title: `${y.name} · <span style="color:var(--accent)">${y.rate}</span> <span class="faint">${y.rateNote}</span>`, sub: y.sub, go: "yieldDetail", params: { id: y.id }, chev: true })).join("")}
        </div>

        <div class="group-label-m">Earning streams</div>
        <div class="list-tight">
          ${row({ ic: "cards", title: "Card cashback", sub: "86.40 AED this month · paid as points", go: "cashback", chev: true })}
          ${row({ ic: "gift", title: "Invite friends", sub: "150 pts each · 3 joined so far", go: "referral", chev: true })}
          ${row({ ic: "flame", title: "Streak · 5 days", sub: "Do one money action a day for a boost", go: "streaks", chev: true })}
          ${row({ ic: "earn", title: "Ways to earn more", sub: "5 activities worth up to 800 pts", go: "earnTasks", chev: true })}
        </div>
      </div>`,
  });

  /* 62 · OWN points detail */
  Screens.points = () => ({
    render: () => `
      ${navrow({ title: t("OWN points") })}
      <div class="scr-body">
        ${pageTitle(t("OWN points"), "")}
        <div class="hero-label">Your points</div>
        <div class="hero-money" dir="ltr">${fmt(DB.points, 0)}<span class="money-ccy">pts</span></div>
        <div class="hero-delta">= <strong>${fmt(ptsAED())} AED</strong> today · 1 pt = 0.15 AED, always</div>
        <div class="cta-dock stack-8" style="position:static;margin-top:18px">
          <button class="btn btn-primary btn-hero" data-go="redeem">${t("Use points")}</button>
        </div>
        <div class="group-label-m">How you earn now</div>
        <div class="def-group">
          ${defRow("Card spending", "1 pt per 10 AED")}
          ${defRow("Salary landing here", "300 pts, monthly")}
          ${defRow("Friends who join", "150 pts each")}
          ${defRow("Streak boost", "+10% while a streak is alive")}
        </div>
        <div class="group-label-m">Latest points</div>
        <div class="list-tight">
          ${row({ ic: "cards", title: "Card spending this week", sub: "Aug 14", right: `<span class="m-amt positive">+96 pts</span>` })}
          ${row({ ic: "gift", title: "Sara joined with your link", sub: "Aug 9", right: `<span class="m-amt positive">+150 pts</span>` })}
          ${row({ ic: "flame", title: "7-day streak bonus", sub: "Aug 3", right: `<span class="m-amt positive">+40 pts</span>` })}
        </div>
        <button class="mrow" data-go="earnTasks"><span class="m-ic">${icon("earn", 16)}</span><span class="m-body"><span class="m-title">What earns more?</span><span class="m-sub">5 activities worth up to 800 pts</span></span><span class="chev">${icon("chevronRight", 14)}</span></button>
      </div>`,
  });

  /* 63 · Earn-more activity list */
  Screens.earnTasks = () => ({
    render: () => `
      ${navrow({ title: "Earn more" })}
      <div class="scr-body">
        ${pageTitle("Ways to earn more", "Real actions, real points. No spinning wheels.")}
        <div class="list-tight">
          ${DB.earnTasks.map((e) => row({
            ic: e.icon, icTone: e.done ? "tint" : "",
            title: e.done ? `<s style="opacity:0.6">${e.name}</s>` : e.name,
            sub: e.done ? "Done — points added" : e.sub,
            right: `<span class="m-amt ${e.done ? "pending" : "positive"}">+${e.pts} pts</span>`,
            act: e.done ? undefined : "task", params: { id: e.id },
          })).join("")}
        </div>
      </div>`,
    onMount(el) {
      el.querySelectorAll('[data-act="task"]').forEach((b) => b.addEventListener("click", () => {
        const id = JSON.parse(b.dataset.params).id;
        const route = { e1: "acctAED", e2: "referral", e4: "card", e5: "yieldDetail" }[id];
        App.go(route || "earn", id === "e5" ? { id: "y-usd" } : {});
      }));
    },
  });

  /* 64 · Streaks */
  Screens.streaks = () => ({
    render: () => `
      ${navrow({ title: "Streak" })}
      <div class="scr-body">
        ${statusHero({ ic: "flame", title: "5 days going", sub: "One money action a day — a payment, a top-up, a save — keeps it alive. Streaks add +10% to every point you earn." })}
        <div class="streak-grid">
          ${["M", "T", "W", "T", "F", "S", "S"].map((d, i) => `<span class="sd ${i < 5 ? "hit" : ""} ${i === 4 ? "today" : ""}"><i></i>${d}</span>`).join("")}
        </div>
        <div class="def-group" style="margin-top:26px">
          ${defRow("Current boost", "+10% on all points")}
          ${defRow("At 14 days", "+15%")}
          ${defRow("Longest streak", "11 days")}
        </div>
        <p class="footnote">Miss a day? Streaks pause on UAE public holidays and weekends don't break them.</p>
      </div>`,
  });

  /* 65 · Referral */
  Screens.referral = () => ({
    render: () => `
      ${navrow({ title: "Invite" })}
      <div class="scr-body">
        ${pageTitle("Invite friends", "You each get 150 points when they add money for the first time. Points, not vouchers — they become real assets.")}
        <div class="card card-pad" style="border-radius:12px;text-align:center">
          <div class="stat-k">Your link</div>
          <div style="font-family:var(--font-mono);font-size:14px;margin-top:6px" dir="ltr">fasset.me/join/${DB.state.user.tag.slice(1)}</div>
        </div>
        <div class="cta-dock stack-8" style="position:static;margin-top:12px">
          <button class="btn btn-primary btn-hero" data-act="share">${icon("share", 15)} Share your link</button>
          <button class="btn btn-secondary btn-hero" data-copy="fasset.me/join/${DB.state.user.tag.slice(1)}">${icon("copy", 15)} ${t("Copy")}</button>
        </div>
        <div class="group-label-m">Your invites</div>
        <div class="list-tight">
          ${row({ av: "S", title: "Sara M.", sub: "Joined and funded · Aug 9", right: `<span class="m-amt positive">+150 pts</span>` })}
          ${row({ av: "K", title: "Karim A.", sub: "Joined and funded · Jul 28", right: `<span class="m-amt positive">+150 pts</span>` })}
          ${row({ av: "T", title: "Tariq B.", sub: "Joined · hasn't funded yet", right: `<span class="m-amt pending">waiting</span>` })}
        </div>
      </div>`,
    onMount(el) { el.querySelector('[data-act="share"]').addEventListener("click", () => toast("Share sheet opens here")); },
  });

  /* 66 · Cashback summary */
  Screens.cashback = () => ({
    render: () => `
      ${navrow({ title: "Cashback" })}
      <div class="scr-body">
        ${pageTitle("Card cashback", "Every card payment earns points automatically. No categories to activate, no monthly caps to track.")}
        <div class="stat-strip-m" style="margin-top:4px">
          <div><div class="stat-k">This month</div><div class="stat-v">86.40 <span class="faint">AED</span></div><div class="stat-s">576 pts from 41 payments</div></div>
          <div><div class="stat-k">All time</div><div class="stat-v">612.90 <span class="faint">AED</span></div><div class="stat-s">since March</div></div>
        </div>
        <div class="group-label-m">Where it came from this month</div>
        <div class="def-group">
          ${defRow("Groceries", "31.20 AED")}
          ${defRow("Dining", "24.10 AED")}
          ${defRow("Transport", "17.60 AED")}
          ${defRow("Everything else", "13.50 AED")}
        </div>
        <p class="footnote">Rate: 1 point per 10 AED — about 1.5% back when redeemed into assets.</p>
      </div>`,
  });

  /* ————— Redemption — the differentiator ————— */

  /* 67 · Selector */
  Screens.redeem = () => ({
    render: () => `
      ${navrow({ title: t("Use points") })}
      <div class="scr-body">
        ${pageTitle("Turn points into things", `${fmt(DB.points, 0)} pts ready · worth ${fmt(ptsAED())} AED. Same value whichever you pick.`)}
        <div class="list-tight">
          ${row({ ic: "gold", icTone: "tint", title: "Gold", sub: "Vaulted grams — the most popular pick", act: "rd", params: { target: "gold" }, chev: true })}
          ${row({ ic: "chart", title: "Global growth bundle", sub: "Adds to your existing position", act: "rd", params: { target: "bundle" }, chev: true })}
          ${row({ ic: "globe", title: "An asset you choose", sub: "Bitcoin, a stock, silver — anything in Explore", act: "rd", params: { target: "asset" }, chev: true })}
          ${row({ ic: "leaf", title: "USD savings", sub: "Start earning ~4.2% on it right away", act: "rd", params: { target: "savings" }, chev: true })}
          ${row({ ic: "wallet", title: "Spending balance", sub: "Plain AED, spendable on your card", act: "rd", params: { target: "cash" }, chev: true })}
        </div>
        <p class="footnote">One rule for everyone: 1 pt = 0.15 AED, no tiers, no expiry.</p>
      </div>`,
    onMount(el) {
      el.querySelectorAll('[data-act="rd"]').forEach((b) => b.addEventListener("click", () => {
        const target = JSON.parse(b.dataset.params).target;
        if (target === "asset") { App.go("explore", { forRedeem: true }); return; }
        App.go("redeemAmount", { target });
      }));
    },
  });

  const TARGETS = {
    gold: { name: "Gold", desc: (aed) => `${fmt(aed / 499.2, 3)} g of vaulted gold`, pos: "p-gold" },
    bundle: { name: "Global growth bundle", desc: (aed) => `${fmt(aed / 91.4, 2)} units of the bundle`, pos: "p-bundle" },
    savings: { name: "USD savings", desc: (aed) => `${fmt(aed / DB.USD, 2)} USD earning ~4.2%`, pos: "p-usd" },
    cash: { name: "Spending balance", desc: (aed) => `${fmt(aed)} AED, spendable instantly`, pos: null },
    btc: { name: "Bitcoin", desc: (aed) => `${(aed / 249530).toFixed(6)} BTC`, pos: "p-btc" },
  };

  /* 68 · Amount + preview of what will be owned */
  Screens.redeemAmount = (p) => {
    const tgt = TARGETS[p.target] || TARGETS.gold;
    return amountScreen({
      navTitle: t("Use points"),
      destLine: `Into ${tgt.name.toLowerCase()}`, destIcon: "own",
      sub: `You have ${fmt(DB.points, 0)} pts = ${fmt(ptsAED())} AED.`,
      ccy: "pts", min: 100, max: DB.points, chips: [500, 1000, "Max"],
      quote(n) {
        if (!n) return "From 100 pts";
        const aed = n * DB.pointRate;
        return `You'll own <strong>${tgt.desc(aed)}</strong>`;
      },
      overMax: () => `<span style="color:var(--negative)">More points than you have</span>`,
      cta: "Review",
      onConfirm(n) { App.go("redeemConfirm", { target: p.target, pts: n }); },
    });
  };

  /* 69 · Confirmation */
  Screens.redeemConfirm = (p) => ({
    render() {
      const tgt = TARGETS[p.target] || TARGETS.gold;
      const aed = p.pts * DB.pointRate;
      return `
        ${navrow({ title: "Review" })}
        <div class="scr-body">
          ${pageTitle("Confirm redemption", "")}
          <div class="def-group">
            ${defRow("Points used", `${fmt(p.pts, 0)} pts`)}
            ${defRow("Value", money(aed), true)}
            ${defRow("You'll own", `<span class="strong">${tgt.desc(aed)}</span>`)}
            ${defRow("Fee", "None — redemption is always free")}
            ${defRow("When", "Instantly")}
          </div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="rc">Redeem ${fmt(p.pts, 0)} pts</button></div>
        </div>`;
    },
    onMount(el, p) {
      el.querySelector("#rc").addEventListener("click", () => authSheet(() => {
        const aed = p.pts * DB.pointRate;
        DB.points -= p.pts;
        DB.state.balances.rewardsAED = DB.points * DB.pointRate;
        if (p.target === "cash") DB.state.balances.available += aed;
        else DB.state.balances.invested += aed;
        if (DB.points < 100) DB.state.scenario.rewardReady = false;
        const tgt = TARGETS[p.target] || TARGETS.gold;
        const pos = DB.positions.find((x) => x.id === tgt.pos);
        if (pos) { pos.value += aed; pos.invested += aed; }
        DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "reward", title: `Redeemed into ${tgt.name.toLowerCase()}`, sub: `${fmt(p.pts, 0)} pts → ${tgt.desc(aed)}`, amt: -p.pts, pts: true, status: "completed", cat: "Rewards" });
        App.go("redeemSuccess", { target: p.target, pts: p.pts, aed }, { replace: true });
      }, "Confirm redemption"));
    },
  });

  /* 70 · Success — links through to the owned position */
  Screens.redeemSuccess = (p) => ({
    render() {
      const tgt = TARGETS[p.target] || TARGETS.gold;
      return `
        ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
        <div class="scr-body">
          ${statusHero({ title: "It's yours now", sub: `${fmt(p.pts, 0)} points became ${tgt.desc(p.aed)}.` })}
          ${tgt.pos ? `<button class="nudge-card" data-go="positionDetail" data-params='{"id":"${tgt.pos}"}'>
            <span class="n-ic">${icon("own", 17)}</span>
            <span style="flex:1"><span class="n-title">See it under Own</span><div class="n-sub">Your ${tgt.name.toLowerCase()} position just grew.</div></span>
            <span class="chev">${icon("chevronRight", 14)}</span>
          </button>` : ""}
          <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
        </div>`;
    },
  });

  /* ————— Yield & staking ————— */

  /* 71 · List — rates framed as variable */
  Screens.yieldList = () => ({
    render: () => `
      ${navrow({ title: "Earn on savings" })}
      <div class="scr-body">
        ${pageTitle("Put money to work", "Rates are a share of real profit — they move, and that's stated everywhere. Nothing here is guaranteed.")}
        <div class="list-tight">
          ${DB.yieldProducts.map((y) => row({ ic: "leaf", icTone: "tint", title: `${y.name} · <span style="color:var(--accent)">${y.rate}</span> <span class="faint">${y.rateNote}</span>`, sub: y.sub, go: "yieldDetail", params: { id: y.id }, chev: true })).join("")}
        </div>
      </div>`,
  });

  /* 72 · Detail — one sentence a first-timer understands */
  Screens.yieldDetail = (p) => ({
    render() {
      const y = DB.yieldProducts.find((x) => x.id === p.id) || DB.yieldProducts[0];
      return `
        ${navrow({ title: y.name })}
        <div class="scr-body">
          ${pageTitle(y.name, y.how)}
          <div class="stat-strip-m" style="margin-top:2px">
            <div><div class="stat-k">Current rate</div><div class="stat-v" style="color:var(--accent)">${y.rate}</div><div class="stat-s">${y.rateNote} — moves with the market</div></div>
            <div><div class="stat-k">Your money</div><div class="stat-v" style="font-size:15px">${y.access.split(",")[0].split(".")[0]}</div><div class="stat-s">from ${fmt(y.min, 0)} AED</div></div>
          </div>
          <div class="group-label-m">Worth knowing</div>
          <div class="def-group">
            ${defRow("Expected on 10,000 AED", `~${fmt(10000 * parseFloat(y.rate.replace(/[~%]/g, "")) / 100 / 12, 0)} AED a month`)}
            ${defRow("Getting money out", y.access)}
            ${defRow("Structure", "Profit-sharing — Shariah-certified, never interest")}
          </div>
          <div class="inline-note">${icon("infoCircle", 15)}<span>${y.risk}</span></div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" data-go="yieldRisk" data-params='{"id":"${y.id}"}'>${t("Continue")}</button></div>
        </div>`;
    },
  });

  /* 73 · Risk acknowledgement — deliberate consent */
  Screens.yieldRisk = (p) => {
    const checks = [
      { t: "The rate moves", s: "It's a profit share, not a promise. Some weeks it's higher, some lower — it can be zero." },
      { t: "This is not a bank deposit", s: "There's no deposit guarantee. Fasset holds your funds in segregated accounts with vetted counterparties." },
      { t: "I know how to get out", s: "I've read the access terms and the notice period, if any." },
    ];
    let on = [false, false, false];
    return {
      render: () => `
        ${navrow({ title: "Before you start" })}
        <div class="scr-body">
          ${pageTitle("Three things, honestly", "Tap each one after you've actually read it.")}
          <div id="risks">${checks.map((c, i) => `
            <button class="risk-item" data-r="${i}">
              <span class="rk-box">${icon("check", 12)}</span>
              <span><span class="rk-t">${c.t}</span><div class="rk-s">${c.s}</div></span>
            </button>`).join("")}
          </div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="ok" disabled>I understand — continue</button></div>
        </div>`,
      onMount(el) {
        const ok = el.querySelector("#ok");
        el.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => {
          const i = +b.dataset.r;
          on[i] = !on[i];
          b.classList.toggle("on", on[i]);
          ok.disabled = !on.every(Boolean);
        }));
        ok.addEventListener("click", () => App.go("yieldAmount", { id: p.id }));
      },
    };
  };

  /* 74 · Amount with estimated earnings and the caveat inline */
  Screens.yieldAmount = (p) => {
    const y = DB.yieldProducts.find((x) => x.id === p.id) || DB.yieldProducts[0];
    const r = parseFloat(y.rate.replace(/[~%]/g, "")) / 100;
    return amountScreen({
      navTitle: "Start earning",
      destLine: `${y.name} · ${y.rate} ${y.rateNote}`, destIcon: "leaf", destLocked: true,
      sourceLabel: "From", sourceLine: "AED balance", sourceIcon: "wallet", sourceLocked: true,
      ccy: "AED", min: y.min, max: DB.totals().available, chips: [1000, 5000, "Max"],
      quote: (n) => n ? `Could earn ~${fmt(n * r / 12, 0)} AED a month — <span class="faint">if the rate holds; it varies</span>` : `From ${fmt(y.min, 0)} AED`,
      overMax: () => `<span style="color:var(--negative)">More than your available balance</span>`,
      cta: "Review",
      onConfirm(n) {
        openSheet({
          title: "Confirm",
          body: `<div class="def-group">
              ${defRow("Amount", money(n), true)}
              ${defRow("Product", y.name)}
              ${defRow("Rate today", `${y.rate} · variable`)}
              ${defRow("Access", y.access)}
              ${defRow("First profit", "Tomorrow, 6:00 AM")}
            </div>`,
          foot: `<button class="btn btn-primary" id="yc">${t("Confirm")}</button>`,
          onMount(sheet) {
            sheet.querySelector("#yc").addEventListener("click", () => {
              closeSheet(true);
              authSheet(() => {
                DB.state.balances.available -= n;
                DB.state.balances.earning += n;
                const pos = DB.positions.find((x) => x.id === "p-usd");
                if (pos && y.id === "y-usd") { pos.value += n; pos.invested += n; }
                DB.state.scenario.idleCash = false;
                DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "yield", title: `Moved into ${y.name}`, sub: y.rate + " " + y.rateNote, amt: -n, status: "completed", cat: "Earnings" });
                App.go("yieldSuccess", { id: y.id, amt: n }, { replace: true });
              }, t("Confirm"));
            });
          },
        });
      },
    });
  };

  /* 76 · Success — when the first accrual appears, where to track */
  Screens.yieldSuccess = (p) => ({
    render() {
      const y = DB.yieldProducts.find((x) => x.id === p.id) || DB.yieldProducts[0];
      return `
        ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
        <div class="scr-body">
          ${statusHero({ title: "It's working now", sub: `${fmt(p.amt)} AED is in ${y.name}. Your first profit share lands tomorrow at 6:00 AM — you'll see it in Activity and under Own.` })}
          <button class="nudge-card" data-go="positionDetail" data-params='{"id":"p-usd"}'>
            <span class="n-ic">${icon("own", 17)}</span>
            <span style="flex:1"><span class="n-title">Track it under Own</span><div class="n-sub">Position, profit history, and withdrawals live there.</div></span>
            <span class="chev">${icon("chevronRight", 14)}</span>
          </button>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
        </div>`;
    },
  });

  /* 77 · Manage — add, withdraw, unstake with timing */
  Screens.yieldManage = (p) => ({
    render: () => `
      ${navrow({ title: "Manage" })}
      <div class="scr-body">
        ${pageTitle("USD savings", "Add, take out, or stop — your money, no lock-in.")}
        <div class="list-tight">
          ${row({ ic: "plus", title: "Add more", sub: "Starts earning from tomorrow's accrual", go: "yieldAmount", params: { id: "y-usd" }, chev: true })}
          ${row({ ic: "arrowDownLeft", title: "Withdraw some or all", sub: "Back in your balance in seconds", act: "wd", chev: true })}
          ${row({ ic: "receipt", title: "Profit history", sub: "Daily accruals, exportable", act: "hist", chev: true })}
        </div>
      </div>`,
    onMount(el) {
      el.querySelector('[data-act="wd"]').addEventListener("click", () => {
        const pos = DB.positions.find((x) => x.id === "p-usd");
        App.go("yieldWithdraw", { id: "p-usd" });
      });
      el.querySelector('[data-act="hist"]').addEventListener("click", () => toast("Daily accrual export lives here — demo stub"));
    },
  });

  Screens.yieldWithdraw = () => amountScreen({
    navTitle: t("Withdraw"),
    destLine: "USD savings → AED balance", destIcon: "leaf", destLocked: true,
    sub: "Arrives in seconds. Profit already earned stays yours.",
    ccy: "AED", min: 10, max: DB.positions.find((x) => x.id === "p-usd").value, chips: [1000, "Max"],
    quote: () => "No fee · instant",
    overMax: () => `<span style="color:var(--negative)">More than the position holds</span>`,
    cta: t("Withdraw"),
    onConfirm(n) {
      authSheet(() => {
        const pos = DB.positions.find((x) => x.id === "p-usd");
        pos.value -= n; pos.invested = Math.max(0, pos.invested - n);
        DB.state.balances.earning -= n;
        DB.state.balances.available += n;
        DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "yield", title: "Withdrew from USD savings", sub: "Instant", amt: n, status: "completed", cat: "Earnings" });
        App.go("depositSuccess", { amt: n, method: "savings" }, { replace: true });
      }, "Confirm withdrawal");
    },
  });
})();
