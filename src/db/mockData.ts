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
  notifiedSubscribersAt?: string | null;
  notifySubscribers?: boolean;
  arConfig: {
    isArEnabled: boolean;
    defaultWidthCm: number;
    defaultHeightCm: number;
    defaultScale: number;
    defaultRotation: number;
    minScale?: number;
    maxScale?: number;
    placementMode?: "wall" | "floor";
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
  preferredContactMethod?: "email" | "phone";
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  adminNotes?: string;
  createdAt: string;
}

export const INITIAL_ARTWORKS: MockArtwork[] = [
  {
    id: "art-kazuha",
    slug: "kazuha",
    title: "Kazuha",
    description: "Original contemporary digital canvas featuring vivid atmospheric depth and autumnal wind currents.",
    longDescription: "Kazuha is an evocative digital work exploring harmony, movement, and ethereal light. Captured at ultra-high 2.5K resolution with rich color depth on ImageKit CDN.",
    year: 2026,
    medium: "Digital Canvas & High-Fidelity Pigments",
    widthCm: 120,
    heightCm: 67.5,
    depthCm: 3.5,
    price: 16500,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490",
    additionalImages: [],
    altText: "Kazuha digital artwork by Vishal",
    seoTitle: "Kazuha | Original Artwork by Vishal",
    seoDescription: "Examine Kazuha in true 1:1 scale WebAR in your living space.",
    isFeatured: true,
    displayOrder: 1,
    collectionSlug: "chromatic-solitude",
    collectionName: "Chromatic Solitude",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 120,
      defaultHeightCm: 67.5,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "minimal_black",
      frameDepthCm: 3.0,
      frameWidthCm: 4.0,
      matColor: "#0D0E12",
      arReadinessStatus: "ready",
      arInstructions: "Point camera towards a well-lit wall and tap to mount Kazuha in 1:1 true physical scale.",
    },
  },
  {
    id: "art-study-1",
    slug: "atelier-study-no-1",
    title: "Atelier Study No. 1",
    description: "Architectural and UI composition study examining digital presence and modernist spatial geometry.",
    longDescription: "A geometric and modernist digital composition exploring proportion, negative space, and digital craftsmanship.",
    year: 2026,
    medium: "Digital Mixed Media",
    widthCm: 80,
    heightCm: 55,
    depthCm: 2.5,
    price: 8500,
    currency: "USD",
    status: "published",
    coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788716375938-screenshot-2026-03-26-191642_0jLwOtfwv.png?updatedAt=1788716375615",
    additionalImages: [],
    altText: "Atelier Study No. 1 by Vishal",
    seoTitle: "Atelier Study No. 1 | Vishal",
    seoDescription: "Explore Atelier Study No. 1 in high-fidelity preview and WebAR.",
    isFeatured: true,
    displayOrder: 2,
    collectionSlug: "ephemeral-terrains",
    collectionName: "Ephemeral Terrains",
    arConfig: {
      isArEnabled: true,
      defaultWidthCm: 80,
      defaultHeightCm: 55,
      defaultScale: 1.0,
      defaultRotation: 0.0,
      frameEnabled: true,
      frameType: "white_gallery",
      frameDepthCm: 2.5,
      frameWidthCm: 3.5,
      matColor: "#FFFFFF",
      arReadinessStatus: "ready",
      arInstructions: "Scale calibrated for viewing from 2 meters distance.",
    },
  }
];

export const INITIAL_COLLECTIONS: MockCollection[] = [
  {
    id: "col-1",
    slug: "chromatic-solitude",
    title: "Chromatic Solitude",
    description: "A contemplative exploration of pigment isolation, silence, and the architecture of the human horizon.",
    curatorialStatement: "Chromatic Solitude marks an investigation into how monochromatic and tonal fields command physical presence.",
    coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490",
    isPublished: true,
    displayOrder: 1,
    artworkSlugs: ["kazuha"],
  },
  {
    id: "col-2",
    slug: "ephemeral-terrains",
    title: "Ephemeral Terrains",
    description: "Digital memory, relief studies, and spatial stratification.",
    curatorialStatement: "Ephemeral Terrains bridges digital abstraction with tactile architectural balance.",
    coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788716375938-screenshot-2026-03-26-191642_0jLwOtfwv.png?updatedAt=1788716375615",
    isPublished: true,
    displayOrder: 2,
    artworkSlugs: ["atelier-study-no-1"],
  }
];

export const INITIAL_EXHIBITIONS: MockExhibition[] = [
  {
    id: "exh-1",
    slug: "luminescence-at-twilight",
    title: "Luminescence at Twilight",
    subtitle: "Solo Exhibition at Galerie Vivienne",
    description: "A seminal solo exhibition examining the boundary between atmosphere and digital presence.",
    curatorNote: "The collection creates a singular experience where shifting room lighting reveals vibrant new color harmonies.",
    location: "Galerie Vivienne, 4 Rue des Petits-Champs, Paris, France",
    startDate: "2026-04-10T18:00:00.000Z",
    endDate: "2026-06-25T20:00:00.000Z",
    status: "current",
    coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490",
    isPublished: true,
    displayOrder: 1,
    artworkSlugs: ["kazuha"],
  },
  {
    id: "exh-2",
    slug: "resonance-of-the-earth",
    title: "Resonance of the Earth",
    subtitle: "Curated Showcase at Manhattan Contemporary",
    description: "An upcoming group exhibition exploring spatial materiality in modern fine art.",
    curatorNote: "Highlighting innovative contemporary compositions pushing the boundaries of light and form.",
    location: "520 West 24th Street, Chelsea, New York, NY",
    startDate: "2026-10-15T10:00:00.000Z",
    endDate: "2027-01-10T18:00:00.000Z",
    status: "upcoming",
    coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788716375938-screenshot-2026-03-26-191642_0jLwOtfwv.png?updatedAt=1788716375615",
    isPublished: true,
    displayOrder: 2,
    artworkSlugs: ["atelier-study-no-1"],
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
    title: "About the Artist",
    subtitle: "Biography, Monologue & Provenance",
    contentJson: {
      heading: "Art as an Encounter with Space",
      quote: "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room.",
      description: "Elena Vance (b. 1986) lives and works between Paris and coastal Brittany. Her paintings have been acquired by prominent private foundations across Europe, North America, and Japan.",
      ctaText: "Inquire With Curatorial Office",
      ctaUrl: "/#contact",
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
    title: "Contact & Studio Inquiries",
    subtitle: "Curatorial Liaison & Direct Correspondence",
    contentJson: {
      heading: "Direct Studio Acquisitions",
      description: "For private acquisitions, curatorial loan requests, bespoke commissions, and private atelier viewings, please correspond directly with our studio liaison desk.",
      ctaText: "Inquire with Curator",
      ctaUrl: "/#contact",
    },
    isEnabled: true,
    displayOrder: 7,
  },
];

export interface SiteSettingsData {
  artistName: string;
  siteTitle: string;
  shortBrandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  bioSummary: string;
  statement: string;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  location: string;
  address: string;
  city: string;
  country: string;
  businessHours: string;
  contactInstructions: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    artsy?: string;
    facebook?: string;
    pinterest?: string;
  };
  announcementBar: {
    isEnabled: boolean;
    message: string;
    link?: string;
    linkLabel?: string;
    bg?: string;
    textColor?: string;
    dismissible?: boolean;
  };
  headerConfig: {
    logoType: "text" | "image";
    logoText?: string;
    logoUrl?: string;
    style: "transparent" | "solid" | "floating_pill";
    showCta: boolean;
    ctaLabel: string;
    ctaUrl: string;
  };
  navigationItems: Array<{
    id: string;
    label: string;
    href: string;
    isEnabled: boolean;
    order: number;
  }>;
  footerConfig: {
    description: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    contactText: string;
    copyrightText: string;
    showNewsletterCta: boolean;
  };
  galleryPageConfig: {
    title: string;
    subtitle: string;
    description: string;
    coverImageUrl?: string;
    defaultLayout: "grid" | "masonry" | "editorial";
    enabledFilters: {
      medium: boolean;
      price: boolean;
      year: boolean;
      availability: boolean;
      collection: boolean;
    };
    defaultSort: "featured" | "newest" | "price_asc" | "price_desc";
  };
  collectionsPageConfig: {
    title: string;
    subtitle: string;
    description: string;
    coverImageUrl?: string;
    eyebrow?: string;
  };
  exhibitionsPageConfig: {
    title: string;
    subtitle: string;
    description: string;
    coverImageUrl?: string;
    eyebrow?: string;
  };
  aboutPageConfig: {
    intro: string;
    bio: string;
    artistImageUrl?: string;
    story?: string;
    philosophy?: string;
    process?: string;
    quote?: string;
    exhibitions?: Array<{ year: string; title: string; location: string }>;
    achievements?: string[];
    ctaText?: string;
    ctaUrl?: string;
  };
  contactPageConfig: {
    title: string;
    description: string;
    recipientEmail: string;
    officeAddress: string;
    openingHours: string;
    contactInstructions: string;
    formFields: {
      name: boolean;
      email: boolean;
      phone: boolean;
      message: boolean;
      artworkContext: boolean;
    };
    successMessage?: string;
  };
  legalPages: {
    privacyPolicy?: string;
    termsOfService?: string;
    cookiePolicy?: string;
    refundPolicy?: string;
    shippingPolicy?: string;
  };
  maintenanceMode: {
    isEnabled: boolean;
    title?: string;
    message?: string;
    expectedReturn?: string;
  };
  globalArDefaults: {
    defaultFrame: string;
    defaultScale: number;
    defaultPlacement: "wall" | "floor";
    defaultInstructions?: string;
    ctaLabel?: string;
    fallbackMessage?: string;
  };
  copyrightText: string;
}

export const DEFAULT_NAVIGATION_ITEMS = [
  { id: "nav-about", label: "About", href: "/about", isEnabled: true, order: 1 },
  { id: "nav-contact", label: "Contact", href: "/contact", isEnabled: true, order: 2 },
];

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  artistName: "Elena Vance",
  siteTitle: "L'Atelier Lumineux",
  shortBrandName: "L'Atelier",
  tagline: "Contemporary Fine Art Studio & WebAR Gallery",
  logoUrl: "",
  faviconUrl: "",
  bioSummary: "Contemporary fine artist exploring oceanic silence and mineral materiality.",
  statement: "A painting is an alteration of the atmospheric silence within a room.",
  contactEmail: "curator@latelier-lumineux.art",
  phone: "+33 1 42 68 55 00",
  whatsapp: "+33 6 12 34 56 78",
  location: "Paris & Brittany, France",
  address: "14 Rue de Beaune, 7th Arrondissement",
  city: "Paris",
  country: "France",
  businessHours: "Monday – Saturday: 10:00 – 19:00 (By Appointment)",
  contactInstructions: "For private acquisitions, curatorial loan requests, and press access, please correspond using our liaison desk.",
  socialLinks: {
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    artsy: "https://artsy.net",
  },
  announcementBar: {
    isEnabled: false,
    message: "",
    link: "",
    linkLabel: "",
    bg: "#18191e",
    textColor: "#d1a86e",
    dismissible: true,
  },
  headerConfig: {
    logoType: "text",
    logoText: "L'Atelier Lumineux",
    logoUrl: "",
    style: "transparent",
    showCta: true,
    ctaLabel: "Inquire",
    ctaUrl: "/contact",
  },
  navigationItems: DEFAULT_NAVIGATION_ITEMS,
  footerConfig: {
    description: "The independent studio and private gallery of contemporary artist Elena Vance. Dedicated to exploring lapis lazuli glazes, geological materiality, and true-scale spatial WebAR curation.",
    columns: [
      {
        title: "Explore",
        links: [
          { label: "All Artworks", href: "/gallery" },
          { label: "Curated Series", href: "/collections" },
          { label: "Exhibitions", href: "/exhibitions" },
          { label: "Artist Monologue & CV", href: "/about" },
          { label: "Acquisitions & Press", href: "/contact" },
        ],
      },
      {
        title: "Legal & Studio",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Acquisition", href: "/terms" },
          { label: "Collector Inquiries", href: "/contact" },
        ],
      },
    ],
    contactText: "curator@latelier-lumineux.art",
    copyrightText: "© 2026 Elena Vance Studio. All rights reserved.",
    showNewsletterCta: true,
  },
  galleryPageConfig: {
    title: "Original Canvases & Pigments",
    subtitle: "The Studio Catalogue",
    description: "Each painting is an original piece created using natural mineral pigments, French lapis lazuli glazes, and raw Belgian linen. Inquire for provenance or launch the 1:1 scale WebAR viewer.",
    coverImageUrl: "",
    defaultLayout: "grid",
    enabledFilters: {
      medium: true,
      price: true,
      year: true,
      availability: true,
      collection: true,
    },
    defaultSort: "featured",
  },
  collectionsPageConfig: {
    title: "Curated Series",
    subtitle: "Thematic Bodies of Work",
    description: "Elena Vance groups her artistic inquiries into multi-year cycles. Each series represents a focused exploration of specific pigments, geological binders, and spatial tensions.",
    coverImageUrl: "",
    eyebrow: "Thematic Bodies of Work",
  },
  exhibitionsPageConfig: {
    title: "Exhibitions",
    subtitle: "Public & Museum History",
    description: "Chronological record of curated solo exhibitions, biennale participations, and institutional showcases across Paris, New York, London, and Tokyo.",
    coverImageUrl: "",
    eyebrow: "Public & Museum History",
  },
  aboutPageConfig: {
    intro: "Biography & Studio Practice",
    bio: "Elena Vance is a contemporary fine artist whose paintings investigate the physics of optical depth, geological materiality, and oceanic stillness. Combining archaic mineral pigments—chiefly Afghan lapis lazuli and Roman pozzolana—with multi-layered stand-oil glazes on raw Belgian linen.",
    artistImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490",
    story: "Her studio practice resists the rapid consumption of images. Canvases are frequently held in progress across several seasons, receiving up to twenty gossamer layers of translucent stand-oil glaze.",
    philosophy: "A painting is not merely a depiction; it is an alteration of the atmospheric stillness and light acoustics within a room.",
    process: "Pure powdered lapis lazuli, crushed slate, cold-pressed walnut oil, and Belgian flax linen.",
    quote: "Light does not strike the surface; it penetrates the mineral stratums and is reflected from within.",
    exhibitions: [
      { year: "2026", title: "Luminous Stillness Retrospective", location: "Fondation d'Art Contemporain, Paris" },
      { year: "2025", title: "Mineral Stratum & Oceanic Silence", location: "Galerie Pompéi, Geneva" },
      { year: "2024", title: "The Blue Horizon: Spatial Canvases", location: "Chelsea Arts Pavilion, New York" },
    ],
    achievements: [
      "Lauréate du Prix Jean-François Millet pour la Peinture Contemporaine (2024)",
      "Permanent collection acquisition: Fondation d'Art Contemporain, Geneva",
      "ADAGP France Certified Contemporary Master (Registration #89421)",
    ],
    ctaText: "Contact Curatorial Office",
    ctaUrl: "/contact",
  },
  contactPageConfig: {
    title: "Inquiries & Acquisitions",
    description: "For private acquisitions, curatorial loan requests, and press access, please correspond using our studio liaison desk.",
    recipientEmail: "curator@latelier-lumineux.art",
    officeAddress: "14 Rue de Beaune, 7th Arrondissement, 75007 Paris, France",
    openingHours: "Monday – Saturday: 10:00 – 19:00 (By Appointment)",
    contactInstructions: "Every acquisition is accompanied by a signed Certificate of Authenticity and custom museum-grade crating.",
    formFields: {
      name: true,
      email: true,
      phone: true,
      message: true,
      artworkContext: true,
    },
    successMessage: "Thank you for your correspondence. The curatorial studio office will review your inquiry and respond within one business day.",
  },
  legalPages: {
    privacyPolicy: "We respect your collector privacy. Personal data submitted through inquiries or account registration is encrypted, never sold, and used solely for private studio correspondence, provenance records, and authenticated certificate delivery.",
    termsOfService: "All artworks displayed on this platform are original copyright-protected creations of Elena Vance. Authenticated certificates of authenticity are registered with ADAGP France upon completion of acquisition.",
    cookiePolicy: "This studio uses essential session cookies for collector authentication and anonymous telemetry to evaluate exhibition interest and true-scale AR room sessions. Camera data used in AR never leaves your local device.",
    refundPolicy: "Private collection acquisitions include a 14-day inspection period upon white-glove crated delivery. Inquiries regarding condition reports and international transit insurance are handled directly by the curatorial office.",
    shippingPolicy: "International museum-grade crating and climate-controlled freight are coordinated through specialized fine art logistics couriers (Crozier / Hasenkamp).",
  },
  maintenanceMode: {
    isEnabled: false,
    title: "Studio Under Curation",
    message: "L'Atelier Lumineux is currently undergoing curatorial updates for an upcoming retrospective exhibition. The digital gallery will resume normal visitor access shortly.",
    expectedReturn: "Returning Today at 18:00 CET",
  },
  globalArDefaults: {
    defaultFrame: "minimal_black",
    defaultScale: 1.0,
    defaultPlacement: "wall",
    defaultInstructions: "Point camera at a well-lit wall surface. Tap to position the canvas at true 1:1 physical scale.",
    ctaLabel: "View in Your Space",
    fallbackMessage: "AR requires a WebXR or camera-enabled mobile device. You can explore true-scale dimensions and virtual room views directly above.",
  },
  copyrightText: "© 2026 Elena Vance Studio. All rights reserved.",
};

export interface ThemeSettingsData {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  containerWidth: string;
  animationLevel: "minimal" | "standard" | "cinematic";
}

export const DEFAULT_THEME_SETTINGS: ThemeSettingsData = {
  primaryColor: "#d1a86e",
  accentColor: "#e2c18d",
  backgroundColor: "#0d0e12",
  foregroundColor: "#f4f4f6",
  headingFont: "Playfair Display",
  bodyFont: "Plus Jakarta Sans",
  borderRadius: "0.375rem",
  containerWidth: "1440px",
  animationLevel: "cinematic",
};

export const INITIAL_SITE_SETTINGS = DEFAULT_SITE_SETTINGS;

export const INITIAL_INQUIRIES: MockInquiry[] = [
  {
    id: "inq-1",
    artworkId: "art-1",
    artworkTitle: "Solitude in Ultramarine",
    name: "Arthur Pendelton",
    email: "a.pendelton@arch-advisors.ch",
    phone: "+41 22 819 4000",
    preferredContactMethod: "phone",
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
    preferredContactMethod: "email",
    subject: "Exhibition Loan Proposal for Autumn 2026",
    message: "Greetings Madame Vance. On behalf of the contemporary curatorial board, we would like to formally request 'Aurora at the Meridian' for our upcoming retrospective in Lyon.",
    status: "read" as const,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];
