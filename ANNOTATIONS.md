# Annotations — decisions made where the brief was ambiguous

The brief asked for a record of every judgment call. These are them, grouped by theme.

## Visual authority

1. **Light-first, not dark.** The reference screenshot of the current app is dark green; the supplied design system is explicitly light-first ("warm paper"). The prompt's precedence rules say the design system wins on all visuals, so the prototype is warm-paper light. The screenshot contributed *content* (what's on the home screen), not palette.
2. **The business design system, translated to mobile.** The bundle is a desktop web system (sidebar, topbar, tables). Where it is silent — phone frame, tab bar, bottom sheets, keypad, OTP cells, capture frames — components were derived from its tokens: same radii scale (16px max), ink-tinted shadows, ink pills, out-quint/drawer easings, 6px squared chips, sentence case, no lines in content. The tab bar reuses the sidebar's grammar: active item = paper rect with a soft shadow, floating on linen.
3. **"Unlock" language.** The product brief demands unlock-framing for KYC; the design system bans the word "Unlock" as marketing-speak. Resolution: the *mechanic* is pure unlock-framing (every gate names exactly what it turns on and how long it takes), but the copy says "turns on / opens / raises" instead of the banned word.
4. **AED is typeset as a dimmed suffix code** (`48,236.40 AED`), per the system's suffix-currency rule; USD uses a solid full-size `$`. Hero balances assemble per-digit at 42px/weight 460.

## Interpreting the reference screenshot

5. **"The sign-in screen should include the info from this image."** Read as: the arrival surfaces must carry the account concepts shown — total balance in AED with visibility toggle, today's change, Global USD account, Investments, Card balance, quick actions, the verify-to-activate-card prompt, the Fasset Tag pitch ("Pay friends as easily as sending a message."), and Invite & Earn. They appear twice: as a compact account preview on the welcome/sign-in screen, and fully on the working home screen.
6. **"Global USD Account — Coming Soon" became live.** The brief's UAE configuration lists a USD account with international details as an existing capability of the ideal app, and separately bans showing anything the user can't access. So the USD account is real here (ACH/SWIFT details, balance folded into Available).
7. **Bottom nav.** The screenshot shows Home · Accounts · Card · Invest; the brief mandates Home · Move · Earn · Own. The brief wins; Accounts and Card live inside Move (each feature appears exactly once).

## Product mechanics

8. **Demo persona** is tier-1 verified (identity done, address not), with realistic funds: 48,236.40 AED total = 18,420.15 available (incl. $1,360.40 USD) + 21,340.80 invested + 7,969.05 earning + 506.40 rewards. Tier 1 makes the most instructive gate demoable: international send → "confirm your address" (tier 2), while a fresh tier-0 account (dev panel) gates card activation and investing.
9. **The card decline** is caused by a control (international payments off) rather than insufficient funds, because it's the decline that best demonstrates "the exact action that fixes it, executable on that screen" — one switch, applied instantly.
10. **One send primitive.** Tag, phone, UAE IBAN, international bank, and wallet address all route through the same entry → recognition → amount → review flow. Cross-border differs only by one rate line and a fee row. P2P QR reuses it.
11. **Redemption rate is flat and universal**: 1 pt = 0.15 AED, no tiers, stated on every redemption surface, and redemptions land in the same positions the user already owns (gold redemption grows the gold position, linked from the success screen).
12. **Yield is worded as Shariah profit-sharing** ("a share of real profit", "never interest"), stated once per surface, quietly, per the system's rule. Risk acknowledgement is three separately-tapped items with real copy, not a bundled checkbox. No guaranteed-return language exists anywhere; every rate carries "variable" inline.
13. **Rails**: Aani as the UAE instant rail, exchange-house cash-in (Al Ansari/Lulu), fixed AED/USD peg at 3.6725, AED→PKR 77.86. Fees are honest and shown before method selection.
14. **Credit** is a flat-fee, Shariah-structured line, eligible only at tier 2 with salary history; the ineligible state lists the exact three things that would change it.

## Scope compromises (a buildathon prototype, honestly)

15. **Arabic coverage is structural, not exhaustive.** RTL flips the entire app (logical properties + `dir`), numerals stay LTR-isolated, and ~80 of the highest-traffic strings are translated (shell, home, common actions). Long-tail screen copy falls back to English rather than machine-translating 400 strings badly.
16. **Some tertiary flows are labelled stubs** (add new withdrawal bank, statement archive, complaint form, goal editor, drawdown). Each is one toast deep, named as such, and never on the acceptance path.
17. **Simulated states**: OTP accepts any code (111111 demonstrates the wrong-code state); the first document capture always triggers the retry screen so the poor-quality path is demoable; KYC approval resolves in ~3 seconds; "more information needed" is reachable from the verification status screen.
18. **The prototype control panel** is the ◆ tab on the right edge (or press `` ` ``). It flips: pending deposit, failed deposit, card decline, rewards ready, idle cash, restriction, zero-balance/tier-0, tier 2, Arabic RTL — plus a jump list to every screen and a full demo reset.
19. **One recommendation at a time** is enforced by a priority ladder (attention states → pending money → verification → rewards → idle cash → tier-2 offer); each is dismissible and dismissal is remembered for the session.
20. **Card art**: the supplied renders are used as the card objects — Plus rosé as the default virtual card, Prime black and Plus steel as orderable metal, with masked-by-default details revealed via Face ID for 60 seconds.
