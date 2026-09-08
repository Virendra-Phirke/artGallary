interface ArtworkAnnouncementEmailProps {
  artwork: {
    id: string;
    title: string;
    slug: string;
    description: string;
    medium: string;
    year: number;
    widthCm: string | number;
    heightCm: string | number;
    depthCm?: string | number | null;
    price?: string | number | null;
    currency?: string;
    coverImageUrl?: string | null;
  };
  recipientName?: string;
  artworkUrl: string;
  unsubscribeUrl: string;
  artistName?: string;
  galleryTitle?: string;
}

export function generateArtworkAnnouncementHtml(props: ArtworkAnnouncementEmailProps): string {
  const {
    artwork,
    recipientName = "Esteemed Collector",
    artworkUrl,
    unsubscribeUrl,
    artistName = "Vishal Patil",
    galleryTitle = "Seclusion Art Gallary",
  } = props;

  const formattedDimensions = `${artwork.widthCm} × ${artwork.heightCm}${
    artwork.depthCm ? ` × ${artwork.depthCm}` : ""
  } cm`;

  const formattedPrice = artwork.price
    ? `${artwork.currency || "USD"} ${Number(artwork.price).toLocaleString()}`
    : "Price on private inquiry";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Artwork Release: ${artwork.title} by ${artistName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #08090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e5e7eb;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #08090b;
      padding-bottom: 40px;
    }
    .main {
      background-color: #121318;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border: 1px solid #232530;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      padding: 32px 36px 24px;
      text-align: center;
      border-bottom: 1px solid #1c1e28;
    }
    .eyebrow {
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #d1a86e;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .gallery-brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      letter-spacing: 0.12em;
      color: #ffffff;
      text-transform: uppercase;
      font-weight: 400;
      margin: 0;
    }
    .hero-image-cell {
      padding: 24px 36px 12px;
      text-align: center;
    }
    .artwork-img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      border: 1px solid #262938;
      display: block;
      margin: 0 auto;
    }
    .content-cell {
      padding: 16px 36px 32px;
    }
    .artwork-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      line-height: 1.25;
      color: #ffffff;
      margin: 0 0 8px;
      text-align: center;
    }
    .artwork-meta-summary {
      font-size: 13px;
      color: #8e92a4;
      text-align: center;
      margin-bottom: 24px;
      letter-spacing: 0.05em;
    }
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #171821;
      border-radius: 8px;
      border: 1px solid #232532;
    }
    .specs-table td {
      padding: 12px 16px;
      font-size: 13px;
      border-bottom: 1px solid #1e202c;
    }
    .specs-table tr:last-child td {
      border-bottom: none;
    }
    .spec-label {
      color: #8e92a4;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.1em;
      width: 40%;
    }
    .spec-val {
      color: #f3f4f6;
      font-weight: 500;
      text-align: right;
    }
    .curator-note {
      font-size: 14px;
      line-height: 1.65;
      color: #c4c7d4;
      font-style: italic;
      border-left: 2px solid #d1a86e;
      padding-left: 16px;
      margin: 24px 0;
    }
    .btn-container {
      text-align: center;
      padding: 16px 0 24px;
    }
    .cta-btn {
      display: inline-block;
      background-color: #d1a86e;
      color: #0d0e12 !important;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
    }
    .footer {
      padding: 24px 36px 32px;
      background: #0d0e12;
      border-top: 1px solid #1c1e28;
      text-align: center;
      font-size: 11px;
      line-height: 1.6;
      color: #6c7082;
    }
    .footer a {
      color: #a6aabf;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 24px 12px 12px;">
          <table role="presentation" class="main" width="100%" cellpadding="0" cellspacing="0">
            <!-- Header -->
            <tr>
              <td class="header">
                <div class="eyebrow">Studio Dispatch • Private Acquisition Notice</div>
                <h1 class="gallery-brand">${galleryTitle}</h1>
                <div style="font-size: 12px; color: #8e92a4; margin-top: 4px;">${galleryTitle} &amp; Provenance Registry</div>
              </td>
            </tr>

            <!-- Cover Image -->
            ${
              artwork.coverImageUrl
                ? `<tr>
                    <td class="hero-image-cell">
                      <a href="${artworkUrl}" target="_blank">
                        <img src="${artwork.coverImageUrl}" alt="${artwork.title}" class="artwork-img" />
                      </a>
                    </td>
                  </tr>`
                : ""
            }

            <!-- Artwork Information -->
            <tr>
              <td class="content-cell">
                <p style="font-size: 13px; color: #a6aabf; margin: 0 0 12px;">
                  Salutations ${recipientName},
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #d1d5db; margin: 0 0 20px;">
                  We are pleased to announce the completion of a distinguished masterwork by <strong>${artistName}</strong>, now cataloged and available for private acquisition and true-scale spatial WebAR preview.
                </p>

                <h2 class="artwork-title">${artwork.title}</h2>
                <div class="artwork-meta-summary">${artwork.medium} (${artwork.year})</div>

                <!-- Specs -->
                <table role="presentation" class="specs-table">
                  <tr>
                    <td class="spec-label">Artist</td>
                    <td class="spec-val">${artistName}</td>
                  </tr>
                  <tr>
                    <td class="spec-label">Medium</td>
                    <td class="spec-val">${artwork.medium}</td>
                  </tr>
                  <tr>
                    <td class="spec-label">Dimensions</td>
                    <td class="spec-val">${formattedDimensions}</td>
                  </tr>
                  <tr>
                    <td class="spec-label">Acquisition Val.</td>
                    <td class="spec-val" style="color: #d1a86e;">${formattedPrice}</td>
                  </tr>
                  <tr>
                    <td class="spec-label">Provenance</td>
                    <td class="spec-val">ADAGP France Registered</td>
                  </tr>
                </table>

                <!-- Description -->
                ${
                  artwork.description
                    ? `<div class="curator-note">“${artwork.description}”</div>`
                    : ""
                }

                <!-- CTA -->
                <div class="btn-container">
                  <a href="${artworkUrl}" target="_blank" class="cta-btn">
                    View in Your Space & Inquire
                  </a>
                </div>

                <p style="font-size: 12px; line-height: 1.6; color: #8e92a4; text-align: center; margin: 0;">
                  Using your mobile browser, you may place <em>${artwork.title}</em> true-to-scale on your physical wall with 1:1 spatial augmented reality.
                </p>
              </td>
            </tr>

            <!-- Studio Footer -->
            <tr>
              <td class="footer">
                <p style="margin: 0 0 10px;">
                  <strong>${galleryTitle}</strong> • ${artistName}<br>
                  Contemporary Fine Art &amp; WebAR Gallery
                </p>
                <p style="margin: 0 0 10px;">
                  You received this email because your email address is registered for studio announcements and newly released artwork notifications.
                </p>
                <p style="margin: 0;">
                  <a href="${unsubscribeUrl}" target="_blank">Disable subscription / Unsubscribe</a>
                  &nbsp;•&nbsp;
                  <a href="${artworkUrl}" target="_blank">View online</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function generateArtworkAnnouncementText(props: ArtworkAnnouncementEmailProps): string {
  const {
    artwork,
    recipientName = "Esteemed Collector",
    artworkUrl,
    unsubscribeUrl,
    artistName = "Vishal Patil",
    galleryTitle = "Seclusion Art Gallary",
  } = props;

  const formattedDimensions = `${artwork.widthCm} × ${artwork.heightCm}${
    artwork.depthCm ? ` × ${artwork.depthCm}` : ""
  } cm`;

  const formattedPrice = artwork.price
    ? `${artwork.currency || "USD"} ${Number(artwork.price).toLocaleString()}`
    : "Price on private inquiry";

  return `STUDIO DISPATCH • ${galleryTitle.toUpperCase()}
New Artwork Release by ${artistName}

Salutations ${recipientName},

We are pleased to announce the completion of a distinguished masterwork by ${artistName}, now cataloged and available for private acquisition.

Artwork: ${artwork.title}
Year: ${artwork.year}
Medium: ${artwork.medium}
Dimensions: ${formattedDimensions}
Acquisition Valuation: ${formattedPrice}

${artwork.description ? `“${artwork.description}”\n` : ""}
Experience the artwork in true 1:1 spatial AR or submit a private acquisition inquiry:
${artworkUrl}

---
${galleryTitle} • ${artistName}
To modify your email preferences or unsubscribe from artwork dispatches:
${unsubscribeUrl}
`;
}
