// Soulful Yoga's general terms, based on https://www.soulfulyoga.nl/general-5,
// with article 14 added for the app.
export const TERMS_VERSION = 'Versie 1.1 · november 2026';

export type TermsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  // Paragraphs shown after the bullets.
  closing?: string[];
};

export const terms: TermsSection[] = [
  {
    title: 'Artikel 1: Definities',
    paragraphs: [
      '1.1 Soulful Yoga: de gebruiker van deze voorwaarden, gevestigd aan de Runselstraat 18, 5351 NJ Berghem (KvK 89222237), en alle aan Soulful Yoga op enigerlei wijze verbonden ondernemingen en organisaties.',
      '1.2 Klant: de wederpartij van Soulful Yoga die een product of dienst afneemt.',
    ],
  },
  {
    title: 'Artikel 2: Toepasselijkheid en geldigheid',
    paragraphs: [
      '2.1 Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten waarbij Soulful Yoga als opdrachtnemer optreedt, ook wanneer de Klant lessen reserveert of beheert via de Soulful Yoga-app.',
      '2.2 Afwijkingen van en aanvullingen op tot stand gekomen overeenkomsten dan wel deze algemene voorwaarden zijn slechts geldig indien en voor zover deze door Soulful Yoga uitdrukkelijk en schriftelijk zijn bevestigd.',
      '2.3 Indien één of meer bepalingen in deze algemene voorwaarden op enig moment geheel of gedeeltelijk nietig zijn of vernietigd mochten worden, dan blijft het overige in deze algemene voorwaarden bepaalde volledig van toepassing.',
    ],
  },
  {
    title: 'Artikel 3: Leskaarten, abonnementen en losse lessen',
    paragraphs: [
      '3.1 Een 10-strippenkaart is strikt persoonlijk en niet overdraagbaar.',
      '3.2 Een 10-strippenkaart is maximaal vier maanden geldig vanaf de dag van de eerst afgenomen les.',
      '3.3 Soulful Yoga verleent geen restitutie op 10-strippenkaarten en abonnementen.',
      '3.4 Het lesrooster is te vinden in de app en op de website. Dit rooster kan door Soulful Yoga desgewenst worden gewijzigd, ook behoudt Soulful Yoga zich het recht voor lessen te annuleren. Wijzigingen in het lesrooster geven geen recht op restitutie van reeds betaalde leskaarten en abonnementen of verlenging hiervan.',
      '3.5 Soulful Yoga is tijdens de zomervakantie 3 weken gesloten.',
      '3.6 Bij zwangerschap of ziekte kan, in overleg vooraf tussen Klant en Soulful Yoga, een restitutie plaatsvinden van de 10-strippenkaart. De reeds afgenomen lessen worden dan berekend als losse lessen (à 15 euro per les), het overige bedrag wordt terugbetaald aan de Klant.',
    ],
  },
  {
    title: 'Artikel 4: Workshops en cursussen',
    paragraphs: [
      '4.1 Een inschrijving voor het volgen van een workshop of cursus wordt door Soulful Yoga aanvaard met het voorbehoud van voldoende inschrijvingen.',
      '4.2 Klant kan uitsluitend aan de workshop of cursus deelnemen, als vooraf het lesgeld is voldaan.',
      '4.3 Soulful Yoga behoudt zich het recht voor om ten aanzien van workshops en cursussen organisatorische en inhoudelijke wijzigingen aan te brengen.',
    ],
  },
  {
    title: 'Artikel 5: Annulering',
    paragraphs: [
      '5.1 Annulering van workshops of cursussen kan uitsluitend schriftelijk plaatsvinden.',
      '5.2 Annulering tot 24 uur voor aanvang van een cursus of workshop gegeven door een docent van Soulful Yoga is kosteloos. Bij annulering nadien is Klant de volledige betaling verschuldigd.',
      '5.3 Annulering van workshops en cursussen gegeven door een externe docent heeft de volgende consequenties:',
    ],
    bullets: [
      'Bij annulering minimaal 12 weken voor aanvang van de workshop of cursus wordt 50% van het lesgeld in rekening gebracht.',
      'Bij annulering tussen 12 en 6 weken voor aanvang van de workshop of cursus wordt 70% van het lesgeld in rekening gebracht.',
      'Bij annulering binnen 6 weken voor aanvang van de workshop of cursus is er geen recht op terugbetaling. Ook bij uitval tijdens de workshop of cursus wordt er geen lesgeld gerestitueerd.',
    ],
    closing: [
      '5.4 Annulering van een les kan kosteloos tot 24 uur voor aanvang van de les, via de app of bij Soulful Yoga. Binnen de 24 uur zal bij gebruik van een 10-strippenkaart er 1 les worden afgeschreven. Bij annulering van een privéles binnen 24 uur voor aanvang zal het volledige bedrag in rekening worden gebracht bij de Klant.',
    ],
  },
  {
    title: 'Artikel 6: Huisregels',
    paragraphs: ['6.1 Klant moet altijd de volgende huisregels van Soulful Yoga volgen:'],
    bullets: [
      'Kom fris naar de yogales. Het gebruik van (geurloze) deodorant wordt zeer op prijs gesteld. In verband met mogelijke allergieën van andere klanten wordt iedereen verzocht geen parfum, aromatherapie-olie of andere geuren te dragen, en geen spray-deodorant in de ruimte te gebruiken.',
      'Draag schone (yoga)kleding tijdens de yogalessen, waar je makkelijk in kunt bewegen.',
      'Wij adviseren niet later dan twee uur voor de yogales te eten en in ieder geval geen yoga op een volle maag te beoefenen.',
      'Geen schoenen in de yogastudio.',
      'De yogamat dient na gebruik schoongemaakt te worden door de Klant die daarvan gebruik heeft gemaakt.',
      'De (lichamelijke) integriteit van Klanten en medewerkers van Soulful Yoga dient altijd gerespecteerd te worden. Seksueel gedrag c.q. seksueel getint gedrag wordt door Soulful Yoga niet getolereerd.',
      'Telefoons dienen op stil gezet te worden tijdens de les.',
      'Wees op tijd, indien mogelijk minimaal 5 minuten voor aanvang van de les.',
    ],
  },
  {
    title: 'Artikel 7: Verplichtingen Soulful Yoga',
    paragraphs: [
      '7.1 Soulful Yoga behoudt zich het recht voor Klanten die naar haar mening de huisregels, zoals genoemd in artikel 6, niet naleven, van verdere deelneming uit te sluiten. Uitsluiting laat iedere verplichting tot betaling zijdens Klant onverlet.',
      '7.2 De overeenkomst tussen partijen leidt voor Soulful Yoga tot een inspanningsverplichting, nimmer tot een resultaatsverplichting. Toelating van een Klant op grond van het voldoen aan de verstrekte toelatingsnormen houdt dus geen garantie in dat Klant de les, cursus of workshop met succes zal doorlopen c.q. afronden.',
      '7.3 Soulful Yoga behoudt zich het recht voor zonder opgaaf van reden een les, cursus of workshop te annuleren of deelname van Klant te weigeren voorafgaand aan de start van een les, cursus, workshop of opleiding.',
      '7.4 Soulful Yoga kan nimmer gehouden zijn cursussen te herhalen voor Klanten die verhinderd waren deze bij te wonen. De betaling van gemiste lesdagen blijft onverminderd verschuldigd.',
    ],
  },
  {
    title: 'Artikel 8: Prijs en betaling',
    paragraphs: [
      '8.1 De prijzen zijn in euro’s inclusief omzetbelasting, tenzij anders vermeld.',
      '8.2 Soulful Yoga behoudt zich het recht voor om haar prijzen aan te passen. Aanpassing van de prijzen zal worden gecommuniceerd via de website van Soulful Yoga en mondeling worden gedeeld met de Klant door Soulful Yoga.',
      '8.3 Soulful Yoga behoudt zich het recht voor een prijsstijging van kostprijsbepalende factoren, welke is ontstaan na het tot stand komen van de overeenkomst, aan Klant door te berekenen.',
      '8.4 Bij niet-tijdige of niet-volledige betaling is Klant in verzuim zonder dat daartoe een aanmaning of ingebrekestelling is vereist en is Soulful Yoga gerechtigd om haar contractuele verplichtingen op te schorten c.q. Klant de toegang tot het pand te weigeren. Tevens is Soulful Yoga alsdan gerechtigd de overeenkomst te ontbinden.',
      '8.5 Bij niet-tijdige of niet-volledige betaling is Klant onverminderd het bovenstaande de wettelijke rente verschuldigd over het openstaande bedrag. Daarnaast zijn alle met de invordering van het openstaande bedrag samenvallende kosten, zowel gerechtelijk als buitengerechtelijk, verschuldigd. Eerst nadat Klant het verschuldigde bedrag, vermeerderd met de rente en de kosten, heeft betaald, zal hij/zij weer worden toegelaten.',
    ],
  },
  {
    title: 'Artikel 9: Overmacht',
    paragraphs: [
      '9.1 Onder overmacht wordt verstaan: elke buiten de directe invloed van Soulful Yoga liggende of elk voor haar redelijkerwijs niet voorziene omstandigheid, die de nakoming van de verplichtingen van Soulful Yoga uit de overeenkomst tijdelijk of blijvend verhindert. Dergelijke omstandigheden zijn onder meer: beperkende overheidsmaatregelen, mobilisatie, oorlog, oorlogsgevaar, revolutie, staking, inbeslagneming, beslaglegging, bijzondere weersomstandigheden, gebrek aan vervoermiddelen, dan wel geheel of gedeeltelijk in gebreke blijven van derden wier diensten worden ontvangen.',
      '9.2 In geval van overmacht heeft Soulful Yoga het recht hetzij de nakoming van haar verplichtingen jegens Klant op te schorten, hetzij de overeenkomst zonder gerechtelijke tussenkomst en zonder zelf tot enige schadevergoeding gehouden te zijn geheel of gedeeltelijk te ontbinden, zulks ter keuze van Soulful Yoga.',
    ],
  },
  {
    title: 'Artikel 10: Aansprakelijkheid',
    paragraphs: [
      '10.1 Het afnemen van de diensten van Soulful Yoga is geheel voor eigen risico van Klant. Bij twijfel aan zijn/haar gezondheid wordt Klant geadviseerd de huisarts te raadplegen. Klant is te allen tijde verplicht om eventuele gezondheidsklachten of andere fysieke bijzonderheden (bijv. zwangerschap, hoge bloeddruk, spier- of gewrichtsklachten) te melden bij de docent. Onderbreek bij fysieke klachten (bijv. pijn, kramp, duizeligheid, misselijkheid) een activiteit en stel de docent of behandelaar daarvan op de hoogte.',
      '10.2 Soulful Yoga aanvaardt geen enkele aansprakelijkheid voor materiële of immateriële schade als gevolg van enig ongeval of letsel van Klant.',
      '10.3 Soulful Yoga is niet aansprakelijk voor vermissing, verduistering, diefstal of schade, zowel direct als indirect, respectievelijk van of aan eigendommen van Klant.',
      '10.4 Schade die door Klant al dan niet opzettelijk of door onoordeelkundig gebruik wordt toegebracht aan eigendommen van Soulful Yoga, dient te worden vergoed.',
      '10.5 Klant vrijwaart Soulful Yoga voor aanspraken van derden. Klant zal personeelsleden van Soulful Yoga, door Soulful Yoga ingeschakelde derden en personeelsleden van deze derden nimmer aansprakelijk kunnen stellen.',
    ],
  },
  {
    title: 'Artikel 11: Opschorting en ontbinding',
    paragraphs: [
      '11.1 Indien voor het tijdstip van levering van diensten aan Klant blijkt dat laatstgenoemde niet, niet behoorlijk of niet tijdig voldoet aan enige verplichting jegens Soulful Yoga, heeft Soulful Yoga het recht de nakoming van al haar verplichtingen jegens Klant op te schorten dan wel de overeenkomst met Klant, zonder enige ingebrekestelling of gerechtelijke tussenkomst en zonder zelf tot enige schadevergoeding gehouden te zijn, geheel of gedeeltelijk te ontbinden, één en ander onverminderd de overige rechten van Soulful Yoga in een dergelijk geval.',
    ],
  },
  {
    title: 'Artikel 12: Auteursrecht en eigendom',
    paragraphs: [
      '12.1 Van het door Soulful Yoga verstrekte lesmateriaal, waaronder video’s in de app, blijven alle rechten voorbehouden. Niets uit de uitgave(n) mag digitaal worden opgeslagen of openbaar worden gemaakt in enigerlei vorm of enigerlei wijze zonder voorafgaande schriftelijke toestemming van Soulful Yoga. Het is niet toegestaan het lesmateriaal aan derden ter beschikking te stellen.',
    ],
  },
  {
    title: 'Artikel 13: Klachten',
    paragraphs: [
      '13.1 Klachten kunnen schriftelijk of per mail (info@soulfulyoga.nl) worden ingediend onder vermelding van datum, plaats, de situatie waar de klacht betrekking op heeft en je voorstel om tot een oplossing te komen. Soulful Yoga zal binnen vier weken na ontvangst reageren met een voorstel tot oplossing. Bij onduidelijkheid zal Soulful Yoga contact opnemen met de indiener van de klacht. Indien de klacht betrekking heeft op een docent, zal contact opgenomen worden met de docent. Daarna volgt een voorstel ter oplossing van je klacht.',
      '13.2 Mochten Soulful Yoga en klager het niet eens worden over een oplossing, dan wordt de klacht voorgelegd aan de Geschillencommissie Algemeen van de Stichting Geschillencommissies Consumentenzaken. De uitspraak van de Geschillencommissie is bindend voor partijen.',
      '13.3 Klachten worden geregistreerd bij Soulful Yoga en worden vertrouwelijk behandeld. Klachten zijn omwille van de privacy alleen inzichtelijk voor direct belanghebbenden.',
    ],
  },
  {
    title: 'Artikel 14: De Soulful Yoga-app',
    paragraphs: [
      '14.1 Een account voor de app wordt aangemaakt door Soulful Yoga. Je account is persoonlijk; houd je wachtwoord geheim.',
      '14.2 Via de app kun je het rooster bekijken, een plek in een les aanvragen en lessen annuleren. Een aanvraag is pas definitief wanneer Soulful Yoga deze heeft goedgekeurd. Voor je vaste les staat je plek automatisch gereserveerd.',
      '14.3 Een strip wordt afgeschreven wanneer Soulful Yoga je aanwezigheid bij een les bevestigt, of bij annulering binnen 24 uur zoals bepaald in artikel 5.4. Het saldo in de app is leidend; meld het bij Soulful Yoga als je denkt dat het niet klopt.',
      '14.4 In de app worden je naam, e-mailadres, telefoonnummer, strippenkaart, reserveringen, aanwezigheid en je chatberichten met Soulful Yoga bewaard. Soulful Yoga gebruikt deze gegevens alleen voor je lessen en deelt ze niet met derden, behalve met de dienstverlener die de app technisch mogelijk maakt (opslag binnen de EU).',
      '14.5 Je kunt je account en de bijbehorende gegevens zelf verwijderen via Profiel → Account verwijderen. Een resterend tegoed op je strippenkaart vervalt daarmee niet; neem daarvoor contact op met Soulful Yoga.',
    ],
  },
];
