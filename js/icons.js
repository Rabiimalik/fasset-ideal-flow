/* ————————————————————————————————————————————————
   Inline icon set — 16px grid, 1.5px stroke, round caps,
   geometric. The business bundle set, extended with the
   consumer verbs this app needs (drawn to the same spec).
   ———————————————————————————————————————————————— */

(function () {
  const paths = {
    /* from the business bundle */
    overview: `<rect x="1.75" y="1.75" width="5.1" height="5.1" rx="1.2"/><rect x="9.15" y="1.75" width="5.1" height="5.1" rx="1.2"/><rect x="1.75" y="9.15" width="5.1" height="5.1" rx="1.2"/><rect x="9.15" y="9.15" width="5.1" height="5.1" rx="1.2"/>`,
    payments: `<path d="M10.5 1.75 13.25 4.5 10.5 7.25"/><path d="M13.25 4.5H4.75"/><path d="M5.5 14.25 2.75 11.5 5.5 8.75"/><path d="M2.75 11.5h8.5"/>`,
    cards: `<rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5"/><path d="M1.75 6.5h12.5"/><path d="M4.25 10h3"/>`,
    accounts: `<rect x="1.75" y="3.5" width="12.5" height="9" rx="1.5"/><path d="M1.75 6.5h12.5"/><circle cx="11" cy="9.75" r="1.15"/>`,
    treasury: `<path d="M1.75 12.75V9.5c2.5 0 3.5-2.25 5-4.25S10.5 2.75 14.25 2.9v9.85"/><path d="M1.75 12.75h12.5"/>`,
    statements: `<path d="M11.75 14.25h-7.5c-.83 0-1.5-.67-1.5-1.5V3.25c0-.83.67-1.5 1.5-1.5h7.5c.83 0 1.5.67 1.5 1.5v9.5c0 .83-.67 1.5-1.5 1.5Z"/><path d="M5.5 5.25h5"/><path d="M5.5 8h5"/><path d="M5.5 10.75h2.5"/>`,
    bell: `<path d="M8 1.75a4 4 0 0 0-4 4c0 4-1.5 5.25-1.5 5.25h11S12 9.75 12 5.75a4 4 0 0 0-4-4Z"/><path d="M6.5 13.5a1.6 1.6 0 0 0 3 0"/>`,
    chart: `<path d="M2 2.25v10.5c0 .55.45 1 1 1h11"/><path d="M5 11V7.5"/><path d="M8 11V4.5"/><path d="M11 11V8.5"/><path d="M13.75 11V5.5"/>`,
    activity: `<path d="M1.75 8h2.75l1.75-4.5 3 9 1.75-4.5h3.25"/>`,
    settings: `<circle cx="8" cy="8" r="2.25"/><path d="M8 1.5l1.1 1.9 2.2-.35.5 2.15 1.9 1.1-1 1.95 1 1.95-1.9 1.1-.5 2.15-2.2-.35L8 14.5l-1.1-1.9-2.2.35-.5-2.15-1.9-1.1 1-1.95-1-1.95 1.9-1.1.5-2.15 2.2.35L8 1.5Z" stroke-linejoin="round"/>`,
    search: `<circle cx="7" cy="7" r="4.75"/><path d="m13.75 13.75-3.4-3.4"/>`,
    plus: `<path d="M8 2.75v10.5"/><path d="M2.75 8h10.5"/>`,
    close: `<path d="m3.5 3.5 9 9"/><path d="m12.5 3.5-9 9"/>`,
    check: `<path d="m2.75 8.5 3.5 3.5 7-8"/>`,
    chevronRight: `<path d="m5.75 2.75 5 5.25-5 5.25"/>`,
    chevronDown: `<path d="m2.75 5.75 5.25 5 5.25-5"/>`,
    chevronLeft: `<path d="m10.25 2.75-5 5.25 5 5.25"/>`,
    arrowUpRight: `<path d="M4 12 12 4"/><path d="M5.75 4H12v6.25"/>`,
    arrowDownLeft: `<path d="M12 4 4 12"/><path d="M10.25 12H4V5.75"/>`,
    arrowRight: `<path d="M2.75 8h10.5"/><path d="m9 3.75 4.25 4.25L9 12.25"/>`,
    download: `<path d="M8 2.25v8"/><path d="M4.75 7.25 8 10.5l3.25-3.25"/><path d="M2.25 13.25h11.5"/>`,
    copy: `<rect x="5.75" y="5.75" width="8.5" height="8.5" rx="1.5"/><path d="M3.25 10.25c-.83 0-1.5-.67-1.5-1.5v-5.5c0-.83.67-1.5 1.5-1.5h5.5c.83 0 1.5.67 1.5 1.5"/>`,
    send: `<path d="M14 2 7.4 8.6"/><path d="M14 2 9.8 14l-2.4-5.4L2 6.2 14 2Z"/>`,
    snowflake: `<path d="M8 1.75v12.5"/><path d="M2.6 4.9l10.8 6.2"/><path d="M13.4 4.9 2.6 11.1"/><path d="M6 2.9 8 4.4l2-1.5"/><path d="M6 13.1 8 11.6l2 1.5"/>`,
    sun: `<circle cx="8" cy="8" r="3.25"/><path d="M8 1.5v1.4"/><path d="M8 13.1v1.4"/><path d="M1.5 8h1.4"/><path d="M13.1 8h1.4"/><path d="m3.4 3.4 1 1"/><path d="m11.6 11.6 1 1"/><path d="m3.4 12.6 1-1"/><path d="m11.6 4.4 1-1"/>`,
    dots: `<circle cx="3.25" cy="8" r="0.4"/><circle cx="8" cy="8" r="0.4"/><circle cx="12.75" cy="8" r="0.4"/>`,
    building: `<path d="M2.75 14.25V3.25c0-.83.67-1.5 1.5-1.5h4.5c.83 0 1.5.67 1.5 1.5v11"/><path d="M10.25 6.25h2c.83 0 1.5.67 1.5 1.5v6.5"/><path d="M1.5 14.25h13"/><path d="M5 4.75h2.5"/><path d="M5 7.5h2.5"/><path d="M5 10.25h2.5"/>`,
    globe: `<circle cx="8" cy="8" r="6.25"/><path d="M1.75 8h12.5"/><path d="M8 1.75c1.8 1.7 2.75 3.9 2.75 6.25S9.8 12.55 8 14.25C6.2 12.55 5.25 10.35 5.25 8S6.2 3.45 8 1.75Z"/>`,
    clock: `<circle cx="8" cy="8" r="6.25"/><path d="M8 4.75V8l2.25 1.75"/>`,
    shield: `<path d="M8 1.75 2.75 3.9v4.2c0 3.2 2.24 5.35 5.25 6.15 3.01-.8 5.25-2.95 5.25-6.15V3.9L8 1.75Z"/>`,
    lock: `<rect x="3.25" y="7.25" width="9.5" height="7" rx="1.5"/><path d="M5.25 7.25v-2.5a2.75 2.75 0 0 1 5.5 0v2.5"/>`,
    receipt: `<path d="M3.25 1.75h9.5v12.5l-1.9-1.25-1.9 1.25L8 12.99l-1.9 1.26-1.9-1.25-.95.62V1.75Z" stroke-linejoin="round"/><path d="M5.75 5.25h4.5"/><path d="M5.75 8h4.5"/>`,
    refresh: `<path d="M13.65 6.35a5.75 5.75 0 0 0-11-.85"/><path d="M2.35 9.65a5.75 5.75 0 0 0 11 .85"/><path d="M13.9 2.5v3.25h-3.25"/><path d="M2.1 13.5v-3.25h3.25"/>`,
    users: `<circle cx="6" cy="5.25" r="2.5"/><path d="M1.75 13.25a4.25 4.25 0 0 1 8.5 0"/><path d="M10.75 3.1a2.5 2.5 0 0 1 0 4.8"/><path d="M11.5 9.35a4.25 4.25 0 0 1 2.75 3.9"/>`,

    /* drawn for the consumer app, same spec */
    home: `<path d="M2.75 6.75 8 2.25l5.25 4.5v6c0 .83-.67 1.5-1.5 1.5h-7.5c-.83 0-1.5-.67-1.5-1.5v-6Z" stroke-linejoin="round"/><path d="M6.25 14.25V10h3.5v4.25"/>`,
    move: `<path d="M10.5 1.75 13.25 4.5 10.5 7.25"/><path d="M13.25 4.5H4.75"/><path d="M5.5 14.25 2.75 11.5 5.5 8.75"/><path d="M2.75 11.5h8.5"/>`,
    earn: `<path d="M8 1.75l1.35 3.4 3.4 1.35-3.4 1.35L8 11.25 6.65 7.85l-3.4-1.35 3.4-1.35L8 1.75Z" stroke-linejoin="round"/><path d="M12.75 10.5l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6.6-1.5Z" stroke-linejoin="round"/>`,
    own: `<path d="M8 2.25 13.75 5.5v5L8 13.75 2.25 10.5v-5L8 2.25Z" stroke-linejoin="round"/><path d="M8 13.75V8.4"/><path d="M2.25 5.5 8 8.4l5.75-2.9"/>`,
    wallet: `<path d="M12.75 5V3.9c0-.83-.67-1.5-1.5-1.5H3.75c-.83 0-1.5.67-1.5 1.5v8.2c0 .83.67 1.5 1.5 1.5h8.5c.83 0 1.5-.67 1.5-1.5V6.5c0-.83-.67-1.5-1.5-1.5H2.25"/><circle cx="10.75" cy="9.25" r="1.1"/>`,
    bank: `<path d="M1.75 6 8 2.25 14.25 6v1H1.75V6Z" stroke-linejoin="round"/><path d="M3.25 7v4.5"/><path d="M6.4 7v4.5"/><path d="M9.6 7v4.5"/><path d="M12.75 7v4.5"/><path d="M1.75 13.75h12.5"/>`,
    bolt: `<path d="M8.75 1.75 3.25 9h3.5l-.5 5.25L11.75 7h-3.5l.5-5.25Z" stroke-linejoin="round"/>`,
    cash: `<rect x="1.75" y="4.25" width="12.5" height="7.5" rx="1.5"/><circle cx="8" cy="8" r="1.75"/><path d="M4 8h.01"/><path d="M12 8h.01"/>`,
    qr: `<rect x="2" y="2" width="4.75" height="4.75" rx="1"/><rect x="9.25" y="2" width="4.75" height="4.75" rx="1"/><rect x="2" y="9.25" width="4.75" height="4.75" rx="1"/><path d="M9.25 9.25h2v2h-2z"/><path d="M12.25 12.25H14V14h-1.75z"/><path d="M9.25 13.5v.5"/><path d="M14 9.25h-.5"/>`,
    gift: `<rect x="2.25" y="5.25" width="11.5" height="3" rx="1"/><path d="M3.25 8.25v4.5c0 .83.67 1.5 1.5 1.5h6.5c.83 0 1.5-.67 1.5-1.5v-4.5"/><path d="M8 5.25v9"/><path d="M8 5.25S7.5 2 5.5 2 3.75 5.25 8 5.25Z" stroke-linejoin="round"/><path d="M8 5.25S8.5 2 10.5 2s1.75 3.25-2.5 3.25Z" stroke-linejoin="round"/>`,
    flame: `<path d="M8.4 1.75s.85 1.9-.65 3.9C6.4 7.45 4.5 8 4.5 10.4a3.5 3.5 0 0 0 7 0c0-1.1-.4-1.9-.95-2.65-.5 1-1.3 1.35-1.3 1.35.65-2.9-.85-7.35-.85-7.35Z" stroke-linejoin="round"/>`,
    gold: `<path d="M4.25 6.75h3l1 3.5h-5l1-3.5Z" stroke-linejoin="round"/><path d="M8.75 6.75h3l1 3.5h-5l1-3.5Z" stroke-linejoin="round"/><path d="M6.5 2.75h3l1 3.5h-5l1-3.5Z" stroke-linejoin="round"/><path d="M2.25 13.25h11.5"/>`,
    leaf: `<path d="M13.25 2.75S6.5 2.25 4 6.5c-1.7 2.9.25 5.75.25 5.75S8 13.5 10.5 10c2.2-3.05 2.75-7.25 2.75-7.25Z" stroke-linejoin="round"/><path d="M2.75 13.25c2-4.5 5.5-7 8.5-8.5"/>`,
    eye: `<path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.9"/>`,
    eyeOff: `<path d="M3 3l10 10"/><path d="M6.6 4.15C7.05 4 7.5 3.9 8 3.9c4 0 6.25 4.1 6.25 4.1a11.4 11.4 0 0 1-1.9 2.35M9.9 9.9a2.4 2.4 0 0 1-3.8-2.8"/><path d="M4.3 4.9A11 11 0 0 0 1.75 8S4 12.1 8 12.1c.8 0 1.55-.17 2.2-.45"/>`,
    phone: `<rect x="4.25" y="1.75" width="7.5" height="12.5" rx="1.5"/><path d="M7 12h2"/>`,
    apple: `<path d="M11.1 8.5c0-1.9 1.55-2.8 1.6-2.85-.85-1.3-2.2-1.45-2.7-1.5-1.15-.1-2.2.65-2.8.65-.6 0-1.5-.65-2.45-.6-1.25 0-2.4.75-3.05 1.85-1.3 2.25-.35 5.6.95 7.4.6.9 1.35 1.9 2.3 1.85.95-.05 1.3-.6 2.4-.6s1.45.6 2.45.6c1 0 1.65-.9 2.25-1.8.7-1.05 1-2.05 1-2.1-.05 0-1.95-.75-1.95-2.9Z" stroke-linejoin="round"/><path d="M9.35 3.1c.5-.65.85-1.5.75-2.35-.75.05-1.6.5-2.1 1.1-.45.55-.85 1.45-.75 2.3.8.05 1.6-.4 2.1-1.05Z" stroke-linejoin="round"/>`,
    google: `<path d="M14 8.15c0-.5-.05-.85-.13-1.25H8.14v2.3h3.36c-.07.55-.43 1.4-1.25 1.95l1.88 1.45C13.25 11.55 14 10.05 14 8.15Z"/><path d="M8.14 14c1.62 0 2.98-.55 3.99-1.4l-1.88-1.45c-.52.35-1.22.6-2.11.6-1.62 0-3-1.05-3.5-2.55L2.7 10.65A6 6 0 0 0 8.14 14Z"/><path d="M4.64 9.2A3.6 3.6 0 0 1 4.44 8c0-.4.07-.8.19-1.2L2.7 5.35a6 6 0 0 0 0 5.3l1.94-1.45Z"/><path d="M8.14 4.25c1.15 0 1.92.5 2.36.9l1.68-1.65A5.8 5.8 0 0 0 8.14 2 6 6 0 0 0 2.7 5.35L4.63 6.8c.5-1.5 1.89-2.55 3.51-2.55Z"/>`,
    faceid: `<path d="M1.75 5V3.25c0-.83.67-1.5 1.5-1.5H5"/><path d="M11 1.75h1.75c.83 0 1.5.67 1.5 1.5V5"/><path d="M14.25 11v1.75c0 .83-.67 1.5-1.5 1.5H11"/><path d="M5 14.25H3.25c-.83 0-1.5-.67-1.5-1.5V11"/><path d="M5.25 6v1"/><path d="M10.75 6v1"/><path d="M8 6v2.75c0 .4-.35.75-.75.75"/><path d="M5.5 10.75c.65.65 1.5 1 2.5 1s1.85-.35 2.5-1"/>`,
    id: `<rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5"/><circle cx="5.5" cy="7" r="1.4"/><path d="M3.5 10.75c.3-1 1.1-1.6 2-1.6s1.7.6 2 1.6"/><path d="M9.75 6.25h2.75"/><path d="M9.75 8.75h2.75"/>`,
    camera: `<path d="M5.5 4.25 6.5 2.5h3l1 1.75h2.25c.83 0 1.5.67 1.5 1.5v6.5c0 .83-.67 1.5-1.5 1.5H3.25c-.83 0-1.5-.67-1.5-1.5v-6.5c0-.83.67-1.5 1.5-1.5H5.5Z" stroke-linejoin="round"/><circle cx="8" cy="8.75" r="2.4"/>`,
    passport: `<rect x="3.25" y="1.75" width="9.5" height="12.5" rx="1.5"/><circle cx="8" cy="6.5" r="2.1"/><path d="M5.75 11.25h4.5"/>`,
    map: `<path d="M8 14.25S13 10.1 13 6.75a5 5 0 0 0-10 0c0 3.35 5 7.5 5 7.5Z" stroke-linejoin="round"/><circle cx="8" cy="6.75" r="1.75"/>`,
    briefcase: `<rect x="1.75" y="4.75" width="12.5" height="8.5" rx="1.5"/><path d="M5.5 4.75V3.5c0-.7.55-1.25 1.25-1.25h2.5c.7 0 1.25.55 1.25 1.25v1.25"/><path d="M1.75 8h12.5"/>`,
    percent: `<path d="m12.5 3.5-9 9"/><circle cx="4.75" cy="4.75" r="1.6"/><circle cx="11.25" cy="11.25" r="1.6"/>`,
    infoCircle: `<circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v3.5"/><path d="M8 5.05h.01"/>`,
    alert: `<path d="M8 2.25 14.25 13H1.75L8 2.25Z" stroke-linejoin="round"/><path d="M8 6.75v2.75"/><path d="M8 11.6h.01"/>`,
    share: `<path d="M8 9.75V1.75"/><path d="M5.25 4 8 1.75 10.75 4"/><path d="M3.25 7.5h-.5v5.25c0 .83.67 1.5 1.5 1.5h7.5c.83 0 1.5-.67 1.5-1.5V7.5h-.5"/>`,
    trendUp: `<path d="m1.75 11.25 4-4.5 2.75 2.5 5.75-6"/><path d="M10.5 3.25h3.75V7"/>`,
    sparkline: `<path d="M1.75 12.25 5 8.5l2.5 2 3-4.5 2.75 2"/>`,
    contactless: `<path d="M4.5 5.5a4.5 4.5 0 0 1 0 5"/><path d="M7 4a7 7 0 0 1 0 8"/><path d="M9.5 2.5a9.7 9.7 0 0 1 0 11"/>`,
    atm: `<rect x="2.25" y="2.25" width="11.5" height="8" rx="1.5"/><path d="M8 10.25v3.5"/><path d="M5.5 13.75h5"/><path d="M5 6.25h6"/>`,
    calendar: `<rect x="2.25" y="3" width="11.5" height="10.75" rx="1.5"/><path d="M2.25 6.25h11.5"/><path d="M5.25 1.75v2.5"/><path d="M10.75 1.75v2.5"/>`,
    target: `<circle cx="8" cy="8" r="6.25"/><circle cx="8" cy="8" r="3.4"/><circle cx="8" cy="8" r="0.8"/>`,
    coins: `<ellipse cx="6" cy="4.75" rx="4.25" ry="2.25"/><path d="M1.75 4.75v3.5c0 1.25 1.9 2.25 4.25 2.25.65 0 1.25-.08 1.8-.2"/><path d="M1.75 8.25v3c0 1.25 1.9 2.25 4.25 2.25.65 0 1.27-.07 1.82-.2"/><path d="M14.25 9.25c0 1.24-1.9 2.25-4.25 2.25S5.75 10.5 5.75 9.25 7.65 7 10 7s4.25 1 4.25 2.25Z"/><path d="M5.75 9.25v2.6c0 1.24 1.9 2.25 4.25 2.25s4.25-1 4.25-2.25v-2.6"/>`,
    scan: `<path d="M1.75 5V3.25c0-.83.67-1.5 1.5-1.5H5"/><path d="M11 1.75h1.75c.83 0 1.5.67 1.5 1.5V5"/><path d="M14.25 11v1.75c0 .83-.67 1.5-1.5 1.5H11"/><path d="M5 14.25H3.25c-.83 0-1.5-.67-1.5-1.5V11"/><path d="M1.75 8h12.5"/>`,
    handCoins: `<path d="M8 1.75l.95 2.4 2.4.95-2.4.95L8 8.45l-.95-2.4-2.4-.95 2.4-.95L8 1.75Z" stroke-linejoin="round"/><path d="M1.75 11.5h2.5l2.5 1.25h3.5c.55 0 1 .45 1 1v0" /><path d="M14.25 11.25l-3.4 2.5H6.75"/>`,
    sim: `<path d="M9.5 1.75H4.25c-.83 0-1.5.67-1.5 1.5v9.5c0 .83.67 1.5 1.5 1.5h7.5c.83 0 1.5-.67 1.5-1.5V5.5L9.5 1.75Z" stroke-linejoin="round"/><rect x="5.5" y="7.5" width="5" height="4" rx="1"/>`,
    truck: `<path d="M1.75 3.75h8v7h-8z" stroke-linejoin="round"/><path d="M9.75 6.25h2.4l2.1 2.35v2.15h-4.5"/><circle cx="4.5" cy="12.25" r="1.5"/><circle cx="11.5" cy="12.25" r="1.5"/>`,
    pin: `<circle cx="8" cy="8" r="6.25"/><path d="M5.75 8h.01"/><path d="M8 8h.01"/><path d="M10.25 8h.01"/>`,
    langAr: `<path d="M2.5 12.5c2.5 0 3.5-1.5 3.5-3.5V4"/><path d="M9 12.75c1.5-.5 2.5-1.5 3-3"/><path d="M13.5 5.5v4.75c0 1.5-1 2.5-2.5 2.5"/>`,
    logout: `<path d="M6 14.25H3.25c-.83 0-1.5-.67-1.5-1.5V3.25c0-.83.67-1.5 1.5-1.5H6"/><path d="M10.5 11.25 13.75 8 10.5 4.75"/><path d="M13.75 8h-8"/>`,
    headset: `<path d="M2.25 11V8a5.75 5.75 0 0 1 11.5 0v3"/><path d="M2.25 9.5h1.5v3.25h-1.5A.75.75 0 0 1 1.5 12v-1.75c0-.4.34-.75.75-.75Z" stroke-linejoin="round"/><path d="M13.75 9.5h-1.5v3.25h1.5c.41 0 .75-.34.75-.75v-1.75a.75.75 0 0 0-.75-.75Z" stroke-linejoin="round"/><path d="M12.5 12.75c0 1-1 1.5-2 1.5H9"/>`,
  };

  window.iconNames = Object.keys(paths);
  window.icon = function (name, size = 16, cls = "") {
    const p = paths[name];
    if (!p) return "";
    const sw = size <= 12 ? 1.75 : 1.5;
    return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" aria-hidden="true">${p}</svg>`;
  };
})();
