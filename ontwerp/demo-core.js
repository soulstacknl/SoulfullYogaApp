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
// Leeg in de eerste versies: het tabblad Video's meldt dat hier later video's en mediabestanden komen.
const VIDEOS = [];
// Gelijk aan data/terms.ts (gebaseerd op soulfulyoga.nl/general-5, plus artikel 14 over de app).
const TERMS_VERSION = 'Versie 1.1 · november 2026';
const TERMS = [
  ['Artikel 1: Definities', '<p>1.1 Soulful Yoga: de gebruiker van deze voorwaarden, gevestigd aan de Runselstraat 18, 5351 NJ Berghem (KvK 89222237), en alle aan Soulful Yoga op enigerlei wijze verbonden ondernemingen en organisaties.</p><p>1.2 Klant: de wederpartij van Soulful Yoga die een product of dienst afneemt.</p>'],
  ['Artikel 2: Toepasselijkheid en geldigheid', '<p>2.1 Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten waarbij Soulful Yoga als opdrachtnemer optreedt, ook wanneer de Klant lessen reserveert of beheert via de Soulful Yoga-app.</p><p>2.2 Afwijkingen van en aanvullingen op tot stand gekomen overeenkomsten dan wel deze algemene voorwaarden zijn slechts geldig indien en voor zover deze door Soulful Yoga uitdrukkelijk en schriftelijk zijn bevestigd.</p><p>2.3 Indien één of meer bepalingen in deze algemene voorwaarden op enig moment geheel of gedeeltelijk nietig zijn of vernietigd mochten worden, dan blijft het overige in deze algemene voorwaarden bepaalde volledig van toepassing.</p>'],
  ['Artikel 3: Leskaarten, abonnementen en losse lessen', '<p>3.1 Een 10-strippenkaart is strikt persoonlijk en niet overdraagbaar.</p><p>3.2 Een 10-strippenkaart is maximaal vier maanden geldig vanaf de dag van de eerst afgenomen les.</p><p>3.3 Soulful Yoga verleent geen restitutie op 10-strippenkaarten en abonnementen.</p><p>3.4 Het lesrooster is te vinden in de app en op de website. Dit rooster kan door Soulful Yoga desgewenst worden gewijzigd, ook behoudt Soulful Yoga zich het recht voor lessen te annuleren. Wijzigingen in het lesrooster geven geen recht op restitutie van reeds betaalde leskaarten en abonnementen of verlenging hiervan.</p><p>3.5 Soulful Yoga is tijdens de zomervakantie 3 weken gesloten.</p><p>3.6 Bij zwangerschap of ziekte kan, in overleg vooraf tussen Klant en Soulful Yoga, een restitutie plaatsvinden van de 10-strippenkaart. De reeds afgenomen lessen worden dan berekend als losse lessen (à 15 euro per les), het overige bedrag wordt terugbetaald aan de Klant.</p>'],
  ['Artikel 4: Workshops en cursussen', '<p>4.1 Een inschrijving voor het volgen van een workshop of cursus wordt door Soulful Yoga aanvaard met het voorbehoud van voldoende inschrijvingen.</p><p>4.2 Klant kan uitsluitend aan de workshop of cursus deelnemen, als vooraf het lesgeld is voldaan.</p><p>4.3 Soulful Yoga behoudt zich het recht voor om ten aanzien van workshops en cursussen organisatorische en inhoudelijke wijzigingen aan te brengen.</p>'],
  ['Artikel 5: Annulering', '<p>5.1 Annulering van workshops of cursussen kan uitsluitend schriftelijk plaatsvinden.</p><p>5.2 Annulering tot 24 uur voor aanvang van een cursus of workshop gegeven door een docent van Soulful Yoga is kosteloos. Bij annulering nadien is Klant de volledige betaling verschuldigd.</p><p>5.3 Annulering van workshops en cursussen gegeven door een externe docent heeft de volgende consequenties:</p><ul><li>Bij annulering minimaal 12 weken voor aanvang van de workshop of cursus wordt 50% van het lesgeld in rekening gebracht.</li><li>Bij annulering tussen 12 en 6 weken voor aanvang van de workshop of cursus wordt 70% van het lesgeld in rekening gebracht.</li><li>Bij annulering binnen 6 weken voor aanvang van de workshop of cursus is er geen recht op terugbetaling. Ook bij uitval tijdens de workshop of cursus wordt er geen lesgeld gerestitueerd.</li></ul><p>5.4 Annulering van een les kan kosteloos tot 24 uur voor aanvang van de les, via de app of bij Soulful Yoga. Binnen de 24 uur zal bij gebruik van een 10-strippenkaart er 1 les worden afgeschreven. Bij annulering van een privéles binnen 24 uur voor aanvang zal het volledige bedrag in rekening worden gebracht bij de Klant.</p>'],
  ['Artikel 6: Huisregels', '<p>6.1 Klant moet altijd de volgende huisregels van Soulful Yoga volgen:</p><ul><li>Kom fris naar de yogales. Het gebruik van (geurloze) deodorant wordt zeer op prijs gesteld. In verband met mogelijke allergieën van andere klanten wordt iedereen verzocht geen parfum, aromatherapie-olie of andere geuren te dragen, en geen spray-deodorant in de ruimte te gebruiken.</li><li>Draag schone (yoga)kleding tijdens de yogalessen, waar je makkelijk in kunt bewegen.</li><li>Wij adviseren niet later dan twee uur voor de yogales te eten en in ieder geval geen yoga op een volle maag te beoefenen.</li><li>Geen schoenen in de yogastudio.</li><li>De yogamat dient na gebruik schoongemaakt te worden door de Klant die daarvan gebruik heeft gemaakt.</li><li>De (lichamelijke) integriteit van Klanten en medewerkers van Soulful Yoga dient altijd gerespecteerd te worden. Seksueel gedrag c.q. seksueel getint gedrag wordt door Soulful Yoga niet getolereerd.</li><li>Telefoons dienen op stil gezet te worden tijdens de les.</li><li>Wees op tijd, indien mogelijk minimaal 5 minuten voor aanvang van de les.</li></ul>'],
  ['Artikel 7: Verplichtingen Soulful Yoga', '<p>7.1 Soulful Yoga behoudt zich het recht voor Klanten die naar haar mening de huisregels, zoals genoemd in artikel 6, niet naleven, van verdere deelneming uit te sluiten. Uitsluiting laat iedere verplichting tot betaling zijdens Klant onverlet.</p><p>7.2 De overeenkomst tussen partijen leidt voor Soulful Yoga tot een inspanningsverplichting, nimmer tot een resultaatsverplichting. Toelating van een Klant op grond van het voldoen aan de verstrekte toelatingsnormen houdt dus geen garantie in dat Klant de les, cursus of workshop met succes zal doorlopen c.q. afronden.</p><p>7.3 Soulful Yoga behoudt zich het recht voor zonder opgaaf van reden een les, cursus of workshop te annuleren of deelname van Klant te weigeren voorafgaand aan de start van een les, cursus, workshop of opleiding.</p><p>7.4 Soulful Yoga kan nimmer gehouden zijn cursussen te herhalen voor Klanten die verhinderd waren deze bij te wonen. De betaling van gemiste lesdagen blijft onverminderd verschuldigd.</p>'],
  ['Artikel 8: Prijs en betaling', '<p>8.1 De prijzen zijn in euro’s inclusief omzetbelasting, tenzij anders vermeld.</p><p>8.2 Soulful Yoga behoudt zich het recht voor om haar prijzen aan te passen. Aanpassing van de prijzen zal worden gecommuniceerd via de website van Soulful Yoga en mondeling worden gedeeld met de Klant door Soulful Yoga.</p><p>8.3 Soulful Yoga behoudt zich het recht voor een prijsstijging van kostprijsbepalende factoren, welke is ontstaan na het tot stand komen van de overeenkomst, aan Klant door te berekenen.</p><p>8.4 Bij niet-tijdige of niet-volledige betaling is Klant in verzuim zonder dat daartoe een aanmaning of ingebrekestelling is vereist en is Soulful Yoga gerechtigd om haar contractuele verplichtingen op te schorten c.q. Klant de toegang tot het pand te weigeren. Tevens is Soulful Yoga alsdan gerechtigd de overeenkomst te ontbinden.</p><p>8.5 Bij niet-tijdige of niet-volledige betaling is Klant onverminderd het bovenstaande de wettelijke rente verschuldigd over het openstaande bedrag. Daarnaast zijn alle met de invordering van het openstaande bedrag samenvallende kosten, zowel gerechtelijk als buitengerechtelijk, verschuldigd. Eerst nadat Klant het verschuldigde bedrag, vermeerderd met de rente en de kosten, heeft betaald, zal hij/zij weer worden toegelaten.</p>'],
  ['Artikel 9: Overmacht', '<p>9.1 Onder overmacht wordt verstaan: elke buiten de directe invloed van Soulful Yoga liggende of elk voor haar redelijkerwijs niet voorziene omstandigheid, die de nakoming van de verplichtingen van Soulful Yoga uit de overeenkomst tijdelijk of blijvend verhindert. Dergelijke omstandigheden zijn onder meer: beperkende overheidsmaatregelen, mobilisatie, oorlog, oorlogsgevaar, revolutie, staking, inbeslagneming, beslaglegging, bijzondere weersomstandigheden, gebrek aan vervoermiddelen, dan wel geheel of gedeeltelijk in gebreke blijven van derden wier diensten worden ontvangen.</p><p>9.2 In geval van overmacht heeft Soulful Yoga het recht hetzij de nakoming van haar verplichtingen jegens Klant op te schorten, hetzij de overeenkomst zonder gerechtelijke tussenkomst en zonder zelf tot enige schadevergoeding gehouden te zijn geheel of gedeeltelijk te ontbinden, zulks ter keuze van Soulful Yoga.</p>'],
  ['Artikel 10: Aansprakelijkheid', '<p>10.1 Het afnemen van de diensten van Soulful Yoga is geheel voor eigen risico van Klant. Bij twijfel aan zijn/haar gezondheid wordt Klant geadviseerd de huisarts te raadplegen. Klant is te allen tijde verplicht om eventuele gezondheidsklachten of andere fysieke bijzonderheden (bijv. zwangerschap, hoge bloeddruk, spier- of gewrichtsklachten) te melden bij de docent. Onderbreek bij fysieke klachten (bijv. pijn, kramp, duizeligheid, misselijkheid) een activiteit en stel de docent of behandelaar daarvan op de hoogte.</p><p>10.2 Soulful Yoga aanvaardt geen enkele aansprakelijkheid voor materiële of immateriële schade als gevolg van enig ongeval of letsel van Klant.</p><p>10.3 Soulful Yoga is niet aansprakelijk voor vermissing, verduistering, diefstal of schade, zowel direct als indirect, respectievelijk van of aan eigendommen van Klant.</p><p>10.4 Schade die door Klant al dan niet opzettelijk of door onoordeelkundig gebruik wordt toegebracht aan eigendommen van Soulful Yoga, dient te worden vergoed.</p><p>10.5 Klant vrijwaart Soulful Yoga voor aanspraken van derden. Klant zal personeelsleden van Soulful Yoga, door Soulful Yoga ingeschakelde derden en personeelsleden van deze derden nimmer aansprakelijk kunnen stellen.</p>'],
  ['Artikel 11: Opschorting en ontbinding', '<p>11.1 Indien voor het tijdstip van levering van diensten aan Klant blijkt dat laatstgenoemde niet, niet behoorlijk of niet tijdig voldoet aan enige verplichting jegens Soulful Yoga, heeft Soulful Yoga het recht de nakoming van al haar verplichtingen jegens Klant op te schorten dan wel de overeenkomst met Klant, zonder enige ingebrekestelling of gerechtelijke tussenkomst en zonder zelf tot enige schadevergoeding gehouden te zijn, geheel of gedeeltelijk te ontbinden, één en ander onverminderd de overige rechten van Soulful Yoga in een dergelijk geval.</p>'],
  ['Artikel 12: Auteursrecht en eigendom', '<p>12.1 Van het door Soulful Yoga verstrekte lesmateriaal, waaronder video’s in de app, blijven alle rechten voorbehouden. Niets uit de uitgave(n) mag digitaal worden opgeslagen of openbaar worden gemaakt in enigerlei vorm of enigerlei wijze zonder voorafgaande schriftelijke toestemming van Soulful Yoga. Het is niet toegestaan het lesmateriaal aan derden ter beschikking te stellen.</p>'],
  ['Artikel 13: Klachten', '<p>13.1 Klachten kunnen schriftelijk of per mail (info@soulfulyoga.nl) worden ingediend onder vermelding van datum, plaats, de situatie waar de klacht betrekking op heeft en je voorstel om tot een oplossing te komen. Soulful Yoga zal binnen vier weken na ontvangst reageren met een voorstel tot oplossing. Bij onduidelijkheid zal Soulful Yoga contact opnemen met de indiener van de klacht. Indien de klacht betrekking heeft op een docent, zal contact opgenomen worden met de docent. Daarna volgt een voorstel ter oplossing van je klacht.</p><p>13.2 Mochten Soulful Yoga en klager het niet eens worden over een oplossing, dan wordt de klacht voorgelegd aan de Geschillencommissie Algemeen van de Stichting Geschillencommissies Consumentenzaken. De uitspraak van de Geschillencommissie is bindend voor partijen.</p><p>13.3 Klachten worden geregistreerd bij Soulful Yoga en worden vertrouwelijk behandeld. Klachten zijn omwille van de privacy alleen inzichtelijk voor direct belanghebbenden.</p>'],
  ['Artikel 14: De Soulful Yoga-app', '<p>14.1 Een account voor de app wordt aangemaakt door Soulful Yoga. Je account is persoonlijk; houd je wachtwoord geheim.</p><p>14.2 Via de app kun je het rooster bekijken, een plek in een les aanvragen en lessen annuleren. Een aanvraag is pas definitief wanneer Soulful Yoga deze heeft goedgekeurd. Voor je groepsles staat je plek automatisch gereserveerd.</p><p>14.3 Een strip wordt afgeschreven wanneer Soulful Yoga je aanwezigheid bij een les bevestigt, of bij annulering binnen 24 uur zoals bepaald in artikel 5.4. Het saldo in de app is leidend; meld het bij Soulful Yoga als je denkt dat het niet klopt.</p><p>14.4 In de app worden je naam, e-mailadres, telefoonnummer, strippenkaart, reserveringen, aanwezigheid en je chatberichten met Soulful Yoga bewaard. Soulful Yoga gebruikt deze gegevens alleen voor je lessen en deelt ze niet met derden, behalve met de dienstverlener die de app technisch mogelijk maakt (opslag binnen de EU).</p><p>14.5 Je kunt je account en de bijbehorende gegevens zelf verwijderen via Profiel → Account verwijderen. Een resterend tegoed op je strippenkaart vervalt daarmee niet; neem daarvoor contact op met Soulful Yoga.</p>'],
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

// 100 klanten met elk één groepsles, gelijk verdeeld over de lessen (Gentle iets kleiner).
function seedCustomers(s){
  const rnd = seededRandom(20261031);
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const sessionIds = WEEK.flatMap(d => d.classes.map(c => c.id));
  // Plekken verdelen: elke les krijgt (capaciteit − 1 à 2) vaste klanten, tot er 100 zijn
  const slots = [];
  for (let round = 0; slots.length < DEMO_CUSTOMERS; round++) {
    for (const sid of sessionIds) if (slots.length < DEMO_CUSTOMERS && round < SES[sid].capacity - 1) slots.push(sid);
  }
  // Marieke, Daan en Marjolijn hebben al een groepsles; de rest krijgt een plek uit de pot
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
      termsAcceptedAt: rnd() < 0.6 ? `${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}-10-2026` : null,
      origin: rnd() < 0.2 ? 'beheer' : 'aanvraag'});
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
// Op naam, zodat de lijst niet verspringt als er iets verandert.
const students = () => S.users.filter(u => u.role === 'student').sort((a, b) => a.name.localeCompare(b.name, 'nl'));
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
// Een groepsles is actief zolang er nog een les op of na vandaag in zit.
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
// Voorwaarden art. 5.4: een klant die later dan 24 uur voor aanvang afmeldt, betaalt 1 strip.
const LATE_CANCEL_HOURS = 24;
const isLateCancel = (sid, d) => startOf(sid, d) - now() < LATE_CANCEL_HOURS * 3600000;
const cancellationOf = (email, sid, d) => S.cancels.find(c => c.email === email && c.sessionId === sid && c.date === d);
function cancelNotice(late, paysStrip){
  if (!late) return `Kosteloos tot ${LATE_CANCEL_HOURS} uur voor aanvang: er gaat geen strip af.`;
  if (paysStrip) return `Deze les begint binnen ${LATE_CANCEL_HOURS} uur. Volgens de voorwaarden wordt er bij afmelden 1 strip afgeschreven.`;
  return `Deze les begint binnen ${LATE_CANCEL_HOURS} uur. Volgens de voorwaarden wordt afmelden binnen ${LATE_CANCEL_HOURS} uur in rekening gebracht.`;
}
function cancelLesson(email, sid, d, by){
  if (isCancelled(email, sid, d)) return;
  const late = by === 'klant' && isLateCancel(sid, d);
  const u = userBy(email);
  const charged = late && (u?.strippen ?? 0) > 0;
  if (charged) u.strippen--;
  S.cancels.push({sessionId:sid, date:d, email, by, late, charged, at:nowIso(), seen: by === 'klant' ? false : true});
}
// Weer aanmelden: een strip die voor te laat afmelden afging, komt terug.
const undoCancel = (email, sid, d) => {
  if (cancellationOf(email, sid, d)?.charged) userBy(email).strippen++;
  S.cancels = S.cancels.filter(c => !(c.email === email && c.sessionId === sid && c.date === d));
};
function addVast(sid, d, email, weeks){
  if (occ(sid, d).available <= 0 || enrollmentOf(email, sid, d)) return false;
  S.enrollments.push({id:`e-${Date.now()}`, sessionId:sid, email, start:d, weeks});
  return true;
}
// Vaste klant afmelden voor N weken vanaf deze datum; 99 (of meer dan er over is) = groepsles stoppen.
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
// Een strippenkaart is 4 maanden geldig; bij elke + of +10 begint die periode opnieuw.
const cardValidUntil = () => { const n = now(); return isoOf(new Date(n.getFullYear(), n.getMonth() + 4, n.getDate())); };
const validity = (iso) => { if (!iso) return null; const d = toDate(iso); return {expired: iso < isoOf(now()), date:`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`}; };
const validTag = (iso, extra = '') => { const v = validity(iso); return !v ? '' : v.expired ? `<span class="vtag exp" ${extra}>Vervallen · was geldig t/m ${v.date}</span>` : `<span class="vtag" ${extra}>Geldig t/m ${v.date}</span>`; };
function activateCard(email){ const u = userBy(email); u.strippen = (u.strippen ?? 0) + CARD_SIZE; u.total = Math.max(CARD_SIZE, u.strippen); u.validUntil = cardValidUntil(); return u.strippen; }
function adjustUserStrip(email, delta){ const u = userBy(email); u.strippen = Math.max(0, (u.strippen ?? 0) + delta); if (delta > 0) u.validUntil = cardValidUntil(); return u.strippen; }
// Aparte strippenkaart voor privélessen, zonder einddatum: de beheerder schrijft zelf af (−), niet via de presentielijst.
function adjustPrivateStrip(email, delta){ const u = userBy(email); u.privateStrips = Math.max(0, (u.privateStrips ?? 0) + delta); return u.privateStrips; }
function removePrivateCard(email){ const u = userBy(email); u.privateStrips = null; }
function adjustSeedStrip(sid, id, delta){ const e = (S.roster[sid] || []).find(x => x.id === id); e.strips = Math.max(0, e.strips + delta); }

// Nieuwe demo: de afgelopen weken alvast als bevestigd vastleggen.
if (S.seedPending) { delete S.seedPending; seedHistory(); save(); }

/* ── Berichten: nieuws van de studio en 1-op-1 chat ────────────────── */
// S.news: {id, title, body, at, push}. S.messages: {id, email (de klant), from:'klant'|'studio', text, at}.
// Gelezen tot: S.read[email] = {news, chat} voor de klant, S.studioRead[email] voor de studio.
const nowIso = () => now().toISOString();
const agoIso = (days, hours = 0) => new Date(Date.now() - (days * 24 + hours) * 3600000).toISOString();
function seedMessages(s){
  s.news = [
    {id:'n-3', title:'Kerstvakantie', body:'Van 21 december tot en met 3 januari is de studio dicht. Je groepslessen in die periode vervallen en kosten geen strip. Vanaf maandag 4 januari staan we weer voor je klaar. Fijne feestdagen! 🎄', at:agoIso(2), push:true},
    {id:'n-2', title:'Nieuw: Gentle Yoga op vrijdagochtend', body:'Vanaf deze maand is er op vrijdag om 9.00 een Gentle Yoga-les: rustig bewegen, diep ademen en souplesse. Fijn als je net begint of na een blessure. Reserveer een plek via het rooster.', at:agoIso(9), push:false},
    {id:'n-1', title:'Welkom in de Soulful Yoga-app', body:'Vanaf nu regel je alles in de app: je lessen, je strippenkaart en afmelden. Heb je een vraag? Stuur ons een bericht via de chat.', at:agoIso(21), push:true},
  ];
  s.messages = [
    {id:'m-1', email:'marieke@soulfulyoga.nl', from:'klant', text:'Hoi! Mag ik mijn eigen matje voortaan in de studio laten liggen?', at:agoIso(1, 5)},
    {id:'m-2', email:'marieke@soulfulyoga.nl', from:'studio', text:'Hoi Marieke, natuurlijk! Er is een plank bij de kapstok, zet je naam erop.', at:agoIso(1, 3)},
    {id:'m-3', email:'marieke@soulfulyoga.nl', from:'klant', text:'Top, dank je wel! Tot dinsdag 🙏', at:agoIso(0, 2)},
    {id:'m-4', email:'marjolijn_n@hotmail.com', from:'studio', text:'Hoi Marjolijn, je hebt nog 5 strippen. Wil je alvast een nieuwe kaart? Dan zet ik hem klaar voor donderdag.', at:agoIso(0, 4)},
  ];
  const other = s.users.find(u => u.role === 'student' && u.email.endsWith('@voorbeeld.nl'));
  if (other) s.messages.push({id:'m-5', email:other.email, from:'klant', text:'Is er volgende week ook gewoon les op Hemelvaartsdag?', at:agoIso(0, 1)});
  // Marieke heeft alles gelezen; de studio heeft Mariekes laatste bericht nog niet gezien.
  s.read = {'marieke@soulfulyoga.nl': {news:agoIso(1), chat:agoIso(1, 2)}};
  s.studioRead = {'marieke@soulfulyoga.nl': agoIso(1, 3), 'marjolijn_n@hotmail.com': agoIso(0, 4)};
}

const newsList = () => [...S.news].sort((a, b) => b.at.localeCompare(a.at));
const newsBy = (id) => S.news.find(n => n.id === id);
const unreadNews = (email) => S.news.filter(n => n.at > (S.read[email]?.news || '')).length;
const markNewsRead = (email) => { (S.read[email] ??= {}).news = nowIso(); };
function postNews({title, body, push}){ const n = {id:`n-${Date.now()}`, title, body, push, at:nowIso()}; S.news.push(n); return n; }
function updateNews(id, fields){ Object.assign(newsBy(id), fields); }
function deleteNews(id){ S.news = S.news.filter(n => n.id !== id); }

const chatOf = (email) => S.messages.filter(m => m.email === email).sort((a, b) => a.at.localeCompare(b.at));
function sendMessage(email, from, text){ const m = {id:`m-${Date.now()}`, email, from, text, at:nowIso()}; S.messages.push(m); return m; }
// Alleen de studio: een betaalverzoek (bedrag, omschrijving, betaallink van bank of Tikkie) of een bestand.
function sendPayment(email, text, cents, url){ const m = sendMessage(email, 'studio', text); Object.assign(m, {kind:'betaalverzoek', cents, url, paidAt:null}); return m; }
function sendFile(email, name, type, size, dataUrl){ const m = sendMessage(email, 'studio', name); Object.assign(m, {kind:'bestand', type, size, dataUrl}); return m; }
function setPaid(id, paid){ const m = S.messages.find(x => x.id === id); if (m) m.paidAt = paid ? nowIso() : null; }
// De link uit wat er geplakt is: bank-apps delen "Wil je … betalen? https://…".
const linkIn = (text) => (text || '').match(/https:\/\/[^\s"'<>]+/)?.[0]?.replace(/[.,;)]+$/, '') ?? null;
const openPayments = () => S.messages.filter(m => m.kind === 'betaalverzoek' && !m.paidAt).reverse();
const paidPayments = () => S.messages.filter(m => m.kind === 'betaalverzoek' && m.paidAt).sort((a, b) => b.paidAt.localeCompare(a.paidAt));
// Groepsles verwijderen: nooit gegeven → helemaal weg; met geschiedenis → stopt na gisteren.
function removeWeekly(sid){
  const hasHistory = Object.keys(S.confirmed).some(k => k.startsWith(sid + '@'));
  if (hasHistory) { const d = plusDays(isoOf(now()), -1); SES[sid].until = d; for (const k of ['bookings', 'requests', 'cancels']) S[k] = S[k].filter(x => !(x.sessionId === sid && x.date > d)); return 'gestopt'; }
  S.sessions = S.sessions.filter(s => s.id !== sid);
  for (const k of ['bookings', 'requests', 'cancels', 'enrollments']) S[k] = S[k].filter(x => x.sessionId !== sid);
  reindex(); return 'verwijderd';
}
const euro = (c) => `€ ${(c / 100).toFixed(2).replace('.', ',')}`;
const fileIcon = (t) => t?.startsWith('image/') ? '🖼️' : t?.startsWith('video/') ? '🎬' : '📄';
const sizeLabel = (b) => !b ? '' : b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} kB` : `${(b / 1048576).toFixed(1).replace('.', ',')} MB`;
const msgPreview = (m) => m.kind === 'betaalverzoek' ? `💶 Betaalverzoek ${euro(m.cents)}` : m.kind === 'bestand' ? `${fileIcon(m.type)} ${m.text}` : m.text;
// Eén bericht in de chat (telefoon-demo en portaal): tekst, betaalverzoek of bestand.
function bubbleHtml(m, me, admin){
  const time = `<small>${msgTime(m.at).split(' ').at(-1)}</small>`;
  if (m.kind === 'betaalverzoek') return `<div class="att ${me ? 'me' : 'them'}"><div class="paycard"><div class="pl">Betaalverzoek</div><div class="pa">${euro(m.cents)}</div><div class="pd">${esc(m.text)}</div>
    <span class="tag ${m.paidAt ? 'paid' : 'pend'}">${m.paidAt ? `✓ Betaald · ${new Date(m.paidAt).toLocaleDateString('nl-NL', {day:'numeric', month:'short'})}` : 'Nog niet betaald'}</span>
    ${m.paidAt ? '' : `<a class="paybtn" href="${esc(m.url)}" target="_blank" rel="noopener">${admin ? 'Betaallink openen' : 'Betalen'}</a>`}
    ${admin ? `<div class="paymark" data-act="togglePaid" data-id="${m.id}">${m.paidAt ? 'Toch nog niet betaald' : '✓ Markeer als betaald'}</div>` : ''}</div>${time}</div>`;
  if (m.kind === 'bestand') return `<div class="att ${me ? 'me' : 'them'}">${m.dataUrl && m.type.startsWith('image/') ? `<img class="attimg" src="${m.dataUrl}" alt="${esc(m.text)}">`
    : `<div class="paycard filecard"><span class="fi">${fileIcon(m.type)}</span><div><div class="fn">${esc(m.text)}</div><div class="fm">${sizeLabel(m.size)} · tik om te openen</div></div></div>`}${time}</div>`;
  return `<div class="bub ${me ? 'me' : 'them'}">${esc(m.text)}${time}</div>`;
}
// Een gekozen bestand: foto's tot 1 MB worden als voorbeeld bewaard (de echte app gebruikt beveiligde opslag).
function readDemoFile(file, done){
  if (file.size > 50 * 1048576) { alert(`Dit bestand is ${sizeLabel(file.size)}. Het maximum is 50 MB.`); return; }
  if (!file.type.startsWith('image/') || file.size > 1048576) return done(null);
  const r = new FileReader(); r.onload = () => done(r.result); r.readAsDataURL(file);
}
// Ongelezen voor de klant (van de studio) of voor de studio (van deze klant).
const unreadChat = (email) => chatOf(email).filter(m => m.from === 'studio' && m.at > (S.read[email]?.chat || '')).length;
const unreadForStudio = (email) => chatOf(email).filter(m => m.from === 'klant' && m.at > (S.studioRead[email] || '')).length;
const markChatRead = (email, side) => { if (side === 'studio') S.studioRead[email] = nowIso(); else (S.read[email] ??= {}).chat = nowIso(); };
// "Gelezen" onder je eigen laatste bericht: heeft de ander het al geopend?
const seenByOther = (m) => m.from === 'studio' ? m.at <= (S.read[m.email]?.chat || '') : m.at <= (S.studioRead[m.email] || '');
// Gesprekken voor de studio, laatste bericht bovenaan.
const conversations = () => [...new Set(S.messages.map(m => m.email))].filter(userBy)
  .map(email => ({email, last: chatOf(email).at(-1), unread: unreadForStudio(email)}))
  .sort((a, b) => b.last.at.localeCompare(a.last.at));
const studioUnread = () => conversations().filter(c => c.unread).length;
function msgTime(iso){
  const d = new Date(iso);
  const t = `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
  const days = daysBetween(isoOf(d), isoOf(now()));
  return days <= 0 ? t : days === 1 ? `gisteren ${t}` : `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

// Oudere bewaarde demo's krijgen de voorbeeldberichten er alsnog bij.
if (!S.news) { seedMessages(S); save(); }

/* ── Klantenbeheer ─────────────────────────────────────────────────── */
// origin: 'aanvraag' = via een accountaanvraag (gebruikt de app), 'beheer' = handmatig door de beheerder.
const ORIGIN_LABEL = {aanvraag:'Via accountaanvraag', beheer:'Handmatig toegevoegd'};
// Klanten zonder e-mailadres krijgen een adres op het gereserveerde .invalid-domein (wordt nooit bezorgd).
const hasEmail = (email) => !email.endsWith('@soulfulyoga.invalid');
const shownEmail = (email) => hasEmail(email) ? email : 'geen e-mailadres';
function createCustomer({name, email, phone, origin}){
  const mail = (email || '').trim().toLowerCase() || `zonder-email-${Date.now().toString(36)}@soulfulyoga.invalid`;
  if (userBy(mail)) return null;
  const u = {email:mail, password:'yoga123', name, phone:phone || '', strippen:null, total:10, role:'student', termsAcceptedAt:null, origin};
  S.users.push(u);
  return u;
}
// Klant met alles wat erbij hoort verwijderen (strippen, lessen, berichten).
function deleteCustomer(email){
  S.users = S.users.filter(u => u.email !== email);
  for (const k of ['enrollments', 'bookings', 'requests', 'cancels', 'messages']) S[k] = (S[k] || []).filter(x => x.email !== email);
  delete S.read[email]; delete S.studioRead[email];
}
// Oudere bewaarde demo's: herkomst ontbreekt nog.
if (S.users.some(u => !u.origin)) { S.users.forEach(u => { u.origin ??= 'aanvraag'; }); save(); }

/* ── Accountaanvragen ──────────────────────────────────────────────── */
// De app stuurt de aanvraag zelf naar Soulful Yoga: opgeslagen, pushmelding en mail naar info@soulfulyoga.nl.
function requestAccount({name, email, phone}){
  S.accountRequests = (S.accountRequests || []).filter(r => r.email !== email);
  S.accountRequests.unshift({id:`a-${Date.now()}`, name, email, phone, at:nowIso()});
}
function approveAccountRequest(id){
  const r = S.accountRequests.find(x => x.id === id); if (!r) return null;
  S.accountRequests = S.accountRequests.filter(x => x !== r);
  return createCustomer({name:r.name, email:r.email, phone:r.phone, origin:'aanvraag'});
}
function rejectAccountRequest(id){ S.accountRequests = S.accountRequests.filter(x => x.id !== id); }
/* ── Privélessen: één-op-één met de docent, buiten het rooster, geen strippen ── */
// S.privates: {id, email, date, time:'10.00 – 11.00', cancelled}. Alleen de klant zelf en de beheerder zien ze.
// S.pushQueue: pushmeldingen die verschijnen zodra die klant (of de beheerder: to 'admin') inlogt.
if (!S.privates) { S.privates = [{id:'p-seed', email:'marieke@soulfulyoga.nl', date:plusDays(isoOf(now()), 5), time:'10.00 – 11.00', cancelled:false}]; save(); }
if (!S.pushQueue) S.pushQueue = [];
const privStart = (p) => toDate(p.date, p.time.split(' – ')[0]);
const privEnd = (p) => toDate(p.date, p.time.split(' – ')[1]);
const privatesOf = (email) => S.privates.filter(p => p.email === email).sort((a, b) => privStart(a) - privStart(b));
const upcomingPrivates = () => S.privates.filter(p => privEnd(p) > now()).sort((a, b) => privStart(a) - privStart(b));
const privLabel = (p) => `${shortDate(p.date)} ${p.time.split(' – ')[0]}`;
function addPrivate(email, date, time){
  const p = {id:`p-${Date.now()}`, email, date, time, cancelled:false}; S.privates.push(p);
  S.pushQueue.push({to:email, text:`🧘 Privéles gepland: ${privLabel(p)} met Marjolijn. Namasté!`, open:{tab:'lessen'}});
}
function cancelPrivate(id){
  const p = S.privates.find(x => x.id === id); p.cancelled = true; p.cancelledAt = nowIso(); p.cancelSeen = false;
  S.pushQueue.push({to:'admin', text:`✕ ${userBy(p.email).name} meldt zich af · privéles ${privLabel(p)}`, open:{screen:'rooster-beheer'}});
}
function removePrivate(id){
  const p = S.privates.find(x => x.id === id); S.privates = S.privates.filter(x => x !== p);
  if (!p.cancelled) S.pushQueue.push({to:p.email, text:`✕ Privéles ${privLabel(p)} gaat niet door.`, open:{tab:'lessen'}});
}

// Afmeldingen van klanten die de beheerder nog niet met Akkoord als gezien heeft gemarkeerd (nieuwste eerst).
const openCancellations = () => [
  ...S.cancels.filter(c => c.by === 'klant' && c.seen === false).map(c => ({kind:'groep', key:`${c.sessionId}@${c.date}#${c.email}`, email:c.email, date:c.date, at:c.at, sid:c.sessionId, charged:c.charged})),
  ...S.privates.filter(p => p.cancelled && p.cancelSeen === false).map(p => ({kind:'prive', key:p.id, email:p.email, date:p.date, at:p.cancelledAt, id:p.id, time:p.time})),
].sort((a, b) => b.at.localeCompare(a.at));
function acknowledgeCancellation(key){
  const c = S.cancels.find(x => `${x.sessionId}@${x.date}#${x.email}` === key); if (c) c.seen = true;
  const p = S.privates.find(x => x.id === key); if (p) p.cancelSeen = true;
}
// Geldigheid en privéstrippen voor demo’s die al bewaard waren.
if (!S.validitySeeded) {
  S.users.forEach(u => { if (u.strippen !== null && !u.validUntil) u.validUntil = cardValidUntil(); if (u.privateStrips === undefined) u.privateStrips = null; });
  const mn = userBy('marjolijn_n@hotmail.com'); if (mn) mn.validUntil = plusDays(isoOf(now()), -9);   // voorbeeld: vervallen kaart
  const mk = userBy('marieke@soulfulyoga.nl'); if (mk) { mk.privateStrips = 5; }
  S.validitySeeded = true; save();
}

if (!S.accountRequests) { S.accountRequests = [{id:'a-seed', name:'Joke Peters', email:'joke.peters@gmail.com', phone:'06 18273645', at:agoIso(0, 3)}]; save(); }
