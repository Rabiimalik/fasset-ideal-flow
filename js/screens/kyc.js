/* ————————————————————————————————————————————————
   F. Progressive verification — screens 91–106.
   Reached from whichever action needs it. Each entry says
   what it turns on, collects only what that needs, and
   reuses everything already held.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, openSheet, closeSheet, toast, statusHero, defRow } = UI;

  /* what each unlock needs */
  const FLOWS = {
    card: {
      label: "your card, accounts and investing",
      needs: ["kycPersonal", "kycDoc", "kycLiveness", "kycDeclarations", "kycReview"],
      time: "about 2 minutes",
      unlocks: ["Virtual card, instantly", "Personal AED account + IBAN", "Investing from 10 AED", "Sending inside the UAE"],
      toTier: 1, returnTo: "card",
    },
    invest: {
      label: "investing",
      needs: ["kycPersonal", "kycDoc", "kycLiveness", "kycDeclarations", "kycReview"],
      time: "about 2 minutes",
      unlocks: ["Investing from 10 AED", "Your card and AED account too"],
      toTier: 1, returnTo: "explore",
    },
    intl: {
      label: "international transfers and higher limits",
      needs: ["kycAddress", "kycTax", "kycFunds", "kycReview"],
      time: "about 1 minute",
      unlocks: ["Sending to any country", "150,000 AED monthly limit", "Credit eligibility"],
      toTier: 2, returnTo: "send",
    },
  };

  function flow() { return DB.state.kycFlow || null; }
  function startFlow(unlock) {
    DB.state.kycFlow = { unlock, i: 0, docTries: 0, passport: false };
  }
  function progressBar() {
    const f = flow();
    if (!f) return "";
    const steps = FLOWS[f.unlock].needs;
    return `<div class="kyc-progress">${steps.map((_, i) => `<i class="${i < f.i ? "done" : i === f.i ? "half" : ""}"></i>`).join("")}</div>`;
  }
  function next() {
    const f = flow();
    f.i++;
    const steps = FLOWS[f.unlock].needs;
    if (f.i >= steps.length) App.go("kycSubmitted", {}, { replace: true });
    else App.go(steps[f.i], {}, { replace: true });
  }
  function saveExitBtn() {
    return `<button class="icon-btn" data-act="save-exit">${icon("close", 16)}</button>`;
  }
  function bindSaveExit(el) {
    el.querySelector('[data-act="save-exit"]')?.addEventListener("click", () => {
      openSheet({
        title: "Save and exit?",
        body: `<p style="font-size:14px;color:var(--text-subtle);line-height:1.5">Everything you've entered is kept. Pick up from the same step any time — from your account, or when you retry the action.</p><div style="height:8px"></div>`,
        foot: `<button class="btn btn-secondary" data-sheet-close>Keep going</button><button class="btn btn-primary" id="sx">Save and exit</button>`,
        onMount(sheet) {
          sheet.querySelector("#sx").addEventListener("click", () => {
            DB.state.user.kycDraft = { ...flow() };
            closeSheet(true);
            toast("Saved — resume any time");
            App.backToRoot();
          });
        },
      });
    });
  }

  /* 91 · Unlock explainer */
  Screens.kycIntro = (p) => ({
    render() {
      const cfg = FLOWS[p.unlock] || FLOWS.card;
      const draft = DB.state.user.kycDraft;
      return `
        ${navrow({ title: "Verification" })}
        <div class="scr-body">
          ${pageTitle(`Turn on ${cfg.label}`, `Takes ${cfg.time}. We only ask for what this step actually needs — nothing twice.`)}
          <div class="group-label-m">This opens</div>
          <div class="list-tight">
            ${cfg.unlocks.map((u) => row({ ic: "check", icTone: "tint", title: u })).join("")}
          </div>
          <div class="group-label-m">You'll need</div>
          <div class="list-tight">
            ${p.unlock === "intl" ? row({ ic: "map", title: "Just your address", sub: "We already hold your identity — we reuse it" }) : row({ ic: "id", title: "Emirates ID", sub: "Or passport if you're not a resident" }) + row({ ic: "camera", title: "A quick selfie", sub: "Proves the ID is yours" })}
          </div>
          <div class="inline-note">${icon("lock", 15)}<span>Your documents are encrypted, used only for this check under UAE law, and never sold or shared for marketing.</span></div>
          ${draft && draft.unlock === p.unlock ? `<div class="inline-note">${icon("refresh", 15)}<span>You're part-way through — we saved your progress.</span></div>` : ""}
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="start">${draft && draft.unlock === p.unlock ? "Resume" : "Start"} · ${cfg.time}</button></div>
        </div>`;
    },
    onMount(el, p) {
      el.querySelector("#start").addEventListener("click", () => {
        const draft = DB.state.user.kycDraft;
        if (draft && draft.unlock === p.unlock) { DB.state.kycFlow = { ...draft }; DB.state.user.kycDraft = null; }
        else startFlow(p.unlock || "card");
        const f = flow();
        App.go(FLOWS[f.unlock].needs[f.i]);
      });
    },
  });

  /* 92 · Name, date of birth, nationality */
  Screens.kycPersonal = () => ({
    render: () => `
      ${progressBar()}
      ${navrow({ title: "About you", right: saveExitBtn() })}
      <div class="scr-body">
        ${pageTitle("About you", "Exactly as it appears on your ID.")}
        <div class="field"><label>Full legal name</label><input class="input" value="${DB.state.user.name}"></div>
        <div class="field-row">
          <div class="field"><label>Date of birth</label><input class="input" placeholder="DD / MM / YYYY" value="14 / 03 / 1994"></div>
        </div>
        <div class="field"><label>Nationality</label><select class="select"><option>Pakistan</option><option>India</option><option>United Arab Emirates</option><option>Philippines</option><option>Egypt</option></select></div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="nx">${t("Continue")}</button></div>
      </div>`,
    onMount(el) { bindSaveExit(el); el.querySelector("#nx").addEventListener("click", next); },
  });

  /* 93–95 · Document capture: EID front/back, retry, passport path */
  Screens.kycDoc = () => {
    let side = "front";
    return {
      render() {
        const f = flow();
        const passport = f.passport;
        return `
        ${progressBar()}
        ${navrow({ title: passport ? "Passport" : "Emirates ID", right: saveExitBtn() })}
        <div class="scr-body">
          ${pageTitle(passport ? "Scan your passport" : side === "front" ? "Emirates ID — front" : "Now the back", passport ? "The photo page, all four corners in the frame." : "All four corners in the frame, glare off the chip.")}
          <div class="capture-stage">
            <div class="guide"></div>
            <span class="cap-hint">${passport ? "Photo page here" : side === "front" ? "Photo side up" : "Barcode side up"}</span>
          </div>
          <div class="cta-dock stack-8">
            <button class="btn btn-primary btn-hero" id="cap">${icon("camera", 16)} Capture</button>
            ${!passport ? `<button class="btn btn-ghost btn-hero" id="pp">I'm not a UAE resident — use passport</button>` : ""}
          </div>
        </div>`;
      },
      onMount(el) {
        bindSaveExit(el);
        const f = flow();
        el.querySelector("#pp")?.addEventListener("click", () => { f.passport = true; App.renderTop("root"); });
        el.querySelector("#cap").addEventListener("click", () => {
          f.docTries++;
          if (f.docTries === 1) { App.go("kycDocRetry", {}, { replace: true }); return; }
          if (f.passport || side === "back") { toast("Looks good"); next(); }
          else { side = "back"; toast("Front captured"); App.renderTop("root"); }
        });
      },
    };
  };

  /* 94 · Poor quality retry */
  Screens.kycDocRetry = () => ({
    render: () => `
      ${progressBar()}
      ${navrow({ title: "Try again", right: saveExitBtn() })}
      <div class="scr-body">
        ${statusHero({ tone: "warn", ic: "camera", title: "That one was blurry", sub: "No harm done. Flat surface, good light, and hold still for a second — the frame does the rest." })}
        <div class="list-tight" style="margin-top:10px">
          ${row({ ic: "sun", title: "Face a window", sub: "Daylight beats the kitchen bulb" })}
          ${row({ ic: "id", title: "Lay the card flat", sub: "And fill the frame with it" })}
        </div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="rt">Retake</button></div>
      </div>`,
    onMount(el) { bindSaveExit(el); el.querySelector("#rt").addEventListener("click", () => { const f = flow(); App.go("kycDoc", {}, { replace: true }); }); },
  });

  /* 96 · Liveness with in-progress state */
  Screens.kycLiveness = () => ({
    render: () => `
      ${progressBar()}
      ${navrow({ title: "Selfie", right: saveExitBtn() })}
      <div class="scr-body">
        ${pageTitle("Quick selfie", "Proves the ID is really you. Look at the camera and follow the ring.")}
        <div class="capture-stage selfie"><div class="guide"></div><span class="cap-hint" id="lv-hint">Fit your face in the circle</span></div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="lv">Start</button></div>
      </div>`,
    onMount(el) {
      bindSaveExit(el);
      el.querySelector("#lv").addEventListener("click", () => {
        const hint = el.querySelector("#lv-hint"), btn = el.querySelector("#lv");
        btn.disabled = true;
        hint.textContent = "Hold still…";
        setTimeout(() => (hint.textContent = "Turn your head slightly…"), 800);
        setTimeout(() => (hint.textContent = "Done"), 1700);
        setTimeout(() => { toast("You're clearly you"); next(); }, 2100);
      });
    },
  });

  /* 97 · Address + proof */
  Screens.kycAddress = () => ({
    render: () => `
      ${progressBar()}
      ${navrow({ title: "Address", right: saveExitBtn() })}
      <div class="scr-body">
        ${pageTitle("Where you live", "Type it once — an Ejari, DEWA bill or bank letter can confirm it if we need more.")}
        <div class="field"><label>Address</label><input class="input" value="Marina Gate 2, Apt 1804"></div>
        <div class="field-row">
          <div class="field"><label>Area</label><input class="input" value="Dubai Marina"></div>
          <div class="field"><label>Emirate</label><select class="select"><option>Dubai</option><option>Abu Dhabi</option><option>Sharjah</option><option>Ajman</option><option>Ras Al Khaimah</option><option>Fujairah</option><option>Umm Al Quwain</option></select></div>
        </div>
        <button class="mrow" data-act="proof"><span class="m-ic">${icon("statements", 16)}</span><span class="m-body"><span class="m-title">Upload proof <span class="faint">· optional now</span></span><span class="m-sub">DEWA bill, Ejari, or bank letter — under 3 months old</span></span><span class="chev">${icon("chevronRight", 14)}</span></button>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="nx">${t("Continue")}</button></div>
      </div>`,
    onMount(el) {
      bindSaveExit(el);
      el.querySelector('[data-act="proof"]').addEventListener("click", () => toast("Document picker opens here"));
      el.querySelector("#nx").addEventListener("click", next);
    },
  });

  /* 98 · Tax residency and TIN — with a "why we ask" */
  Screens.kycTax = () => ({
    render: () => `
      ${progressBar()}
      ${navrow({ title: "Tax residency", right: saveExitBtn() })}
      <div class="scr-body">
        ${pageTitle("Tax residency", `Needed only for international transfers and investing above certain limits. <button class="link-quiet" data-act="why" style="text-decoration:underline;color:var(--text-default)">Why we ask</button>`)}
        <div class="field"><label>Country of tax residency</label><select class="select"><option>United Arab Emirates</option><option>Pakistan</option><option>India</option></select></div>
        <div class="field"><label>Tax number (TIN) <span class="faint">· if your country issues one</span></label><input class="input" placeholder="Optional in the UAE"></div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="nx">${t("Continue")}</button></div>
      </div>`,
    onMount(el) {
      bindSaveExit(el);
      el.querySelector('[data-act="why"]').addEventListener("click", () => openSheet({
        title: "Why we ask",
        body: `<p style="font-size:14px;color:var(--text-subtle);line-height:1.55">International rules (CRS/FATCA) require financial platforms to record where customers pay tax when money crosses borders. We report only what the law requires, to tax authorities only — never to anyone else.</p><div style="height:12px"></div>`,
      }));
      el.querySelector("#nx").addEventListener("click", next);
    },
  });

  /* 99 · Source of funds and employment */
  Screens.kycFunds = () => ({
    render: () => `
      ${progressBar()}
      ${navrow({ title: "Money's origin", right: saveExitBtn() })}
      <div class="scr-body">
        ${pageTitle("Where your money comes from", "One tap each — this is what lets us raise your limits.")}
        <div class="field"><label>Main source</label><select class="select"><option>Salary</option><option>Business income</option><option>Freelance work</option><option>Savings</option><option>Family support</option></select></div>
        <div class="field"><label>Occupation</label><input class="input" value="Product manager"></div>
        <div class="field"><label>Monthly inflow, roughly</label><select class="select"><option>Under 5,000 AED</option><option selected>5,000 – 25,000 AED</option><option>25,000 – 100,000 AED</option><option>Over 100,000 AED</option></select></div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="nx">${t("Continue")}</button></div>
      </div>`,
    onMount(el) { bindSaveExit(el); el.querySelector("#nx").addEventListener("click", next); },
  });

  /* 100 · Declarations — each item individually legible */
  Screens.kycDeclarations = () => {
    let on = [false, false];
    const items = [
      { t: "I'm not a politically exposed person", s: "No senior public role — for me or an immediate family member. If you are one, that's fine — it just means one extra review." },
      { t: "The money is mine, legitimately", s: "It comes from the sources I'll describe, and I'm not acting for someone else." },
    ];
    return {
      render: () => `
        ${progressBar()}
        ${navrow({ title: "Declarations", right: saveExitBtn() })}
        <div class="scr-body">
          ${pageTitle("Two declarations", "Read each one — they're short and they matter.")}
          ${items.map((c, i) => `
            <button class="risk-item" data-r="${i}">
              <span class="rk-box">${icon("check", 12)}</span>
              <span><span class="rk-t">${c.t}</span><div class="rk-s">${c.s}</div></span>
            </button>`).join("")}
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="nx" disabled>${t("Continue")}</button></div>
        </div>`,
      onMount(el) {
        bindSaveExit(el);
        const nx = el.querySelector("#nx");
        el.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => {
          const i = +b.dataset.r;
          on[i] = !on[i];
          b.classList.toggle("on", on[i]);
          nx.disabled = !on.every(Boolean);
        }));
        nx.addEventListener("click", next);
      },
    };
  };

  /* 101 · Review and submit — editable summary */
  Screens.kycReview = () => ({
    render() {
      const f = flow();
      const intl = f.unlock === "intl";
      return `
        ${progressBar()}
        ${navrow({ title: "Review", right: saveExitBtn() })}
        <div class="scr-body">
          ${pageTitle("Check it over", "Tap anything to fix it before you send.")}
          <div class="def-group">
            ${defRow("Name", DB.state.user.name)}
            ${intl ? "" : defRow("Date of birth", "14 / 03 / 1994") + defRow("Nationality", "Pakistan") + defRow("Document", f.passport ? "Passport" : "Emirates ID · both sides") + defRow("Selfie", "Captured")}
            ${intl ? defRow("Address", "Marina Gate 2, Apt 1804, Dubai Marina") + defRow("Tax residency", "United Arab Emirates") + defRow("Source of funds", "Salary · 5,000–25,000 AED/mo") : ""}
          </div>
          <p class="footnote">Most checks clear in under a minute. If we need anything else, we'll name it exactly.</p>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="sub">Submit</button></div>
        </div>`;
    },
    onMount(el) {
      bindSaveExit(el);
      el.querySelectorAll(".def-row").forEach((r) => r.addEventListener("click", () => toast("Editable in the demo's full flow")));
      el.querySelector("#sub").addEventListener("click", next);
    },
  });

  /* 102 · Under review — with what you can do meanwhile */
  Screens.kycSubmitted = () => ({
    render: () => `
      ${navrow({ back: false, right: saveExitBtn() })}
      <div class="scr-body">
        ${statusHero({ tone: "warn", pulse: true, title: "Checking…", sub: "Usually under a minute. You can leave — we'll ping you the moment it's done, and everything else keeps working meanwhile." })}
        <div class="cta-dock"><button class="btn btn-secondary btn-hero" data-back-root>Browse while you wait</button></div>
      </div>`,
    onMount(el) {
      bindSaveExit(el);
      const timer = setTimeout(() => {
        const f = flow();
        if (!f) return;
        // demo: one path through "more information needed" is available from the status screen
        DB.state.user.tier = Math.max(DB.state.user.tier, FLOWS[f.unlock].toTier);
        App.go("kycApproved", { unlock: f.unlock }, { replace: true });
      }, 2600);
    },
  });

  /* 103 · Approved — routes straight back into the attempted action */
  Screens.kycApproved = (p) => ({
    render() {
      const cfg = FLOWS[p.unlock] || FLOWS.card;
      return `
        ${navrow({ back: false })}
        <div class="scr-body">
          ${statusHero({ title: "You're verified", sub: `Everything you came for is on: ${cfg.unlocks.slice(0, 2).join(", ").toLowerCase()} — and your limits moved up.` })}
          <div class="cta-dock stack-8">
            <button class="btn btn-primary btn-hero" id="cont">${p.unlock === "intl" ? "Continue your transfer" : p.unlock === "invest" ? "Back to investing" : "See your card"}</button>
            <button class="btn btn-ghost btn-hero" data-back-root>${t("Home")}</button>
          </div>
        </div>`;
    },
    onMount(el, p) {
      DB.state.kycFlow = null;
      DB.state.dismissed = {};
      el.querySelector("#cont").addEventListener("click", () => {
        const cfg = FLOWS[p.unlock] || FLOWS.card;
        App.resetTo("home");
        App.go(cfg.returnTo);
      });
    },
  });

  /* 104 · More information needed — names the deficiency, one next action */
  Screens.kycMoreInfo = () => ({
    render: () => `
      ${navrow({ title: "One more thing" })}
      <div class="scr-body">
        ${statusHero({ tone: "warn", ic: "statements", title: "We need one document", sub: "Your ID and selfie are fine. The address needs a proof document — the DEWA bill or Ejari you have on your phone works." })}
        <div class="list-tight" style="margin-top:12px">
          ${row({ ic: "statements", icTone: "warn", title: "Upload a proof of address", sub: "DEWA bill, Ejari, or bank letter · under 3 months old", act: "up", chev: true })}
        </div>
        <p class="footnote">This isn't a rejection — everything else is approved and waiting on this one item.</p>
      </div>`,
    onMount(el) {
      el.querySelector('[data-act="up"]').addEventListener("click", () => {
        toast("Uploaded — reviewing now");
        setTimeout(() => App.go("kycApproved", { unlock: "intl" }, { replace: true }), 1200);
      });
    },
  });

  /* 105 · Verification status overview */
  Screens.kycStatus = () => ({
    render() {
      const tier = DB.state.user.tier;
      const draft = DB.state.user.kycDraft;
      return `
        ${navrow({ title: "Verification" })}
        <div class="scr-body">
          ${pageTitle("Your verification", "Each level opens more — do them when you actually need them.")}
          <div class="list-tight">
            ${row({ ic: "check", icTone: "tint", title: "Account basics", sub: "Phone verified · explore and receive up to 3,670 AED" })}
            ${row({ ic: tier >= 1 ? "check" : "id", icTone: tier >= 1 ? "tint" : "", title: "Identity", sub: tier >= 1 ? "Done · card, AED account, investing, domestic sending" : "2 min · turns on card, accounts and investing", go: tier >= 1 ? undefined : "kycIntro", params: { unlock: "card" }, chev: tier < 1 })}
            ${row({ ic: tier >= 2 ? "check" : "map", icTone: tier >= 2 ? "tint" : "", title: "Address & tax", sub: tier >= 2 ? "Done · international sending, 150,000 AED/mo, credit" : "1 min · opens international sending and higher limits", go: tier >= 2 ? undefined : "kycIntro", params: { unlock: "intl" }, chev: tier < 2 })}
          </div>
          ${draft ? `<button class="nudge-card" data-go="kycIntro" data-params='{"unlock":"${draft.unlock}"}'>
              <span class="n-ic">${icon("refresh", 16)}</span>
              <span style="flex:1"><span class="n-title">Resume where you left off</span><div class="n-sub">Your progress is saved.</div></span>
              <span class="chev">${icon("chevronRight", 14)}</span></button>` : ""}
          <div class="group-label-m">Current limits</div>
          <div class="def-group">
            ${defRow("Monthly in + out", tier >= 2 ? "150,000 AED" : tier >= 1 ? "35,000 AED" : "3,670 AED lifetime")}
            ${defRow("Card daily", tier >= 1 ? "25,000 AED" : "—")}
            ${defRow("International", tier >= 2 ? "On" : "After address & tax")}
          </div>
          ${tier < 2 ? `<p class="footnote">Demo: the "more information needed" state is <button class="link-quiet" data-go="kycMoreInfo" style="text-decoration:underline">here</button>.</p>` : ""}
        </div>`;
    },
  });
})();
