/* ————————————————————————————————————————————————
   Demo data + state — Fasset consumer prototype, UAE instance.
   One persona with realistic funds and history, plus scenario
   flags the prototype control panel can flip.
   ———————————————————————————————————————————————— */

(function () {
  const USD = 3.6725; // AED per USD (peg)

  const state = {
    lang: "en",
    booted: false,
    onboarded: true, // dev panel can send you back through arrival
    tab: "home",
    dismissed: {}, // nudge ids dismissed this session
    scenario: {
      pendingDeposit: false,
      failedDeposit: false,
      cardDeclined: false,
      restricted: false,
      rewardReady: true,
      idleCash: false,
      freshAccount: false, // tier 0, zero balance
    },
    user: {
      name: "Rabii Malik",
      first: "Rabii",
      phone: "+971 50 214 8867",
      email: "rabii.malik@fasset.com",
      tag: "@rabii",
      country: "United Arab Emirates",
      tier: 1, // 0 explore · 1 verified (EID+liveness) · 2 full
      kycDraft: null, // saved-and-exit resume point
    },
    balances: {
      available: 18420.15,
      invested: 21340.8,
      earning: 7969.05,
      rewardsAED: 506.4,
    },
    points: 3376,
    pointRate: 0.15, // AED per OWN point
    card: {
      virtual: { active: true, last4: "4821", exp: "09/29", art: "assets/cards/plus-rose.png", name: "Fasset Plus · virtual" },
      physical: { status: "none", art: "assets/cards/prime.png", last4: "7305" }, // none | ordered | shipped | delivered | active
      frozen: false,
      controls: { online: true, contactless: true, atm: true, intl: false },
      limits: { daily: 25000, perTx: 10000, atm: 5000 },
      fundingAsset: "AED balance",
    },
    goals: [{ id: "g1", name: "Umrah trip", target: 8000, saved: 5150, monthly: 750, reached: false }],
    send: { defaultSource: "AED balance" },
  };

  // AED → X per 1 AED for display quotes
  const fxOut = { PKR: 77.86, INR: 23.58, IDR: 4392.4, USD: 1 / USD, PHP: 15.62 };

  /* ————— activity — one ledger across every product ————— */
  const txs = [
    { id: "t1", when: "Today", time: "9:12 AM", kind: "card", title: "Careem", sub: "Fasset Plus ·· 4821", amt: -24.5, status: "completed", cat: "Transport" },
    { id: "t2", when: "Today", time: "6:00 AM", kind: "yield", title: "USD savings profit", sub: "Daily profit share", amt: 2.31, status: "completed", cat: "Earnings" },
    { id: "t3", when: "Yesterday", time: "7:48 PM", kind: "card", title: "Spinneys Marina", sub: "Fasset Plus ·· 4821", amt: -186.2, status: "completed", cat: "Groceries" },
    { id: "t4", when: "Yesterday", time: "1:22 PM", kind: "send", title: "Ayesha Khan", sub: "To HBL ·· 2231 · she received 155,700.00 PKR", amt: -2000, status: "completed", cat: "Transfers", route: "Bank transfer · Pakistan", fee: 0, rate: "1 AED = 77.85 PKR" },
    { id: "t5", when: "Aug 15", time: "4:41 PM", kind: "deposit", title: "Added from Emirates NBD", sub: "Aani instant transfer", amt: 5000, status: "completed", cat: "Deposits", route: "Aani", fee: 0 },
    { id: "t6", when: "Aug 15", time: "11:05 AM", kind: "buy", title: "Bought gold", sub: "2.00 g at 448.80 AED/g", amt: -897.6, status: "completed", cat: "Investments" },
    { id: "t7", when: "Aug 14", time: "8:30 PM", kind: "reward", title: "OWN points earned", sub: "Card spending this week", amt: 96, pts: true, status: "completed", cat: "Rewards" },
    { id: "t8", when: "Aug 13", time: "9:02 PM", kind: "card", title: "Talabat", sub: "Fasset Plus ·· 4821", amt: -64.75, status: "completed", cat: "Dining" },
    { id: "t9", when: "Aug 12", time: "10:14 PM", kind: "receive", title: "Omar Farooq", sub: "@omarf · dinner split", amt: 180, status: "completed", cat: "Transfers" },
    { id: "t10", when: "Aug 10", time: "9:00 AM", kind: "deposit", title: "Salary · Meridian Consulting DMCC", sub: "To your AED account ·· 3016", amt: 14500, status: "completed", cat: "Income" },
    { id: "t11", when: "Aug 8", time: "2:17 PM", kind: "buy", title: "Global growth bundle", sub: "Monthly top-up", amt: -1500, status: "completed", cat: "Investments" },
    { id: "t12", when: "Aug 6", time: "6:55 PM", kind: "card", title: "ADNOC", sub: "Fasset Plus ·· 4821", amt: -142, status: "completed", cat: "Transport" },
    { id: "t13", when: "Aug 3", time: "3:26 PM", kind: "withdraw", title: "Withdrawal to Emirates NBD", sub: "AED ·· 8842", amt: -1200, status: "completed", cat: "Withdrawals", fee: 0 },
  ];

  /* scenario-conditional ledger entries, injected at the top */
  const scenarioTxs = {
    pendingDeposit: { id: "sp1", when: "Today", time: "10:04 AM", kind: "deposit", title: "Bank transfer arriving", sub: "From Emirates NBD · usually under 2 hours", amt: 3500, status: "pending", cat: "Deposits", route: "UAE bank transfer", fee: 0 },
    failedDeposit: { id: "sf1", when: "Today", time: "9:31 AM", kind: "deposit", title: "Card top-up didn't go through", sub: "Visa ·· 0417 · your bank declined it", amt: 1000, status: "failed", cat: "Deposits", route: "Debit card", fee: 24 },
    cardDeclined: { id: "sc1", when: "Today", time: "8:47 AM", kind: "card", title: "Netflix", sub: "Declined · international payments are off", amt: -55.99, status: "failed", cat: "Entertainment", declineReason: "intl" },
  };

  /* ————— funding methods, sorted by relevance ————— */
  const fundingMethods = [
    { id: "aani", icon: "bolt", name: "Aani instant transfer", sub: "From any UAE bank app", eta: "Instant", fee: "Free", rec: true },
    { id: "bank", icon: "bank", name: "UAE bank transfer", sub: "AED to your personal IBAN", eta: "Under 2 hours", fee: "Free" },
    { id: "card", icon: "cards", name: "Debit or credit card", sub: "Visa or Mastercard", eta: "Instant", fee: "2.4% · min 5.00 AED" },
    { id: "cash", icon: "cash", name: "Cash at an exchange house", sub: "Al Ansari, Lulu Exchange and 210 more", eta: "Same day", fee: "From 5.00 AED" },
    { id: "p2p", icon: "users", name: "From a Fasset friend", sub: "They send to your tag, instantly", eta: "Instant", fee: "Free" },
    { id: "crypto", icon: "globe", name: "Crypto transfer", sub: "USDT, USDC, BTC and more", eta: "About 2 minutes", fee: "Network fee shown upfront" },
  ];

  /* ————— recipients ————— */
  const recipients = [
    { id: "r1", name: "Ayesha Khan", sub: "HBL ·· 2231 · Pakistan · gets PKR", type: "bank-intl", ccy: "PKR", recent: true, intl: true },
    { id: "r2", name: "Omar Farooq", sub: "@omarf · instant and free", type: "tag", ccy: "AED", recent: true },
    { id: "r3", name: "Marina Heights Real Estate", sub: "AE47 0331 ·· 9012 · rent", type: "bank-uae", ccy: "AED", recent: true },
    { id: "r4", name: "Dewi Lestari", sub: "BCA ·· 8804 · Indonesia · gets IDR", type: "bank-intl", ccy: "IDR", intl: true },
    { id: "r5", name: "My hardware wallet", sub: "TQrY…kF2v · USDT · TRC-20", type: "wallet", ccy: "USDT" },
  ];

  /* ————— own — positions organised by outcome ————— */
  const outcomes = {
    save: { name: "Save", blurb: "Money kept safe and easy to reach, earning a little while it waits." },
    grow: { name: "Grow", blurb: "Money working for the long run. Values move — time smooths the ride." },
    protect: { name: "Protect", blurb: "Stores of value like gold, held to keep what you have." },
  };

  const positions = [
    { id: "p-usd", outcome: "save", name: "USD savings", sub: "2,170.05 USD · ~4.2% variable", value: 7969.05, invested: 7800, earned: 169.05, rate: "~4.2% variable", type: "yield", icon: "leaf", access: "Withdraw any time", accrues: "Profit added daily at 6:00 AM" },
    { id: "p-bundle", outcome: "grow", name: "Global growth bundle", sub: "Stocks, sukuk and gold in one", value: 9860.5, invested: 9000, earned: 860.5, avg: "Avg buy 91.40 AED/unit", type: "bundle", icon: "chart", units: "107.9 units", feesPaid: 22.5 },
    { id: "p-btc", outcome: "grow", name: "Bitcoin", sub: "0.0210 BTC", value: 5240.0, invested: 5000, earned: 240.0, avg: "Avg buy 238,095 AED/BTC", type: "asset", icon: "globe", feesPaid: 12.5 },
    { id: "p-gold", outcome: "protect", name: "Gold", sub: "12.50 g · vaulted in DMCC", value: 6240.3, invested: 5610, earned: 630.3, avg: "Avg buy 448.80 AED/g", type: "metal", icon: "gold", feesPaid: 14.0 },
  ];

  /* ————— explore catalogue ————— */
  const catalogue = [
    { id: "a-bundle-growth", group: "Bundles", name: "Global growth bundle", sub: "60% world stocks · 20% sukuk · 20% gold", risk: "Medium risk", fee: "0.4%/yr", outcome: "grow", icon: "chart", blurb: "One purchase spreads your money across hundreds of companies, sukuk and gold." },
    { id: "a-bundle-income", group: "Bundles", name: "Steady income bundle", sub: "Sukuk and income funds", risk: "Lower risk", fee: "0.35%/yr", outcome: "save", icon: "statements", blurb: "Aims for gentle, regular income rather than fast growth." },
    { id: "a-bundle-gold", group: "Bundles", name: "Gold starter", sub: "Physical gold, from 10 AED", risk: "Medium risk", fee: "0.3%/yr", outcome: "protect", icon: "gold", blurb: "Vaulted physical gold you can buy in grams." },
    { id: "a-gold", group: "Metals", name: "Gold", sub: "499.20 AED/g", risk: "Medium risk", fee: "0.5% per trade", outcome: "protect", icon: "gold", blurb: "Physical gold, allocated to you and vaulted in the DMCC." },
    { id: "a-silver", group: "Metals", name: "Silver", sub: "5.84 AED/g", risk: "Medium risk", fee: "0.5% per trade", outcome: "protect", icon: "gold", blurb: "Physical silver, vaulted and insured." },
    { id: "a-btc", group: "Crypto", name: "Bitcoin", sub: "249,530 AED", risk: "High risk", fee: "0.8% per trade", outcome: "grow", icon: "globe", blurb: "The largest digital asset. Prices move sharply — invest money you can leave alone." },
    { id: "a-eth", group: "Crypto", name: "Ethereum", sub: "12,410 AED", risk: "High risk", fee: "0.8% per trade", outcome: "grow", icon: "globe", blurb: "The second-largest digital asset, used across digital finance." },
    { id: "a-aapl", group: "Stocks", name: "Apple", sub: "AAPL · 851.10 AED", risk: "Medium risk", fee: "0.25% per trade", outcome: "grow", icon: "trendUp", blurb: "Fractional shares — own a slice from 10 AED." },
    { id: "a-nvda", group: "Stocks", name: "NVIDIA", sub: "NVDA · 674.90 AED", risk: "High risk", fee: "0.25% per trade", outcome: "grow", icon: "trendUp", blurb: "Fractional shares — own a slice from 10 AED." },
    { id: "a-sukuk", group: "Sukuk", name: "Global sukuk fund", sub: "~4.6% expected", risk: "Lower risk", fee: "0.3%/yr", outcome: "save", icon: "statements", blurb: "A basket of investment-grade sukuk paying regular income." },
  ];

  /* ————— earn ————— */
  const yieldProducts = [
    { id: "y-usd", name: "USD savings", rate: "~4.2%", rateNote: "variable", sub: "Withdraw any time · profit added daily", access: "Withdraw any time, arrives in seconds", risk: "Your money is placed in short-term, asset-backed trades. The rate moves with the market and can be zero in a bad week — it is not guaranteed.", how: "Your dollars fund short-term, fully backed trades, and you share the profit.", min: 100 },
    { id: "y-vault", name: "6-month goal vault", rate: "~5.1%", rateNote: "variable", sub: "6-month term · higher share of profit", access: "Locked for 6 months. Early exit takes 5 working days and forfeits that month's profit.", risk: "The rate is a target, not a promise. Early exit forfeits the current month's profit.", how: "Committing for 6 months lets your money fund longer trades with a higher profit share.", min: 500 },
    { id: "y-gold", name: "Gold earn", rate: "~1.6%", rateNote: "variable, paid in gold", sub: "30-day notice · profit paid in grams", access: "Withdrawals need 30 days' notice.", risk: "Paid in gold, so the value also moves with the gold price.", how: "Your vaulted gold is leased to vetted jewellers, and you share the lease income.", min: 1000 },
  ];

  const earnTasks = [
    { id: "e1", name: "Receive your salary here", pts: 300, sub: "One-time, when your first salary lands", icon: "briefcase", done: false },
    { id: "e2", name: "Invite a friend", pts: 150, sub: "For each friend who adds money", icon: "gift", done: false },
    { id: "e3", name: "Make your first investment", pts: 200, sub: "Any asset or bundle, from 10 AED", icon: "own", done: true },
    { id: "e4", name: "Pay with your card 5 times", pts: 50, sub: "This week · 3 of 5 done", icon: "cards", done: false },
    { id: "e5", name: "Start earning on idle cash", pts: 100, sub: "Move any amount into USD savings", icon: "leaf", done: false },
  ];

  /* ————— nudge inventory (screen 107) ————— */
  const nudges = [
    { id: "n-idle", name: "Idle cash", trigger: "Available balance sits unused for 14 days", copy: "18,420 AED has been idle for 2 weeks. In USD savings it would have earned about 26 AED by now.", action: "Start earning", scenario: "idleCash" },
    { id: "n-pending", name: "Incomplete deposit", trigger: "A transfer was started but hasn't arrived", copy: "Your 3,500 AED bank transfer is on its way — usually under 2 hours.", action: "Track it", scenario: "pendingDeposit" },
    { id: "n-declined", name: "Card needs attention", trigger: "A payment was declined for a fixable reason", copy: "Netflix was declined because international payments are off. One switch fixes it.", action: "Fix it now", scenario: "cardDeclined" },
    { id: "n-reward", name: "Rewards ready", trigger: "Points cross a redeemable threshold", copy: "3,376 OWN points are ready — worth 506.40 AED. Turn them into gold or an investment.", action: "Use points", scenario: "rewardReady" },
    { id: "n-recurring", name: "Recurring transfer", trigger: "Same recipient, similar amount, 3 months running", copy: "You send Ayesha about 2,000 AED every month. Want it to go automatically?", action: "Set it up" },
    { id: "n-spend", name: "Spending pattern", trigger: "A category rises sharply month over month", copy: "Dining is up 34% this month — 942 AED so far. Worth a look?", action: "See breakdown" },
    { id: "n-goal", name: "Goal within reach", trigger: "A goal crosses 90% of target", copy: "Umrah trip is 90% funded. One top-up of 350 AED finishes it.", action: "Finish the goal" },
    { id: "n-unlockable", name: "Restriction removable", trigger: "A limit can be lifted by one verification step", copy: "Confirm your address to raise your monthly limit to 150,000 AED.", action: "Confirm address" },
  ];

  /* ————— i18n — Arabic for the shell and the most-travelled surfaces ————— */
  const AR = {
    "Home": "الرئيسية", "Move": "تحويل", "Earn": "اكسب", "Own": "تملّك",
    "Total balance": "الرصيد الكلي", "Today": "اليوم", "This month": "هذا الشهر",
    "Available": "متاح للصرف", "Invested": "مستثمَر", "Earning": "يُدرّ ربحاً", "Rewards": "المكافآت",
    "Add money": "أضف أموالاً", "Send": "أرسل", "Request": "اطلب", "More": "المزيد",
    "Recent activity": "النشاط الأخير", "See all": "عرض الكل", "Activity": "النشاط",
    "Card": "البطاقة", "Receive": "استلم", "Withdraw": "اسحب", "Accounts": "الحسابات",
    "Continue": "متابعة", "Back": "رجوع", "Done": "تم", "Cancel": "إلغاء", "Confirm": "تأكيد",
    "Sign in": "تسجيل الدخول", "Get started": "ابدأ الآن", "Skip": "تخطَّ",
    "Amount": "المبلغ", "Fee": "الرسوم", "Arrives": "يصل", "Free": "مجاناً", "Instant": "فوري",
    "Verify": "وثّق حسابك", "Settings": "الإعدادات", "Support": "الدعم", "Security": "الأمان",
    "Notifications": "الإشعارات", "Limits": "الحدود", "Privacy": "الخصوصية",
    "Your account": "حسابك", "Move money": "حرّك أموالك", "Explore": "استكشف",
    "Save": "ادّخر", "Grow": "نمِّ", "Protect": "احمِ",
    "OWN points": "نقاط OWN", "Use points": "استخدم النقاط", "Invite friends": "ادعُ أصدقاءك",
    "Holdings": "ممتلكاتك", "Buy": "اشترِ", "Sell": "بِع", "Add": "أضف",
    "Pay friends as easily as sending a message.": "ادفع لأصدقائك بسهولة إرسال رسالة.",
    "Your Fasset Tag": "معرّفك في فاسِت", "Share": "شارك", "Copy": "انسخ",
    "One account for your money": "حساب واحد لأموالك",
    "Move it home, grow it, and make it yours — from one balance in AED.":
      "حوّلها لعائلتك، نمِّها، واجعلها ملكك — من رصيد واحد بالدرهم.",
  };

  function t(s) { return state.lang === "ar" && AR[s] ? AR[s] : s; }

  /* ————— derived helpers ————— */
  function totals() {
    if (state.scenario.freshAccount) return { total: 0, available: 0, invested: 0, earning: 0, rewards: 0 };
    const b = state.balances;
    const total = b.available + b.invested + b.earning + b.rewardsAED;
    return { total, available: b.available, invested: b.invested, earning: b.earning, rewards: b.rewardsAED };
  }
  function toUSD(aed) { return aed / USD; }

  function ledger() {
    const out = [];
    const s = state.scenario;
    if (!s.freshAccount) {
      if (s.cardDeclined) out.push(scenarioTxs.cardDeclined);
      if (s.failedDeposit) out.push(scenarioTxs.failedDeposit);
      if (s.pendingDeposit) out.push(scenarioTxs.pendingDeposit);
      out.push(...txs);
    }
    return out;
  }

  /* the single most useful thing to say right now — one at a time */
  function nextBestAction() {
    const s = state.scenario, d = state.dismissed;
    if (s.freshAccount && !d["fresh"]) return { id: "fresh", tone: "", icon: "plus", title: "Add money to start", sub: "Your account works — it's just empty. Most people start with Aani, it's instant and free.", go: "addmoney" };
    if (s.cardDeclined && !d["declined"]) return { id: "declined", tone: "neg", icon: "alert", title: "A card payment was declined", sub: "Netflix, 55.99 AED — international payments are off. One switch fixes it.", go: "cardDeclineDetail" };
    if (s.failedDeposit && !d["failedDep"]) return { id: "failedDep", tone: "neg", icon: "alert", title: "Your top-up didn't go through", sub: "Your bank declined the card payment. Two ways to fix it.", go: "depositFailed" };
    if (s.pendingDeposit && !d["pendingDep"]) return { id: "pendingDep", tone: "warn", icon: "clock", title: "3,500.00 AED on its way", sub: "Bank transfer from Emirates NBD — usually under 2 hours.", go: "depositPending" };
    if (state.user.tier < 1 && !d["verify"]) return { id: "verify", tone: "", icon: "id", title: "Turn on your card", sub: "A 2-minute identity check activates your card and local account details.", go: "kycIntro", params: { unlock: "card" } };
    if (s.rewardReady && !d["reward"]) return { id: "reward", tone: "", icon: "earn", title: "506.40 AED in points, ready", sub: "Turn 3,376 OWN points into gold, an investment, or spending money.", go: "redeem" };
    if (s.idleCash && !d["idle"]) return { id: "idle", tone: "", icon: "leaf", title: "Your cash is sitting idle", sub: "18,420 AED earns nothing here. USD savings pays ~4.2%, withdraw any time.", go: "yieldDetail", params: { id: "y-usd" } };
    if (state.user.tier < 2 && !d["tier2"]) return { id: "tier2", tone: "", icon: "arrowUpRight", title: "Send abroad from this account", sub: "Confirm your address once to send internationally and raise your limits.", go: "kycIntro", params: { unlock: "intl" } };
    return null;
  }

  window.DB = { state, t, totals, toUSD, USD, fx: fxOut, ledger, txs, scenarioTxs, fundingMethods, recipients, outcomes, positions, catalogue, yieldProducts, earnTasks, nudges, nextBestAction };
  Object.defineProperty(window.DB, "points", { get: () => state.points, set: (v) => (state.points = v) });
  Object.defineProperty(window.DB, "pointRate", { get: () => state.pointRate });
})();
