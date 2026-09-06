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
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
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
