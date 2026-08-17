/* ————————————————————————————————————————————————
   C. Card — screens 44–56. Physical and virtual are two
   forms of one card account. Declines explain themselves
   and are fixable on the spot.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, money, fmt, openSheet, closeSheet, toast, statusHero, defRow, toggleRow, authSheet } = UI;

  /* 44 · Card hub */
  Screens.card = () => ({
    render() {
      const c = DB.state.card;
      if (DB.state.user.tier < 1) return blockedRender();
      const phys = c.physical.status;
      const physRow =
        phys === "none" ? row({ img: c.physical.art, title: "Fasset Prime · metal", sub: "Free with your account · 3–5 days", go: "orderCard", chev: true })
        : phys === "ordered" || phys === "shipped" ? row({ img: c.physical.art, title: "Fasset Prime on its way", sub: phys === "shipped" ? "Out for delivery · arriving tomorrow" : "Being made · ships this week", go: "trackCard", chev: true })
        : phys === "delivered" ? row({ img: c.physical.art, title: "Activate your Prime card", sub: "It's arrived — takes 30 seconds", go: "activateCard", chev: true })
        : row({ img: c.physical.art, title: "Fasset Prime · metal", sub: `·· ${c.physical.last4} · active`, go: "cardDetails", params: { which: "physical" }, chev: true });
      const cardTx = DB.ledger().filter((x) => x.kind === "card").slice(0, 4);
      return `
        ${navrow({ title: t("Card") })}
        <div class="scr-body">
          ${pageTitle("Your card", "One card account — virtual in your phone now, metal in your pocket later.")}
          <button class="pcard ${c.frozen ? "frozen" : ""}" style="background-image:url('${c.virtual.art}')" data-go="cardDetails" data-params='{"which":"virtual"}'>
            <span class="pc-overlay"><span class="pc-num">•••• •••• •••• ${c.virtual.last4}</span></span>
          </button>
          ${c.frozen ? `<p class="center footnote" style="padding-top:10px">Frozen — nothing can charge it until you say so.</p>` : ""}
          <div class="qa-row" style="margin-top:18px">
            <button class="qa quiet" data-go="cardDetails" data-params='{"which":"virtual"}'><i>${icon("eye", 19)}</i>Details</button>
            <button class="qa quiet" data-act="freeze"><i>${icon("snowflake", 19)}</i>${c.frozen ? "Unfreeze" : "Freeze"}</button>
            <button class="qa quiet" data-go="cardControls"><i>${icon("settings", 19)}</i>Controls</button>
            <button class="qa quiet" data-act="wallet"><i>${icon("phone", 19)}</i>Wallet</button>
          </div>
          <button class="mrow" data-act="funding" style="margin-top:10px"><span class="m-ic">${icon("wallet", 16)}</span><span class="m-body"><span class="m-sub">Card pays from</span><span class="m-title">${c.fundingAsset} · ${fmt(DB.totals().available)} AED available</span></span><span class="chev">${icon("chevronDown", 13)}</span></button>
          <div class="group-label-m">Manage</div>
          <div class="list-tight">
            ${physRow}
            ${row({ ic: "chart", title: "Limits", sub: `Daily ${fmt(c.limits.daily, 0)} AED · per payment ${fmt(c.limits.perTx, 0)} AED`, go: "cardLimits", chev: true })}
            ${row({ ic: "refresh", title: "Replace card", sub: "Lost, stolen, or damaged", go: "replaceCard", chev: true })}
          </div>
          <div class="group-label-m">Card activity</div>
          <div class="list-tight">${cardTx.map(UI.txRow).join("") || `<div class="empty" style="padding:28px 0">No card payments yet.</div>`}</div>
        </div>`;
    },
    onMount(el) {
      if (DB.state.user.tier < 1) { blockedMount(el); return; }
      const c = DB.state.card;
      el.querySelector('[data-act="freeze"]').addEventListener("click", () => {
        c.frozen = !c.frozen;
        App.renderTop("root");
        toast(c.frozen ? "Card frozen — instantly" : "Card unfrozen", "snowflake");
      });
      el.querySelector('[data-act="wallet"]').addEventListener("click", () => App.go("addToWallet"));
      el.querySelector('[data-act="funding"]').addEventListener("click", () => openSheet({
        title: "Card pays from",
        body: `<p class="footnote" style="padding-bottom:8px">Pick once — every card payment routes from here automatically.</p>` +
          [["AED balance", "Default · no conversion"], ["Global USD account", "Good for USD subscriptions — no FX fee"], ["OWN points", "Spend rewards directly, 1 pt = 0.15 AED"]].map(([tt, ss], i) => row({ ic: ["wallet", "globe", "earn"][i], title: tt, sub: ss, act: "pick" })).join(""),
        onMount(sheet) {
          sheet.querySelectorAll('[data-act="pick"]').forEach((b, i) => b.addEventListener("click", () => {
            c.fundingAsset = ["AED balance", "Global USD account", "OWN points"][i];
            closeSheet(); App.renderTop("root"); toast("Card funding updated");
          }));
        },
      }));
    },
  });

  /* 56 · Card blocked pending verification — framed by what it turns on */
  function blockedRender() {
    return `
      ${navrow({ title: t("Card") })}
      <div class="scr-body">
        <div style="position:relative;margin-top:10px">
          <div class="pcard" style="background-image:url('${DB.state.card.virtual.art}');filter:saturate(0.4) opacity(0.75)"></div>
        </div>
        ${statusHero({ tone: "quiet", ic: "id", title: "Your card is one step away", sub: "A 2-minute identity check turns it on — virtual card instantly, Apple Pay right after, metal card by courier." })}
        <div class="cta-dock stack-8">
          <button class="btn btn-primary btn-hero" data-go="kycIntro" data-params='{"unlock":"card"}'>Verify and turn it on</button>
          <button class="btn btn-ghost btn-hero" data-back>Later</button>
        </div>
      </div>`;
  }
  function blockedMount() {}

  /* 45 · Details revealed — masked by default, deliberate reveal */
  Screens.cardDetails = (p) => {
    let revealed = false;
    return {
      render() {
        const c = DB.state.card;
        const isPhys = p.which === "physical";
        const art = isPhys ? c.physical.art : c.virtual.art;
        const last4 = isPhys ? c.physical.last4 : c.virtual.last4;
        return `
        ${navrow({ title: "Card details" })}
        <div class="scr-body">
          ${pageTitle(isPhys ? "Fasset Prime" : "Virtual card", "")}
          <div class="pcard" style="background-image:url('${art}')">
            <span class="pc-overlay">
              <span class="pc-num" style="font-size:16px">${revealed ? "4532 0198 2276 " + last4 : "•••• •••• •••• " + last4}</span>
              <span style="display:flex;gap:18px;margin-top:6px;font-size:12px">
                <span>EXP ${revealed ? c.virtual.exp : "••/••"}</span><span>CVV ${revealed ? "381" : "•••"}</span>
              </span>
            </span>
          </div>
          <div class="cta-dock stack-8" style="position:static;margin-top:18px">
            <button class="btn ${revealed ? "btn-secondary" : "btn-primary"} btn-hero" id="reveal">${revealed ? "Hide details" : "Reveal details"}</button>
            ${revealed ? `<button class="btn btn-secondary btn-hero" data-copy="4532019822764821">${icon("copy", 15)} Copy number</button>` : ""}
          </div>
          <p class="footnote center">Revealing needs Face ID and hides again in 60 seconds.</p>
        </div>`;
      },
      onMount(el) {
        el.querySelector("#reveal").addEventListener("click", () => {
          if (revealed) { revealed = false; App.renderTop("root"); return; }
          authSheet(() => { revealed = true; App.renderTop("root"); }, "Reveal card details");
        });
      },
    };
  };

  /* 46 · Add to Apple / Google Wallet */
  Screens.addToWallet = () => ({
    render: () => `
      ${navrow({ title: "Wallet" })}
      <div class="scr-body">
        ${pageTitle("Pay with your phone", "Add the card once — then just hold your phone to any terminal.")}
        <div class="list-tight" style="margin-top:8px">
          ${row({ ic: "apple", title: "Add to Apple Wallet", sub: "Face ID confirms it — about 10 seconds", act: "apple", chev: true })}
          ${row({ ic: "google", title: "Add to Google Wallet", sub: "For your Android devices", act: "google", chev: true })}
        </div>
        <div class="inline-note">${icon("shield", 15)}<span>Your real card number is never shared with the phone or the shop — each payment uses a one-time code.</span></div>
      </div>`,
    onMount(el) {
      el.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
        openSheet({
          body: statusHero({ pulse: true, tone: "quiet", title: "Adding to Wallet", sub: "Confirming with the network…" }) + "<div style='height:12px'></div>",
        });
        setTimeout(() => { closeSheet(true); toast("Added to Wallet — hold to pay"); }, 1200);
      }));
    },
  });

  /* 48 · Controls */
  Screens.cardControls = () => ({
    render() {
      const k = DB.state.card.controls;
      return `
      ${navrow({ title: "Controls" })}
      <div class="scr-body">
        ${pageTitle("Card controls", "Flip a switch, it applies instantly — even mid-checkout.")}
        ${toggleRow("online", "Online payments", "Websites and apps", k.online)}
        ${toggleRow("contactless", "Contactless", "Tap to pay in person", k.contactless)}
        ${toggleRow("atm", "ATM withdrawals", "Cash from any machine", k.atm)}
        ${toggleRow("intl", "International payments", "Charges from outside the UAE — includes foreign websites", k.intl)}
        ${DB.state.scenario.cardDeclined && !k.intl ? `<div class="inline-note" style="color:var(--negative)">${icon("alert", 15)}<span>Netflix was declined this morning because international payments are off.</span></div>` : ""}
      </div>`;
    },
    onMount(el) {
      el.querySelectorAll("[data-toggle]").forEach((sw) => sw.addEventListener("click", () => {
        const k = DB.state.card.controls;
        const id = sw.dataset.toggle;
        k[id] = !k[id];
        sw.classList.toggle("on");
        if (id === "intl" && k.intl && DB.state.scenario.cardDeclined) {
          DB.state.scenario.cardDeclined = false;
          toast("On — Netflix will go through now");
          setTimeout(() => App.renderTop("root"), 600);
        } else toast(k[id] ? "Turned on" : "Turned off");
      }));
    },
  });

  /* 49 · Limits */
  Screens.cardLimits = () => ({
    render() {
      const L = DB.state.card.limits;
      return `
      ${navrow({ title: t("Limits") })}
      <div class="scr-body">
        ${pageTitle("Spending limits", "Your caps, your call — changes apply instantly.")}
        ${[["daily", "Daily spending", L.daily, 50000], ["perTx", "Per payment", L.perTx, 25000], ["atm", "ATM per day", L.atm, 10000]].map(([id, label, v, max]) => `
          <div style="padding:14px 0">
            <div class="spread"><span class="d-t">${label}</span><span class="strong">${fmt(v, 0)} AED</span></div>
            <input type="range" min="500" max="${max}" step="500" value="${v}" data-lim="${id}" style="width:100%;accent-color:var(--ink);margin-top:10px">
          </div>`).join("")}
        <p class="footnote">Your account tier allows up to 50,000 AED daily. <button class="link-quiet" data-go="kycStatus" style="text-decoration:underline">See tiers</button></p>
      </div>`;
    },
    onMount(el) {
      el.querySelectorAll("[data-lim]").forEach((r) => r.addEventListener("change", () => {
        DB.state.card.limits[r.dataset.lim] = +r.value;
        App.renderTop("root");
        toast("Limit updated");
      }));
    },
  });

  /* 50 · Order physical */
  Screens.orderCard = () => {
    let design = 0;
    const designs = [
      { art: "assets/cards/prime.png", name: "Prime black" },
      { art: "assets/cards/plus-steel.png", name: "Plus steel" },
      { art: "assets/cards/plus-rose.png", name: "Plus rosé" },
    ];
    return {
      render: () => `
        ${navrow({ title: "Metal card" })}
        <div class="scr-body">
          ${pageTitle("Pick your metal", "Free with your account. Same card account as your virtual — one balance, one set of controls.")}
          <div class="pcard" id="big" style="background-image:url('${designs[design].art}')"></div>
          <div class="pcard-stackwrap" style="margin-top:14px">
            ${designs.map((d, i) => `<button class="pcard small ${i === design ? "" : ""}" data-d="${i}" style="background-image:url('${d.art}');outline:${i === design ? "2px solid var(--ink)" : "none"};outline-offset:2px;flex-shrink:0"></button>`).join("")}
          </div>
          <div class="group-label-m">Delivery</div>
          ${row({ ic: "map", title: "Marina Gate 2, Apt 1804", sub: "Dubai Marina, Dubai · from your profile", act: "addr", chev: true })}
          <div class="def-group">
            ${defRow("Arrives", "3–5 working days · courier, not post")}
            ${defRow("Cost", "Free")}
          </div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="order">Order the ${designs[design].name}</button></div>
        </div>`,
      onMount(el) {
        el.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
          design = +b.dataset.d;
          el.querySelector("#big").style.backgroundImage = `url('${designs[design].art}')`;
          el.querySelectorAll("[data-d]").forEach((x, i) => (x.style.outline = i === design ? "2px solid var(--ink)" : "none"));
          el.querySelector("#order").textContent = `Order the ${designs[design].name}`;
        }));
        el.querySelector('[data-act="addr"]').addEventListener("click", () => toast("Address editor lives here — demo stub"));
        el.querySelector("#order").addEventListener("click", () => {
          DB.state.card.physical.status = "ordered";
          DB.state.card.physical.art = designs[design].art;
          App.go("trackCard", {}, { replace: true });
        });
      },
    };
  };

  /* 51 · Track delivery */
  Screens.trackCard = () => ({
    render() {
      const shipped = DB.state.card.physical.status === "shipped";
      return `
      ${navrow({ title: "Delivery" })}
      <div class="scr-body">
        ${statusHero({ tone: "quiet", ic: "truck", title: shipped ? "Out for delivery" : "Being made", sub: shipped ? "Your Prime card arrives tomorrow before 6 PM. The courier will message you." : "Metal takes a couple of days to press. We'll track it here the whole way." })}
        <div class="timeline" style="margin-top:24px">
          <div class="timeline-item done"><span class="timeline-dot"></span><span><div class="timeline-label">Ordered</div><div class="timeline-time">Today</div></span></div>
          <div class="timeline-item ${shipped ? "done" : "pending"}"><span class="timeline-dot"></span><span><div class="timeline-label">Pressed and packed</div><div class="timeline-time">${shipped ? "Done" : "1–2 days"}</div></span></div>
          <div class="timeline-item ${shipped ? "pending" : ""}"><span class="timeline-dot"></span><span><div class="timeline-label">With the courier</div><div class="timeline-time">${shipped ? "Arriving tomorrow" : "—"}</div></span></div>
          <div class="timeline-item"><span class="timeline-dot"></span><span><div class="timeline-label">In your hands</div><div class="timeline-time">Activate in the app</div></span></div>
        </div>
        <div class="cta-dock"><button class="btn btn-secondary btn-hero" id="ff">Demo: skip ahead</button></div>
      </div>`;
    },
    onMount(el) {
      el.querySelector("#ff").addEventListener("click", () => {
        const s = DB.state.card.physical;
        s.status = s.status === "ordered" ? "shipped" : "delivered";
        if (s.status === "delivered") App.go("activateCard", {}, { replace: true });
        else App.renderTop("root");
      });
    },
  });

  /* 52 · Activate + set PIN */
  Screens.activateCard = () => {
    let pin = "";
    return {
      render: () => `
        ${navrow({ title: "Activate" })}
        <div class="scr-body">
          ${pageTitle("Activate your Prime", "Choose a PIN for ATMs and chip payments. Everything else already works.")}
          <div class="otp-row" style="margin-top:20px" id="pin">${Array.from({ length: 4 }, (_, i) => `<span class="otp-cell ${i === 0 ? "focus" : ""}"></span>`).join("")}</div>
          <div class="keypad" style="margin-top:16px">${["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k) => k === "" ? "<span></span>" : `<button class="key" data-key="${k}">${k === "⌫" ? icon("chevronLeft", 18) : k}</button>`).join("")}</div>
        </div>`,
      onMount(el) {
        const cells = el.querySelectorAll(".otp-cell");
        el.querySelectorAll("[data-key]").forEach((k) => k.addEventListener("click", () => {
          const key = k.dataset.key;
          if (key === "⌫") pin = pin.slice(0, -1);
          else if (pin.length < 4) pin += key;
          cells.forEach((c, i) => { c.textContent = pin[i] ? "•" : ""; c.classList.toggle("focus", i === pin.length); });
          if (pin.length === 4) setTimeout(() => {
            DB.state.card.physical.status = "active";
            App.go("cardActivated", {}, { replace: true });
          }, 250);
        }));
      },
    };
  };

  Screens.cardActivated = () => ({
    render: () => `
      ${navrow({ back: false, right: `<button class="icon-btn" data-back-root>${icon("close", 16)}</button>` })}
      <div class="scr-body">
        ${statusHero({ title: "Your Prime is live", sub: "Tap it anywhere Visa works. Same balance, same controls as your virtual card." })}
        <div class="pcard" style="background-image:url('${DB.state.card.physical.art}')"></div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
      </div>`,
  });

  /* 53 · Replace */
  Screens.replaceCard = () => ({
    render: () => `
      ${navrow({ title: "Replace" })}
      <div class="scr-body">
        ${pageTitle("Replace your card", "The old number stops working the moment you confirm. Subscriptions carry over to the new one automatically.")}
        <div class="list-tight">
          ${row({ ic: "alert", icTone: "neg", title: "Lost or stolen", sub: "Old card blocked now · new virtual instantly · metal in 3–5 days", act: "r" })}
          ${row({ ic: "refresh", title: "Damaged", sub: "Keep using it until the new one arrives", act: "r" })}
          ${row({ ic: "eye", title: "Number compromised", sub: "New number, physical card unchanged", act: "r" })}
        </div>
      </div>`,
    onMount(el) {
      el.querySelectorAll('[data-act="r"]').forEach((b) => b.addEventListener("click", () => authSheet(() => {
        toast("Done — new virtual card is live");
        App.back();
      }, "Confirm replacement")));
    },
  });

  /* 54 · Decline notification + 55 · resolution on the same path */
  Screens.cardDeclineDetail = () => ({
    render() {
      const fixed = !DB.state.scenario.cardDeclined;
      if (fixed) return `
        ${navrow({ title: "Declined payment" })}
        <div class="scr-body">
          ${statusHero({ title: "Fixed", sub: "International payments are on. Ask Netflix to retry, or just wait — most merchants retry within a day." })}
          <div class="cta-dock"><button class="btn btn-primary btn-hero" data-back-root>${t("Done")}</button></div>
        </div>`;
      return `
        ${navrow({ title: "Declined payment" })}
        <div class="scr-body">
          ${statusHero({ tone: "neg", ic: "alert", title: "Netflix was declined", sub: "55.99 AED, today 8:47 AM. Your balance is fine — the payment came from outside the UAE and international payments are switched off on your card." })}
          <div class="def-group" style="margin-top:8px">
            ${defRow("Merchant", "Netflix · Amsterdam, NL")}
            ${defRow("Amount", money(55.99))}
            ${defRow("Card", "Fasset Plus ·· 4821")}
            ${defRow("Reason", "International payments off")}
          </div>
          <div class="group-label-m">Fix it here</div>
          <button class="nudge-card" data-act="fix">
            <span class="n-ic">${icon("globe", 17)}</span>
            <span style="flex:1"><span class="n-title">Turn on international payments</span><div class="n-sub">Applies instantly — Netflix's retry will go through.</div></span>
            <span class="chev">${icon("chevronRight", 14)}</span>
          </button>
          <div class="list-tight" style="margin-top:10px">
            ${row({ ic: "settings", title: "See all card controls", go: "cardControls", chev: true })}
            ${row({ ic: "headset", title: "This wasn't me", sub: "Freeze the card and talk to support", go: "support", params: { ctx: "sc1" } })}
          </div>
        </div>`;
    },
    onMount(el) {
      el.querySelector('[data-act="fix"]')?.addEventListener("click", () => {
        DB.state.card.controls.intl = true;
        DB.state.scenario.cardDeclined = false;
        DB.state.dismissed = {};
        App.renderTop("root");
        toast("On — payments from abroad will work now");
      });
    },
  });
})();
