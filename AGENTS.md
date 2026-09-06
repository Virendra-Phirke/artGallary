# AGENTS.md

# AI Engineering Guidelines — Art Gallery + AR Platform

## 1. Project Overview

This repository contains a production-grade digital art gallery platform for a **single independent artist / art shop**.

The product has three major surfaces:

1. **Public Gallery**
   - Visitors can browse artwork without an account.
   - Visitors can search, filter, explore collections and exhibitions, read about the artist, and view artwork details.
   - Visitors can launch an AR experience to preview artwork in their physical environment.
   - Visitors only need an account when they want to contact the artist.

2. **User Account**
   - Email/password authentication through Better Auth.
   - Users can manage their profile and view their own inquiries.
   - Authentication must never be required merely to browse artwork or use AR.

3. **Admin CMS**
   - The artist/admin can manage artwork, media, collections, exhibitions, homepage content, theme, accessibility, AR configuration, SEO, inquiries, analytics, activity logs, and settings.

The product should feel like a **premium contemporary art gallery with a private CMS and polished AR showroom**, not a generic SaaS dashboard.

---

# 2. Core Architecture

Use a modular monorepo architecture.

```text
                         ┌──────────────────────┐
                         │       Visitor        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Next.js         │
                         │ Public + Admin UI    │
                         └──────────┬───────────┘
                                    │
                              HTTPS / REST
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Fastify API      │
                         │                      │
                         │ Auth                 │
                         │ Authorization        │
                         │ Validation           │
                         │ Business Logic       │
                         │ Rate Limiting        │
                         │ Storage Orchestration│
                         └───────┬───────┬──────┘
                                 │       │
                         ┌───────┘       └────────┐
                         ▼                         ▼
                 ┌───────────────┐         ┌───────────────┐
                 │ Neon          │         │ Cloudflare R2 │
                 │ PostgreSQL    │         │ Artwork Media │
                 │ + Drizzle     │         └───────────────┘
                 └───────────────┘
```

AR is client-side:

```text
Artwork Metadata
       ↓
Next.js
       ↓
Three.js / React Three Fiber
       ↓
WebXR / Browser AR
       ↓
Device Camera
       ↓
Physical Environment
```

Camera data must remain on the user's device whenever technically possible.

---

# 3. Mandatory Technology Stack

## Frontend

- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Motion

## Backend

- Node.js
- Fastify
- TypeScript
- REST API

## Database

- Neon PostgreSQL
- Drizzle ORM

## Authentication

- Better Auth
- Email + password only

Do not add Google OAuth, GitHub OAuth, Clerk, Firebase Auth, or other authentication providers unless explicitly requested.

## Storage

- Cloudflare R2
- Sharp for image processing

Artwork binaries must not be stored in PostgreSQL.

## Validation

- Zod
- React Hook Form

## Email

- Resend

## Analytics

- Vercel Analytics

Keep analytics abstract enough that another provider such as PostHog can be added later without rewriting the application.

## AR / 3D

- Three.js
- React Three Fiber
- WebXR where supported
- Browser-compatible AR fallback

## Testing

- Vitest
- Playwright
- axe accessibility testing
- ESLint accessibility rules

## Deployment

- Vercel for Next.js
- Suitable Node.js hosting for Fastify
- Neon PostgreSQL
- Cloudflare R2

---

# 4. Repository Structure

Prefer a pnpm workspace / monorepo structure:

```text
/
├── apps/
│   ├── web/
│   │   └── Next.js application
│   │
│   └── api/
│       └── Fastify application
│
├── packages/
│   ├── db/
│   │   └── Drizzle schema + database utilities
│   ├── auth/
│   │   └── Better Auth configuration
│   ├── validation/
│   │   └── Shared Zod schemas
│   ├── types/
│   │   └── Shared domain types
│   └── config/
│       └── Shared configuration
│
├── AGENTS.md
├── CLAUDE.md
├── package.json
└── pnpm-workspace.yaml
```

Keep domain logic modular.

Do not create giant files such as:

```text
routes.ts
utils.ts
helpers.ts
components.tsx
```

containing unrelated functionality.

---

# 5. General Engineering Principles

Always prioritize:

1. Security
2. Correctness
3. Accessibility
4. Performance
5. Maintainability
6. User experience

Do not optimize for the smallest amount of code.

Do not introduce unnecessary abstractions.

Do not introduce a new technology unless there is a clear architectural reason.

Do not rewrite working functionality without justification.

---

# 6. Before Modifying Code

Before changing code:

1. Inspect the repository.
2. Understand the current architecture.
3. Read relevant files.
4. Identify existing patterns.
5. Check related database schemas.
6. Check existing API contracts.
7. Check existing tests.
8. Reuse existing components and utilities when appropriate.
9. Determine security and accessibility implications.

Do not blindly replace entire files.

Prefer focused, coherent changes.

---

# 7. TypeScript Rules

Use strict TypeScript.

Avoid `any`.

Prefer `unknown` with proper narrowing when the type is genuinely unknown.

Do not silence compiler errors with unsafe assertions.

Bad:

```ts
const artwork = response as Artwork;
```

Prefer schema validation or properly typed API responses.

Avoid unnecessary non-null assertions:

```ts
value!
```

Use explicit validation where possible.

---

# 8. Frontend Architecture

Next.js Server Components are the default.

Use Client Components only when necessary for:

- browser APIs
- camera
- AR
- Three.js
- interactive state
- gestures
- interactive forms
- client-only animations

Do not add `"use client"` to entire pages unnecessarily.

Keep business logic out of presentation components.

Preferred:

```text
UI
 ↓
API client / server action
 ↓
Fastify
 ↓
Database
```

Do not allow UI components to contain direct database access.

---

# 9. Backend Architecture

Fastify is the authoritative business and security layer.

Backend responsibilities:

- authentication
- authorization
- request validation
- business rules
- database access
- storage authorization
- signed upload URLs
- rate limiting
- email orchestration
- audit logging

Organize backend modules by domain:

```text
apps/api/
├── modules/
│   ├── auth/
│   ├── artworks/
│   ├── collections/
│   ├── exhibitions/
│   ├── homepage/
│   ├── theme/
│   ├── accessibility/
│   ├── media/
│   ├── ar/
│   ├── inquiries/
│   ├── analytics/
│   └── admin/
├── plugins/
├── middleware/
├── lib/
└── server.ts
```

Do not create a single giant route file.

---

# 10. API Rules

Use versioned APIs:

```text
/api/v1
```

Use resource-oriented REST.

Examples:

```text
GET    /api/v1/artworks
GET    /api/v1/artworks/:slug
POST   /api/v1/artworks
PATCH  /api/v1/artworks/:id
DELETE /api/v1/artworks/:id
POST   /api/v1/artworks/:id/publish

GET    /api/v1/collections
POST   /api/v1/collections
PATCH  /api/v1/collections/:id

POST   /api/v1/inquiries
GET    /api/v1/admin/inquiries
PATCH  /api/v1/admin/inquiries/:id
```

Validate:

- body
- query parameters
- path parameters
- headers where relevant

Never trust client-provided:

- role
- ownership
- permissions
- status transitions
- IDs without validation

---

# 11. Authentication

Use Better Auth.

Authentication method:

```text
Email + Password
```

No OAuth in the initial product.

Public visitors do not need authentication to:

- browse
- search
- view artwork
- view collections
- view exhibitions
- use AR
- read artist information

Authentication is required for contacting the artist.

Required flow:

```text
Visitor
 ↓
Contact Artist
 ↓
Authenticated?
 ├── YES → Contact form
 │
 └── NO
      ↓
   Login/Register
      ↓
   Return to contact flow
      ↓
   Submit inquiry
```

Preserve the intended destination and form state whenever practical.

Never discard a message the user already typed.

---

# 12. Authorization

Use two application roles:

```text
USER
ADMIN
```

Authorization must be server-side.

Never trust:

```json
{
  "role": "ADMIN"
}
```

from the client.

Every admin operation must verify:

```text
Request
 ↓
Valid session
 ↓
User exists
 ↓
Role = ADMIN
 ↓
Permission check
 ↓
Input validation
 ↓
Business rule validation
 ↓
Database mutation
```

Do not rely on route hiding or frontend role checks as security.

---

# 13. Admin Security

Admin should use:

- secure session handling
- strict authorization
- rate limiting
- audit logs

Strongly prefer admin 2FA when supported by the selected Better Auth configuration.

Normal users remain email/password only.

Never log:

- passwords
- session tokens
- access tokens
- API keys
- storage secrets

---

# 14. Database

Use Neon PostgreSQL with Drizzle.

Core Better Auth tables:

- user
- session
- account
- verification

Application tables should include at minimum:

- artworks
- artwork_images
- artwork_ar
- collections
- collection_artworks
- exhibitions
- exhibition_artworks
- homepage_sections
- theme_settings
- accessibility_settings
- site_settings
- inquiries
- media
- analytics_events
- activity_logs
- content_versions

Use:

- foreign keys
- indexes
- unique constraints
- check constraints
- enums where appropriate
- created_at / updated_at timestamps

Never construct SQL using string concatenation.

---

# 15. Artwork Data Model

Artwork should support:

- id
- title
- slug
- description
- long_description
- year
- medium
- width
- height
- depth
- price
- currency
- status
- cover image
- additional images
- alt text
- collection
- exhibition
- AR configuration
- SEO metadata
- publication timestamp
- created timestamp
- updated timestamp

Artwork statuses:

```text
draft
published
reserved
sold
archived
```

Use soft-delete/archive where practical instead of irreversible deletion.

---

# 16. Collection and Exhibition Models

Collections should support:

- title
- slug
- description
- cover image
- artwork ordering
- publication state
- SEO metadata

Exhibitions should support:

- title
- slug
- description
- location
- start date
- end date
- cover image
- artwork ordering
- publication state
- SEO metadata

Do not duplicate artwork records just to associate them with collections/exhibitions.

Use relationships.

---

# 17. Cloudflare R2

Use R2 for:

```text
artworks/
  {artwork-id}/
    original/
    optimized/
    thumbnails/
    ar/

artists/
exhibitions/
site/
```

Neon stores metadata.

R2 stores files.

Never expose:

```text
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
```

to the browser.

---

# 18. Upload Architecture

Preferred upload flow:

```text
Admin
 ↓
Next.js
 ↓
Fastify
 ↓
Authenticate + authorize
 ↓
Generate signed upload URL
 ↓
Browser uploads directly to R2
 ↓
Backend registers/validates metadata
 ↓
Neon
```

Avoid routing large image binaries through the backend unless necessary.

---

# 19. Image Security

Do not trust:

- filename
- extension
- client MIME type

Validate:

- file size
- actual file signature / magic bytes
- actual MIME type
- image dimensions
- image integrity

Supported formats initially:

- JPEG
- PNG
- WebP
- AVIF

Process with Sharp.

Generate optimized variants and thumbnails.

Reject unsupported, corrupt, suspicious, or oversized uploads.

---

# 20. Public Routes

Expected public routes:

```text
/
 /gallery
 /artwork/[slug]
 /collections
 /collections/[slug]
 /exhibitions
 /exhibitions/[slug]
 /about
 /contact
 /ar/[artworkId]
 /login
 /register
 /forgot-password
 /reset-password
 /account
 /account/inquiries
```

Exact route structure may be adapted to the implementation.

---

# 21. Admin Routes

Expected admin routes:

```text
/admin
/admin/dashboard
/admin/artworks
/admin/artworks/new
/admin/artworks/[id]
/admin/collections
/admin/exhibitions
/admin/homepage
/admin/appearance
/admin/accessibility
/admin/ar-studio
/admin/qr-codes
/admin/media
/admin/inquiries
/admin/analytics
/admin/seo
/admin/activity
/admin/settings
```

Protect all admin routes server-side.

---

# 22. Public Homepage

Homepage sections should include:

1. Hero
2. Featured artworks
3. Latest collection
4. Artist story
5. AR experience
6. Featured exhibition
7. Contact CTA
8. Footer

Admin should be able to:

- enable/disable sections
- edit content
- change images
- change CTAs
- reorder controlled sections
- preview
- publish

Do not build an unrestricted page builder.

Use predefined, reusable sections.

---

# 23. Gallery

Gallery must support:

- responsive artwork grid
- search
- collection filtering
- status/availability filtering where appropriate
- sorting
- pagination or infinite loading
- optimized images
- lazy loading
- keyboard navigation
- accessible focus states

Artwork remains the visual priority.

---

# 24. Artwork Detail Page

Display:

- large artwork image
- additional images
- title
- description
- medium
- year
- dimensions
- availability
- collection
- exhibition where applicable
- artist information
- AR CTA
- contact CTA
- sharing

Primary AR CTA:

```text
View in Your Space
```

Avoid using "AR" as the only user-facing explanation.

---

# 25. AR Core Requirement

The initial AR feature is:

> Place a 2D artwork on a real wall/environment.

Normal paintings are not converted into 3D models.

Use a plane with the correct artwork aspect ratio.

Example:

```text
Physical artwork:
120 cm × 80 cm

AR plane:
120 : 80
```

Never distort artwork proportions.

---

# 26. AR User Flow

```text
Artwork Page
 ↓
View in Your Space
 ↓
Check capabilities
 ↓
Request camera permission
 ↓
Initialize AR
 ↓
Detect suitable surface
 ↓
Show placement indicator
 ↓
User taps surface
 ↓
Artwork appears
 ↓
User moves/scales/rotates
 ↓
Reset / Exit
```

Do not request camera permission before the user explicitly starts the AR experience.

---

# 27. AR Interaction

Where supported:

```text
Drag → move
Pinch → scale
Two-finger rotation → rotate
Reset → restore initial placement
Exit → leave AR
```

Preserve artwork aspect ratio during scaling.

Do not permit arbitrary distortion.

---

# 28. AR Privacy

Camera data must not be uploaded to the backend.

Do not store camera frames.

Do not implement server-side camera processing for basic artwork placement.

Explain clearly:

> Your camera is used to place the artwork in your space. Camera data is not uploaded.

Use the minimum permissions required.

---

# 29. AR Fallback

Not every browser/device supports the same AR capabilities.

If AR is unavailable:

```text
AR unavailable
 ↓
Interactive Preview
```

Fallback can provide:

- simulated wall/room
- artwork placement
- scale
- rotation
- physical dimension reference

Never display a broken camera interface.

Explain why AR is unavailable when useful.

---

# 30. AR Admin Configuration

Per artwork support:

- AR enabled/disabled
- physical width
- physical height
- default scale
- default rotation
- frame enabled/disabled
- frame style
- AR instructions
- AR readiness status

Display:

```text
AR READY
```

or:

```text
NEEDS ATTENTION
```

Validation examples:

```text
✓ Artwork image available
✓ Physical dimensions available
✓ Aspect ratio valid
✓ Image resolution sufficient
✓ AR configuration complete
```

---

# 31. AR Performance

Never load AR dependencies globally.

Use dynamic imports.

Optimize:

- textures
- image resolution
- memory
- device pixel ratio
- render loop
- resource disposal

Pause or dispose AR resources when the experience exits.

Do not initialize Three.js on ordinary gallery pages.

---

# 32. Optional Frames

Support optional virtual frames.

Possible composition:

```text
Artwork
+
Frame
+
Optional glass/reflection
+
Small physical depth
```

Frames must be optional per artwork.

Do not force the same frame on every artwork.

---

# 33. Admin Dashboard

Dashboard should be action-oriented.

Metrics:

- total artworks
- published artworks
- drafts
- reserved artworks
- sold artworks
- inquiries
- visitors
- AR sessions
- AR success rate

Attention panel:

```text
3 artworks missing alt text
2 artworks missing physical dimensions
1 artwork has incomplete AR configuration
4 drafts waiting for publication
```

Warnings should link directly to the affected resources.

---

# 34. Artwork CMS

Support:

- create
- edit
- duplicate
- publish
- unpublish
- archive
- search
- filter
- sort
- reorder
- bulk publish
- bulk archive
- bulk collection assignment
- bulk AR enable/disable

Use confirmation dialogs for destructive actions.

Prefer archive over permanent deletion.

---

# 35. Publishing

Use:

```text
Draft
 ↓
Preview
 ↓
Validation
 ↓
Publish
```

Before publishing, validate:

- title
- description
- cover image
- alt text
- dimensions
- image validity
- SEO information
- AR configuration if enabled

Show actionable errors.

---

# 36. Theme Management

Use design tokens:

```text
--background
--foreground
--surface
--surface-muted
--accent
--border
--muted
--focus
--success
--danger
```

Admin can manage:

- colors
- heading font
- body font
- radius
- container width
- animation level

Animation levels:

```text
Minimal
Standard
Cinematic
```

Do not allow arbitrary JavaScript injection.

Do not allow unsafe arbitrary CSS injection.

---

# 37. Accessibility

Target:

**WCAG 2.2 AA**

Implement:

- semantic HTML
- keyboard navigation
- visible focus indicators
- screen reader support
- correct heading hierarchy
- accessible labels
- accessible dialogs
- accessible forms
- sufficient color contrast
- reduced motion
- touch-friendly controls
- meaningful alt text
- long descriptions for complex artworks

Use:

- eslint-plugin-jsx-a11y
- axe
- manual keyboard testing
- screen reader testing

---

# 38. Accessibility Dashboard

Admin should see accessibility issues:

```text
Accessibility

✓ Contrast
✓ Heading hierarchy
✓ Form labels

Warnings:
⚠ 3 artworks missing alt text
⚠ 2 artworks missing long descriptions
```

Provide direct links to fix issues.

---

# 39. Motion Guidelines

Use Motion for:

- page transitions
- artwork reveals
- image transitions
- subtle parallax
- modal transitions
- AR entrance transitions

Respect:

```text
prefers-reduced-motion
```

When reduced motion is enabled:

- remove non-essential animation
- disable parallax
- avoid continuous motion
- shorten transitions

Avoid:

- animation everywhere
- constant floating effects
- excessive cursor effects
- distracting transitions

---

# 40. UI Guidelines

The public interface should feel:

- premium
- editorial
- minimalist
- artistic
- spacious
- typography-focused

Prefer:

- large artwork imagery
- strong typography
- generous whitespace
- restrained controls
- subtle transitions

Avoid:

- generic SaaS dashboard aesthetics on the public site
- excessive glassmorphism
- excessive gradients
- excessive shadows
- noisy backgrounds
- excessive cards
- gimmicky interactions

The artwork must remain the hero.

---

# 41. Typography

Use an editorial serif for major headings and a clean sans-serif for body text.

Example direction:

```text
Headings: Playfair Display or equivalent
Body: Inter or equivalent
```

Typography must remain readable and accessible.

---

# 42. Contact / Inquiry

Contact requires authentication.

Inquiry flow:

```text
User
 ↓
Authenticated
 ↓
Contact form
 ↓
Zod validation
 ↓
Rate limit
 ↓
Create inquiry
 ↓
Notify artist
 ↓
Confirm to user
```

Inquiry statuses:

```text
new
read
replied
closed
```

Protect inquiry data from unauthorized users.

Users can only access their own inquiries.

Admins can access all inquiries.

---

# 43. Email

Use Resend.

User:

```text
Your inquiry has been received.
```

Admin:

```text
New artwork inquiry received.
```

Never expose the Resend API key to the browser.

---

# 44. QR Codes

Admin should be able to generate QR codes for artwork pages.

Example:

```text
/artwork/{slug}
```

Optional future destination:

```text
/ar/{artworkId}
```

Support:

- generate
- preview
- regenerate
- print/download

---

# 45. SEO

Implement:

- page metadata
- canonical URLs
- sitemap.xml
- robots.txt
- Open Graph
- social previews
- structured data
- breadcrumbs

Artwork pages must be individually indexable.

Use appropriate structured data for:

- Website
- Person/Artist
- Artwork/Image
- Breadcrumbs
- Collections where appropriate

---

# 46. Analytics

Track privacy-conscious events:

```text
page_view
artwork_view
collection_view
exhibition_view
ar_open
ar_success
ar_exit
inquiry_started
inquiry_sent
```

Do not collect unnecessary personal information.

Do not send camera frames.

---

# 47. Rate Limiting

Rate-limit:

- login
- registration
- password reset
- inquiry creation
- media upload
- admin mutations
- analytics ingestion

Use stricter limits for authentication.

Do not aggressively rate-limit ordinary artwork browsing.

---

# 48. XSS Prevention

Never render unsanitized admin HTML.

Avoid:

```tsx
dangerouslySetInnerHTML
```

unless the content has been explicitly sanitized and there is a documented reason.

Prefer structured content or safe markdown/rich-text handling.

---

# 49. Security Headers

Configure appropriate:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- appropriate frame restrictions

CSP must explicitly account for:

- Next.js
- Three.js
- R2
- fonts
- analytics
- AR requirements

Do not use permissive directives just to bypass errors.

---

# 50. Environment Variables

Use environment variables for secrets.

Example:

```text
DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

RESEND_API_KEY=
```

Never commit real secrets.

Never expose private credentials using `NEXT_PUBLIC_*`.

Do not commit `.env` files containing real credentials.

---

# 51. Caching

Cache public content where appropriate.

Public artwork/collection/exhibition content can use Next.js caching/revalidation.

After admin mutations:

```text
Database updated
 ↓
Invalidate relevant cache
 ↓
Public content refreshes
```

Do not serve stale published content indefinitely.

---

# 52. Error Handling

Never expose:

- stack traces
- SQL errors
- internal service details
- secret values

to users.

Use friendly error messages.

Examples:

```text
Something went wrong.
Please try again.
```

For AR:

```text
AR isn't supported on this device.
Try the interactive preview instead.
```

Include retry actions where appropriate.

---

# 53. Loading and Empty States

Use skeletons for:

- gallery
- artwork details
- dashboard
- admin tables
- media library

Use progress indicators for:

- uploads
- image processing
- publishing
- AR initialization

Create intentional empty states.

Never show unexplained blank screens.

---

# 54. Performance

Target:

```text
LCP < 2.5s
INP < 200ms
CLS < 0.1
```

Optimize:

- images
- fonts
- JavaScript
- database queries
- caching
- R2 delivery

Use Next.js Image where appropriate.

Do not load heavy 3D/AR dependencies globally.

---

# 55. Responsive Design

Design mobile-first.

Test:

- Android Chrome
- Android Firefox
- iOS Safari
- iOS Chrome
- Chrome desktop
- Firefox
- Edge
- Safari

Pay particular attention to:

- camera permissions
- AR
- touch gestures
- orientation
- low-memory devices
- slow networks
- image loading

---

# 56. Testing

## Unit Tests

Test:

- validation
- permissions
- business rules
- dimensions
- status transitions
- utilities

## Integration Tests

Test:

- authentication
- authorization
- artwork CRUD
- publishing
- uploads
- inquiries
- theme mutations

## E2E Tests

Use Playwright.

Test:

- visitor browsing
- artwork viewing
- registration
- login
- contact flow
- admin login
- artwork creation
- artwork publishing
- theme editing
- AR launch

## Accessibility

Use:

- axe
- keyboard testing
- screen reader testing

## AR

Test on real supported mobile devices.

Desktop browser emulation is not sufficient.

---

# 57. CI/CD

Use GitHub Actions.

Recommended pipeline:

```text
Push
 ↓
Install
 ↓
Typecheck
 ↓
Lint
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Build
 ↓
Security Checks
 ↓
Deploy
```

Use separate:

- development
- preview/staging
- production

Never use the production database for local development.

---

# 58. Git Rules

Use conventional commit messages.

Examples:

```text
feat: add artwork management
fix: prevent unauthorized artwork updates
perf: optimize gallery image loading
refactor: extract artwork validation
test: add artwork publishing tests
docs: update AR architecture
```

Never commit:

- `.env`
- secrets
- credentials
- unnecessary build artifacts

---

# 59. Dependency Rules

Before adding a dependency, ask:

1. Is it actually necessary?
2. Does the existing stack already solve the problem?
3. Is it maintained?
4. What is the bundle-size impact?
5. What are the security implications?

Do not install libraries merely because they are popular.

---

# 60. Avoid Overengineering

This is a single-artist platform.

Do not introduce without a concrete requirement:

- microservices
- Kubernetes
- event buses
- Redis
- Kafka
- multiple databases
- GraphQL
- complex queues
- unnecessary background workers

The architecture should be extensible without being unnecessarily complex.

---

# 61. Implementation Phases

Implement in this order.

## Phase 1 — Architecture

Define:

- repository structure
- database schema
- API contracts
- route map
- authorization matrix
- storage architecture
- AR architecture
- design tokens

## Phase 2 — Foundation

Build:

- Next.js
- Fastify
- TypeScript
- Tailwind
- shadcn/ui
- Drizzle
- Neon connection
- environment configuration
- security foundations

## Phase 3 — Authentication

Build:

- registration
- login
- logout
- session
- email verification
- password reset
- roles
- admin authorization

## Phase 4 — Storage

Build:

- R2
- signed upload URLs
- upload validation
- Sharp processing
- thumbnails
- media library

## Phase 5 — CMS

Build:

- artwork management
- collections
- exhibitions
- homepage
- theme
- accessibility settings

## Phase 6 — Public Gallery

Build:

- homepage
- gallery
- artwork detail
- collections
- exhibitions
- about
- account
- contact

## Phase 7 — Admin Dashboard

Build:

- dashboard
- artwork CMS
- collection management
- exhibition management
- homepage management
- appearance
- accessibility
- media
- inquiries

## Phase 8 — AR Prototype

Start with one hardcoded artwork.

Verify:

- camera
- surface detection
- placement
- scale
- rotation
- reset
- exit
- fallback

Test on real devices.

## Phase 9 — AR Integration

Connect AR to:

- artwork metadata
- physical dimensions
- R2 images
- frame configuration

## Phase 10 — QR

Build artwork QR generation.

## Phase 11 — Accessibility

Perform WCAG 2.2 AA review.

## Phase 12 — SEO + Analytics

Implement metadata, structured data, sitemap, robots, and analytics.

## Phase 13 — Security Audit

Review:

- auth
- authorization
- uploads
- XSS
- CSRF/origin protections
- rate limiting
- CSP
- R2 permissions
- secrets
- admin operations

## Phase 14 — Performance

Optimize:

- images
- JavaScript
- database
- caching
- AR
- mobile performance

## Phase 15 — Production

Configure:

- production Neon
- production R2
- Better Auth
- Resend
- domain
- HTTPS
- analytics
- monitoring

---

# 62. MVP Scope

MVP must include:

- premium homepage
- gallery
- artwork pages
- collections
- exhibitions
- about
- contact
- Better Auth
- admin dashboard
- artwork CMS
- collection management
- homepage management
- theme management
- R2 storage
- image optimization
- AR wall placement
- AR fallback
- inquiry management
- basic analytics
- SEO
- accessibility
- security hardening

Do not implement advanced computer vision in the MVP.

---

# 63. Future Features

Design extension points for:

- image recognition
- physical artwork scanning
- AR hotspots
- audio narration
- virtual exhibitions
- favorites
- social sharing
- advanced analytics
- multiple frame styles
- 3D sculptures
- multiple artists

Do not implement these unless explicitly requested.

---

# 64. Definition of Done

A feature is not complete because its UI exists.

A feature is complete only when applicable:

- frontend implemented
- backend implemented
- validation exists
- authorization exists
- errors handled
- loading state handled
- empty state handled
- accessibility considered
- tests added
- security reviewed
- responsive behavior verified
- performance considered

---

# 65. AI Agent Behavior

When working on this repository:

- Inspect before modifying.
- Read relevant files.
- Understand existing patterns.
- Reuse abstractions.
- Keep changes focused.
- Do not create fake functionality.
- Do not hardcode secrets.
- Do not bypass authorization.
- Do not disable tests or linting to make CI pass.
- Do not use `any` to hide type problems.
- Do not silently remove existing functionality.
- Explain important architectural decisions briefly.
- Prefer robust solutions over quick hacks.

If requirements are ambiguous, choose the solution that best preserves:

```text
Security
Accessibility
Performance
Maintainability
User Experience
```

---

# 66. Task Completion Checklist

Before declaring a task complete:

```text
[ ] TypeScript passes
[ ] ESLint passes
[ ] Relevant tests pass
[ ] Build succeeds
[ ] No secrets exposed
[ ] Authorization verified
[ ] Input validation verified
[ ] Error handling verified
[ ] Loading states verified
[ ] Empty states verified
[ ] Accessibility considered
[ ] Mobile layout verified
[ ] Performance considered
[ ] Documentation updated when architecture changed
```

For AR:

```text
[ ] Real mobile device tested
[ ] Camera permission tested
[ ] Surface placement tested
[ ] Scaling tested
[ ] Rotation tested
[ ] Reset tested
[ ] Exit tested
[ ] Fallback tested
[ ] Camera data is not uploaded
```

---

# 67. Final Product Principle

The final application should feel like:

> A premium contemporary art gallery combined with a secure private CMS and polished AR showroom.

The artwork is always the primary visual focus.

Technology should support the artwork, not compete with it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
