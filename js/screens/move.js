/* ————————————————————————————————————————————————
   C. Move — screens 18–43, 57–60.
   Add money · send · receive · withdraw · accounts · credit.
   Cross-border feels identical to domestic; one send primitive.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, money, moneyUsd, fmt, openSheet, closeSheet, toast, statusHero, copyRow, defRow, qrSvg, amountScreen, authSheet } = UI;

  /* 18 · Move hub */
  Screens.move = () => ({
    render() {
      const restricted = DB.state.scenario.restricted;
      const phys = DB.state.card.physical.status;
      return `
        <div class="scr-body with-tabbar">
          ${pageTitle(t("Move money"), "In, out, home, or into the world — one place.")}
          ${restricted ? `<button class="nudge-card warn" data-go="restrictions"><span class="n-ic">${icon("shield", 16)}</span><span style="flex:1"><span class="n-title">Outgoing transfers are paused</span><div class="n-sub">A routine review — see what it affects and how long it takes.</div></span><span class="chev">${icon("chevronRight", 14)}</span></button>` : ""}
          <div class="qa-row" style="margin-top:18px">
            <button class="qa" data-go="addmoney"><i>${icon("plus", 20)}</i>${t("Add money")}</button>
            <button class="qa quiet" data-go="send"><i>${icon("arrowUpRight", 20)}</i>${t("Send")}</button>
            <button class="qa quiet" data-go="receive"><i>${icon("arrowDownLeft", 20)}</i>${t("Receive")}</button>
            <button class="qa quiet" data-go="withdraw"><i>${icon("bank", 20)}</i>${t("Withdraw")}</button>
          </div>

          <div class="group-label-m">${t("Card")}</div>
          ${row({ img: DB.state.card.virtual.art, title: "Fasset card", sub: DB.state.card.frozen ? "Frozen · tap to manage" : `Spending from ${DB.state.card.fundingAsset} · ·· ${DB.state.card.virtual.last4}`, go: "card", chev: true })}
          ${phys === "none" ? row({ ic: "truck", title: "Get the metal card", sub: "Fasset Prime · delivered in 3–5 days", go: "orderCard", chev: true }) : ""}

          <div class="group-label-m">${t("Accounts")}</div>
          ${row({ ic: "bank", title: "AED account", sub: "Your personal IBAN · salary-ready", go: "acctAED", chev: true })}
          ${row({ ic: "globe", title: "Global USD account", sub: "Receive dollars from anywhere", go: "acctUSD", chev: true })}

          <div class="group-label-m">More</div>
          ${row({ ic: "handCoins", title: "Credit", sub: DB.state.user.tier >= 2 ? "You're eligible for up to 15,000 AED" : "See what you'd need to qualify", go: "credit", chev: true })}
          ${row({ ic: "calendar", title: "Scheduled & recurring", sub: "Rent to Marina Heights · monthly", act: "recurring", chev: true })}
        </div>`;
    },
    onMount(el) {
      el.querySelector('[data-act="recurring"]')?.addEventListener("click", () => toast("Recurring transfers live here — demo stub", "calendar"));
    },
  });

  /* ————— Add money ————— */

  /* 19 · Funding method list — honest arrival time and total fee up front */
  Screens.addmoney = () => ({
    render: () => `
      ${navrow({ title: t("Add money") })}
      <div class="scr-body">
        ${pageTitle(t("Add money"), "Every way in, with the real cost and timing before you choose.")}
        <div class="list-tight">
          ${DB.fundingMethods.map((m) => row({
            ic: m.icon, icTone: m.rec ? "tint" : "",
            title: m.name + (m.rec ? ` <span class="tag" style="margin-inline-start:6px">Fastest</span>` : ""),
            sub: m.sub,
            right: `<span class="m-amt" style="font-size:13px">${m.fee}</span><span class="m-when">${m.eta}</span>`,
            go: { aani: "aaniFlow", bank: "bankIn", card: "cardIn", cash: "cashIn", p2p: "p2pIn", crypto: "cryptoIn" }[m.id],
          })).join("")}
        </div>
      </div>`,
  });

  /* home shortcut · convert between AED and the USD account */
  Screens.convert = () => amountScreen({
    navTitle: "Convert",
    destLine: "AED → USD account", destIcon: "refresh", destLocked: true,
    ccy: "AED", min: 10, max: 13424.08, chips: [500, 2000, "Max"],
    quote: (n) => n ? `You'll get <strong>${moneyUsd(n / DB.USD)}</strong> · free · instant` : "1 USD = 3.6725 AED · fixed peg · free",
    overMax: () => `<span style="color:var(--negative)">More than your AED balance</span>`,
    cta: "Convert",
    onConfirm(n) {
      authSheet(() => {
        DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "deposit", title: "Converted to USD", sub: `${fmt(n)} AED → $${fmt(n / DB.USD)}`, amt: 0, status: "completed", cat: "Transfers", fee: 0 });
        App.backToRoot();
        toast(`Converted — $${fmt(n / DB.USD)} in your USD account`);
      }, "Confirm conversion");
    },
  });

  /* 21 · Aani — the local instant rail */
  Screens.aaniFlow = () => amountScreen({
    navTitle: t("Add money"),
    destLine: "Aani instant transfer · Instant", destIcon: "bolt",
    ccy: "AED", min: 10, chips: [100, 500, 2000],
    quote: (n) => n > 0 ? `Arrives instantly · no fee` : `From 10.00 AED · free`,
    cta: "Continue to your bank",
    onConfirm(n) {
      openSheet({
        body: statusHero({ tone: "quiet", pulse: true, title: "Approve in your bank app", sub: `We've asked your bank for ${fmt(n)} AED via Aani. Approve it there and come straight back.` }) + `<div style="height:16px"></div>`,
      });
      setTimeout(() => {
        closeSheet(true);
        DB.state.balances.available += n;
        DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "deposit", title: "Added with Aani", sub: "Instant transfer", amt: n, status: "completed", cat: "Deposits", route: "Aani", fee: 0 });
        App.go("depositSuccess", { amt: n, method: "Aani" }, { replace: true });
      }, 1600);
    },
  });

  /* 20 · Bank transfer instructions */
  Screens.bankIn = () => ({
    render: () => `
      ${navrow({ title: "Bank transfer" })}
      <div class="scr-body">
        ${pageTitle("Transfer from your bank", "Send AED to your own account details below. It's yours — money sent here lands in your balance, usually within 2 hours.")}
        ${copyRow("Account name", DB.state.user.name)}
        ${copyRow("IBAN", "AE07 0331 2345 6789 0123 456", true)}
        ${copyRow("Bank", "Fasset via Zand Bank · Dubai")}
        <div class="inline-note">${icon("infoCircle", 15)}<span>No reference needed — these details are unique to you.</span></div>
        <div class="cta-dock stack-8">
          <button class="btn btn-secondary btn-hero" data-copy="AE07 0331 2345 6789 0123 456">${icon("copy", 15)} Copy IBAN</button>
          <button class="btn btn-primary btn-hero" data-act="done">I've sent it</button>
        </div>
      </div>`,
    onMount(el) {
      el.querySelector('[data-act="done"]').addEventListener("click", () => {
        DB.state.scenario.pendingDeposit = true;
        DB.state.dismissed = {};
        App.go("depositPending", {}, { replace: true });
      });
    },
  });

  /* 22 · Card top-up */
  Screens.cardIn = () => amountScreen({
    navTitle: t("Add money"),
    destLine: "Visa ·· 0417 · Instant", destIcon: "cards",
    ccy: "AED", min: 20, chips: [100, 500, 1000],
    quote(n) {
      if (!n) return "Fee 2.4% · minimum 5.00 AED";
      const fee = Math.max(5, n * 0.024);
      return `Fee ${fmt(fee)} AED · you'll receive ${fmt(n)} AED instantly`;
    },
    cta: t("Continue"),
    onConfirm(n) {
      const fee = Math.max(5, n * 0.024);
      openSheet({
        title: "Confirm top-up",
        body: `
          ${row({ ic: "cards", title: "Visa ·· 0417", sub: "Personal debit · Emirates NBD" })}
          <div class="def-group">
            ${defRow("Amount", money(n))}
            ${defRow("Card fee", money(fee))}
            ${defRow("Total charged", money(n + fee), true)}
            ${defRow("Arrives", "Instantly")}
          </div>`,
        foot: `<button class="btn btn-primary" id="cf">Pay ${fmt(n + fee)} AED</button>`,
        onMount(sheet) {
          sheet.querySelector("#cf").addEventListener("click", () => {
            closeSheet(true);
            if (DB.state.scenario.failedDeposit) { App.go("depositFailed", { amt: n }, { replace: true }); return; }
            authSheet(() => {
              DB.state.balances.available += n;
              DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "deposit", title: "Card top-up", sub: "Visa ·· 0417", amt: n, status: "completed", cat: "Deposits", route: "Debit card", fee });
              App.go("depositSuccess", { amt: n, method: "card" }, { replace: true });
            }, "Confirm payment");
          });
        },
      });
    },
  });

  /* 23 · Cash-in via exchange house */
  Screens.cashIn = () => ({
    render: () => `
      ${navrow({ title: "Cash" })}
      <div class="scr-body">
        ${pageTitle("Add cash", "Hand cash to any partner counter and it lands in your balance the same day.")}
        <div class="card card-pad" style="border-radius:12px;text-align:center">
          <div class="stat-k">Show this code at the counter</div>
          <div class="hero-money" dir="ltr" style="font-size:30px;margin-top:8px;font-family:var(--font-mono);letter-spacing:3px">FST-8214</div>
          <div class="footnote" style="margin-top:6px">Valid 48 hours · you'll get a confirmation text</div>
        </div>
        <div class="group-label-m">Partners near you</div>
        <div class="list-tight">
          ${row({ ic: "building", title: "Al Ansari Exchange", sub: "Marina Mall · 400 m · open until 10 PM", right: `<span class="m-when">Fee from 5 AED</span>` })}
          ${row({ ic: "building", title: "Lulu Exchange", sub: "JBR Walk · 1.2 km · open until 11 PM", right: `<span class="m-when">Fee from 5 AED</span>` })}
          ${row({ ic: "building", title: "Al Fardan Exchange", sub: "Dubai Mall · 4.8 km", right: `<span class="m-when">Fee from 6 AED</span>` })}
        </div>
        <p class="footnote">212 locations across the UAE take Fasset cash-in.</p>
      </div>`,
  });

  /* p2p in */
  Screens.p2pIn = () => ({
    render: () => `
      ${navrow({ title: "From a friend" })}
      <div class="scr-body">
        ${pageTitle("From a Fasset friend", "Anyone on Fasset can pay your tag — instantly and free.")}
        <div class="qr-box">${qrSvg(DB.state.user.tag)}</div>
        <p class="center" style="padding-top:14px"><span class="strong" dir="ltr">${DB.state.user.tag}</span></p>
        <div class="cta-dock stack-8">
          <button class="btn btn-secondary btn-hero" data-copy="${DB.state.user.tag}">${icon("copy", 15)} Copy tag</button>
          <button class="btn btn-primary btn-hero" data-go="paymentRequest">Request an amount</button>
        </div>
      </div>`,
  });

  /* 24 · Crypto transfer in — network picked for the user */
  Screens.cryptoIn = () => ({
    render: () => `
      ${navrow({ title: "Crypto transfer" })}
      <div class="scr-body">
        ${pageTitle("Receive crypto", "Send USDT to the address below — it arrives as dollars in your balance.")}
        <button class="mrow" data-act="asset">${`<span class="m-ic tint">${icon("globe", 17)}</span>`}<span class="m-body"><span class="m-sub">Asset</span><span class="m-title">USDT · digital dollars</span></span><span class="chev">${icon("chevronDown", 13)}</span></button>
        <div class="inline-note">${icon("check", 14)}<span>Network chosen for you: <strong>TRC-20</strong> — the cheapest and fastest for USDT. You don't need to know what that means; just pick USDT and TRC-20 in the sending app.</span></div>
        <div class="qr-box">${qrSvg("TQrYx82mMv31bhLskF2v")}</div>
        ${copyRow("Your deposit address", "TQrYx82mMv31bhLs…kF2v", true)}
        <div class="def-group">
          ${defRow("Arrives", "About 2 minutes")}
          ${defRow("Fee", "Network fee only · shown by the sender")}
          ${defRow("Minimum", "10.00 USDT")}
        </div>
      </div>`,
    onMount(el) {
      el.querySelector('[data-act="asset"]').addEventListener("click", () => openSheet({
        title: "Choose asset",
        body: ["USDT · digital dollars", "USDC · digital dollars", "Bitcoin", "Ethereum"].map((a, i) => row({ ic: "globe", icTone: i === 0 ? "tint" : "", title: a, sub: i < 2 ? "Arrives as USD" : "Arrives as the asset, under Own", act: "pick" })).join(""),
        onMount(sheet) { sheet.querySelectorAll('[data-act="pick"]').forEach((b) => b.addEventListener("click", () => { closeSheet(); toast("Address updated"); })); },
      }));
    },
  });

  /* 26 · Deposit pending */
  Screens.depositPending = () => ({
    render: () => `
      ${navrow({ title: "Deposit" })}
      <div class="scr-body">
        ${statusHero({ tone: "warn", pulse: true, title: "3,500.00 AED on its way", sub: "Bank transfer from Emirates NBD. These usually land in under 2 hours during banking hours." })}
        <div class="timeline" style="margin-top:26px">
          <div class="timeline-item done"><span class="timeline-dot"></span><span><div class="timeline-label">Sent from your bank</div><div class="timeline-time">Today, 10:04 AM</div></span></div>
          <div class="timeline-item pending"><span class="timeline-dot"></span><span><div class="timeline-label">Clearing at the central bank</div><div class="timeline-time">In progress</div></span></div>
          <div class="timeline-item"><span class="timeline-dot"></span><span><div class="timeline-label">In your balance</div><div class="timeline-time">Estimated by 12:00 PM</div></span></div>
        </div>
        <div class="divider-q"></div>
        <div class="list-tight">
          ${row({ ic: "bell", title: "We'll tell you the moment it lands", sub: "No need to keep checking" })}
          ${row({ ic: "headset", title: "Taking longer than expected?", sub: "Support can trace it with one tap", go: "support", params: { ctx: "sp1" } })}
        </div>
      </div>`,
  });

  /* 27 · Deposit failed — plain cause, self-service fix */
  Screens.depositFailed = (p) => ({
    render: () => `
      ${navrow({ title: "Deposit" })}
      <div class="scr-body">
        ${statusHero({ tone: "neg", ic: "alert", title: "Your top-up didn't go through", sub: `Your bank declined the ${fmt(p.amt || 1000)} AED card payment. This is almost always the bank blocking a new merchant — not a problem with your account.` })}
        <div class="group-label-m">Fix it in one step</div>
        <div class="list-tight">
          ${row({ ic: "bolt", icTone: "tint", title: "Use Aani instead", sub: "Instant, free, and banks never block it", go: "aaniFlow" })}
          ${row({ ic: "refresh", title: "Try the card again", sub: "Some banks approve the second attempt", go: "cardIn" })}
          ${row({ ic: "headset", title: "Chat with support", sub: "We can see exactly what the bank said", go: "support", params: { ctx: "sf1" } })}
        </div>
        <p class="footnote">You weren't charged. If your bank shows a hold, it releases automatically within 2 business days.</p>
      </div>`,
  });

  /* 28 · Deposit success — with a useful next step */
  Screens.depositSuccess = (p) => ({
    render: () => `
      ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
      <div class="scr-body">
        ${statusHero({ title: `${fmt(p.amt || 500)} AED added`, sub: p.method === "Aani" ? "Instant, free, done. It's already in your balance." : "It's in your balance and ready to use." })}
        <div class="group-label-m" style="text-align:center">What now?</div>
        <div class="list-tight">
          ${row({ ic: "arrowUpRight", title: t("Send") + " some of it", sub: "Home, to a friend, anywhere", go: "send", chev: true })}
          ${row({ ic: "leaf", title: "Let it earn while it waits", sub: "~4.2% on USD savings, withdraw any time", go: "yieldDetail", params: { id: "y-usd" }, chev: true })}
          ${row({ ic: "own", title: "Put some into an asset", sub: "Gold, stocks, funds — from 10 AED", go: "explore", chev: true })}
        </div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
      </div>`,
  });

  /* ————— Send — one primitive for every destination ————— */

  /* 29–30 · Entry + recognition */
  Screens.send = () => ({
    render() {
      const restricted = DB.state.scenario.restricted;
      return `
      ${navrow({ title: t("Send") })}
      <div class="scr-body">
        ${pageTitle(t("Send"), "A tag, phone number, bank account, or wallet address — we work out the best route.")}
        ${restricted ? `<button class="nudge-card warn" data-go="restrictions"><span class="n-ic">${icon("shield", 16)}</span><span style="flex:1"><span class="n-title">Sending is paused right now</span><div class="n-sub">A routine review, usually done in a day. Tap for details.</div></span></button>` : ""}
        <div class="tx-search" style="margin-top:4px">${icon("search", 14)}<input class="tx-search-input" id="who" placeholder="@tag, phone, IBAN, or address" autocomplete="off"><button class="icon-btn" style="width:30px;height:30px" data-act="qr">${icon("scan", 15)}</button></div>
        <div id="recognized"></div>
        <div class="group-label-m">Recent</div>
        <div class="list-tight" id="recents">
          ${DB.recipients.filter((r) => r.recent).map((r) => row({ av: r.name[0], title: r.name, sub: r.sub, act: "pick", params: { id: r.id }, cls: "pick-row", chev: true })).join("")}
        </div>
        <div class="group-label-m">Everyone</div>
        <div class="list-tight">
          ${DB.recipients.filter((r) => !r.recent).map((r) => row({ av: r.name[0], title: r.name, sub: r.sub, act: "pick", params: { id: r.id }, cls: "pick-row", chev: true })).join("")}
        </div>
      </div>`;
    },
    onMount(el) {
      const who = el.querySelector("#who"), rec = el.querySelector("#recognized");
      function pick(id) {
        if (DB.state.scenario.restricted) { App.go("sendBlocked"); return; }
        const r = DB.recipients.find((x) => x.id === id);
        if (r.intl && DB.state.user.tier < 2) { App.go("sendVerifyGate", { id }); return; }
        App.go("sendAmount", { id });
      }
      el.querySelectorAll(".pick-row").forEach((b) => b.addEventListener("click", () => pick(JSON.parse(b.dataset.params).id)));
      el.querySelector('[data-act="qr"]').addEventListener("click", () => openSheet({
        title: "Scan to pay",
        body: `<div class="capture-stage" style="margin-top:6px;aspect-ratio:1.3"><div class="guide"></div><span class="cap-hint">Point at any Fasset QR or payment code</span><div class="capture-scan"></div></div>
          <button class="btn btn-secondary btn-block" style="margin-top:14px" id="simqr">Simulate a scan · @omarf</button><div style="height:8px"></div>`,
        onMount(sheet) { sheet.querySelector("#simqr").addEventListener("click", () => { closeSheet(true); pick("r2"); }); },
      }));
      who.addEventListener("input", () => {
        const v = who.value.trim();
        if (v.length < 3) { rec.innerHTML = ""; return; }
        let kind, sub, route;
        if (v.startsWith("@")) { kind = "Fasset tag"; sub = "Instant and free, in any currency"; route = "tag"; }
        else if (/^ae/i.test(v)) { kind = "UAE bank account"; sub = "Arrives in minutes via local transfer"; route = "bank-uae"; }
        else if (/^(t|0x)/i.test(v)) { kind = "Wallet address"; sub = "USDT · network picked automatically"; route = "wallet"; }
        else if (/^[+0-9 ]+$/.test(v)) { kind = "Phone number"; sub = "They get a text to collect it — free"; route = "phone"; }
        else { kind = "Name search"; sub = "We'll match tags and contacts"; route = "tag"; }
        rec.innerHTML = `<div class="group-label-m">Recognised</div>` + row({ ic: "check", icTone: "tint", title: `${v}`, sub: `${kind} · ${sub}`, cls: "rec-row", chev: true });
        rec.querySelector(".rec-row").addEventListener("click", () => {
          if (DB.state.scenario.restricted) { App.go("sendBlocked"); return; }
          App.go("sendAmount", { id: "r2", custom: v, route });
        });
      });
    },
  });

  /* 37 · Send needs verification — framed by what it turns on */
  Screens.sendVerifyGate = (p) => ({
    render() {
      const r = DB.recipients.find((x) => x.id === p.id) || DB.recipients[0];
      return `
      ${navrow({ title: t("Send") })}
      <div class="scr-body">
        ${statusHero({ tone: "quiet", ic: "globe", title: "One step opens international sending", sub: `To send to ${r.name} in ${r.ccy === "PKR" ? "Pakistan" : "another country"}, we need your address on file — a UAE rule for cross-border transfers. Takes about a minute.` })}
        <div class="list-tight" style="margin-top:18px">
          ${row({ ic: "check", icTone: "tint", title: "You'll get", sub: "International transfers at bank-beating rates, up to 150,000 AED a month" })}
          ${row({ ic: "clock", title: "It takes", sub: "About 1 minute — just your address, we have the rest" })}
        </div>
        <div class="cta-dock stack-8">
          <button class="btn btn-primary btn-hero" data-go="kycIntro" data-params='{"unlock":"intl"}'>Confirm my address</button>
          <button class="btn btn-ghost btn-hero" data-back>Not now</button>
        </div>
      </div>`;
    },
  });

  /* 31 · Amount with live rate */
  Screens.sendAmount = (p) => {
    const r = DB.recipients.find((x) => x.id === p.id) || DB.recipients[1];
    const name = p.custom || r.name;
    const intl = !p.custom && r.intl;
    const ccy = p.custom ? "AED" : r.ccy === "USDT" ? "USD" : r.ccy;
    const rate = DB.fx[ccy];
    return amountScreen({
      navTitle: t("Send"),
      destLine: `To ${name}`, destIcon: "send",
      sourceLabel: "From", sourceLine: DB.state.send.defaultSource, sourceIcon: "wallet",
      ccy: "AED", min: 5, max: DB.totals().available,
      chips: [100, 500, 2000],
      quote(n) {
        if (!n) return intl ? `1 AED = ${fmt(rate, rate > 100 ? 1 : 2)} ${ccy} · live rate` : "No fee between Fasset accounts";
        if (intl) { const fee = 9; return `They get <strong>${fmt(n * rate, 0)} ${ccy}</strong> · fee ${fmt(fee)} AED · arrives in minutes`; }
        return `They get exactly ${fmt(n)} AED · free · instant`;
      },
      overMax: (n) => `<span style="color:var(--negative)">That's more than your available ${fmt(DB.totals().available)} AED</span>`,
      cta: "Review",
      onConfirm(n) { App.go("sendReview", { id: p.id, custom: p.custom, amt: n }); },
      onSource() {
        openSheet({
          title: "Pay from",
          body: [["AED balance", `${fmt(13424.08)} AED available`], ["Global USD account", `$${fmt(1360.4)} · converted at the live rate`], ["USD savings", "Withdraw and send in one step"]].map(([tt, ss], i) => row({ ic: i === 0 ? "wallet" : i === 1 ? "globe" : "leaf", title: tt, sub: ss, act: "src" })).join(""),
          onMount(sheet) {
            sheet.querySelectorAll('[data-act="src"]').forEach((b, i) => b.addEventListener("click", () => {
              DB.state.send.defaultSource = ["AED balance", "Global USD account", "USD savings"][i];
              closeSheet(); App.renderTop("root"); toast("Default source updated");
            }));
          },
        });
      },
    });
  };

  /* 32–33 · Review + authentication */
  Screens.sendReview = (p) => ({
    render() {
      const r = DB.recipients.find((x) => x.id === p.id) || DB.recipients[1];
      const name = p.custom || r.name;
      const intl = !p.custom && r.intl;
      const ccy = intl ? r.ccy : "AED";
      const rate = DB.fx[ccy];
      const fee = intl ? 9 : 0;
      const gets = intl ? `${fmt(p.amt * rate, 0)} ${ccy}` : `${fmt(p.amt)} AED`;
      return `
        ${navrow({ title: "Review" })}
        <div class="scr-body">
          ${pageTitle("Check and send", "")}
          ${row({ av: name[0], title: name, sub: p.custom ? "New recipient" : r.sub })}
          <div class="def-group" style="margin-top:10px">
            ${defRow("You send", money(p.amt), true)}
            ${defRow("From", DB.state.send.defaultSource)}
            ${intl ? defRow("Rate", `1 AED = ${fmt(rate, rate > 100 ? 1 : 2)} ${ccy} · locked for 10 min`) : ""}
            ${defRow("Fee", fee ? money(fee) : "Free")}
            ${defRow("Arrives", intl ? "Usually within minutes" : "Instantly")}
            ${defRow("They receive", `<span class="strong">${gets}</span>`, true)}
          </div>
          ${intl ? `<p class="footnote">Banks charge 40–120 AED for this and take days. This goes over Fasset's own rails.</p>` : ""}
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="pay">${t("Send")} ${fmt(p.amt)} AED</button></div>
        </div>`;
    },
    onMount(el, p) {
      el.querySelector("#pay").addEventListener("click", () => {
        authSheet(() => {
          const r = DB.recipients.find((x) => x.id === p.id) || DB.recipients[1];
          const name = p.custom || r.name;
          const intl = !p.custom && r.intl;
          DB.state.balances.available -= p.amt;
          DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "send", title: name, sub: intl ? `They received ${fmt(p.amt * DB.fx[r.ccy], 0)} ${r.ccy}` : "Sent on Fasset", amt: -p.amt, status: intl ? "pending" : "completed", cat: "Transfers", fee: intl ? 9 : 0 });
          App.go(intl ? "sendPending" : "sendSuccess", { name, amt: p.amt, ccy: intl ? r.ccy : "AED", gets: intl ? fmt(p.amt * DB.fx[r.ccy], 0) : fmt(p.amt) }, { replace: true });
        }, `${t("Send")} ${fmt(p.amt)} AED`);
      });
    },
  });

  /* 34 · Sent */
  Screens.sendSuccess = (p) => ({
    render: () => `
      ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
      <div class="scr-body">
        ${statusHero({ title: `${p.name} has it`, sub: `${p.gets} ${p.ccy} arrived instantly. We've sent them a note.` })}
        <div class="list-tight" style="margin-top:16px">
          ${row({ ic: "receipt", title: "Share the receipt", sub: "PDF with reference number", act: "rcpt" })}
          ${row({ ic: "refresh", title: "Make this monthly", sub: "Same amount, same day each month", act: "recur" })}
        </div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
      </div>`,
    onMount(el) {
      el.querySelector('[data-act="rcpt"]').addEventListener("click", () => toast("Receipt ready to share"));
      el.querySelector('[data-act="recur"]').addEventListener("click", () => toast("Recurring transfer set", "calendar"));
    },
  });

  /* 35 · In progress with tracking */
  Screens.sendPending = (p) => ({
    render: () => `
      ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
      <div class="scr-body">
        ${statusHero({ tone: "warn", pulse: true, title: "On its way", sub: `${p.gets} ${p.ccy} to ${p.name}. We'll tell you the second it lands — usually minutes.` })}
        <div class="timeline" style="margin-top:24px">
          <div class="timeline-item done"><span class="timeline-dot"></span><span><div class="timeline-label">Left your account</div><div class="timeline-time">Just now</div></span></div>
          <div class="timeline-item done"><span class="timeline-dot"></span><span><div class="timeline-label">Converted at the locked rate</div><div class="timeline-time">Just now</div></span></div>
          <div class="timeline-item pending"><span class="timeline-dot"></span><span><div class="timeline-label">Arriving at ${p.name.split(" ")[0]}'s bank</div><div class="timeline-time">Estimated under 10 minutes</div></span></div>
        </div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
      </div>`,
  });

  /* 36 · Blocked / failed send */
  Screens.sendBlocked = () => ({
    render: () => `
      ${navrow({ title: t("Send") })}
      <div class="scr-body">
        ${statusHero({ tone: "neg", ic: "alert", title: "This transfer can't go yet", sub: "Outgoing transfers are paused while we finish a routine review of your account. Nothing is lost — your money is safe and everything else works." })}
        <div class="list-tight" style="margin-top:14px">
          ${row({ ic: "shield", title: "See the restriction", sub: "What's affected, why, and how long it takes", go: "restrictions", chev: true })}
          ${row({ ic: "headset", title: "Talk to support", sub: "They can see your review status", go: "support", params: { ctx: "restriction" }, chev: true })}
        </div>
      </div>`,
  });

  /* ————— Receive ————— */

  /* 38 · Method selector */
  Screens.receive = (p) => ({
    render: () => `
      ${navrow({ title: t("Receive") })}
      <div class="scr-body">
        ${pageTitle(t("Receive"), "Give people whichever of these suits them — it all lands in the same balance.")}
        <div class="list-tight">
          ${row({ ic: "send", icTone: "tint", title: "Fasset tag", sub: `${DB.state.user.tag} · instant, free, from any Fasset user`, act: "m", params: { m: "tag" }, chev: true })}
          ${row({ ic: "phone", title: "Phone number", sub: "+971 50 214 8867 · they don't need your tag", act: "m", params: { m: "phone" }, chev: true })}
          ${row({ ic: "bank", title: "AED bank details", sub: "Personal IBAN · salary and local transfers", go: "acctAED", chev: true })}
          ${row({ ic: "globe", title: "USD account details", sub: "Dollars from abroad, wire or local US transfer", go: "acctUSD", chev: true })}
          ${row({ ic: "qr", title: "QR code", sub: "For someone standing next to you", act: "m", params: { m: "qr" }, chev: true })}
          ${row({ ic: "globe", title: "Crypto address", sub: "USDT and more, network handled for you", go: "cryptoIn", chev: true })}
        </div>
        <div class="cta-dock"><button class="btn btn-secondary btn-hero" data-go="paymentRequest">Turn into a payment request</button></div>
      </div>`,
    onMount(el, params) {
      const show = (m) => App.go("receiveDetails", { m });
      el.querySelectorAll('[data-act="m"]').forEach((b) => b.addEventListener("click", () => show(JSON.parse(b.dataset.params).m)));
      if (params.method === "tag") setTimeout(() => show("tag"), 60);
    },
  });

  /* 39 · Receive details */
  Screens.receiveDetails = (p) => ({
    render() {
      const map = {
        tag: { title: "Your tag", v: DB.state.user.tag, sub: "Instant and free from any Fasset user, anywhere." },
        phone: { title: "Your number", v: "+971 50 214 8867", sub: "Fasset users can pay it directly. Others get a collect link by text." },
        qr: { title: "Your QR", v: DB.state.user.tag, sub: "They scan, you get paid. Works from any Fasset app." },
      };
      const d = map[p.m] || map.tag;
      return `
        ${navrow({ title: d.title })}
        <div class="scr-body">
          ${pageTitle(d.title, d.sub)}
          <div class="qr-box">${qrSvg(d.v)}</div>
          <p class="center" style="padding-top:14px"><span class="strong" dir="ltr">${d.v}</span></p>
          <div class="cta-dock stack-8">
            <button class="btn btn-secondary btn-hero" data-copy="${d.v}">${icon("copy", 15)} ${t("Copy")}</button>
            <button class="btn btn-secondary btn-hero" data-act="share">${icon("share", 15)} ${t("Share")}</button>
            <button class="btn btn-primary btn-hero" data-go="paymentRequest">Request a specific amount</button>
          </div>
        </div>`;
    },
    onMount(el) { el.querySelector('[data-act="share"]').addEventListener("click", () => toast("Share sheet opens here")); },
  });

  /* 40 · Payment request */
  Screens.paymentRequest = () => amountScreen({
    navTitle: "Request money", sub: "Creates a link anyone can pay — Fasset or not.",
    ccy: "AED", min: 1, chips: [50, 180, 500],
    quote: (n) => n ? "They can pay by card, Aani, or Fasset balance" : "",
    cta: "Create request",
    onConfirm(n) {
      App.go("requestCreated", { amt: n }, { replace: true });
    },
  });

  Screens.requestCreated = (p) => ({
    render: () => `
      ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
      <div class="scr-body">
        ${statusHero({ title: `Request for ${fmt(p.amt)} AED`, sub: "Share the link — you'll get a push the moment it's paid." })}
        <div class="card card-pad" style="border-radius:12px;text-align:center;font-family:var(--font-mono);font-size:13px" dir="ltr">fasset.me/${DB.state.user.tag.slice(1)}/${fmt(p.amt, 0).replace(",", "")}</div>
        <div class="cta-dock stack-8">
          <button class="btn btn-secondary btn-hero" data-copy="fasset.me/${DB.state.user.tag.slice(1)}/${fmt(p.amt, 0)}">${icon("copy", 15)} Copy link</button>
          <button class="btn btn-primary btn-hero" data-act="share">${icon("share", 15)} ${t("Share")}</button>
        </div>
      </div>`,
    onMount(el) { el.querySelector('[data-act="share"]').addEventListener("click", () => toast("Share sheet opens here")); },
  });

  /* ————— Withdraw ————— */

  /* 41 · Destination */
  Screens.withdraw = () => ({
    render: () => `
      ${navrow({ title: t("Withdraw") })}
      <div class="scr-body">
        ${pageTitle(t("Withdraw"), "Back to any bank account in your name.")}
        <div class="list-tight">
          ${row({ ic: "bank", title: "Emirates NBD ·· 8842", sub: "AED · arrives in minutes via Aani", act: "dest", chev: true })}
          ${row({ ic: "plus", title: "New bank account", sub: "Any UAE bank, or international", act: "new", chev: true })}
        </div>
        <p class="footnote">Withdrawals are free. Your money is never locked in.</p>
      </div>`,
    onMount(el) {
      el.querySelector('[data-act="dest"]').addEventListener("click", () => App.go("withdrawAmount"));
      el.querySelector('[data-act="new"]').addEventListener("click", () => toast("Add-bank form lives here — demo stub"));
    },
  });

  /* 42 · Amount, fee, timing */
  Screens.withdrawAmount = () => amountScreen({
    navTitle: t("Withdraw"),
    destLine: "To Emirates NBD ·· 8842", destIcon: "bank",
    ccy: "AED", min: 10, max: DB.totals().available, chips: [500, 2000, "Max"],
    quote: (n) => n ? `Free · arrives in minutes` : "Free · arrives in minutes",
    overMax: () => `<span style="color:var(--negative)">More than your available balance</span>`,
    cta: "Review",
    onConfirm(n) {
      openSheet({
        title: "Confirm withdrawal",
        body: `<div class="def-group">
            ${defRow("Amount", money(n), true)}
            ${defRow("To", "Emirates NBD ·· 8842")}
            ${defRow("Fee", "Free")}
            ${defRow("Arrives", "Usually within minutes")}
          </div>`,
        foot: `<button class="btn btn-primary" id="wf">${t("Withdraw")} ${fmt(n)} AED</button>`,
        onMount(sheet) {
          sheet.querySelector("#wf").addEventListener("click", () => {
            closeSheet(true);
            authSheet(() => {
              DB.state.balances.available -= n;
              DB.txs.unshift({ id: "new" + Date.now(), when: "Today", time: "Just now", kind: "withdraw", title: "Withdrawal to Emirates NBD", sub: "AED ·· 8842", amt: -n, status: "completed", cat: "Withdrawals", fee: 0 });
              App.go("withdrawDone", { amt: n }, { replace: true });
            }, "Confirm withdrawal");
          });
        },
      });
    },
  });

  /* 43 · Withdraw status */
  Screens.withdrawDone = (p) => ({
    render: () => `
      ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
      <div class="scr-body">
        ${statusHero({ title: `${fmt(p.amt)} AED on its way`, sub: "Sent to Emirates NBD ·· 8842 — usually there in minutes." })}
        <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
      </div>`,
  });

  /* ————— Accounts & credit ————— */

  /* 57 · AED account */
  Screens.acctAED = () => ({
    render: () => `
      ${navrow({ title: "AED account" })}
      <div class="scr-body">
        ${pageTitle("Your AED account", "A personal UAE account in your name. Salary, transfers, Aani — all land in your balance.")}
        ${copyRow("Account name", DB.state.user.name)}
        ${copyRow("IBAN", "AE07 0331 2345 6789 0123 456", true)}
        ${copyRow("Account number", "2345 6789 0123 456", true)}
        ${copyRow("Bank", "Fasset via Zand Bank · Dubai, UAE")}
        <div class="inline-note">${icon("briefcase", 15)}<span>Give the IBAN to your employer — salaries arrive here like any bank, and you can set salary day to auto-invest.</span></div>
        <div class="cta-dock stack-8">
          <button class="btn btn-secondary btn-hero" data-act="share">${icon("share", 15)} Share details</button>
          <button class="btn btn-primary btn-hero" data-go="paymentRequest">Turn into a payment request</button>
        </div>
      </div>`,
    onMount(el) { el.querySelector('[data-act="share"]').addEventListener("click", () => toast("Share sheet opens here")); },
  });

  /* 58 · USD account */
  Screens.acctUSD = () => ({
    render: () => `
      ${navrow({ title: "USD account" })}
      <div class="scr-body">
        ${pageTitle("Global USD account", "Dollar details in your name. Clients and platforms abroad pay you like a US account.")}
        ${copyRow("Beneficiary", DB.state.user.name)}
        ${copyRow("Account number", "8331002417", true)}
        ${copyRow("ACH routing", "026073150", true)}
        ${copyRow("SWIFT / BIC", "FSSTUS33", true)}
        ${copyRow("Bank address", "Fasset partner bank · New York, NY, USA")}
        <div class="def-group" style="margin-top:8px">
          ${defRow("Receives", "ACH · wire · SWIFT")}
          ${defRow("Fee", "Free for ACH · 5 USD for SWIFT")}
          ${defRow("Lands as", "USD in your balance — convert to AED whenever you like")}
        </div>
        <div class="cta-dock"><button class="btn btn-secondary btn-hero" data-act="share">${icon("share", 15)} Share details</button></div>
      </div>`,
    onMount(el) { el.querySelector('[data-act="share"]').addEventListener("click", () => toast("Share sheet opens here")); },
  });

  /* 59–60 · Credit — eligible and not-yet */
  Screens.credit = () => ({
    render() {
      const eligible = DB.state.user.tier >= 2;
      if (eligible) return `
        ${navrow({ title: "Credit" })}
        <div class="scr-body">
          ${pageTitle("Credit line", "Pre-approved from your salary history here. Draw what you need, repay monthly, no paperwork.")}
          <div style="padding-top:8px">
            <div class="hero-label">You can draw up to</div>
            ${UI.heroMoney(15000)}
          </div>
          <div class="def-group" style="margin-top:20px">
            ${defRow("Cost", "2.4% flat per month on what you draw")}
            ${defRow("Repayment", "Monthly, auto from salary — pay early, pay less")}
            ${defRow("Late", "No hidden penalties · we call before we charge")}
            ${defRow("Example", "Draw 5,000 AED for 1 month → repay 5,120 AED")}
          </div>
          <p class="footnote">Structured as a Shariah-compliant financing, not an interest loan.</p>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" data-act="draw">Draw funds</button></div>
        </div>`;
      return `
        ${navrow({ title: "Credit" })}
        <div class="scr-body">
          ${pageTitle("Credit", "Not available yet — here's exactly what would change that.")}
          <div class="list-tight" style="margin-top:6px">
            ${row({ ic: "id", icTone: DB.state.user.tier >= 1 ? "tint" : "", title: "Verify your identity", sub: DB.state.user.tier >= 1 ? "Done" : "2 minutes with your Emirates ID", go: DB.state.user.tier >= 1 ? undefined : "kycIntro", params: { unlock: "card" } })}
            ${row({ ic: "map", title: "Confirm your address", sub: DB.state.user.tier >= 2 ? "Done" : "1 minute — required for credit", go: "kycIntro", params: { unlock: "intl" } })}
            ${row({ ic: "briefcase", title: "Receive salary here for 3 months", sub: "1 of 3 months so far · your IBAN is ready", go: "acctAED" })}
          </div>
          <p class="footnote">When you qualify, you'll see it here first — no application, no credit bureau visit.</p>
        </div>`;
    },
    onMount(el) { el.querySelector('[data-act="draw"]')?.addEventListener("click", () => toast("Drawdown flow lives here — demo stub")); },
  });
})();
