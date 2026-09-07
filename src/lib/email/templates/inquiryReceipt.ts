interface InquiryEmailProps {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
  };
  artworkTitle?: string | null;
  artworkUrl?: string | null;
  artistName?: string;
  galleryTitle?: string;
  adminDashboardUrl?: string;
}

export function generateInquiryUserConfirmationHtml(props: InquiryEmailProps): string {
  const {
    inquiry,
    artworkTitle,
    artworkUrl,
    artistName = "Elena Vance",
    galleryTitle = "L'Atelier Lumineux",
  } = props;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Confirmation • ${galleryTitle}</title>
  <style>
    body {
      margin: 0; padding: 0; background-color: #08090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e5e7eb;
    }
    .main {
      background-color: #121318; margin: 24px auto; width: 100%; max-width: 580px;
      border: 1px solid #232530; border-radius: 12px; overflow: hidden;
    }
    .header {
      padding: 32px 36px 20px; text-align: center; border-bottom: 1px solid #1c1e28;
    }
    .brand {
      font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #ffffff;
      text-transform: uppercase; letter-spacing: 0.12em; margin: 0;
    }
    .body-cell { padding: 28px 36px; }
    .quote-box {
      background: #171821; border-left: 3px solid #d1a86e; padding: 14px 18px;
      margin: 20px 0; border-radius: 4px; font-size: 13px; color: #cbd5e1; line-height: 1.6;
    }
    .footer {
      padding: 20px 36px; background: #0d0e12; border-top: 1px solid #1c1e28;
      text-align: center; font-size: 11px; color: #6c7082;
    }
  </style>
</head>
<body>
  <div class="main">
    <div class="header">
      <div style="font-size: 10px; letter-spacing: 0.25em; color: #d1a86e; text-transform: uppercase; margin-bottom: 4px;">Private Studio Correspondence</div>
      <h1 class="brand">${galleryTitle}</h1>
    </div>
    <div class="body-cell">
      <p style="font-size: 14px; color: #f3f4f6; margin: 0 0 16px;">
        Dear ${inquiry.name},
      </p>
      <p style="font-size: 14px; line-height: 1.65; color: #a6aabf; margin: 0 0 16px;">
        Thank you for contacting ${artistName}’s curatorial studio. We have received your acquisition inquiry${
          artworkTitle ? ` regarding <strong>${artworkTitle}</strong>` : ""
        }.
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #8e92a4; margin: 0 0 12px;">
        Summary of your message:
      </p>
      <div class="quote-box">
        ${inquiry.subject ? `<div style="font-weight: 600; color: #f8fafc; margin-bottom: 6px;">Subject: ${inquiry.subject}</div>` : ""}
        “${inquiry.message}”
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #a6aabf; margin: 0 0 20px;">
        Our studio curator reviews every collector inquiry personally. You may expect a formal response within 24 to 48 hours.
      </p>
      ${
        artworkUrl
          ? `<div style="text-align: center; margin: 24px 0;">
              <a href="${artworkUrl}" style="background-color: #d1a86e; color: #0d0e12; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 12px 28px; border-radius: 9999px; display: inline-block;">
                View Artwork in Gallery
              </a>
            </div>`
          : ""
      }
    </div>
    <div class="footer">
      ${galleryTitle} • Elena Vance Curatorial Office<br>
      Paris & Brittany, France
    </div>
  </div>
</body>
</html>`;
}

export function generateCuratorInquiryAlertHtml(props: InquiryEmailProps): string {
  const {
    inquiry,
    artworkTitle,
    artworkUrl,
    galleryTitle = "L'Atelier Lumineux",
    adminDashboardUrl = "http://localhost:3000/admin/inquiries",
  } = props;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Collector Inquiry</title>
  <style>
    body { margin: 0; padding: 0; background: #0b0c10; font-family: sans-serif; color: #e2e8f0; }
    .card { max-width: 580px; margin: 20px auto; background: #13151b; border: 1px solid #2a2d3d; border-radius: 8px; padding: 24px; }
    .btn { display: inline-block; background: #d1a86e; color: #0d0e12; padding: 10px 20px; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #d1a86e; font-weight: 600;">Acquisitions Alert</div>
    <h2 style="color: #fff; margin: 8px 0 16px;">New Collector Inquiry Received</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
      <tr><td style="padding: 6px 0; color: #8e92a4; width: 120px;">Collector:</td><td style="color: #fff; font-weight: 500;">${inquiry.name}</td></tr>
      <tr><td style="padding: 6px 0; color: #8e92a4;">Email:</td><td><a href="mailto:${inquiry.email}" style="color: #d1a86e;">${inquiry.email}</a></td></tr>
      ${inquiry.phone ? `<tr><td style="padding: 6px 0; color: #8e92a4;">Phone:</td><td style="color: #fff;">${inquiry.phone}</td></tr>` : ""}
      ${artworkTitle ? `<tr><td style="padding: 6px 0; color: #8e92a4;">Artwork:</td><td style="color: #fff;"><strong>${artworkTitle}</strong></td></tr>` : ""}
      ${inquiry.subject ? `<tr><td style="padding: 6px 0; color: #8e92a4;">Subject:</td><td style="color: #fff;">${inquiry.subject}</td></tr>` : ""}
    </table>
    <div style="background: #1a1d26; padding: 14px; border-radius: 6px; border: 1px solid #242735; font-size: 13px; line-height: 1.6; color: #e2e8f0; margin-bottom: 24px;">
      ${inquiry.message}
    </div>
    <div>
      <a href="${adminDashboardUrl}" class="btn">Open Inquiries Ledger</a>
      ${artworkUrl ? `&nbsp;&nbsp;<a href="${artworkUrl}" style="color: #8e92a4; font-size: 12px;">View Artwork</a>` : ""}
    </div>
  </div>
</body>
</html>`;
}
