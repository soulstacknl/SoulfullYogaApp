// 30 dagen Yin Yoga challenge, overgenomen van https://www.soulfulyoga.nl/yoga-challenge.
// Per dag een mini yin yoga reeks (stappen met foto en uitleg) of een meditatie.
// Foto's staan in de mediabibliotheek van de website (Wix); zie challengeImage().
// Gegenereerd uit de website; pas teksten hier aan.

export type ChallengeStep = { image: string; title: string; lines: string[]; duration?: string };
export type ChallengeDay = { day: number; meditation: boolean; thumb: string; steps: ChallengeStep[] };

export const CHALLENGE_TITLE = '30 dagen Yin Yoga challenge';
export const CHALLENGE_URL = 'https://www.soulfulyoga.nl/yoga-challenge';
export const CHALLENGE_INTRO =
  'Welkom bij de 30 dagen Yin Yoga challenge van Soulful Yoga! Wat leuk dat je de uitdaging aan gaat om in 30 dagen te werken aan je flexibiliteit, rust en volledige ontspanning in je lichaam en geest. Elke dag vind je een nieuwe mini yin yoga reeks of meditatie. Succes en ik hoor graag hoe het gaat!';

const WIX = 'https://static.wixstatic.com/media/';
// A photo from the website's media library, scaled by Wix: 'step' keeps the whole photo,
// 'thumb' is the square picture of a day in the list.
export function challengeImage(path: string, kind: 'step' | 'thumb') {
  const file = path.split('/')[0];
  return kind === 'step' ? `${WIX}${file}/v1/fit/w_1200,h_1200,q_80/${file}` : `${WIX}${path}/fill/w_200,h_200,al_c,q_80/${file}`;
}
export const dayTitle = (d: ChallengeDay) => `Dag ${d.day}${d.meditation ? ' (meditatie)' : ''}`;

export const challengeDays: ChallengeDay[] = [
  {
    day: 1,
    meditation: false,
    thumb: "11062b_58498485dd60485e9b1f24ea98192acb~mv2.jpg/v1/crop/x_1301,y_0,w_5203,h_5203",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_189a3b94a4534b7da9e5d6e69677f53d~mv2.jpg",
        title: "Vlinder",
        lines: [
          "Voorwaardse val",
          "Evt bolster vervangen door kussen of deken.",
          "Voordelen: Openen heupen en liezen, rek onderrug.",
          "Compressie buikgebied."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_d15e5d3f5e8b47bd9466853ba95408ed~mv2.jpg",
        title: "Halve god van de vissen",
        lines: [
          "Twist rechts vanuit de rug, kijk evt mee over de schouder.",
          "Voordelen: rek buitenste heup en dijbeen, openen schouders en borst. Opbouwen kracht bovenrug, lengte geven aan de ruggengraad."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_4b476f60e72047d19f988b808c511468~mv2.jpg",
        title: "Halve god van de vissen",
        lines: [
          "Twist links vanuit de rug, kijk evt mee over de schouder.",
          "Voordelen: rek buitenste heup en dijbeen, openen schouders en borst. Opbouwen kracht bovenrug, lengte geven aan de ruggengraad."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 2,
    meditation: false,
    thumb: "11062b_0683f62d416b4d9eac1a1b5cd00df64b~mv2.jpg/v1/crop/x_0,y_834,w_3333,h_3333",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_8f4f1a8add4142d5ac00935cf7079480~mv2.jpg",
        title: "Zittende vooroverbuiging",
        lines: [
          "Gebruik evt kussen of opgerolde deken onder de knieën.",
          "Voordelen: stretch onderrug en heupen, openen van de hamstrings."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_b26d4eb12bcb4914b1743f49afdc7676~mv2.jpg",
        title: "Halve kikker",
        lines: [
          "Haal rechter knie naar binnen.",
          "Voordeel: openen van de heup."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_db3527f7a3b3410584df2b9d6c1e6716~mv2.jpg",
        title: "Halve kikker",
        lines: [
          "Haal linker knie naar binnen.",
          "Voordeel: openen van de heup."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 3,
    meditation: false,
    thumb: "11062b_27102c7e528a464f85cba0e70267299a~mv2.jpg/v1/crop/x_0,y_674,w_3653,h_3653",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_b0ad5bad4c824b0aba8069595ed4e5c0~mv2.jpg",
        title: "Staande voorwaardse val",
        lines: [
          "Knieën buigen zo ver als nodig is. Armen laten hangen of ellebogen vasthouden.",
          "Voordelen: stretch hamstrings, openen van de heupen en ruimte creëren in de ruggengraad."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_b5a87f1cedbb421fb937a43a8cd1a43e~mv2.jpg",
        title: "Sphinx",
        lines: [
          "Ellebogen onder de schouders, onderarmen plat op de mat, vingers gespreid. Hoofd laten hangen of ondersteunen.",
          "Voordelen: Versterken rug en de buik, helpt bij nek en rugpijn."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_adc928eb977e462e9a27c1e3ba53e3e1~mv2.jpg",
        title: "Ondersteunde child's pose",
        lines: [
          "Geruststellende, ondersteunende pose",
          "Voordelen: Opent het bekken, versterkt de onderrug, heupen en knieën. Creëert flexibiliteit in de enkels."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 4,
    meditation: false,
    thumb: "11062b_1c2df66a13c041c08abcf3aad9424ee3~mv2.jpg/v1/crop/x_833,y_0,w_3334,h_3334",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_b05919fce7af4159952969d3465b0da0~mv2.jpg",
        title: "Child's pose",
        lines: [
          "Grote tenen bij elkaar, knieën wijd. Voorhoofd steunt op mat.",
          "Voordelen: stretcht de heupen, dijen en enkels. Helpt bij het lolaten van stress en kalmeert de hersenen."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_2d927621ae58419b9a39b9d7caf4d426~mv2.jpg",
        title: "Lizard pose",
        lines: [
          "Linkervoet voor, knie gebogen. Handen op steun (boeken), grond of op onderarmen.",
          "Voordelen: intense heupopener, stretch in quadriceps en hamstrings. Versterken beenspieren."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_83c3224743854e2cb91348b39e29db16~mv2.jpg",
        title: "Lizard pose",
        lines: [
          "Rechtervoet voor, knie gebogen. Handen op steun (boeken), grond of op onderarmen.",
          "Voordelen: intense heupopener, stretch in quadriceps en hamstrings. Versterken beenspieren."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 5,
    meditation: true,
    thumb: "11062b_56418cd3b2354d0888847b8fdfde2d9d~mv2.jpg/v1/crop/x_834,y_0,w_3333,h_3333",
    steps: []
  },
  {
    day: 6,
    meditation: false,
    thumb: "fe53e88fd2dd4b669d759079ebfc826c.jpg/v1/crop/x_894,y_0,w_3413,h_3413",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_4fc198b34c3e4d638a04a5f8baa5c684~mv2.jpg",
        title: "Balletje",
        lines: [
          "Bevrijdende houding.",
          "Voordelen: verdrijft kramp in de rug en stimuleert de buikorganen. Kalmeert de geest en vermindert onrustige gevoelens."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_145ece879f934f778e0200253b386ba7~mv2.jpg",
        title: "Liggende boom",
        lines: [
          "Rechterknie gebogen, voet tegen linkerbeen aan, eventueel armen in cactus vorm.",
          "Voordelen: helpt de heupen te openen en stimuleert de bloedcirculatie in de heupen en benen. Verlicht stijfheid rond de onderrug."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_265597a312b04b2a8d95972517cc37ee~mv2.jpg",
        title: "Liggende boom",
        lines: [
          "Linkerknie gebogen, voet tegen rechterbeen aan, eventueel armen in cactus vorm.",
          "Voordelen: helpt de heupen te openen en stimuleert de bloedcirculatie in de heupen en benen. Verlicht stijfheid rond de onderrug."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 7,
    meditation: false,
    thumb: "11062b_c5df1b6e0915484f85a873e99e5fd783~mv2.jpeg/v1/crop/x_894,y_0,w_3575,h_3575",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_8de31e9ab36e4a64a337e89b73eb281c~mv2.jpg",
        title: "Borstopener",
        lines: [
          "Gebruik eventueel opgerolde deken of kussen onder boven rug, ondersteun het hoofd.",
          "Voordelen: verlicht schouderklachten, stretcht borstspieren."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_294115ecd70d41e28b13b71c8b33f834~mv2.jpg",
        title: "Ruitenwisser",
        lines: [
          "Laat knieën heen en weer gaan en kom daarna tot stilstand, knieën rechts.",
          "Voordelen: stretch buitenkant heup, lichte twist ruggengraad."
        ],
        duration: "2-3 minuten"
      },
      {
        image: "7e29a3_47680ccd8d8b4caa95fece3401d1ebab~mv2.jpg",
        title: "Ruitenwisser",
        lines: [
          "Laat knieën heen en weer gaan en kom daarna tot stilstand, knieën links.",
          "Voordelen: stretch buitenkant heup, lichte twist ruggengraad."
        ],
        duration: "2-3 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 8,
    meditation: false,
    thumb: "ed39cd224b1dc63ac90297b968b4c9e6.jpg/v1/crop/x_171,y_0,w_683,h_683",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_135cb8fa2d034f2e9355402a507e8faf~mv2.jpg",
        title: "Hert",
        lines: [
          "Hert (rechter been voor) in combinatie met voorwaardse val. Draai borst over rechter onderbeen.",
          "Voordelen: stretcht de heupen, je wervelkolom, de bilspieren en buitenkant bovenbenen."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_75f39bb1da084e03b814dc5d78b53710~mv2.jpg",
        title: "Hert",
        lines: [
          "Hert (linker been voor) in combinatie met voorwaardse val. Draai borst over linker onderbeen.",
          "Voordelen: stretcht de heupen, je wervelkolom, de bilspieren en buitenkant bovenbenen."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_be298444b7854cab8048068efcf245c8~mv2.jpg",
        title: "Hartopener",
        lines: [
          "Bolster kan vervangen worden door opgerolde deken of kussen. Optie benen naar vlinder.",
          "Voordelen: diepe stretch voor de borstspieren en schouders."
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 9,
    meditation: true,
    thumb: "11062b_2a0a35caff5d4c60a6222107a507afd6~mv2.jpg/v1/crop/x_833,y_0,w_3335,h_3335",
    steps: []
  },
  {
    day: 10,
    meditation: false,
    thumb: "11062b_8fbbc4b7ac72432da030e5369edf4602~mv2.jpg/v1/crop/x_1099,y_0,w_2802,h_2802",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_b29be2fa7e0b4b71881ef207e4d7a663~mv2.jpg",
        title: "Halve hero pose",
        lines: [
          "Draai linker voet naar binnen, steun eventueel op bolster of kussen.",
          "Voordelen: stretcht de voet, enkel, knie, quadriceps"
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_9e420f272bd745b8909d8b9080a0b0ab~mv2.jpg",
        title: "Halve hero pose",
        lines: [
          "Draai rechter voet naar binnen, steun eventueel op bolster of kussen.",
          "Voordelen: stretcht de voet, enkel, knie, quadriceps"
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_024db2745d03426383e59032d05dd78e~mv2.jpg",
        title: "Ondersteunde Brug",
        lines: [
          "Variant op ondersteunde brug. Bolster kan vervangen worden door opgerolde deken of kussen.",
          "Voordelen: openen en stretch volledige voorzijde lichaam."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 11,
    meditation: false,
    thumb: "11062b_63ba1960ad6248f4878dfc4db488cb8e~mv2.jpg/v1/crop/x_668,y_0,w_2621,h_2621",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_be6b6c1e2d7f4b43bc7de6c739da8328~mv2.jpg",
        title: "Voorwaardse val",
        lines: [
          "Laat het hoofd hangen en de zwaartekracht het werk doen.",
          "Voordelen: Opent de hamstrings en stretcht de onderrug en heupen."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_bc3e26446b884d0a9abfabd60b1a7281~mv2.jpg",
        title: "Halve happy baby",
        lines: [
          "Linker voet richting plafond. Linker hak mag richting bil gebracht worden. Mogelijkheid om rechter been te strekken.",
          "Voordelen: Opent de heupen, stretch van de quadriceps en de hamstrings."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_e95e9ab3dc214f4e95d3f24fd94e695e~mv2.jpg",
        title: "Halve happy baby",
        lines: [
          "Rechter voet richting plafond. Rechter hak mag richting bil gebracht worden. Mogelijkheid om rechter been te strekken.",
          "Voordelen: Opent de heupen, stretch van de quadriceps en de hamstrings."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 12,
    meditation: false,
    thumb: "11062b_fe29cf52c2e44b24879be7e0282b98ea~mv2.jpg/v1/crop/x_712,y_0,w_2832,h_2832",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_b5a87f1cedbb421fb937a43a8cd1a43e~mv2.jpg",
        title: "Sphinx",
        lines: [
          "Ellebogen onder de schouders, onderarmen plat op de mat, vingers gespreid. Hoofd laten hangen of ondersteunen.",
          "Voordelen: Versterken rug en de buik, helpt bij nek en rugpijn."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_cc4f3f2066bb4ddca7935cd8e34259bd~mv2.jpg",
        title: "Liggende twist",
        lines: [
          "Draai knieën naar links.",
          "Voordelen: Versoepelt de wervelkolom, heupen en nek. Verbeterd de spijsvertering."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_33664ae371b3467f8a0561148bc7a924~mv2.jpg",
        title: "Liggende twist",
        lines: [
          "Draai knieën naar rechts.",
          "Voordelen: Versoepelt de wervelkolom, heupen en nek. Verbeterd de spijsvertering."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laar alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 13,
    meditation: false,
    thumb: "11062b_268749fd45164643928d18d97afeadff~mv2.jpg/v1/crop/x_0,y_801,w_3202,h_3202",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_ef6e29f60f6f4b7d9174b70ded7466dd~mv2.jpg",
        title: "Yogi squat",
        lines: [
          "Eventueel hakken ondersteunen met opgerolde deken. Laat het hoofd hangen als dit goed voelt.",
          "Voordelen: bevrijdt spanning in de onderrug, opent de heupen en versterkt de enkels."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_8c119ed9d52645598e0f4f1ac79499bb~mv2.jpg",
        title: "Wijdbeense voorwaardse val",
        lines: [
          "Steun mogelijk op bolster of kussen. Lift eventueel de heupen door op een deken te zitten.",
          "Voordelen: stretch onderrug, liezen, heupen en hamstrings"
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_7e4ad8457e184c3f9c250fcbb6c54abc~mv2.jpg",
        title: "Liggende vlinder",
        lines: [
          "Ondersteun eventueel de knieën met deken of kussen. Bolster onder rug is optioneel.",
          "Voordelen: Opent de heupen en verlengt de rug. Stretcht borst en schouders."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 14,
    meditation: false,
    thumb: "11062b_f69bcc3e4c0f42b6bf3650614f28d557~mv2.jpg/v1/crop/x_0,y_356,w_2497,h_2497",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_719e52d574144d4e8d4a49c2a8cb5ef3~mv2.jpg",
        title: "Thread the needle pose",
        lines: [
          "Draai linker arm onder rechts door, lig op de schouder. Heupen boven knieën.",
          "Voordelen: diepe stretch van de schouders, rug en nek."
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_655b72be37f24f0ab3b78e82e7c22709~mv2.jpg",
        title: "Thread the needle pose",
        lines: [
          "Draai rechter arm onder links door, lig op de schouder. Heupen boven knieën.",
          "Voordelen: diepe stretch van de schouders, rug en nek."
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_0af07cb6d57941ff9294b04f5bc5e852~mv2.jpg",
        title: "Borstopener",
        lines: [
          "Gebruik eventueel opgerolde deken of kussen onder boven rug, ondersteun het hoofd.",
          "Voordelen: verlicht schouderklachten, stretcht borstspieren."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 15,
    meditation: false,
    thumb: "f483c37190bb451d9d6d3b58dca84b09.jpg/v1/crop/x_666,y_0,w_3840,h_3840",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_dff62efe241e4e7ab78e8ec26b033719~mv2.jpg",
        title: "Easy pose twist",
        lines: [
          "Schouders laag houden, open de borst. Draai links.",
          "Voordelen: openen van de middenrug en heupen, lengte en twist in de ruggengraad."
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_d1ec3126e1de4286b793f584372014a9~mv2.jpg",
        title: "Easy pose twist",
        lines: [
          "Schouders laag houden, open de borst. Draai rechts.",
          "Voordelen: openen van de middenrug en heupen, lengte en twist in de ruggengraad."
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_8f4f1a8add4142d5ac00935cf7079480~mv2.jpg",
        title: "Voorwaardse val",
        lines: [
          "Laat het hoofd hangen en de zwaartekracht het werk doen.",
          "Voordelen: Opent de hamstrings en stretcht de onderrug en heupen."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 16,
    meditation: true,
    thumb: "11062b_ed66d63fd7454db1a4942d211d823b9c~mv2.jpg/v1/crop/x_907,y_0,w_3629,h_3629",
    steps: []
  },
  {
    day: 17,
    meditation: false,
    thumb: "11062b_58b3e10a93904e2c95bce440a68a3583~mv2.jpg/v1/crop/x_850,y_0,w_3401,h_3401",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_4b5671cb4b9f406d84b977bde90ba6cb~mv2.jpg",
        title: "Voorwaardse twist",
        lines: [
          "Rijk naar rechtervoet, onderbeen of knie. Kijk eventueel mee naar achteren.",
          "Voordelen: stretch hamstring. onderrug, openen van de heup."
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_f5660284e38940b68b63f4ef8d4c0d82~mv2.jpg",
        title: "Voorwaardse twist",
        lines: [
          "Rijk naar linkervoet, onderbeen of knie. Kijk eventueel mee naar achteren.",
          "Voordelen: stretch hamstring. onderrug, openen van de heup."
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_be298444b7854cab8048068efcf245c8~mv2.jpg",
        title: "Hartopener",
        lines: [
          "Bolster kan vervangen worden door opgerolde deken of kussen. Optie benen naar vlinder.",
          "Voordelen: diepe stretch voor de borstspieren en schouders."
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 18,
    meditation: false,
    thumb: "11062b_3ddbd634ce204de8b109fb015b10f348~mv2.jpg/v1/crop/x_1224,y_0,w_4912,h_4912",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_409c81f9b5754c3494d16e4579e948ff~mv2.jpg",
        title: "Halve kameel",
        lines: [
          "Strek linker arm omhoog, rechter hand op enkel of in de onderrug. Duw heupen naar voren.",
          "Voordelen: stretch buikspieren, compressie onderrug. corrigeert ronde schouders en ingevallen borstkas."
        ],
        duration: "1-2 minuten"
      },
      {
        image: "7e29a3_3417277f28104dfaa8267471d0470001~mv2.jpg",
        title: "Halve kameel",
        lines: [
          "Strek rechter arm omhoog, linker hand op enkel of in de onderrug. Duw heupen naar voren.",
          "Voordelen: stretch buikspieren, compressie onderrug. corrigeert ronde schouders en ingevallen borstkas."
        ],
        duration: "1-2 minuten"
      },
      {
        image: "7e29a3_adc928eb977e462e9a27c1e3ba53e3e1~mv2.jpg",
        title: "Child's pose",
        lines: [
          "Geruststellende, ondersteunende pose",
          "Voordelen: Opent het bekken, versterkt de onderrug, heupen en knieën. Creëert flexibiliteit in de enkels."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 19,
    meditation: false,
    thumb: "11062b_da1a1c07c123484c9ec44b3a5d147b68~mv2.jpg/v1/crop/x_624,y_0,w_2364,h_2364",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_7b1ecb05b4c54ecba0314d67179d0083~mv2.jpg",
        title: "Halve vlinder",
        lines: [
          "Strek rechter been naar buiten, linkervoet naar binnen. Voorwaardse val, evt ondersteunen met bolster of kussen.",
          "Voordelen: openen van de heupen, stretch hamstring gestrekte been en binnenkant dijbeen en lies."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_401fd67e2091406690f2e23d1195cc2a~mv2.jpg",
        title: "Halve vlinder",
        lines: [
          "Strek linker been naar buiten, rechtervoet naar binnen. Voorwaardse val, evt ondersteunen met bolster of kussen.",
          "Voordelen: openen van de heupen, stretch hamstring gestrekte been en binnenkant dijbeen en lies."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_fa9d32d98c4d43beb2af778adcf34f81~mv2.jpg",
        title: "Gebroken kaars",
        lines: [
          "Kan ook zonder bolster tegen de muur.",
          "Voordelen: verlicht rugpijn, lichte stretch achterkant benen. Effectief bij vermoeide benen en opgezwollen enkels."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 20,
    meditation: false,
    thumb: "3d684727975841d996387fd8a11d8243.jpg/v1/crop/x_747,y_0,w_3499,h_3499",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_f78bc627f98c470c8cad71ec4900831e~mv2.jpg",
        title: "Figure 4",
        lines: [
          "Leg rechter enkel op linker bovenbeen. Mogelijkheid om knieën naar je toe te halen.",
          "Voordelen: helpt stijfheid in buitenste heup verminderen door stretch bilspier en hamstring."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_cc0b19eda353446087d09fe21b35d9da~mv2.jpg",
        title: "Figure 4",
        lines: [
          "Leg linker enkel op rechter bovenbeen. Mogelijkheid om knieën naar je toe te halen.",
          "Voordelen: helpt stijfheid in buitenste heup verminderen door stretch bilspier en hamstring."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_1fc9b3297a314963bfea94e4d25ee32a~mv2.jpg",
        title: "Balletje",
        lines: [
          "Bevrijdende houding.",
          "Voordelen: verdrijft kramp in de rug en stimuleert de buikorganen. Kalmeert de geest en vermindert onrustige gevoelens."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 21,
    meditation: false,
    thumb: "7d6e9d778e5f4567bf2da7fec17b7096.jpg/v1/crop/x_891,y_0,w_3564,h_3564",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_a80d8780bc994a6ab50f64b488f5778f~mv2.jpg",
        title: "Halve boog",
        lines: [
          "Rijk met linker hand naar linker voet. Ze hoeven elkaar niet te vinden. Je kan omhoog komen met de borst.",
          "Voordelen: bevorderen flexibiliteit ruggengraad (als je borst mee omhoog laat komen), stretch quadriceps"
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_b4c16f61db914821907187ae9017da2c~mv2.jpg",
        title: "Halve boog",
        lines: [
          "Rijk met rechter hand naar rechter voet. Ze hoeven elkaar niet te vinden. Je kan omhoog komen met de borst.",
          "Voordelen: bevorderen flexibiliteit ruggengraad (als je borst mee omhoog laat komen), stretch quadriceps"
        ],
        duration: "2-5 minuten"
      },
      {
        image: "7e29a3_c8289b62a1b64aac8c1d0fdbb9d4f864~mv2.jpg",
        title: "Hele boog",
        lines: [
          "Mogelijkheid om borst en hoofd omhoog te brengen en bovenbenen van de grond te laten komen. Duw dan voeten in handen.",
          "Voordelen: versterkt en versoepelt de rug, stretch quadriceps."
        ],
        duration: "1-2 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 22,
    meditation: false,
    thumb: "11062b_e545f4704305496cb305f2cd2b82556f~mv2.jpg/v1/crop/x_0,y_776,w_3448,h_3448",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_862163b2c8ba4160856880a9ac1c2e20~mv2.jpg",
        title: "Child's pose",
        lines: [
          "Grote tenen bij elkaar, knieën naar binnen. Voorhoofd steunt op mat.",
          "Voordelen: stretcht de heupen, dijen en enkels. Helpt bij het lolaten van stress en kalmeert de hersenen."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_b0ad5bad4c824b0aba8069595ed4e5c0~mv2.jpg",
        title: "Staande voorwaardse val",
        lines: [
          "Knieën buigen zo ver als nodig is. Armen laten hangen of ellebogen vasthouden.",
          "Voordelen: stretch hamstrings, openen van de heupen en ruimte creëren in de ruggengraad."
        ],
        duration: "1-3 minuten"
      },
      {
        image: "7e29a3_b5a87f1cedbb421fb937a43a8cd1a43e~mv2.jpg",
        title: "Shinx",
        lines: [
          "Ellebogen onder de schouders, onderarmen plat op de mat, vingers gespreid. Hoofd laten hangen of ondersteunen.",
          "Voordelen: Versterken rug en de buik, helpt bij nek en rugpijn."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 23,
    meditation: true,
    thumb: "11062b_c5f0630caa6c4815bdae3c514e1476d0~mv2.jpg/v1/crop/x_833,y_0,w_3334,h_3334",
    steps: []
  },
  {
    day: 24,
    meditation: false,
    thumb: "11062b_15301c270cd240318b0bcff42406729e~mv2.jpg/v1/crop/x_740,y_0,w_2465,h_2465",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_f78dd56fde70412195e8654866d276bf~mv2.jpg",
        title: "Sphinx, halve kikker",
        lines: [
          "Vanuit Sphinx haal linker knie naar buiten. Eventueel ondersteunen met bolster of opgerolde deken.",
          "Voordelen: diepe stretch in de heup, compressie onderrug."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_f6cb2452ef0745a890809a9022934ebe~mv2.jpg",
        title: "Spinx, halve kikker",
        lines: [
          "Vanuit Sphinx haal rechter knie naar buiten. Eventueel ondersteunen met bolster of opgerolde deken.",
          "Voordelen: diepe stretch in de heup, compressie onderrug."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_adc928eb977e462e9a27c1e3ba53e3e1~mv2.jpg",
        title: "Child's pose",
        lines: [
          "Geruststellende, ondersteunende pose",
          "Voordelen: Opent het bekken, versterkt de onderrug, heupen en knieën. Creëert flexibiliteit in de enkels."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 25,
    meditation: false,
    thumb: "11062b_9393754bcc8448fcb9c28f1b822c083e~mv2.jpg/v1/crop/x_0,y_834,w_3333,h_3333",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_6a664e24527648e09a09820ddd0c4206~mv2.jpg",
        title: "Ondersteunde brug",
        lines: [
          "Bolster eventueel vervangen door opgerolde deken of kussen.",
          "Voordelen: het hart is hoger dan het hoofd waardoor angst, stress, vermoeidheid, rugpijn, hoofdpijn en slaaploosheid kunnen afnemen."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_fa9d32d98c4d43beb2af778adcf34f81~mv2.jpg",
        title: "Gebroken kaars",
        lines: [
          "Kan ook zonder bolster tegen de muur.",
          "Voordelen: verlicht rugpijn, lichte stretch achterkant benen. Effectief bij vermoeide benen en opgezwollen enkels."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_024db2745d03426383e59032d05dd78e~mv2.jpg",
        title: "Ondersteunde brug",
        lines: [
          "Variant op ondersteunde brug. Bolster kan vervangen worden door opgerolde deken of kussen.",
          "Voordelen: openen en stretch volledige voorzijde lichaam."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 26,
    meditation: false,
    thumb: "11062b_0058c843eaa743caae5baca8e3d74150~mv2.jpg/v1/crop/x_0,y_1049,w_4196,h_4196",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_4e01ea043d814b35b8d629778795cc5d~mv2.jpg",
        title: "Liggende vlinder",
        lines: [
          "Ondersteun eventueel de knieën met deken of kussen.",
          "Voordelen: Opent de heupen en verlengt de rug. Stretcht borst en schouders."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_7b91782412f24eaeb8e68cd8872a1746~mv2.jpg",
        title: "Banaan",
        lines: [
          "Draai bovenlijf en benen naar rechts, eventueel linker voet op rechter enkel.",
          "Voordelen: stretch hele zijkant lichaam, vooral rek op IT-band (zijkant bovenbeen)"
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_639fb3e61aa943859aed887738a590c3~mv2.jpg",
        title: "Banaan",
        lines: [
          "Draai bovenlijf en benen naar links, eventueel rechter voet op linker enkel.",
          "Voordelen: stretch hele zijkant lichaam, vooral rek op IT-band (zijkant bovenbeen)"
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 27,
    meditation: false,
    thumb: "11062b_b29b922dde604da8a3ebadd6b8f58fd7~mv2.jpg/v1/crop/x_1092,y_0,w_4369,h_4369",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_47e2a245553d4078985544e393763912~mv2.jpg",
        title: "Vlinder",
        lines: [
          "Ondersteun eventueel de knieën met deken of kussen. Bolster eventueel vervangen door opgerolde deken of kussen.",
          "Voordelen: Opent de heupen en verlengt de rug. Stretcht borst en schouders."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_4d226e329a62445c89217838ba00e1eb~mv2.jpg",
        title: "Halve vlinder",
        lines: [
          "Strek linker been naar voren, rechtervoet naar binnen. Voorwaardse val, evt ondersteunen met bolster of kussen.",
          "Voordelen: openen van de heupen, stretch hamstring gestrekte been en binnenkant dijbeen en lies."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_bac473a86d494bab9f42b81636daec5e~mv2.jpg",
        title: "Halve vlinder",
        lines: [
          "Strek rechter been naar voren, linker voet naar binnen. Voorwaardse val, evt ondersteunen met bolster of kussen.",
          "Voordelen: openen van de heupen, stretch hamstring gestrekte been en binnenkant dijbeen en lies."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 28,
    meditation: false,
    thumb: "11062b_2d2b6a74dc424e10a59d0f691e8d1f4b~mv2.jpg/v1/crop/x_317,y_0,w_1267,h_1267",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_7e4a6400bd374bef83484426880e41b1~mv2.jpg",
        title: "Sphinx, halve kikker",
        lines: [
          "Vanuit Sphinx haal rechter knie naar buiten. Eventueel ondersteunen met bolster of opgerolde deken.",
          "Voordelen: diepe stretch in de heup, compressie onderrug."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_94ece851b5084d7f9a9d9b517a062ead~mv2.jpg",
        title: "Sphinx, halve kikker",
        lines: [
          "Vanuit Sphinx haal linker knie naar buiten. Eventueel ondersteunen met bolster of opgerolde deken.",
          "Voordelen: diepe stretch in de heup, compressie onderrug."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_96f55cf14a4140909fd3f1c92196df34~mv2.jpg",
        title: "Child's pose",
        lines: [
          "Geruststellende, ondersteunende pose",
          "Voordelen: Opent het bekken, versterkt de onderrug, heupen en knieën. Creëert flexibiliteit in de enkels."
        ],
        duration: "5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laat alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 29,
    meditation: false,
    thumb: "352540af0345423b8d447b3b337f557a.jpg/v1/crop/x_960,y_0,w_3840,h_3840",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_be6b6c1e2d7f4b43bc7de6c739da8328~mv2.jpg",
        title: "Voorwaardse val",
        lines: [
          "Laat het hoofd hangen en de zwaartekracht het werk doen.",
          "Voordelen: Opent de hamstrings en stretcht de onderrug en heupen."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_cc4f3f2066bb4ddca7935cd8e34259bd~mv2.jpg",
        title: "Liggende twist",
        lines: [
          "Draai knieën naar links.",
          "Voordelen: Versoepelt de wervelkolom, heupen en nek. Verbeterd de spijsvertering."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_33664ae371b3467f8a0561148bc7a924~mv2.jpg",
        title: "Liggende twist",
        lines: [
          "Draai knieën naar rechts",
          "Voordelen: Versoepelt de wervelkolom, heupen en nek. Verbeterd de spijsvertering."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laar alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  },
  {
    day: 30,
    meditation: false,
    thumb: "821989ec405f44f2a1dea1e9aa20d7e1.jpg/v1/crop/x_912,y_0,w_3648,h_3648",
    steps: [
      {
        image: "7e29a3_d2dabdfaacb44daf969adcd28986c75e~mv2.jpg",
        title: "Easy pose",
        lines: [
          "Moment van meditatie. Comfortabele zithouding om terug te komen in het lichaam en geest.",
          "Connectie met de ademhaling"
        ],
        duration: "5-10 minuten"
      },
      {
        image: "7e29a3_bcb8ba1078354f4a8e8f0e999f61b785~mv2.jpg",
        title: "Halve bevrijdende pose",
        lines: [
          "Bolster is optioneel. Haal linker knie richting borst.",
          "Voordelen: stretch bilspier, versterken armen en schouders. bevorderd de spijsvertering door compressie buik."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_e3b2c47ed1fc400392a5bc8fea75b267~mv2.jpg",
        title: "Halve bevrijdende pose",
        lines: [
          "Bolster is optioneel. Haal rechter knie richting borst.",
          "Voordelen: stretch bilspier, versterken armen en schouders. bevorderd de spijsvertering door compressie buik."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_acdef365cad64bd186e4616dc8feb624~mv2.jpg",
        title: "Constructieve rust",
        lines: [
          "Zet de voeten wijd aan de mat, knieën vallen naar binnen tegen elkaar.",
          "Eventueel rechterhand buik, linkerhand op je hart. Vind rust en maak de connectie met je ademhaling en hart."
        ],
        duration: "3-5 minuten"
      },
      {
        image: "7e29a3_0c25b9994d1445b9858c9111873e3993~mv2.jpg",
        title: "Savasana",
        lines: [
          "Totale ontspanning",
          "Laar alle vorige houdingen doorwerken in je lichaam en geest."
        ],
        duration: "5-10 minuten"
      }
    ]
  }
];
