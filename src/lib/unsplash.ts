/**
 * Unsplash Media Service for Temporary / Curated Artwork Images
 * Supports direct Unsplash API with fallback to high-resolution curated contemporary art imagery.
 */

export interface UnsplashArtImage {
  id: string;
  title: string;
  author: string;
  authorUrl: string;
  authorUsername: string;
  imageUrl: string;
  thumbUrl: string;
  rawUrl: string;
  width: number;
  height: number;
  altText: string;
  blurHash?: string;
}

// Curated contemporary fine art catalog from Unsplash for instant zero-config use
export const CURATED_UNSPLASH_ART: UnsplashArtImage[] = [
  {
    id: "photo-1579783900882-c0d3dad7b119",
    title: "Solitude in Ultramarine",
    author: "Europeana",
    authorUsername: "europeana",
    authorUrl: "https://unsplash.com/@europeana",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
    width: 2400,
    height: 1714,
    altText: "Abstract expressionist painting featuring deep ultramarine blues and golden earth tones",
  },
  {
    id: "photo-1541701494587-cb58502866ab",
    title: "Aurora at the Meridian",
    author: "Steve Johnson",
    authorUsername: "steve_j",
    authorUrl: "https://unsplash.com/@steve_j",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
    width: 2400,
    height: 1800,
    altText: "Luminous fluid acrylic and resin study with amber, gold, and cerulean swirls",
  },
  {
    id: "photo-1577083552431-6e5fd01aa342",
    title: "Resonance in Granite No. 4",
    author: "Pawel Czerwinski",
    authorUsername: "pawel_czerwinski",
    authorUrl: "https://unsplash.com/@pawel_czerwinski",
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342",
    width: 2400,
    height: 1800,
    altText: "Textured mixed-media study with mineral pigments and raw impasto edges",
  },
  {
    id: "photo-1579783483458-83d02161294e",
    title: "The Silence of Amber",
    author: "Europeana",
    authorUsername: "europeana",
    authorUrl: "https://unsplash.com/@europeana",
    imageUrl: "https://images.unsplash.com/photo-1579783483458-83d02161294e?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1579783483458-83d02161294e?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1579783483458-83d02161294e",
    width: 2400,
    height: 1600,
    altText: "Constructivist geometric abstraction with muted ochre and Prussian blue planes",
  },
  {
    id: "photo-1518709268805-4e9042af9f23",
    title: "Nocturne with Ochre Glaze",
    author: "JR Korpa",
    authorUsername: "jrkorpa",
    authorUrl: "https://unsplash.com/@jrkorpa",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
    width: 2400,
    height: 1600,
    altText: "Subtle monochromatic oil study investigating low-light coastal twilight atmosphere",
  },
  {
    id: "photo-1547891654-e66ed7ebb968",
    title: "Vestige of Salt and Iron",
    author: "Pawel Czerwinski",
    authorUsername: "pawel_czerwinski",
    authorUrl: "https://unsplash.com/@pawel_czerwinski",
    imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968",
    width: 2400,
    height: 1800,
    altText: "Oxidized iron pigment and chalk grounds exploring natural erosion on canvas",
  },
  {
    id: "photo-1578301978693-85fa9c0320b9",
    title: "Passage Through Ochre",
    author: "Birmingham Museums Trust",
    authorUsername: "birminghammuseumstrust",
    authorUrl: "https://unsplash.com/@birminghammuseumstrust",
    imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9",
    width: 2400,
    height: 1714,
    altText: "Atmospheric landscape study with misty horizon and warm amber glazes",
  },
  {
    id: "photo-1561214115-f2f134cc4912",
    title: "Cantata in Verdigris",
    author: "Steve Johnson",
    authorUsername: "steve_j",
    authorUrl: "https://unsplash.com/@steve_j",
    imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912",
    width: 2400,
    height: 1800,
    altText: "Oxidized copper verdigris and gold leaf impasto on raw linen canvas",
  },
  {
    id: "photo-1536924940846-227afb31e2a5",
    title: "Liminal Light Study",
    author: "Europeana",
    authorUsername: "europeana",
    authorUrl: "https://unsplash.com/@europeana",
    imageUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5",
    width: 2400,
    height: 1600,
    altText: "Soft diffused morning light through gallery studio window with paint dust",
  },
  {
    id: "photo-1579783900882-c0d3dad7b119",
    title: "Cobalt and Venetian Red",
    author: "Europeana",
    authorUsername: "europeana",
    authorUrl: "https://unsplash.com/@europeana",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
    rawUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
    width: 2400,
    height: 1800,
    altText: "Intense cobalt blue and Venetian red brush gestures on primed gesso",
  },
];

/**
 * Search or retrieve Unsplash contemporary art images.
 * Uses official Unsplash API when UNSPLASH_ACCESS_KEY is set; otherwise falls back to curated catalog.
 */
export async function getUnsplashArtImages(options?: {
  query?: string;
  count?: number;
}): Promise<UnsplashArtImage[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const count = options?.count || 8;
  const query = options?.query || "contemporary art oil painting";

  if (accessKey) {
    try {
      const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=${count}&orientation=landscape`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          return data.results.map((item: any) => ({
            id: item.id,
            title: item.description || item.alt_description || "Untitled Composition",
            author: item.user?.name || "Unsplash Artist",
            authorUsername: item.user?.username || "",
            authorUrl: item.user?.links?.html || "https://unsplash.com",
            imageUrl: `${item.urls.raw}&auto=format&fit=crop&w=1600&q=85`,
            thumbUrl: `${item.urls.raw}&auto=format&fit=crop&w=400&q=80`,
            rawUrl: item.urls.raw,
            width: item.width || 2400,
            height: item.height || 1800,
            altText: item.alt_description || item.description || "Contemporary fine art",
            blurHash: item.blur_hash,
          }));
        }
      }
    } catch (err) {
      console.warn("Unsplash API fetch failed, falling back to curated art catalog:", err);
    }
  }

  // Curated Fallback
  if (options?.query) {
    const q = options.query.toLowerCase();
    const filtered = CURATED_UNSPLASH_ART.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.altText.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
    );
    if (filtered.length > 0) {
      return filtered.slice(0, count);
    }
  }

  return CURATED_UNSPLASH_ART.slice(0, count);
}
