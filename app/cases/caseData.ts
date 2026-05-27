/* All case content lives here. The shared `CasePage` component renders
   whatever's in CASES[slug], and each slug has its own thin page.tsx
   that hands the slug to CasePage. Add a case → add an entry here and a
   folder with a one-line page.tsx. */

export type CaseSlug =
  | 'hair-by-kim'
  | 'fgs'
  | 'hal-xiii'
  | 'vloerverwarming-limburg'

/* Titles split into a script lead-in letter and the rest of the title.
   The rest may contain \n which the renderer turns into <br />. */
export type CaseTitle = { script: string; rest: string }

export type CaseSection = {
  label: string
  title: CaseTitle
  body: string[]
  image: string
  /* Override default sectie aspect-ratio — handig wanneer het beeld
     verticaal (social) is en de standaard landscape het zou croppen. */
  imageRatio?: 'portrait'
}

/* Items rendered in the "Op de socials" grid. Mirrors what the client
   could post on Instagram/TikTok — videos auto-loop muted (Reel-style),
   images render as-is. */
export type SocialItem =
  | {type: 'image'; src: string; alt?: string}
  | {type: 'video'; src: string; poster?: string}

export type CaseData = {
  slug: CaseSlug
  year: string
  name: string
  heroTitle: CaseTitle
  heroTags: string[]
  heroImage: string
  /* `object-position` voor `heroImage` — handig om de crop te
     verschuiven wanneer de standaard center het onderwerp afsnijdt. */
  heroImagePosition?: string
  sections: [CaseSection, CaseSection] | [CaseSection, CaseSection, CaseSection]
  quote: {
    logo: string
    text: string
    author: string
    role: string
  }
  fullBleedImage: string
  socialItems?: SocialItem[]
  nextSlug: CaseSlug
}

export const CASES: Record<CaseSlug, CaseData> = {
  'hair-by-kim': {
    slug: 'hair-by-kim',
    year: '2026',
    name: 'Hair by Kim',
    heroTitle: {
      script: 'S',
      rest: 'ocial media beheer\nvoor Hair by Kim',
    },
    heroTags: ['Strategie', 'Contentcreatie', 'Fotografie', 'Maandelijks beheer'],
    heroImage: '/cases/hair-by-kim/01.webp',
    heroImagePosition: '50% 15%',
    sections: [
      {
        label: 'Het startpunt',
        title: {
          script: 'E',
          rest: 'en salon met karakter,\nmaar online onzichtbaar.',
        },
        body: [
          "Kim had een volle agenda en loyale klanten, maar haar socials liepen achter. Losse foto's, geen ritme, geen rode draad. De sfeer van de salon kwam niet door het scherm heen, waardoor nieuwe klanten lastig te bereiken waren.",
          'We begonnen met een korte merkanalyse op locatie. Wie is Hair by Kim, voor wie is het, en welk gevoel moet elke post oproepen? Die antwoorden werden het fundament van de contentstrategie.',
        ],
        image: '/cases/hair-by-kim/01.webp',
      },
      {
        label: 'De contentdag',
        title: {
          script: 'É',
          rest: 'én dag shooten,\neen kwartaal aan content.',
        },
        body: [
          'Op één zorgvuldig uitgewerkte contentdag legden we de hele salon vast: behandelingen, details, sfeerbeelden en portretten van Kim zelf. Warm licht, rustige composities en veel ruimte voor stilte in het beeld.',
          'Het resultaat: een voorraad beeld waar we maandenlang mee vooruit konden, zonder dat het ooit als herhaling voelde. Elke post past in het grotere verhaal.',
        ],
        image: '/cases/hair-by-kim/02.webp',
      },
      {
        label: 'Het resultaat',
        title: {
          script: 'D',
          rest: 'e salon voelt online\nnu ook als de salon.',
        },
        body: [
          'Binnen drie maanden groeide de Instagram van Hair by Kim met bijna veertig procent, maar belangrijker: de nieuwe klanten die binnenkwamen gaven aan dat ze "precies de sfeer van de posts" zochten. Online en offline klopten met elkaar.',
          'Inmiddels verzorg ik het maandelijkse beheer, met vaste contentmomenten, een beeldbank die blijft doorgroeien en een kalender die past bij het ritme van de salon.',
        ],
        image: '/cases/hair-by-kim/03.webp',
      },
    ],
    quote: {
      logo: '/logos/hair-by-kim.webp',
      text:
        "Wat Viënna voor ons heeft neergezet is zoveel meer dan foto's en reels. Ze heeft ons merk echt op de kaart gezet. Onze salon voelt nu ook online als onze salon.",
      author: 'Kim van Dijk',
      role: 'Eigenaar Hair by Kim',
    },
    fullBleedImage: '/cases/hair-by-kim/full.webp',
    socialItems: [
      {type: 'video', src: '/cases/hair-by-kim/videos/weekdays.mp4'},
      {type: 'image', src: '/cases/hair-by-kim/04.webp', alt: 'Hair by Kim post'},
      {type: 'video', src: '/cases/hair-by-kim/videos/merel-balayage.mp4'},
      {type: 'image', src: '/cases/hair-by-kim/05.webp', alt: 'Hair by Kim post'},
    ],
    nextSlug: 'fgs',
  },

  /* TODO copy klant — placeholder content tot Vienna definitieve teksten aanlevert */
  fgs: {
    slug: 'fgs',
    year: '2026',
    name: 'FGS',
    heroTitle: {
      script: 'C',
      rest: 'ontent creatie\nvoor FGS',
    },
    heroTags: ['Contentdag', 'Fotografie', 'Video', 'Industrieel'],
    heroImage: '/cases/fgs/hero.webp',
    sections: [
      {
        label: 'Het startpunt',
        title: {
          script: 'E',
          rest: 'en industrieel verhaal,\nklaar voor het scherm.',
        },
        body: [
          'TODO copy klant — beschrijf hier hoe het begon. FGS is een merk met 125 jaar geschiedenis en een duidelijk handschrift. Op social was die historie nog niet zichtbaar.',
          'TODO copy klant — beschrijf de eerste verkenning op locatie en wat de aanpak vormgaf.',
        ],
        image: '/cases/fgs/01.webp',
      },
      {
        label: 'De contentdag',
        title: {
          script: 'É',
          rest: 'én dag op de werkvloer,\nalle details vastgelegd.',
        },
        body: [
          'TODO copy klant — beschrijf de contentdag bij FGS, de focus op craftsmanship en de standaard die het merk hooghoudt.',
          'TODO copy klant — vertel over de keuzes in licht, sfeer en compositie.',
        ],
        image: '/cases/fgs/02.webp',
        imageRatio: 'portrait',
      },
    ],
    quote: {
      logo: '/logos/fgs.webp',
      text:
        'TODO copy klant — quote van FGS over de samenwerking met Viënna.',
      author: 'TODO naam',
      role: 'TODO rol bij FGS',
    },
    fullBleedImage: '/cases/fgs/hero.webp',
    socialItems: [
      {
        type: 'video',
        src: '/cases/fgs/videos/servo-loader-quote.mp4',
        poster: '/cases/fgs/03.webp',
      },
      {
        type: 'video',
        src: '/cases/fgs/videos/transport.mp4',
        poster: '/cases/fgs/full.webp',
      },
    ],
    nextSlug: 'hal-xiii',
  },

  'hal-xiii': {
    slug: 'hal-xiii',
    year: '2026',
    name: 'Hal XIII',
    heroTitle: {
      script: 'M',
      rest: 'aandelijks beheer\nvoor Hal XIII',
    },
    heroTags: ['Strategie', 'Maandelijks beheer', 'Fotografie', 'Video'],
    heroImage: '/cases/hal-xiii/03.webp',
    sections: [
      {
        label: 'Het startpunt',
        title: {
          script: 'E',
          rest: 'en merk met kracht,\nmaar zonder ritme.',
        },
        body: [
          'Hal XIII had de basis goed staan: sterke merkwaarden, loyale volgers, duidelijke richting. Wat ontbrak was regie. Posts verschenen onregelmatig, zonder lijn, en de energie die in het merk zit kwam niet mee.',
          'We spraken uitgebreid met het team over waar ze over een jaar willen staan, en vooral: wie ze onderweg willen raken.',
        ],
        image: '/cases/hal-xiii/01.webp',
      },
      {
        label: 'Het ritme',
        title: {
          script: 'E',
          rest: 'lke maand nieuwe energie,\nniet meer van hetzelfde.',
        },
        body: [
          'We zetten een contentkalender op met vaste momenten: één grote shoot per maand, twee contentdagen op locatie en reactieve content rondom lanceringen en events.',
          'Elke maand verschuift het accent: portretten, productdetails, klantverhalen. Het merk houdt dezelfde toon, maar voelt nooit statisch.',
        ],
        image: '/cases/hal-xiii/02.webp',
      },
      {
        label: 'Het resultaat',
        title: {
          script: 'Z',
          rest: 'ichtbaar, herkenbaar\nen in beweging.',
        },
        body: [
          'Na zes maanden een groeiend publiek op alle kanalen, en belangrijker nog: een community-respons die veel verder gaat dan likes. Berichten, samenwerkingen, nieuwe klanten die zich aangesproken voelen door het totaalbeeld.',
          'Hal XIII is online net zo aanwezig geworden als in de fysieke ruimte.',
        ],
        image: '/cases/hal-xiii/03.webp',
      },
    ],
    quote: {
      logo: '/logos/hal-xiii.svg',
      text:
        'Viënna begrijpt wat een merk nodig heeft om écht zichtbaar te worden. Geen standaard content, maar beeld dat kracht uitstraalt en ons publiek raakt.',
      author: 'Rim Pinckers',
      role: 'Owner Hal XIII',
    },
    fullBleedImage: '/cases/hal-xiii/full.webp',
    socialItems: [
      {type: 'video', src: '/cases/hal-xiii/videos/meer-dan-powerlifting.mp4'},
      {type: 'image', src: '/cases/hal-xiii/04.webp', alt: 'Hal XIII post'},
      {type: 'video', src: '/cases/hal-xiii/videos/valentijnsvideo.mp4'},
      {type: 'video', src: '/cases/hal-xiii/videos/funny-gym-vids.mp4'},
    ],
    nextSlug: 'vloerverwarming-limburg',
  },

  /* TODO copy klant — placeholder content tot Vienna definitieve teksten aanlevert */
  'vloerverwarming-limburg': {
    slug: 'vloerverwarming-limburg',
    year: '2026',
    name: 'Vloerverwarming Limburg',
    heroTitle: {
      script: 'C',
      rest: 'ontent creatie voor\nVloerverwarming Limburg',
    },
    heroTags: ['Contentdag', 'Fotografie', 'Video', 'Website'],
    heroImage: '/cases/vloerverwarming-limburg/hero.webp',
    sections: [
      {
        label: 'Het startpunt',
        title: {
          script: 'E',
          rest: 'en vakbedrijf dat klaar was\nvoor zichtbaarheid online.',
        },
        body: [
          'TODO copy klant — beschrijf hoe Vloerverwarming Limburg startte: lokaal sterk, online onderbelicht.',
          'TODO copy klant — vertel over de eerste briefing en wat de aanpak bepaalde.',
        ],
        image: '/cases/vloerverwarming-limburg/01.webp',
      },
      {
        label: 'De contentdag',
        title: {
          script: 'É',
          rest: 'én dag op locatie,\nhet vakmanschap in beeld.',
        },
        body: [
          'TODO copy klant — beschrijf de dag op locatie en de keuzes voor sfeer en compositie.',
          'TODO copy klant — vertel over wat het oplevert aan beeld en video.',
        ],
        image: '/cases/vloerverwarming-limburg/02.webp',
      },
      {
        label: 'Het resultaat',
        title: {
          script: 'V',
          rest: 'akmanschap dat\nonline nu ook overkomt.',
        },
        body: [
          'TODO copy klant — beschrijf de impact en hoe nieuwe klanten zich melden.',
          'TODO copy klant — sluit af met de doorlopende samenwerking en website.',
        ],
        image: '/cases/vloerverwarming-limburg/03.webp',
      },
    ],
    quote: {
      logo: '/logos/vloerverwarming-limburg.webp',
      text:
        'Eindelijk content die past bij ons vak. Eerlijk beeld van het werk op locatie, waarin klanten ons direct herkennen. Viënna snapte ons merk vanaf dag één.',
      author: 'Team Vloerverwarming Limburg',
      role: 'Klant sinds 2025',
    },
    fullBleedImage: '/cases/vloerverwarming-limburg/full.webp',
    socialItems: [
      {type: 'video', src: '/cases/vloerverwarming-limburg/videos/website.mp4'},
      {type: 'video', src: '/cases/vloerverwarming-limburg/videos/edit-v1.mp4'},
    ],
    nextSlug: 'hair-by-kim',
  },
}
