/* Soulful Yoga demo — gedeelde data en rekenregels.
   Gebruikt door de telefoon-demo (demo.html) en het beheerportaal (beheer.html).
   Beide bewaren in dezelfde localStorage, dus wijzigingen zijn in beide te zien. */

/* ── Startdata — gelijk aan data/*.ts ───────────────────────────────── */
const STYLE = { yin:{label:'Yin Yoga', dot:'Yin'}, flow:{label:'Flow Yoga', dot:'Flow'}, gentle:{label:'Gentle Yoga', dot:'Gtl'} };
const DESC = {
  yin:'Een zeer rustige, ontspannen en mindful vorm van yoga. Je houdt posities vast voor 3 tot 5 minuten, wat spieren, bindweefsel en fascia de tijd geeft om mee te komen in de rek. Je ervaart diepe rust en stilte.',
  flow:'Met Flow Yoga laat je je meevoeren met de muziek — elke in- en uitademing wordt een beweging, tot er een soort yogadans ontstaat. De les wordt een maand lang herhaald zodat je volledig zonder nadenken in de Flow komt.',
  gentle:'Een milde vorm van yoga waarin je met aandacht beweegt, diep ademhaalt en het lichaam souplesse geeft. De houdingen zijn voor iedereen goed te volgen en aan te passen waar nodig.',
};
const VIDEOS = [
  {t:'Yin Yoga — diepe ontspanning', s:'yin', m:45, l:'alle niveaus'},
  {t:'Flow Yoga — vloeiende beweging', s:'flow', m:50, l:'gevorderd'},
  {t:'Gentle Yoga — zachte start', s:'gentle', m:30, l:'beginners'},
  {t:'Yin Yoga — lage rug & heupen', s:'yin', m:40, l:'alle niveaus'},
];
// CONCEPT — vervang door de echte voorwaarden van Soulful Yoga. [..] = nog in te vullen.
const TERMS_VERSION = 'Concept · versie 0.1';
const TERMS = [
  ['1. Toepasselijkheid', '<p>Deze voorwaarden gelden voor alle lessen, strippenkaarten en reserveringen bij Soulful Yoga, Runselstraat 18, 5351 NJ Berghem. Door een les te reserveren of een strippenkaart te kopen ga je akkoord met deze voorwaarden.</p>'],
  ['2. Proefles, losse les en strippenkaart', '<ul><li>Een proefles is eenmalig en gratis.</li><li>Een losse les kost €15, een 10-strippenkaart €110.</li><li>Een strippenkaart is [aantal] maanden geldig na aankoop en is persoonsgebonden.</li><li>Niet gebruikte strippen worden niet terugbetaald.</li></ul>'],
  ['3. Reserveren', '<p>Je reserveert een plek via de app. Een reservering is pas definitief wanneer de docent deze heeft goedgekeurd. Bij het inchecken voor een les wordt één strip afgeschreven.</p>'],
  ['4. Annuleren', '<p>Je kunt een reservering tot [aantal] uur voor aanvang kosteloos annuleren. Annuleer je later of kom je niet, dan wordt de strip afgeschreven.</p>'],
  ['5. Gezondheid en eigen verantwoordelijkheid', '<p>Deelname is op eigen risico. Meld lichamelijke klachten, blessures of zwangerschap vóór de les bij de docent. Raadpleeg bij twijfel eerst je huisarts. Soulful Yoga is niet aansprakelijk voor letsel of schade, behalve bij opzet of grove nalatigheid.</p>'],
  ['6. Rooster en wijzigingen', '<p>Soulful Yoga mag het rooster, de docent of de lesinhoud wijzigen. Valt een les uit, dan krijg je je strip terug of mag je een andere les kiezen.</p>'],
  ['7. Privacy', '<p>We gebruiken je naam, e-mailadres en telefoonnummer alleen voor je reserveringen en strippenkaart. We delen je gegevens niet met derden. Lees meer in onze privacyverklaring [link].</p>'],
  ['8. Huisregels', '<ul><li>Kom op tijd, zodat de les rustig kan beginnen.</li><li>Zet je telefoon op stil.</li><li>Neem een handdoek mee; matten zijn aanwezig.</li></ul>'],
];

/* ── Lessen per week — gelijk aan data/schedule.ts ──────────────────── */
const WEEK = [
  {day:'Maandag', classes:[{id:'mon-1',style:'yin',time:'19.00 – 20.00',capacity:14},{id:'mon-2',style:'yin',time:'20.15 – 21.15',capacity:14}]},
  {day:'Dinsdag', classes:[{id:'tue-1',style:'yin',time:'19.00 – 20.00',capacity:14}]},
  {day:'Woensdag', classes:[{id:'wed-1',style:'flow',time:'09.00 – 10.00',capacity:14}]},
  {day:'Donderdag', classes:[{id:'thu-1',style:'yin',time:'19.00 – 20.00',capacity:14},{id:'thu-2',style:'yin',time:'20.15 – 21.15',capacity:14}]},
  {day:'Vrijdag', classes:[{id:'fri-1',style:'gentle',time:'09.00 – 10.00',capacity:12},{id:'fri-2',style:'yin',time:'10.15 – 11.15',capacity:14}]},
];
// Lessen staan in de toestand (S.sessions) zodat de beheerder ze kan aanpassen; SES is de index op id.
let SES = Object.fromEntries(WEEK.flatMap(d => d.classes.map(c => [c.id, {...c, day:d.day}])));

// Vaste deelnemers zonder app-account (presentielijst). Leeg: in de demo zitten alle klanten in de app.
const ROSTER_SEED = {};

/* ── Datum & tijd ───────────────────────────────────────────────────── */
const DAY = 86400000;
const WEEKDAYS = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];
const MONTHS = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const MONTHS_AHEAD = 3;
let S; // toestand, zie onder
const now = () => new Date(Date.now() + (S?.offsetDays || 0) * DAY);
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const toDate = (iso, hm = '00.00') => { const [y,m,d] = iso.split('-').map(Number); const [h,mi] = hm.split('.').map(Number); return new Date(y, m-1, d, h, mi); };
const plusDays = (iso, n) => { const d = toDate(iso); d.setDate(d.getDate() + n); return isoOf(d); };
const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY);
const startOf = (sid, d) => toDate(d, SES[sid].time.split(' – ')[0]);
const endOf = (sid, d) => toDate(d, SES[sid].time.split(' – ')[1]);
const isPast = (sid, d) => endOf(sid, d) <= now();
const hasStarted = (sid, d) => startOf(sid, d) <= now();
const weekdayOf = (iso) => WEEKDAYS[toDate(iso).getDay()];
const dateLabel = (iso) => { const d = toDate(iso); return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const shortDate = (iso) => { const d = toDate(iso); return `${WEEKDAYS[d.getDay()].slice(0,2).toLowerCase()} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`; };
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
const monthStart = (offset) => { const n = now(); return new Date(n.getFullYear(), n.getMonth() + offset, 1); };
const horizonEnd = () => { const m = monthStart(MONTHS_AHEAD); return isoOf(new Date(m.getFullYear(), m.getMonth() + 1, 0)); };
const key = (sid, d) => `${sid}@${d}`;

/* ── Startdata ──────────────────────────────────────────────────────── */
// De laatste n keer dat een les (echt) voorbij is, oudste eerst.
function recentPast(sid, n){
  const out = []; const d = new Date(); d.setHours(0,0,0,0);
  while (out.length < n) {
    const iso = isoOf(d);
    if (WEEKDAYS[d.getDay()] === SES[sid].day && endOf(sid, iso) <= new Date()) out.unshift(iso);
    d.setDate(d.getDate() - 1);
  }
  return out;
}
// Vaste klant die al een paar weken meedoet (die lessen zijn al bevestigd, zie seedHistory).
function seedVast(s, email, sid, pastWeeks, cancelledIdx, weeks){
  const dates = recentPast(sid, pastWeeks);
  s.enrollments.push({id:`e-${sid}-${email}`, sessionId:sid, email, start:dates[0], weeks});
  dates.forEach((d, i) => { if (cancelledIdx.includes(i)) s.cancels.push({sessionId:sid, date:d, email, by:'klant'}); });
}
// Weekrooster + voorbeeld-vakantie. Eenmalige extra lessen zijn lessen met from === until.
function baseSchedule(){
  const n = new Date(); let y = n.getFullYear();
  if (new Date(y, 11, 21) < n) y++;
  return {
    sessions: WEEK.flatMap(d => d.classes.map(c => ({...c, day:d.day, from:null, until:null}))),
    closures: [{id:'c-kerst', from:`${y}-12-21`, to:`${y+1}-01-03`, sessionId:null, reason:'Kerstvakantie'}],
  };
}
/* ── Voorbeeldklanten ───────────────────────────────────────────────── */
// Vaste "willekeur" (zelfde data bij elke reset, en in telefoon-demo én portaal).
function seededRandom(seed){ return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const FIRST_NAMES = ['Anna','Sanne','Lotte','Femke','Iris','Noor','Eva','Lisa','Julia','Fleur','Sophie','Emma','Tessa','Roos','Maud','Nina','Vera','Elke','Carla','Marloes','Yara','Britt','Esmee','Amber','Wendy','Suzanne','Karin','Nadia','Ingrid','Manon','Merel','Loes','Petra','Anouk','Ilse','Mirjam','Hanneke','Joyce','Linda','Monique','Sandra','Esther','Inge','Marjan','Ellen','Bram','Joost','Thijs','Ruben','Hans','Peter','Mark','Jeroen','Koen','Wouter','Sander','Gijs','Lieke','Kim','Eline','Floor','Jet','Puck','Mila','Saskia','Annemiek','Gerda','Ria','Tineke','Willemijn'];
const LAST_NAMES = ['Jansen','de Vries','van Dijk','Bakker','Visser','Smit','Meijer','de Boer','Mulder','de Groot','Bos','Vos','Peters','Hendriks','van Leeuwen','Dekker','Brouwer','de Wit','Dijkstra','Smits','de Graaf','van der Meer','Kok','Jacobs','Willems','van den Berg','Verhoeven','Schouten','Hoekstra','Kuiper','Postma','Timmer','van Beek','Kramer','Sanders','Groen','Blom','Peeters','Aarts','Verweij','van Erp','Coolen','van Lith','Hermans','van Rooij','Verbeek','Kuijpers','van Gerwen','Wijnen','Cornelissen'];
const DEMO_CUSTOMERS = 100;

// 100 klanten met elk één vaste les, gelijk verdeeld over de lessen (Gentle iets kleiner).
function seedCustomers(s){
  const rnd = seededRandom(20261031);
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const sessionIds = WEEK.flatMap(d => d.classes.map(c => c.id));
  // Plekken verdelen: elke les krijgt (capaciteit − 1 à 2) vaste klanten, tot er 100 zijn
  const slots = [];
  for (let round = 0; slots.length < DEMO_CUSTOMERS; round++) {
    for (const sid of sessionIds) if (slots.length < DEMO_CUSTOMERS && round < SES[sid].capacity - 1) slots.push(sid);
  }
  // Marieke, Daan en Marjolijn hebben al een vaste les; de rest krijgt een plek uit de pot
  const taken = {'marieke@soulfulyoga.nl':'tue-1', 'marjolijn_n@hotmail.com':'thu-2', 'daan@soulfulyoga.nl':'fri-2'};
  for (const sid of Object.values(taken)) slots.splice(slots.indexOf(sid), 1);
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }

  const used = new Set(s.users.map(u => u.name));
  const today = isoOf(new Date());
  for (const sid of slots) {
    let name; do { name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`; } while (used.has(name));
    used.add(name);
    const email = `${name.toLowerCase().replace(/ /g, '.')}@voorbeeld.nl`;
    const r = rnd();
    const strippen = r < 0.05 ? null : r < 0.12 ? 0 : Math.floor(rnd() * 10) + 1;   // ~5% zonder kaart, ~7% op
    s.users.push({email, password:'yoga123', name, phone:`06 ${String(Math.floor(rnd() * 1e8)).padStart(8, '0')}`, strippen, total:10, role:'student',
      termsAcceptedAt: rnd() < 0.6 ? `${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}-10-2026` : null});
    const pastWeeks = 1 + Math.floor(rnd() * 4);
    seedVast(s, email, sid, pastWeeks, rnd() < 0.15 ? [Math.floor(rnd() * pastWeeks)] : [], rnd() < 0.8 ? 99 : 12 + Math.floor(rnd() * 13));
  }
  seedVast(s, 'daan@soulfulyoga.nl', 'fri-2', 2, [], 99);

  // Afmeldingen in de komende 6 weken (~10% van de lessen) en een paar losse aanvragen
  for (const e of s.enrollments) {
    for (let k = 0; k < e.weeks; k++) {
      const d = plusDays(e.start, 7 * k);
      if (d <= today) continue;
      if (daysBetween(today, d) > 42) break;
      if (rnd() < 0.1) s.cancels.push({sessionId:e.sessionId, date:d, email:e.email, by:'klant'});
    }
  }
  const customers = s.users.filter(u => u.role === 'student');
  for (let i = 0; i < 5; i++) {
    const u = pick(customers); const sid = pick(sessionIds);
    let d = plusDays(today, 2 + Math.floor(rnd() * 14));
    while (weekdayOf(d) !== SES[sid].day) d = plusDays(d, 1);
    if (!s.enrollments.some(e => e.email === u.email && e.sessionId === sid)) s.requests.push({id:`r-seed-${i}`, sessionId:sid, date:d, email:u.email, name:u.name});
  }
}

function initialState(){
  const s = {
    users: [
      {email:'marieke@soulfulyoga.nl', password:'yoga123', name:'Marieke Jansen', phone:'06 12345678', strippen:7, total:10, role:'student', termsAcceptedAt:null},
      {email:'daan@soulfulyoga.nl', password:'yoga123', name:'Daan de Vries', phone:'06 23456789', strippen:null, total:10, role:'student', termsAcceptedAt:null},
      {email:'beheer@soulfulyoga.nl', password:'admin123', name:'Studio Beheer', phone:'06 12680852', strippen:null, total:10, role:'admin', termsAcceptedAt:null},
      {email:'marjolijn_n@hotmail.com', password:'0000', name:'Marjolijn N.', phone:'06 34567890', strippen:5, total:10, role:'student', termsAcceptedAt:null},
    ],
    roster: Object.fromEntries(Object.entries(ROSTER_SEED).map(([sid, list]) => [sid, list.map(([name, strips], i) => ({id:`${sid}-${i+1}`, name, strips}))])),
    enrollments: [],   // vaste klanten: {sessionId, email, start, weeks}
    bookings: [],      // goedgekeurde losse lessen: {sessionId, date, email}
    requests: [],      // aanvragen die wachten op goedkeuring
    cancels: [],       // afmeldingen: {sessionId, date, email, by}
    capOverride: {},   // aantal plekken per les-datum (als de beheerder het aanpast)
    checkins: {},      // concept-presentie per les-datum: {deelnemer: aanwezig?} (standaard: volgens planning)
    extras: {},        // door de beheerder toegevoegde deelnemers per les-datum
    confirmed: {},     // bevestigde presentie per les-datum — pas dan gaan er strippen af
    email: null, log: [], offsetDays: 0,
  };
  Object.assign(s, baseSchedule());
  seedVast(s, 'marieke@soulfulyoga.nl', 'tue-1', 4, [1], 99);    // dinsdagavond, 1× afgemeld
  seedVast(s, 'marjolijn_n@hotmail.com', 'thu-2', 3, [], 12);
  seedCustomers(s);
  return s;
}

/* ── Toestand (blijft bewaard tot "Demo resetten") ──────────────────── */
const SAVE_KEY = 'sy-demo-v4';
try { S = JSON.parse(localStorage.getItem(SAVE_KEY)) || null; } catch { S = null; }
const reindex = () => { SES = Object.fromEntries(S.sessions.map(s => [s.id, s])); };
if (!S) { S = initialState(); S.seedPending = true; }   // geschiedenis volgt onderaan, als alle regels bekend zijn
reindex();
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {} };


const me = () => S.users.find(u => u.email === S.email) || null;
const isAdmin = () => me()?.role === 'admin';
const students = () => S.users.filter(u => u.role === 'student');
const userBy = (email) => S.users.find(u => u.email === email);
function log(msg){
  const t = now().toLocaleString('nl-NL', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
  S.log.unshift({t, msg}); S.log = S.log.slice(0, 60);
}

/* ── Wie zit waar? Alles per les-datum ──────────────────────────────── */
const isExtra = (s) => !!s.from && s.from === s.until;
const activeOn = (s, d) => s.day === weekdayOf(d) && (!s.from || d >= s.from) && (!s.until || d <= s.until);
const sessionsOn = (d) => S.sessions.filter(s => activeOn(s, d)).sort((a, b) => a.time.localeCompare(b.time));
const closureOf = (sid, d) => S.closures.find(c => d >= c.from && d <= c.to && (!c.sessionId || c.sessionId === sid));
// Een vaste les is actief zolang er nog een les op of na vandaag in zit.
const lastLessonOf = (e) => plusDays(e.start, 7 * (e.weeks - 1));
const isActiveEnrollment = (e) => e.weeks > 0 && lastLessonOf(e) >= isoOf(now());
const covers = (e, d) => { const n = daysBetween(e.start, d); return n >= 0 && n % 7 === 0 && n / 7 < e.weeks; };
const enrollmentOf = (email, sid, d) => S.enrollments.find(e => e.email === email && e.sessionId === sid && covers(e, d));
const isCancelled = (email, sid, d) => S.cancels.some(c => c.email === email && c.sessionId === sid && c.date === d);
const requestOf = (email, sid, d) => S.requests.find(r => r.email === email && r.sessionId === sid && r.date === d);

// Hoe staat een klant ingepland voor één les-datum?
function statusFor(email, sid, d){
  const e = enrollmentOf(email, sid, d);
  const b = S.bookings.find(x => x.email === email && x.sessionId === sid && x.date === d);
  if (e || b) return {source: e ? 'vast' : 'los', cancelled: isCancelled(email, sid, d), enrollment: e};
  if (requestOf(email, sid, d)) return {source:'aanvraag', cancelled:false};
  return null;
}
// App-klanten die op deze datum meedoen (aanvragen houden ook een plek vast)
const attendees = (sid, d) => students().map(u => ({user:u, st:statusFor(u.email, sid, d)})).filter(x => x.st && !x.st.cancelled);
function occ(sid, d){
  const cap = S.capOverride[key(sid, d)] ?? SES[sid].capacity;
  const booked = (S.roster[sid] || []).length + attendees(sid, d).length;
  return {cap, booked, available: Math.max(0, cap - booked)};
}
// Alle lessen van een klant tussen twee datums, op volgorde
function myLessons(email, from, to){
  const seen = new Map();
  const add = (sid, d) => { if (d >= from && d <= to && SES[sid] && activeOn(SES[sid], d)) seen.set(key(sid, d), {sid, d}); };
  S.enrollments.filter(e => e.email === email).forEach(e => {
    for (let k = 0; k < e.weeks; k++) { const d = plusDays(e.start, 7 * k); if (d > to) break; add(e.sessionId, d); }
  });
  S.bookings.filter(b => b.email === email).forEach(b => add(b.sessionId, b.date));
  S.requests.filter(r => r.email === email).forEach(r => add(r.sessionId, r.date));
  // ook lessen waar de beheerder iemand (extra) als aanwezig heeft bevestigd
  Object.entries(S.confirmed).forEach(([k, c]) => { if (c.people.some(p => p.pid === email && p.present)) { const [sid, d] = k.split('@'); add(sid, d); } });
  return [...seen.values()].map(l => ({...l, st:statusFor(email, l.sid, l.d) || {source:'extra', cancelled:false}, closed:closureOf(l.sid, l.d)})).sort((a, b) => startOf(a.sid, a.d) - startOf(b.sid, b.d));
}

/* ── Presentie & bevestigen ─────────────────────────────────────────── */
// Strippen gaan pas af als de beheerder de presentie van een les bevestigt — niet op basis van de planning alleen.
const confirmationOf = (sid, d) => S.confirmed[key(sid, d)];

// Presentielijst: wie volgens de planning komt (app-klanten + vaste deelnemers zonder app)
// plus wie de beheerder heeft toegevoegd. Iedereen staat standaard op aanwezig.
function attendanceList(sid, d){
  const k = key(sid, d); const draft = S.checkins[k] || {};
  const planned = [
    ...attendees(sid, d).filter(a => a.st.source !== 'aanvraag').map(({user, st}) => ({pid:user.email, name:user.name, app:true, planned:true, source:st.source})),
    ...(S.roster[sid] || []).map(e => ({pid:e.id, name:e.name, app:false, planned:true, source:'zonder-app'})),
  ];
  const added = (S.extras[k] || []).filter(x => !planned.some(p => p.pid === x.pid)).map(x => ({...x, planned:false, source:'toegevoegd'}));
  return [...planned, ...added].map(p => ({...p, present: draft[p.pid] ?? true}));
}
function setPresent(sid, d, pid, present){ const k = key(sid, d); S.checkins[k] = {...(S.checkins[k] || {}), [pid]: present}; }
function addAttendee(sid, d, person){ const k = key(sid, d); S.extras[k] = [...(S.extras[k] || []).filter(x => x.pid !== person.pid), person]; setPresent(sid, d, person.pid, true); }
function removeAttendee(sid, d, pid){ const k = key(sid, d); S.extras[k] = (S.extras[k] || []).filter(x => x.pid !== pid); }

// Per aanwezige één strip; zonder strippen 'open' (nog te betalen); losse deelnemer zonder kaart 'los'.
function confirmAttendance(sid, d){
  const people = attendanceList(sid, d).map(p => {
    if (!p.present) return {...p, charge:null};
    if (p.walkin) return {...p, charge:'los'};
    if (p.app) { const u = userBy(p.pid); if ((u.strippen ?? 0) > 0) { u.strippen -= 1; return {...p, charge:'strip'}; } return {...p, charge:'open'}; }
    const e = (S.roster[sid] || []).find(x => x.id === p.pid);
    if (e && e.strips > 0) { e.strips -= 1; return {...p, charge:'strip'}; }
    return {...p, charge:'open'};
  });
  S.confirmed[key(sid, d)] = {at: now().toLocaleString('nl-NL', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}), people};
  return people;
}
// Bevestiging terugdraaien: afgeschreven strippen komen terug, de lijst is weer te wijzigen.
function undoConfirmation(sid, d){
  const c = confirmationOf(sid, d); if (!c) return;
  for (const p of c.people) {
    if (p.charge !== 'strip') continue;
    if (p.app) { const u = userBy(p.pid); u.strippen = (u.strippen ?? 0) + 1; }
    else { const e = (S.roster[sid] || []).find(x => x.id === p.pid); if (e) e.strips += 1; }
  }
  delete S.confirmed[key(sid, d)];
}
// Begonnen of voorbije lessen (laatste `days` dagen) die nog bevestigd moeten worden, nieuwste eerst.
function unconfirmedLessons(days = 14){
  const out = []; const t = isoOf(now());
  for (let i = 0; i <= days; i++) {
    const d = plusDays(t, -i);
    for (const s of [...sessionsOn(d)].reverse()) if (hasStarted(s.id, d) && !closureOf(s.id, d) && !confirmationOf(s.id, d)) out.push({sid:s.id, d});
  }
  return out;
}
// Wat is er voor een klant bij een voorbije les geregistreerd? undefined = nog niet bevestigd.
function chargeFor(email, sid, d){
  const c = confirmationOf(sid, d); if (!c) return undefined;
  const p = c.people.find(x => x.pid === email);
  return p && p.present ? p.charge : 'afwezig';
}
const openChargesOf = (email) => Object.values(S.confirmed).filter(c => c.people.some(p => p.pid === email && p.present && p.charge === 'open')).length;
// Voorbeelddata: de afgelopen 4 weken zijn al bevestigd volgens de planning (de strippen staan daar al op).
function seedHistory(){
  const t = isoOf(new Date());
  for (let i = 28; i >= 0; i--) {
    const d = plusDays(t, -i);
    for (const s of sessionsOn(d)) {
      if (endOf(s.id, d) > new Date() || closureOf(s.id, d)) continue;
      S.confirmed[key(s.id, d)] = {at:'voorbeelddata', people: attendanceList(s.id, d).map(p => ({...p, charge:'strip'}))};
    }
  }
}

// Hoeveel lessen (en ingeplande klanten) raakt een vakantie?
function closurePreview(f){
  if (!f.from || !f.to || f.to < f.from || daysBetween(f.from, f.to) > 400) return null;
  let lessons = 0, people = 0;
  for (let d = f.from; d <= f.to; d = plusDays(d, 1)) {
    for (const s of sessionsOn(d)) {
      if (f.scope && s.id !== f.scope) continue;
      lessons++; people += attendees(s.id, d).length;
    }
  }
  return {lessons, people};
}
const checkTimes = (f) => !f.start || !f.end ? 'Vul een begin- en eindtijd in.' : f.end <= f.start ? 'De eindtijd moet na de begintijd liggen.' : '';
const timeOf = (f) => `${f.start.replace(':', '.')} – ${f.end.replace(':', '.')}`;

/* ── Acties op de data ──────────────────────────────────────────────── */
function requestLesson(sid, d, u){
  if (statusFor(u.email, sid, d) || occ(sid, d).available <= 0) return false;
  S.requests.unshift({id:`r-${Date.now()}`, sessionId:sid, date:d, email:u.email, name:u.name});
  return true;
}
function cancelLesson(email, sid, d, by){ if (!isCancelled(email, sid, d)) S.cancels.push({sessionId:sid, date:d, email, by}); }
const undoCancel = (email, sid, d) => { S.cancels = S.cancels.filter(c => !(c.email === email && c.sessionId === sid && c.date === d)); };
function addVast(sid, d, email, weeks){
  if (occ(sid, d).available <= 0 || enrollmentOf(email, sid, d)) return false;
  S.enrollments.push({id:`e-${Date.now()}`, sessionId:sid, email, start:d, weeks});
  return true;
}
// Vaste klant afmelden voor N weken vanaf deze datum; 99 (of meer dan er over is) = vaste les stoppen.
function removeVast(sid, d, email, weeks){
  const e = enrollmentOf(email, sid, d);
  const idx = daysBetween(e.start, d) / 7;
  if (weeks >= e.weeks - idx) {
    e.weeks = idx;
    if (e.weeks === 0) S.enrollments = S.enrollments.filter(x => x !== e);
    return 'gestopt';
  }
  for (let k = 0; k < weeks; k++) cancelLesson(email, sid, plusDays(d, 7 * k), 'beheer');
  return `${weeks} ${weeks === 1 ? 'week' : 'weken'} afgemeld`;
}


/* ── Gedeeld tussen telefoon-demo en beheerportaal ──────────────────── */
// Wijzigingen uit een ander tabblad live overnemen; elke pagina zet hier haar render-functie in.
let onExternalChange = null;
window.addEventListener('storage', (e) => {
  if (e.key !== SAVE_KEY || !e.newValue) return;
  try { S = JSON.parse(e.newValue); reindex(); onExternalChange?.(); } catch {}
});

const lessonName = (sid, d) => `${STYLE[SES[sid].style].label} ${shortDate(d)} ${SES[sid].time.split(' – ')[0]}`;
const todayDDMMYYYY = () => { const n = now(); return `${String(n.getDate()).padStart(2,'0')}-${String(n.getMonth()+1).padStart(2,'0')}-${n.getFullYear()}`; };

function setCapacity(sid, d, capacity){ S.capOverride[key(sid, d)] = Math.max(0, capacity); }
function resolveRequest(id, approved){
  const r = S.requests.find(x => x.id === id);
  if (!r) return null;
  S.requests = S.requests.filter(x => x !== r);
  if (approved) S.bookings.push({sessionId:r.sessionId, date:r.date, email:r.email});
  return r;
}
function addSession(session){ S.sessions.push({...session, id:`s-${Date.now()}`}); reindex(); }
function removeExtraSession(sid){
  S.sessions = S.sessions.filter(s => s.id !== sid);
  for (const k of ['bookings', 'requests', 'cancels', 'enrollments']) S[k] = S[k].filter(x => x.sessionId !== sid);
  reindex();
}
function addClosure(closure){ S.closures.push({...closure, id:`c-${Date.now()}`}); }
function removeClosure(id){ S.closures = S.closures.filter(c => c.id !== id); }
// Nieuwe 10-strippenkaart: 10 strippen erbij (een restant blijft staan).
const CARD_SIZE = 10;
function activateCard(email){ const u = userBy(email); u.strippen = (u.strippen ?? 0) + CARD_SIZE; u.total = Math.max(CARD_SIZE, u.strippen); return u.strippen; }
function adjustUserStrip(email, delta){ const u = userBy(email); u.strippen = Math.max(0, (u.strippen ?? 0) + delta); return u.strippen; }
function adjustSeedStrip(sid, id, delta){ const e = (S.roster[sid] || []).find(x => x.id === id); e.strips = Math.max(0, e.strips + delta); }

// Nieuwe demo: de afgelopen weken alvast als bevestigd vastleggen.
if (S.seedPending) { delete S.seedPending; seedHistory(); save(); }
