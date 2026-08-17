/* ————————————————————————————————————————————————
   A. Arrival and onboarding — screens 1–8.
   Signup finishes in under two minutes; verification is
   optional and framed by what it turns on.
   ———————————————————————————————————————————————— */

(function () {
  const { t } = DB;
  const { navrow, pageTitle, row, money, heroMoney, openSheet, closeSheet, toast } = UI;

  /* 1 · Welcome — includes the account info from the reference screen:
     total balance, USD account, investments, card, tag, invite & earn */
  Screens.welcome = () => ({
    render: () => `
      <div class="scr-body" style="display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:18px">
          <span style="display:inline-flex;align-items:center;gap:9px;color:var(--text-strong)">
            <span style="width:20px;height:20px;display:inline-flex;color:var(--accent)">${window.markSvg}</span>
            <span style="font-weight:var(--w-medium);letter-spacing:0.14em;font-size:14px">FASSET<span style="font-size:8px;vertical-align:super">®</span></span>
          </span>
          <button class="btn btn-ghost btn-sm" data-act="lang">${DB.state.lang === "ar" ? "English" : "العربية"}</button>
        </div>

        <div style="flex:1.2"></div>
        <h1 class="page-title" style="font-size:34px">${t("One account for your money")}</h1>
        <p class="page-sub2" style="font-size:16px">${t("Move it home, grow it, and make it yours — from one balance in AED.")}</p>

        <div class="pillar-row" style="margin-top:14px">
          <div class="pillar"><span class="p-ic">${icon("move", 18)}</span><span><span class="p-t">${t("Move")}</span><div class="p-s">Bring money in your way, send it anywhere, spend it on a card.</div></span></div>
          <div class="pillar"><span class="p-ic">${icon("earn", 18)}</span><span><span class="p-t">${t("Earn")}</span><div class="p-s">Points on everything you do, and a share of real profit on savings.</div></span></div>
          <div class="pillar"><span class="p-ic">${icon("own", 18)}</span><span><span class="p-t">${t("Own")}</span><div class="p-s">Turn spare money into gold, stocks and funds — from 10 AED.</div></span></div>
        </div>

        <div style="flex:1"></div>
        <div class="cta-dock stack-8">
          <button class="btn btn-primary btn-hero" data-go="walkthrough">${t("Get started")}</button>
          <button class="btn btn-ghost btn-hero" data-go="signup" data-params='{"mode":"signin"}'>${t("Sign in")}</button>
        </div>
      </div>`,
    onMount(el) {
      el.querySelector('[data-act="lang"]').addEventListener("click", () => App.setLang(DB.state.lang === "ar" ? "en" : "ar"));
    },
  });

  /* 2 · Pillar walkthrough — three panels, skippable at any point */
  const PANELS = [
    { ic: "move", title: "Money in, your way", sub: "Top up with Aani, a bank transfer, a card, cash at an exchange house — or from a friend. Send it home for the same fee as sending it across the street." },
    { ic: "earn", title: "Everything you do earns", sub: "Card payments, deposits, referrals — they all collect OWN points. Idle cash can earn a real profit share, paid daily." },
    { ic: "own", title: "Points become things you own", sub: "Redeem points into gold, a fund, or an asset you pick. Not vouchers. Not coupons. Yours." },
  ];
  Screens.walkthrough = () => {
    let i = 0;
    return {
      render: () => `
        ${navrow({ back: true, right: `<button class="btn btn-ghost btn-sm" data-go="signup">${t("Skip")}</button>` })}
        <div class="scr-body" style="display:flex;flex-direction:column">
          <div id="wt-panel" style="flex:1;display:flex;flex-direction:column;justify-content:center"></div>
          <div style="display:flex;justify-content:center;gap:6px;padding:18px 0" id="wt-dots"></div>
          <div class="cta-dock"><button class="btn btn-primary btn-hero" id="wt-next">${t("Continue")}</button></div>
        </div>`,
      onMount(el) {
        const panel = el.querySelector("#wt-panel"), dots = el.querySelector("#wt-dots");
        function paint() {
          const p = PANELS[i];
          panel.innerHTML = `<div class="status-hero" style="padding-top:0">
            <span class="status-orb quiet" style="width:88px;height:88px">${icon(p.ic, 38)}</span>
            <h1 style="font-size:26px;margin-top:26px">${p.title}</h1><p class="st-sub" style="font-size:15px">${p.sub}</p></div>`;
          dots.innerHTML = PANELS.map((_, j) => `<i style="width:${j === i ? 18 : 6}px;height:6px;border-radius:999px;background:${j === i ? "var(--ink)" : "var(--border-strong)"};transition:width 240ms var(--ease-snappy)"></i>`).join("");
        }
        el.querySelector("#wt-next").addEventListener("click", () => { if (i < PANELS.length - 1) { i++; paint(); } else App.go("signup"); });
        paint();
      },
    };
  };

  /* 3 · Signup / sign-in — phone primary, Apple and Google as alternatives */
  Screens.signup = (params) => ({
    render: () => `
      ${navrow({})}
      <div class="scr-body">
        ${pageTitle(params.mode === "signin" ? t("Sign in") : "What's your number?", params.mode === "signin" ? "Welcome back. Your number is your key." : "Your account takes about two minutes. No documents needed to look around.")}
        <div class="field" style="margin-top:12px">
          <label>Phone number</label>
          <div class="phone-row">
            <button class="phone-cc">🇦🇪 +971 ${icon("chevronDown", 12)}</button>
            <input class="input" id="ph" type="tel" inputmode="tel" placeholder="50 123 4567" autocomplete="tel">
          </div>
          <p class="hint">We'll text you a code. Standard rates apply.</p>
        </div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="cont" disabled>${t("Continue")}</button></div>
        <div style="display:flex;align-items:center;gap:12px;padding:20px 0 14px"><span style="flex:1;height:1px;background:var(--border-faint)"></span><span class="footnote">or</span><span style="flex:1;height:1px;background:var(--border-faint)"></span></div>
        <div class="stack-8">
          <button class="btn btn-secondary btn-hero" data-act="alt">${icon("apple", 17)} Continue with Apple</button>
          <button class="btn btn-secondary btn-hero" data-act="alt">${icon("google", 16)} Continue with Google</button>
        </div>
        <p class="footnote" style="padding-top:22px">By continuing you agree to the terms and privacy policy. Fasset operates in the UAE under VARA supervision.</p>
      </div>`,
    onMount(el, p) {
      const ph = el.querySelector("#ph"), cont = el.querySelector("#cont");
      ph.addEventListener("input", () => (cont.disabled = ph.value.replace(/\D/g, "").length < 8));
      const proceed = () => App.go("otp", { mode: p.mode, phone: ph.value || "50 214 8867" });
      cont.addEventListener("click", proceed);
      el.querySelectorAll('[data-act="alt"]').forEach((b) => b.addEventListener("click", () => App.go(p.mode === "signin" ? "otp" : "country", { mode: p.mode, social: true })));
      setTimeout(() => ph.focus(), 350);
    },
  });

  /* 4 · OTP — resend and wrong-code states. 111111 shows the wrong-code state. */
  Screens.otp = (params) => {
    let code = "";
    return {
      render: () => `
        ${navrow({})}
        <div class="scr-body">
          ${pageTitle("Enter the code", `Sent to <span dir="ltr">+971 ${params.phone || "50 214 8867"}</span> · <button class="link-quiet" data-back style="text-decoration:underline;color:var(--text-default)">wrong number?</button>`)}
          <div class="otp-row" id="otp" style="margin-top:16px">${Array.from({ length: 6 }, (_, i) => `<span class="otp-cell ${i === 0 ? "focus" : ""}"></span>`).join("")}</div>
          <p class="otp-err" id="otp-err" style="display:none">That code isn't right. Check the newest message or resend.</p>
          <p class="center footnote" style="padding-top:16px"><button id="resend" class="link-quiet" style="color:var(--text-subtle)">Resend code in <span id="rs-n">20</span>s</button></p>
          <div class="keypad" style="margin-top:8px">${["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k) => k === "" ? "<span></span>" : `<button class="key" data-key="${k}">${k === "⌫" ? icon("chevronLeft", 18) : k}</button>`).join("")}</div>
          <p class="footnote center" style="padding-top:14px">Demo: any code works · 111111 shows the error state</p>
        </div>`,
      onMount(el, p) {
        const cells = el.querySelectorAll(".otp-cell"), err = el.querySelector("#otp-err");
        let rs = 20;
        const resendBtn = el.querySelector("#resend");
        const timer = setInterval(() => {
          rs--; const n = el.querySelector("#rs-n");
          if (!n) return clearInterval(timer);
          if (rs <= 0) { clearInterval(timer); resendBtn.innerHTML = "Resend code"; resendBtn.style.color = "var(--text-default)"; }
          else n.textContent = rs;
        }, 1000);
        resendBtn.addEventListener("click", () => { if (rs <= 0) { toast("New code sent"); rs = 20; } });
        function paint() {
          cells.forEach((c, i) => {
            c.textContent = code[i] || "";
            c.classList.toggle("focus", i === code.length);
            c.classList.remove("err");
          });
        }
        function complete() {
          if (code === "111111") {
            cells.forEach((c) => c.classList.add("err"));
            err.style.display = "block";
            code = "";
            setTimeout(paint, 700);
            return;
          }
          if (p.mode === "signin") { DB.state.onboarded = true; App.setTab("home"); toast(`Welcome back, ${DB.state.user.first}`); }
          else App.go("country", {});
        }
        el.querySelectorAll("[data-key]").forEach((k) => k.addEventListener("click", () => {
          const key = k.dataset.key;
          err.style.display = "none";
          if (key === "⌫") code = code.slice(0, -1);
          else if (code.length < 6) code += key;
          paint();
          if (code.length === 6) setTimeout(complete, 220);
        }));
      },
    };
  };

  /* 5 · Country selection — UAE preselected by signal, changeable */
  const COUNTRIES = [
    ["🇦🇪", "United Arab Emirates", "AED · Emirates ID or passport"],
    ["🇸🇦", "Saudi Arabia", "SAR"], ["🇶🇦", "Qatar", "QAR"], ["🇧🇭", "Bahrain", "BHD"],
    ["🇵🇰", "Pakistan", "PKR"], ["🇮🇳", "India", "INR"], ["🇮🇩", "Indonesia", "IDR"], ["🇵🇭", "Philippines", "PHP"],
  ];
  Screens.country = () => ({
    render: () => `
      ${navrow({})}
      <div class="scr-body">
        ${pageTitle("Where do you live?", "This sets your currency, how you can add money, and what we're licensed to offer you. You can't change it later without support.")}
        <div class="list-tight" id="cl" style="margin-top:8px">
          ${COUNTRIES.map(([flag, name, sub], i) => `
            <button class="mrow" data-c="${i}">
              <span class="mono-av" style="font-size:18px;background:var(--surface-2)">${flag}</span>
              <span class="m-body"><span class="m-title">${name}</span><span class="m-sub">${sub}</span></span>
              <span class="rk-box" style="width:20px;height:20px;border-radius:999px;border:1.5px solid var(--border-strong);display:inline-flex;align-items:center;justify-content:center;color:transparent">${icon("check", 11)}</span>
            </button>`).join("")}
        </div>
        <p class="footnote">Detected from your phone number — United Arab Emirates.</p>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" data-go="createAccount">${t("Continue")}</button></div>
      </div>`,
    onMount(el) {
      let sel = 0;
      const rows = el.querySelectorAll("[data-c]");
      function paint() {
        rows.forEach((r, i) => {
          const box = r.querySelector(".rk-box");
          const on = i === sel;
          box.style.background = on ? "var(--ink)" : "var(--bg)";
          box.style.borderColor = on ? "var(--ink)" : "var(--border-strong)";
          box.style.color = on ? "var(--on-ink)" : "transparent";
        });
      }
      rows.forEach((r, i) => r.addEventListener("click", () => { sel = i; paint(); }));
      paint();
    },
  });

  /* 6 · Basic account creation — minimum viable fields only */
  Screens.createAccount = () => ({
    render: () => `
      ${navrow({})}
      <div class="scr-body">
        ${pageTitle("Almost there", "Just a name for your account. Everything else can wait until you need it.")}
        <div class="field"><label>Your name</label><input class="input" id="nm" placeholder="As you'd like to be greeted" value=""></div>
        <div class="field"><label>Email <span class="faint">· for receipts</span></label><input class="input" id="em" type="email" placeholder="you@example.com"></div>
        <div class="cta-dock"><button class="btn btn-primary btn-hero" id="mk" disabled>Create my account</button></div>
      </div>`,
    onMount(el) {
      const nm = el.querySelector("#nm"), mk = el.querySelector("#mk");
      nm.addEventListener("input", () => (mk.disabled = nm.value.trim().length < 2));
      mk.addEventListener("click", () => {
        const name = nm.value.trim() || "Rabii Malik";
        DB.state.user.name = name;
        DB.state.user.first = name.split(" ")[0];
        App.go("kycOffer");
      });
      setTimeout(() => nm.focus(), 350);
    },
  });

  /* 7 · Optional verification prompt — clearly skippable, says what it turns on */
  Screens.kycOffer = () => ({
    render: () => `
      ${navrow({ back: false })}
      <div class="scr-body" style="display:flex;flex-direction:column">
        ${UI.statusHero({ ic: "check", title: `Your account is ready, ${DB.state.user.first}`, sub: "You can look around, get your tag, and receive up to 3,670 AED right now." })}
        <div class="group-label-m" style="text-align:center;padding-top:26px">A 2-minute ID check also turns on</div>
        <div class="list-tight">
          ${row({ ic: "cards", title: "Your Fasset card", sub: "Virtual right away, metal by courier" })}
          ${row({ ic: "bank", title: "Personal AED account + IBAN", sub: "Receive salary and bank transfers" })}
          ${row({ ic: "own", title: "Investing from 10 AED", sub: "Gold, stocks, funds and more" })}
        </div>
        <div style="flex:1"></div>
        <div class="cta-dock stack-8">
          <button class="btn btn-primary btn-hero" data-go="kycIntro" data-params='{"unlock":"card","from":"onboarding"}'>Verify now · about 2 min</button>
          <button class="btn btn-ghost btn-hero" id="skip">Explore first</button>
        </div>
      </div>`,
    onMount(el) {
      el.querySelector("#skip").addEventListener("click", () => {
        DB.state.onboarded = true;
        App.setTab("home");
        toast("You can verify any time from your account");
      });
    },
  });
})();
