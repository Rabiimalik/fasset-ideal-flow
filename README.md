# Fasset — one global money account (prototype)

A clickable, high-fidelity mobile prototype of the ideal Fasset app, UAE instance.
Built on the Fasset Business design system: warm paper, ink chrome, no lines,
ease-out physics, art-directed money. ~100 screens across Move · Earn · Own,
progressive verification, intelligence, and trust.

## Run it

No build step, no dependencies:

```bash
python3 -m http.server 8471
# open http://localhost:8471
```

Opening `index.html` directly from disk also works (everything is self-hosted).
On desktop it renders in a phone frame on the linen wallpaper; on a phone it's full-screen.

## Demo script (the acceptance path)

1. **Welcome / sign-in** — carries the account info from the reference screen. Get started → walkthrough → phone → OTP (any code; `111111` shows the error state) → country (UAE preselected) → name → optional verification, clearly skippable.
2. **Home** — one total, four sub-balances, one recommendation, tag card, activity.
3. **Add money** — six UAE rails with honest fee + timing. Aani is instant end to end.
4. **Send** — pick Ayesha Khan (international): the address gate appears (unlock framing) → 1-minute KYC → straight back into the transfer → keypad with live PKR quote → review → Face ID → tracking.
5. **Card** — reveal (Face ID), freeze, controls, limits, order the metal card, track, activate with PIN.
6. **Card decline** — flip it in the control panel: home shows the attention state → cause in plain language → the fixing switch on the same screen.
7. **Earn** — points, cashback, streaks, referral; redeem 3,376 pts into gold → the gold position grows under Own.
8. **Own** — Save · Grow · Protect, explore, buy gold from 10 AED, position detail with performance on the primary screen, sell.
9. **Trust** — account control → security, limits, restrictions (with the honest "why/what/how long"), UAE regulatory page, context-inheriting support.

## Prototype control panel

The ◆ tab on the right edge (or press `` ` ``). Toggles every required demo state —
pending/failed deposit, card decline, rewards ready, idle cash, restriction,
zero-balance new user, tier 2, **Arabic/RTL** — plus a jump list to every screen
and a demo reset.

## Layout

```
index.html          shell (phone frame, status bar, hosts)
css/tokens.css      design-system tokens (from the bundle, untouched)
css/app.css         design-system components (from the bundle, untouched)
css/mobile.css      mobile shell derived from the tokens
js/data.js          demo state, UAE config, i18n, scenario flags
js/ui.js            shared components (money, rows, sheets, keypad, auth)
js/app.js           stack router, tab bar, control panel
js/screens/*.js     the screen inventory, grouped by pillar
assets/             self-hosted fonts, brand mark, card art
ANNOTATIONS.md      every judgment call where the brief was ambiguous
```
