export interface MockArtwork {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  year: number;
  medium: string;
  widthCm: number;
  heightCm: number;
  depthCm?: number;
  price?: number;
  currency: string;
  status: "draft" | "published" | "reserved" | "sold" | "archived";
  coverImageUrl: string;
  additionalImages?: string[];
  altText: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  displayOrder: number;
  collectionSlug?: string;
  collectionName?: string;
  arConfig: {
    isArEnabled: boolean;
    defaultWidthCm: number;
    defaultHeightCm: number;
    defaultScale: number;
    defaultRotation: number;
    frameEnabled: boolean;
    frameType: "none" | "minimal_black" | "classic_gold" | "natural_wood" | "white_gallery";
    frameDepthCm: number;
    frameWidthCm: number;
    matColor: string;
    arReadinessStatus: "ready" | "needs_attention";
    arInstructions: string;
  };
}

export interface MockCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  curatorialStatement: string;
  coverImageUrl: string;
  isPublished: boolean;
  displayOrder: number;
  artworkSlugs: string[];
}

export interface MockExhibition {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  curatorNote: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "current" | "past";
  coverImageUrl: string;
  isPublished: boolean;
  displayOrder: number;
  artworkSlugs: string[];
}

export interface MockHomepageSection {
  id: string;
  sectionKey: "hero" | "featured_artworks" | "latest_collection" | "artist_story" | "ar_experience" | "featured_exhibition" | "contact_cta";
  title: string;
  subtitle: string;
  contentJson: Record<string, any>;
  isEnabled: boolean;
  displayOrder: number;
}

export interface MockInquiry {
  id: string;
  artworkId?: string;
  artworkTitle?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  createdAt: string;
}

export const INITIAL_ARTWORKS: MockArtwork[] = [
  {
    id: "art-1",
    slug: "solitude-in-ultramarine",
    title: "Solitude in Ultramarine",
    description: "An evocative study of light and oceanic stillness rendered through deep glazes of French ultramarine and subtle lapis lazuli pigments.",
    longDescription: "Painted over six months in the artist's studio overlooking the Breton coast, 'Solitude in Ultramarine' investigates the emotional threshold between solitude and infinite horizon. Elena Vance built over twenty translucent oil glazes on heavyweight Belgian linen, allowing ambient light to penetrate into the lower pigment strata and re-emerge with luminous depth.",
    year: 2025,
    medium: "Oil and pulverized lapis lazuli on Belgian linen",
    widthCm: 140,
    heightCm: 100,
    depthCm: 4.5,
    price: 18500,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85",
    additionalImages: [
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80"
    ],
    altText: "Abstract oil painting featuring deep ultramarine blues, subtle indigo gradients and luminous golden undertones",
    seoTitle: "Solitude in Ultramarine (2025) – Elena Vance",
    seoDescription: "Original oil on linen artwork by Elena Vance. 140 x 100 cm. Inquire for private collection acquisition or view in your space via AR.",
    isFeatured: true,
    displayOrder: 1,
    collectionSlug: "chromatic-solitude",
    collectionName: "Chromatic Solitude",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 140,
      defaultHeightCm: 100,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "minimal_black",
      frameDepthCm: 3.5,
      frameWidthCm: 3.0,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "For optimal AR placement, point your camera toward a well-lit wall at eye level.",
    },
  },
  {
    id: "art-2",
    slug: "aurora-at-the-meridian",
    title: "Aurora at the Meridian",
    description: "A dynamic canvas contrasting burnished ochre, Venetian red, and emergent morning amber.",
    longDescription: "Examining the transition of dawn over Mediterranean limestone cliffs, this canvas layers oil with mineral sands and 23-karat gold leaf. The textured impasto catches shifting natural room lighting, altering its appearance throughout the day.",
    year: 2025,
    medium: "Oil, mineral earth, and 23k gold leaf on canvas",
    widthCm: 120,
    heightCm: 90,
    depthCm: 4.0,
    price: 14200,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=85",
    altText: "Textured contemporary abstract painting with golden ochre, terracotta red and warm ivory light",
    isFeatured: true,
    displayOrder: 2,
    collectionSlug: "ephemeral-terrains",
    collectionName: "Ephemeral Terrains",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 120,
      defaultHeightCm: 90,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "natural_wood",
      frameDepthCm: 3.5,
      frameWidthCm: 4.0,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Maintain 1.5m to 2.5m distance from the wall for true life-sized preview.",
    },
  },
  {
    id: "art-3",
    slug: "resonance-in-granite-no-4",
    title: "Resonance in Granite No. 4",
    description: "Monolithic textural minimalism drawing inspiration from archaic architectural relics.",
    longDescription: "Executed with palette knives and raw pigment bound in stand oil, 'Resonance in Granite No. 4' is an ode to ancient stonework and geological permanence. The surface possesses a tactile, tactile relief that recalls carved megaliths weathered by centuries of salt wind.",
    year: 2024,
    medium: "Oil, cold wax, and pulverized volcanic pumice on panel",
    widthCm: 160,
    heightCm: 120,
    depthCm: 5.0,
    price: 22000,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=85",
    altText: "Textured monolithic minimal painting in graphite and warm grey tones with pumice impasto",
    isFeatured: false,
    displayOrder: 3,
    collectionSlug: "ephemeral-terrains",
    collectionName: "Ephemeral Terrains",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 160,
      defaultHeightCm: 120,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "minimal_black",
      frameDepthCm: 4.0,
      frameWidthCm: 3.0,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Mount on larger feature wall for proper exhibition proportions.",
    },
  },
  {
    id: "art-4",
    slug: "the-silence-of-amber",
    title: "The Silence of Amber",
    description: "Vertical meditative field painting exploring the luminosity of natural Baltic amber glazes.",
    longDescription: "A vertical compositional axis inspired by high gothic chapel stained glass. Layers of Baltic amber varnish are fused with oxidized copper powder, producing an inner glow that responds dramatically to changes in ambient daylight.",
    year: 2025,
    medium: "Raw oil, oxidized copper wash, and encaustic on unprimed linen",
    widthCm: 80,
    heightCm: 130,
    depthCm: 3.8,
    price: 9800,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://images.unsplash.com/photo-1579783483458-83d02161294e?auto=format&fit=crop&w=1600&q=85",
    altText: "Vertical abstract artwork featuring raw linen texture and a central wash of glowing amber and sienna pigments",
    isFeatured: false,
    displayOrder: 4,
    collectionSlug: "chromatic-solitude",
    collectionName: "Chromatic Solitude",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 80,
      defaultHeightCm: 130,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "classic_gold",
      frameDepthCm: 3.0,
      frameWidthCm: 2.5,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Ideal for narrow wall pillars, entryways, or library alcoves.",
    },
  },
  {
    id: "art-5",
    slug: "whispering-tides",
    title: "Whispering Tides",
    description: "A rhythmic panoramic canvas depicting the tidal wash over basalt sand at dusk.",
    longDescription: "A large-scale panoramic format capturing the transient moment where wet ocean foam retreats over volcanic sand. Vance utilized custom horsehair brushes and poured glazes to achieve the organic froth patterns along the crest.",
    year: 2024,
    medium: "Oil and marine shellac on Belgian linen",
    widthCm: 180,
    heightCm: 85,
    depthCm: 4.0,
    price: 21500,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
    altText: "Panoramic abstract seascape with foaming seafoam green, deep abyssal blue, and slate undertones",
    isFeatured: true,
    displayOrder: 5,
    collectionSlug: "chromatic-solitude",
    collectionName: "Chromatic Solitude",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 180,
      defaultHeightCm: 85,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "white_gallery",
      frameDepthCm: 4.0,
      frameWidthCm: 3.5,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Requires at least 2.2 meters of clear horizontal wall space.",
    },
  },
  {
    id: "art-6",
    slug: "fracture-in-bone-and-gold",
    title: "Fracture in Bone and Gold",
    description: "Delicate white-on-white textural study punctuated by an intentional fracture line of antique gold.",
    longDescription: "Inspired by the Japanese philosophy of Kintsugi, Vance explores fragility as a locus of grace. The surface consists of chalk gesso and bone black washes, separated by an organic fracture lined with 24k Japanese gold leaf.",
    year: 2025,
    medium: "Gesso, egg tempera, bone pigment, and 24k gold leaf on panel",
    widthCm: 100,
    heightCm: 100,
    depthCm: 4.5,
    price: 13500,
    currency: "USD",
    status: "sold",
    coverImageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=85",
    altText: "Square minimalist painting in alabaster and bone white with a glowing jagged fracture line in pure gold leaf",
    isFeatured: false,
    displayOrder: 6,
    collectionSlug: "ephemeral-terrains",
    collectionName: "Ephemeral Terrains",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 100,
      defaultHeightCm: 100,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "minimal_black",
      frameDepthCm: 3.5,
      frameWidthCm: 2.0,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Displays beautifully when illuminated with 3000K warm spotlighting.",
    },
  },
  {
    id: "art-7",
    slug: "nocturne-in-terre-verte",
    title: "Nocturne in Terre Verte",
    description: "Deep subterranean olive and viridian tones that evoke dense temperate rainforest canopies after rain.",
    longDescription: "Vance spent several autumn weeks in the Pacific Northwest studying old-growth cedar canopies. Terre Verte and copper phthalocyanine pigments are worked wet-on-wet with broad silicone blades to produce rhythmic striations.",
    year: 2024,
    medium: "Oil, dammar resin, and green earth pigment on canvas",
    widthCm: 130,
    heightCm: 95,
    depthCm: 4.0,
    price: 15800,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1600&q=85",
    altText: "Dark emerald and moss green abstract painting with ethereal glazes and forest-like depth",
    isFeatured: false,
    displayOrder: 7,
    collectionSlug: "chromatic-solitude",
    collectionName: "Chromatic Solitude",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 130,
      defaultHeightCm: 95,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "natural_wood",
      frameDepthCm: 3.5,
      frameWidthCm: 3.5,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Point camera at any flat neutral wall for AR simulation.",
    },
  },
  {
    id: "art-8",
    slug: "strata-of-forgotten-empires",
    title: "Strata of Forgotten Empires",
    description: "An architectural assemblage of layered pigments reminiscent of weathered Venetian palazzo facades.",
    longDescription: "This monumental piece incorporates actual crushed travertine marble and Roman pozzolana into the pigment binder. The surface seems to peel and flake with deliberate historic gravitas, revealing centuries of concealed color beneath.",
    year: 2025,
    medium: "Oil, Roman pozzolana, crushed travertine, and encaustic on canvas",
    widthCm: 150,
    heightCm: 110,
    depthCm: 5.0,
    price: 24000,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1600&q=85",
    altText: "Textured mixed-media painting with layered terracotta, faded fresco blues and antique stucco surfaces",
    isFeatured: true,
    displayOrder: 8,
    collectionSlug: "ephemeral-terrains",
    collectionName: "Ephemeral Terrains",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 150,
      defaultHeightCm: 110,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "classic_gold",
      frameDepthCm: 4.5,
      frameWidthCm: 4.0,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Scale calibrated for full-size viewing from 2 meters distance.",
    },
  }
];

export const INITIAL_COLLECTIONS: MockCollection[] = [
  {
    id: "col-1",
    slug: "chromatic-solitude",
    title: "Chromatic Solitude",
    description: "A contemplative exploration of pigment isolation, silence, and the architecture of the human horizon.",
    curatorialStatement: "Chromatic Solitude marks Elena Vance's investigation into how monochromatic and tonal fields command physical presence. Each artwork in this series limits its chromatic range to two dominant harmonic notes, forcing the viewer to engage with micro-variations of texture, brush velocity, and optical depth.",
    coverImageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    displayOrder: 1,
    artworkSlugs: ["solitude-in-ultramarine", "the-silence-of-amber", "whispering-tides", "nocturne-in-terre-verte"],
  },
  {
    id: "col-2",
    slug: "ephemeral-terrains",
    title: "Ephemeral Terrains",
    description: "Geological memory, volcanic reliefs, and mineral stratification translated into oil and stone.",
    curatorialStatement: "Ephemeral Terrains originated from Vance's expeditions across Iceland, Sicily, and the Peloponnese. By introducing pulverized stone, volcanic pumice, and crushed marbles into her binders, Vance bridges the gap between painting and tectonic topography.",
    coverImageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    displayOrder: 2,
    artworkSlugs: ["aurora-at-the-meridian", "resonance-in-granite-no-4", "fracture-in-bone-and-gold", "strata-of-forgotten-empires"],
  }
];

export const INITIAL_EXHIBITIONS: MockExhibition[] = [
  {
    id: "exh-1",
    slug: "luminescence-at-twilight",
    title: "Luminescence at Twilight",
    subtitle: "Solo Exhibition at Galerie Vivienne",
    description: "A seminal solo exhibition examining the boundary between day and night through sixteen monumental oil canvases.",
    curatorNote: "Vance's mastery of translucent glazing creates a singular experience where the gallery's dimming natural skylights reveal entirely new color harmonies every fifteen minutes.",
    location: "Galerie Vivienne, 4 Rue des Petits-Champs, Paris, France",
    startDate: "2026-04-10T18:00:00.000Z",
    endDate: "2026-06-25T20:00:00.000Z",
    status: "current",
    coverImageUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    displayOrder: 1,
    artworkSlugs: ["solitude-in-ultramarine", "whispering-tides", "nocturne-in-terre-verte", "the-silence-of-amber"],
  },
  {
    id: "exh-2",
    slug: "resonance-of-the-earth",
    title: "Resonance of the Earth",
    subtitle: "Curated Showcase at Manhattan Contemporary",
    description: "An upcoming group exhibition exploring geological materiality in modern fine art.",
    curatorNote: "Featuring Elena Vance alongside select sculptors and ceramicists pushing the boundaries of mineral composition.",
    location: "520 West 24th Street, Chelsea, New York, NY",
    startDate: "2026-10-15T10:00:00.000Z",
    endDate: "2027-01-10T18:00:00.000Z",
    status: "upcoming",
    coverImageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=85",
    isPublished: true,
    displayOrder: 2,
    artworkSlugs: ["aurora-at-the-meridian", "resonance-in-granite-no-4", "fracture-in-bone-and-gold"],
  }
];

export const INITIAL_HOMEPAGE_SECTIONS: MockHomepageSection[] = [
  {
    id: "sec-1",
    sectionKey: "hero",
    title: "Hero Showcase",
    subtitle: "Opening visual statement and featured canvas reveal",
    contentJson: {
      heading: "L'Atelier Lumineux",
      subheading: "Fine contemporary paintings by Elena Vance",
      description: "Exploring the silence of oceanic horizon, geological stratification, and the ethereal physics of light through museum-grade oils.",
      ctaText: "Explore Collection",
      ctaUrl: "/gallery",
      secondaryCtaText: "Experience in AR",
      secondaryCtaUrl: "/ar/solitude-in-ultramarine",
      badge: "Spring 2026 Exhibition Now Open",
    },
    isEnabled: true,
    displayOrder: 1,
  },
  {
    id: "sec-2",
    sectionKey: "featured_artworks",
    title: "Curated Masterworks",
    subtitle: "Selected original canvases currently available for private acquisition",
    contentJson: {
      heading: "Selected Works",
      description: "Each painting is unique, documented with provenance, physical dimensions, and true-scale AR preview.",
      ctaText: "View Full Gallery",
      ctaUrl: "/gallery",
    },
    isEnabled: true,
    displayOrder: 2,
  },
  {
    id: "sec-3",
    sectionKey: "latest_collection",
    title: "Series Spotlight",
    subtitle: "Focus on 'Chromatic Solitude'",
    contentJson: {
      heading: "Featured Series: Chromatic Solitude",
      description: "A four-year exploration of light penetrating lapis lazuli and marine glazes on unbleached Belgian linen.",
      featuredCollectionSlug: "chromatic-solitude",
      ctaText: "Discover the Series",
      ctaUrl: "/collections/chromatic-solitude",
    },
    isEnabled: true,
    displayOrder: 3,
  },
  {
    id: "sec-4",
    sectionKey: "artist_story",
    title: "The Artist's Monologue",
    subtitle: "Biography and Studio Practice",
    contentJson: {
      heading: "Art as an Encounter with Space",
      quote: "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room.",
      description: "Elena Vance (b. 1986) lives and works between Paris and coastal Brittany. Her paintings have been acquired by prominent private foundations across Europe, North America, and Japan.",
      ctaText: "Read Artist Biography & Statement",
      ctaUrl: "/about",
    },
    isEnabled: true,
    displayOrder: 4,
  },
  {
    id: "sec-5",
    sectionKey: "ar_experience",
    title: "WebAR Spatial Preview",
    subtitle: "Museum curation brought directly into your interior",
    contentJson: {
      heading: "View in Your Space",
      subheading: "Instant Augmented Reality without App Downloads",
      description: "Experience Elena Vance's paintings calibrated to exact 1:1 physical centimeter dimensions on your living room, office, or gallery wall using WebXR technology.",
      ctaText: "Try Interactive AR Studio",
      ctaUrl: "/ar/solitude-in-ultramarine",
    },
    isEnabled: true,
    displayOrder: 5,
  },
  {
    id: "sec-6",
    sectionKey: "featured_exhibition",
    title: "Exhibition Note",
    subtitle: "Currently on display at Galerie Vivienne, Paris",
    contentJson: {
      heading: "Luminescence at Twilight",
      subheading: "Solo Exhibition – Paris",
      description: "April 10 – June 25, 2026. Discover sixteen monumental canvases presented in architectural skylit galleries.",
      ctaText: "Exhibition Details & Catalog",
      ctaUrl: "/exhibitions/luminescence-at-twilight",
    },
    isEnabled: true,
    displayOrder: 6,
  },
  {
    id: "sec-7",
    sectionKey: "contact_cta",
    title: "Private Inquiries & Acquisitions",
    subtitle: "Direct studio contact",
    contentJson: {
      heading: "Acquire an Original",
      description: "For private acquisitions, international crate shipping, or curatorial loan requests, contact the studio directly.",
      ctaText: "Inquire with Curator",
      ctaUrl: "/contact",
    },
    isEnabled: true,
    displayOrder: 7,
  },
];

export const INITIAL_SITE_SETTINGS = {
  artistName: "Elena Vance",
  siteTitle: "L'Atelier Lumineux",
  tagline: "Fine Contemporary Oil & Spatial AR Art Gallery",
  bioSummary: "Elena Vance is a contemporary fine artist whose luminous oil paintings and mineral assemblages investigate geological memory, lapis glazes, and environmental stillness.",
  statement: "I paint to reveal what happens when light travels through twenty layers of transparent oil glaze and strikes raw Belgian linen. My canvases are designed to breathe with the changing natural lighting of the rooms they inhabit.",
  contactEmail: "curator@latelier-lumineux.art",
  phone: "+33 (0)1 42 68 55 00",
  location: "Paris & Brittany, France",
  socialLinks: {
    instagram: "https://instagram.com/elenavance.art",
    twitter: "https://twitter.com/elenavance",
    artsy: "https://artsy.net/artist/elena-vance",
  },
  copyrightText: "© 2026 Elena Vance. All rights reserved. Registered ADAGP.",
};

export const INITIAL_INQUIRIES: MockInquiry[] = [
  {
    id: "inq-1",
    artworkId: "art-1",
    artworkTitle: "Solitude in Ultramarine",
    name: "Arthur Pendelton",
    email: "a.pendelton@arch-advisors.ch",
    phone: "+41 22 819 4000",
    subject: "Private Collection Acquisition Inquiry",
    message: "We are currently completing an architectural residence on Lake Geneva and would like to inquire whether 'Solitude in Ultramarine' is available for immediate acquisition, including museum-grade crating to Geneva.",
    status: "new" as const,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: "inq-2",
    artworkId: "art-2",
    artworkTitle: "Aurora at the Meridian",
    name: "Claire Delacroix",
    email: "c.delacroix@fondation-arts.fr",
    phone: "+33 6 12 34 56 78",
    subject: "Exhibition Loan Proposal for Autumn 2026",
    message: "Greetings Madame Vance. On behalf of the contemporary curatorial board, we would like to formally request 'Aurora at the Meridian' for our upcoming retrospective in Lyon.",
    status: "read" as const,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];
