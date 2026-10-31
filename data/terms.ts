// CONCEPT — replace with Soulful Yoga's real terms. [..] marks values still to fill in.
export const TERMS_VERSION = 'Concept · versie 0.1';

export type TermsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export const terms: TermsSection[] = [
  {
    title: '1. Toepasselijkheid',
    paragraphs: [
      'Deze voorwaarden gelden voor alle lessen, strippenkaarten en reserveringen bij Soulful Yoga, Runselstraat 18, 5351 NJ Berghem. Door een les te reserveren of een strippenkaart te kopen ga je akkoord met deze voorwaarden.',
    ],
  },
  {
    title: '2. Proefles, losse les en strippenkaart',
    bullets: [
      'Een proefles is eenmalig en gratis.',
      'Een losse les kost €15, een 10-strippenkaart €110.',
      'Een strippenkaart is [aantal] maanden geldig na aankoop en is persoonsgebonden.',
      'Niet gebruikte strippen worden niet terugbetaald.',
    ],
  },
  {
    title: '3. Reserveren',
    paragraphs: [
      'Je reserveert een plek via de app. Een reservering is pas definitief wanneer de docent deze heeft goedgekeurd. Bij het inchecken voor een les wordt één strip afgeschreven.',
    ],
  },
  {
    title: '4. Annuleren',
    paragraphs: [
      'Je kunt een reservering tot [aantal] uur voor aanvang kosteloos annuleren. Annuleer je later of kom je niet, dan wordt de strip afgeschreven.',
    ],
  },
  {
    title: '5. Gezondheid en eigen verantwoordelijkheid',
    paragraphs: [
      'Deelname is op eigen risico. Meld lichamelijke klachten, blessures of zwangerschap vóór de les bij de docent. Raadpleeg bij twijfel eerst je huisarts. Soulful Yoga is niet aansprakelijk voor letsel of schade, behalve bij opzet of grove nalatigheid.',
    ],
  },
  {
    title: '6. Rooster en wijzigingen',
    paragraphs: [
      'Soulful Yoga mag het rooster, de docent of de lesinhoud wijzigen. Valt een les uit, dan krijg je je strip terug of mag je een andere les kiezen.',
    ],
  },
  {
    title: '7. Privacy',
    paragraphs: [
      'We gebruiken je naam, e-mailadres en telefoonnummer alleen voor je reserveringen en strippenkaart. We delen je gegevens niet met derden. Lees meer in onze privacyverklaring [link].',
    ],
  },
  {
    title: '8. Huisregels',
    bullets: [
      'Kom op tijd, zodat de les rustig kan beginnen.',
      'Zet je telefoon op stil.',
      'Neem een handdoek mee; matten zijn aanwezig.',
    ],
  },
];
