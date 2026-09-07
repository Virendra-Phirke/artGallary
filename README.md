# 🏛️ L'Atelier Lumineux — Digital Art Gallery & AR Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM_0.45-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis_Cache-00E599?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/docs/redis/overall/getstarted)
[![Upstash QStash](https://img.shields.io/badge/Upstash-QStash_Queue-FF4F81?style=for-the-badge&logo=serverless&logoColor=white)](https://upstash.com/docs/qstash/overall/getstarted)
[![Resend](https://img.shields.io/badge/Resend-Email_Engine-black?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebXR_AR-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/developer-platform/r2/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AA-green?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **A production-grade, editorial digital art gallery platform and augmented reality showroom crafted for independent master artists, ateliers, and fine art shops.**
> 
> Seamlessly blends high-touch curatorial aesthetics, true-to-scale WebXR on-wall projection, distributed Redis caching, durable QStash asynchronous queues, and a private, full-featured administrative studio.

---

## 🖼️ Visual Showcase

<div align="center">
  <img src="public/assets/art_gallery_hero.jpg" alt="L'Atelier Lumineux — Digital Art Gallery and AR Showroom" width="100%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.35);" />
  <p><em>Contemporary public gallery interface with real-world aspect-ratio-locked AR wall projection and mobile companion experience.</em></p>
</div>

---

## 📑 Table of Contents

- [🏛️ Platform Overview](#️-platform-overview)
- [✨ Core Capabilities \& Features](#-core-capabilities--features)
  - [1. Public Gallery \& Collector Experience](#1-public-gallery--collector-experience)
  - [2. Augmented Reality (AR) \& 3D Virtual Showroom](#2-augmented-reality-ar--3d-virtual-showroom)
  - [3. Curatorial Studio \& Admin CMS](#3-curatorial-studio--admin-cms)
  - [4. Marketing Automation \& Asynchronous Email Queue](#4-marketing-automation--asynchronous-email-queue)
  - [5. Distributed Caching \& Sliding-Window Rate Limiting](#5-distributed-caching--sliding-window-rate-limiting)
  - [6. Dual-Provider Media Infrastructure](#6-dual-provider-media-infrastructure)
  - [7. Authentication, Security \& WCAG Accessibility](#7-authentication-security--wcag-accessibility)
- [🏗️ System Architecture](#️-system-architecture)
  - [Infrastructure \& Request Pipeline](#infrastructure--request-pipeline)
  - [Augmented Reality (WebXR) Lifecycle](#augmented-reality-webxr-lifecycle)
  - [Asynchronous QStash Dispatch Workflow](#asynchronous-qstash-dispatch-workflow)
- [💻 Technology Stack](#-technology-stack)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🗄️ Relational Data Model (Neon + Drizzle)](#️-relational-data-model-neon--drizzle)
- [⚙️ Environment Configuration (.env)](#️-environment-configuration-env)
- [🚀 Quick Start \& Local Setup](#-quick-start--local-setup)
- [🛠️ Operational CLI Scripts](#️-operational-cli-scripts)
- [🛡️ Security, Privacy \& Performance Guarantees](#️-security-privacy--performance-guarantees)
- [📄 License \& Credits](#-license--credits)

---

## 🏛️ Platform Overview

**L'Atelier Lumineux** reimagines how fine art is presented, experienced, and acquired online. Rather than treating artworks as generic e-commerce products or locking an artist into generic website builders, this platform is tailored specifically for fine art ateliers:

- **Art-First Editorial Design:** Refined serif typography (`Playfair Display`), warm dark/cream luxury palettes, generous negative space, and subtle motion transitions ensure the artwork remains the visual hero.
- **Zero-Friction Discovery:** Visitors can explore complete catalogs, discover solo exhibitions, and launch interactive AR sessions without creating an account.
- **Protected Artist Communications:** Authentication is required strictly when submitting acquisition inquiries, protecting the artist from spam while archiving structured collector dossiers.
- **True-to-Scale Wall Projection:** WebXR-powered augmented reality places paintings in collectors' physical rooms using exact metric dimensions with zero image distortion and complete on-device camera privacy.
- **Enterprise-Grade Asynchronous Pipeline:** Marketing campaigns and collector dossiers are processed through Upstash QStash queues with cryptographic HMAC validation and automated retry backoffs.

---

## ✨ Core Capabilities & Features

### 1. Public Gallery & Collector Experience
- **Fluid Artwork Catalog:** High-performance responsive artwork grid with instant text search, filtering by curated collection, medium, year, and acquisition status (`Available`, `Reserved`, `Sold`).
- **Comprehensive Artwork Dossier:** Dedicated `/artwork/[slug]` presentation showcasing museum-grade photography, physical measurements (height × width × depth in centimeters/inches), provenance, curatorial essays, and acquisition badges.
- **Exhibitions & Collections Timeline:** Curated showcases grouping related works into distinct artistic eras and physical/virtual gallery showings with start and end dates.
- **Collector Inquiry Flow:** Interactive acquisition modal with draft-state persistence across authentication redirects so typed inquiries are never lost.
- **SEO & Social Indexing:** Dynamic `sitemap.xml`, `robots.txt`, and structured JSON-LD schemas (`VisualArtwork`, `ArtGallery`, `Person`, `BreadcrumbList`) for maximum search visibility.

### 2. Augmented Reality (AR) & 3D Virtual Showroom
- **Device-Native WebXR Wall Placement:** Uses browser WebXR hit-testing and plane detection to anchor 2D canvases to walls in real physical dimensions.
- **Guaranteed Aspect-Ratio Preservation:** Geometry automatically locks to the physical height/width ratios configured in the database, preventing artwork stretching or distortion.
- **Intuitive Touch Gestures:** Smooth one-finger translation across wall planes, two-finger pinch scaling, and rotational adjustments.
- **Virtual Museum Framing:** Configurable virtual frames (Minimalist Oak, Floating Acrylic, Gilded Baroque, Museum Matte Black) with realistic 3D depth and material roughness.
- **Universal 3D Fallback:** Automatically switches to an interactive 3D simulated studio/wall environment on devices without WebXR or camera support—never leaving the visitor with a broken experience.
- **Dynamic In-Gallery QR Codes:** Generates scannable SVG/PNG QR codes for physical gallery wall tags, instantly opening `/artwork/[slug]` or `/ar/[artworkId]` on visitor phones.

### 3. Curatorial Studio & Admin CMS
- **Executive Operations Dashboard:** Real-time metrics tracking published artworks, drafts, reserved pieces, AR engagement sessions, and acquisition inquiries.
- **Intelligent Attention Panel:** Automatic alerts flagging unaddressed inquiries, artworks missing alt text, unconfigured AR physical dimensions, or drafts awaiting review.
- **Visual Page Studio with Live Split-Preview:** Real-time CMS for customizing the Homepage (Hero, Curated Collections, Exhibitions, Artist Story, AR CTA, Footer), About, Collections, and Gallery layouts.
- **Artwork Lifecycle Management:** Multi-state publishing pipeline (`Draft` ➔ `Preview` ➔ `Validation` ➔ `Published` ➔ `Reserved` ➔ `Sold` ➔ `Archived`) with batch operations.
- **Appearance & Design Token Studio:** Real-time theme editor for adjusting CSS design tokens (primary accents, serif typography, radius, container widths, and animation levels: `Minimal`, `Standard`, `Cinematic`).
- **WCAG 2.2 AA Accessibility Auditor:** Built-in scanner auditing color contrast ratios, heading hierarchies, form labels, and missing alt text with direct links to fix issues.

### 4. Marketing Automation & Asynchronous Email Queue
- **Masterwork Release Broadcasts:** Curate and preview artwork announcement newsletters to collector subscriber segments.
- **Upstash QStash Cloud Queuing:** Offloads slow email transmissions from HTTP requests into durable, scheduled serverless message queues.
- **Cryptographic Webhook Verification:** QStash worker endpoints cryptographically verify `upstash-signature` using HMAC-SHA256 tokens (`QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`).
- **Strict Idempotency & Retry Resilience:** Individual recipient jobs stored in Neon PostgreSQL (`email_jobs`) prevent duplicate deliveries; transient Resend delivery errors trigger automatic exponential backoff retries.
- **Timezone-Aware Scheduling:** Announce exhibitions or releases at a precise future date and time across any IANA timezone (e.g. `America/New_York`, `Europe/Paris`, `Asia/Kolkata`).
- **Smart Loopback Hybrid Mode:** Automatically detects local development environments (`localhost` / `127.0.0.1`) where cloud QStash cannot reach loopback URLs, smoothly executing direct delivery with complete database tracking.
- **Bespoke Gallery Email Templates:** Handcrafted, responsive HTML emails with inline styles, hero artwork imagery, acquisition links, and RFC-compliant one-click unsubscribe headers.

### 5. Distributed Caching & Sliding-Window Rate Limiting
- **Upstash Serverless Redis:** Blazing-fast read-through caching layer (`cachedGet`) with configurable TTLs for public catalog views, exhibitions, and theme configurations.
- **Automated Cache Invalidation:** Granular key and prefix purging (`flushCachePrefix`) triggered on admin mutations, keeping public pages fresh without manual intervention.
- **Admin Cache Cockpit:** Real-time Redis ping latency metrics, active key counter, and a one-click full cache purge tool in Admin Settings.
- **Sliding-Window Rate Limiting (`@upstash/ratelimit`):**
  - **Inquiries:** 5 requests/hour per IP (prevents inbox flooding).
  - **Admin Mutations:** 60 requests/minute per authenticated user (guards against automated script abuse).
  - **Public API:** 120 requests/minute per IP (thwarts malicious scraping).
  - **Fail-Open Resilience:** If Redis is temporarily unreachable or unconfigured, traffic fails open to prevent disruption to legitimate collectors.

### 6. Dual-Provider Media Infrastructure
- **ImageKit & Cloudflare R2 Coexistence:** Seamless hybrid architecture supporting S3-compatible raw storage (Cloudflare R2) and CDN-optimized real-time transformations (ImageKit).
- **Zero-Server Upload Bottleneck:** Direct-to-storage signed upload authorizations prevent multi-megabyte image binaries from burdening the Node/Next.js runtime.
- **Server-Side Image Optimization:** Sharp image pipeline extracts dimensions, validates file magic bytes, and generates blur placeholders.
- **Curatorial Stock Integration:** Integrated Unsplash media picker for discovering curatorial imagery directly within the CMS.

### 7. Authentication, Security & WCAG Accessibility
- **Better Auth Integration:** Secure credential-based authentication (email + password) with HTTP-only cookie sessions and CSRF protection.
- **Role-Based Authorization (RBAC):** Strict separation between `USER` (registered collectors) and `ADMIN` (artists & curators), verified server-side on every mutation.
- **Audit Logging:** Detailed security logs capturing admin operations, status changes, and platform events.
- **Privacy-First AR Engine:** Camera frames are strictly processed on the client GPU; zero camera data is ever captured, stored, or transmitted to any server.

---

## 🏗️ System Architecture

### Infrastructure & Request Pipeline

```mermaid
flowchart TD
    subgraph ClientLayer ["Client & Visitor Surfaces"]
        Visitor["👤 Public Visitor / Collector"]
        AdminUser["🔑 Curator / Admin"]
        MobileAR["📱 Mobile Device (WebXR Camera)"]
    end

    subgraph EdgeLayer ["Next.js App Router (Fullstack)"]
        NextApp["Next.js Server & Client Components"]
        APIRoutes["REST API /api/v1/*"]
        AuthModule["Better Auth Engine"]
        WebhookHandler["/api/webhooks/qstash/email"]
    end

    subgraph CacheAndLimits ["High-Speed Edge Services"]
        RedisCache[("⚡ Upstash Redis\n(Read-Through Caching)")]
        RateLimiter["🛡️ Upstash Ratelimit\n(Sliding-Window)"]
    end

    subgraph AsyncPipeline ["Background Queue & Messaging"]
        QStashBroker["📬 Upstash QStash\n(Serverless Message Broker)"]
        ResendEmail["📨 Resend Email API"]
    end

    subgraph DataAndMedia ["Authoritative Persistence & Storage"]
        NeonDB[("🐘 Neon PostgreSQL\n+ Drizzle ORM")]
        StorageR2["☁️ Cloudflare R2 / ImageKit\n(Artwork Binaries & CDN)"]
    end

    Visitor -->|Browse & View| NextApp
    AdminUser -->|Manage Gallery| NextApp
    MobileAR -->|On-Device WebGL / WebXR| NextApp

    NextApp -->|Verify Limits| RateLimiter
    RateLimiter --> RedisCache
    NextApp -->|Query / Cached GET| RedisCache
    RedisCache -.->|Cache Miss| NeonDB

    NextApp -->|Session Validation| AuthModule
    NextApp -->|Mutations & CRUD| APIRoutes
    APIRoutes -->|Drizzle ORM| NeonDB
    APIRoutes -->|Direct Signed Upload| StorageR2

    APIRoutes -->|Enqueue Campaign| QStashBroker
    QStashBroker -->|Durable HTTP POST with HMAC| WebhookHandler
    WebhookHandler -->|Verify HMAC & Idempotency| NeonDB
    WebhookHandler -->|Dispatch| ResendEmail
```

---

### Augmented Reality (WebXR) Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Collector as 📱 Collector
    participant WebPage as Next.js AR Client
    participant Engine as Three.js / WebXR Engine
    participant Camera as Device Camera (Client-Only)
    participant DB as Neon DB (Metadata)

    Collector->>WebPage: Taps "View in Your Space"
    WebPage->>DB: Fetch Artwork Dimensions (Width, Height, Ratio)
    WebPage->>Engine: Initialize AR Viewport with Dimensions
    Engine->>Collector: Request Camera Permission
    Collector->>Camera: Grants Permission (On-Device Stream)
    Camera->>Engine: Video Feed to Local Canvas
    Note over Engine,Camera: 🔒 Camera frames never leave device memory
    Engine->>Engine: Run WebXR Surface & Wall Hit-Testing
    Engine-->>Collector: Display Real-Time Surface Reticle
    Collector->>Engine: Taps Wall Surface to Place Artwork
    Engine->>Engine: Anchor Aspect-Locked 3D Plane at 1:1 Metric Scale
    Collector->>Engine: Drag / Pinch / Rotate Gestures
    Engine-->>Collector: Smooth Real-Time Transform Updates
    opt WebXR Unsupported
        Engine-->>Collector: Fallback to 3D Virtual Studio Wall Simulator
    end
```

---

### Asynchronous QStash Dispatch Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 🎨 Curator
    participant Studio as Admin Campaign Studio
    participant DB as Neon PostgreSQL
    participant QStash as Upstash QStash Broker
    participant Worker as Next.js Webhook (/api/webhooks/qstash/email)
    participant Resend as Resend Mail Engine

    Admin->>Studio: Schedule Artwork Release Announcement
    Studio->>DB: Persist email_campaigns record (status: 'scheduled' / 'queued')
    Studio->>DB: Insert individual email_jobs with unique constraints
    Studio->>QStash: Publish jobs with target delivery time & webhook endpoint
    QStash-->>Studio: Returns QStash Message IDs
    Studio->>DB: Update email_jobs with qstash_message_id

    Note over QStash,Worker: ⏳ Future trigger or immediate queue execution

    QStash->>Worker: POST /api/webhooks/qstash/email (Header: upstash-signature)
    Worker->>Worker: Verify cryptographic HMAC-SHA256 signature
    Worker->>DB: Check job status (Idempotency Guard)
    alt Already Sent / Duplicate
        Worker-->>QStash: HTTP 200 (Skip delivery)
    else Active Job
        Worker->>DB: Update job status to 'processing'
        Worker->>Resend: Send curated HTML email
        alt Send Success
            Resend-->>Worker: HTTP 200 (resend_message_id)
            Worker->>DB: Update job status to 'sent' & record sent_emails
            Worker-->>QStash: HTTP 200 (Job completed)
        else Temporary Error
            Worker->>DB: Update status to 'retrying'
            Worker-->>QStash: HTTP 500 (Triggers QStash exponential backoff)
        end
    end
```

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js (App Router)](https://nextjs.org/) | `^16.3.4` | Server Components, dynamic SSR, optimized client bundles & routing |
| **UI Library** | [React](https://react.dev/) | `^19.2.8` | Declarative UI component architecture |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.0.0` | Strict static typing across schemas, APIs, and components |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.0.0` | Utility-first styling with custom CSS design tokens |
| **Animations** | [Motion](https://motion.dev/) | `^13.2.0` | Editorial page transitions, subtle reveals & modal physics |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless | Cloud-native serverless PostgreSQL database |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | `^0.45.2` | Type-safe SQL schema definitions, migrations & relational queries |
| **Caching** | [Upstash Redis](https://upstash.com/) | `^1.38.4` | Low-latency distributed read-through caching layer |
| **Rate Limiting** | [@upstash/ratelimit](https://upstash.com/) | `^2.0.8` | Sliding-window protection for APIs, auth, and inquiries |
| **Queue / Scheduler**| [Upstash QStash](https://upstash.com/) | `^2.11.3` | Asynchronous durable message queue & timezone campaign scheduler |
| **Email Delivery** | [Resend](https://resend.com/) | `^6.26.0` | Gallery-grade transactional and marketing email delivery |
| **Media Storage** | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) | S3 API | S3-compatible zero-egress artwork asset storage |
| **Image CDN** | [ImageKit](https://imagekit.io/) | `^6.0.0` | Dynamic on-the-fly transformations, responsive WebP/AVIF delivery |
| **Image Processing**| [Sharp](https://sharp.pixelplumbing.com/) | `^0.35.4` | Server-side image metadata analysis, resizing & integrity validation |
| **AR / 3D Graphics** | [Three.js](https://threejs.org/) | `^0.185.1` | WebXR hit-testing, wall projection, 3D frames & fallback room engine |
| **Authentication** | [Better Auth](https://www.better-auth.com/) | `^1.7.3` | Type-safe credential authentication, sessions & role verification |
| **Validation** | [Zod](https://zod.dev/) | `^4.5.4` | Runtime schema validation for requests, forms & webhooks |
| **Forms** | [React Hook Form](https://react-hook-form.com/) | `^7.87.0` | High-performance form state management |
| **Icons & Assets** | [Lucide React](https://lucide.dev/) | `^1.41.0` | Clean, modern editorial icon set |
| **QR Code Engine** | [qrcode](https://www.npmjs.com/package/qrcode) | `^1.5.4` | High-density SVG & DataURL QR generation for gallery tags |

---

## 📂 Project Directory Structure

```text
art-gallery/
├── public/
│   └── assets/                     # Static gallery branding, hero graphics & logos
├── scripts/
│   ├── apply-email-migration.ts    # Database schema update for email queue tables
│   ├── audit_crud.ts               # Automated API CRUD audit suite
│   ├── cleanup-fake-data.ts        # Database cleanup utility
│   ├── inspect-media.ts            # Media storage diagnostics & integrity scanner
│   ├── migrate-r2-to-imagekit.ts   # Asset migration utility across media providers
│   ├── migrate_cms_columns.ts      # CMS schema alignment utility
│   ├── setup-admin.ts              # Interactive CLI for provisioning initial curator admin
│   ├── test-pagination.ts          # Gallery pagination validation script
│   ├── test-qstash-pipeline.ts     # End-to-end QStash queue integration test
│   └── verify-email-system.ts      # Resend & QStash configuration verifier
├── src/
│   ├── app/
│   │   ├── (public)/               # Public gallery visitor routes
│   │   │   ├── about/              # Artist biography & curatorial statement
│   │   │   ├── artwork/[slug]/     # High-res artwork dossier & acquisition trigger
│   │   │   ├── collections/        # Curated collection index & detail pages
│   │   │   ├── contact/            # Collector inquiry form & location info
│   │   │   ├── exhibitions/        # Solo/group exhibition timeline
│   │   │   ├── gallery/            # Filterable, paginated artwork catalog
│   │   │   ├── login/ & register/  # Collector account authentication
│   │   │   └── page.tsx            # Editorial flagship homepage
│   │   ├── account/                # Collector account profile & inquiry history
│   │   ├── admin/                  # Protected Curatorial Studio CMS
│   │   │   ├── accessibility/      # WCAG 2.2 AA live accessibility auditor
│   │   │   ├── activity/           # Security audit logs & curator event stream
│   │   │   ├── analytics/          # Collector impressions & AR engagement stats
│   │   │   ├── appearance/         # Dynamic theme editor & CSS design tokens
│   │   │   ├── ar-studio/          # AR dimension calibration & frame studio
│   │   │   ├── artworks/           # Artwork catalog CMS & publishing pipeline
│   │   │   ├── collections/        # Collection curator
│   │   │   ├── dashboard/          # Executive cockpit with Attention Panel
│   │   │   ├── exhibitions/        # Exhibition scheduler & artwork sequencing
│   │   │   ├── homepage/           # Visual Page Studio with live preview
│   │   │   ├── inquiries/          # Collector acquisition dossiers & CRM
│   │   │   ├── media/              # Unified ImageKit/R2 media asset manager
│   │   │   ├── qr-codes/           # Dynamic wall tag QR code generator
│   │   │   └── settings/           # Cache purge, Redis latency & queue status
│   │   ├── api/                    # Versioned REST APIs & Webhooks
│   │   │   ├── admin/              # Protected admin mutation endpoints
│   │   │   ├── artworks/           # Public catalog querying & filtering
│   │   │   ├── auth/               # Better Auth route handlers
│   │   │   ├── inquiries/          # Collector inquiry submission
│   │   │   ├── newsletter/         # Collector subscriber management
│   │   │   ├── upload/             # Direct-to-storage signed URL generator
│   │   │   └── webhooks/
│   │   │       └── qstash/email/   # Cryptographic QStash worker endpoint
│   │   ├── ar/[artworkId]/         # Dedicated WebXR AR showroom view
│   │   ├── globals.css             # Tailwind v4 theme tokens & styles
│   │   ├── layout.tsx              # Root HTML wrapper, fonts & SEO headers
│   │   ├── robots.ts               # Dynamic crawlers configuration
│   │   └── sitemap.ts              # Search engine sitemap indexer
│   ├── components/
│   │   ├── admin/                  # Admin CMS controls, modals & visual editors
│   │   │   ├── studio/             # Page Studio live split-screen previewers
│   │   │   ├── ArtworkFormClient   # Multi-tab artwork authoring cockpit
│   │   │   ├── InquiriesManager    # Collector CRM dossier viewer
│   │   │   └── MediaLibraryModal   # Media selector with Unsplash integration
│   │   ├── ar/                     # Augmented Reality & Three.js engine
│   │   │   ├── engine/             # WebXR session, gestures, mesh & hit-testing
│   │   │   └── ArStudioViewer      # Unified WebXR viewer & 3D room fallback
│   │   ├── public/                 # Public gallery UI (Grids, Dossiers, Skeletons)
│   │   └── ui/                     # Primitives (Dialogs, Buttons, Dropdowns, Cards)
│   ├── db/
│   │   ├── schema/                 # Relational Drizzle ORM schemas
│   │   ├── index.ts                # Database connection pool (Neon Serverless)
│   │   ├── repository.ts           # Authoritative database repository layer
│   │   └── seed.ts                 # Sample fine art masterworks seed script
│   ├── lib/
│   │   ├── auth/                   # Better Auth configuration & session utilities
│   │   ├── email/                  # Resend client, service & HTML templates
│   │   ├── qstash/                 # QStash client, scheduler, publisher & verifier
│   │   ├── redis/                  # Upstash Redis client, caching & rate limiters
│   │   ├── storage/                # Cloudflare R2 S3 storage adapter
│   │   └── utils.ts                # Class merging & typography helpers
│   └── modules/
│       └── media/                  # Media provider abstraction (ImageKit & R2)
├── drizzle.config.ts               # Drizzle Kit CLI configuration
├── next.config.ts                  # Next.js security headers & image domains
├── package.json                    # Project dependencies & operational scripts
└── tsconfig.json                   # Strict TypeScript compiler rules
```

---

## 🗄️ Relational Data Model (Neon + Drizzle)

```mermaid
erDiagram
    users ||--o{ inquiries : "submits"
    users ||--o{ activity_logs : "triggers"
    users ||--o{ email_campaigns : "creates"

    artworks ||--o{ artwork_images : "contains"
    artworks ||--o| artwork_ar : "configures"
    artworks ||--o{ inquiries : "receives"
    artworks ||--o{ collection_artworks : "belongs_to"
    artworks ||--o{ exhibition_artworks : "featured_in"
    artworks ||--o{ email_campaigns : "subject_of"

    collections ||--o{ collection_artworks : "groups"
    exhibitions ||--o{ exhibition_artworks : "exhibits"

    email_campaigns ||--o{ email_jobs : "dispatches"

    media ||--o{ artworks : "cover_media"
    media ||--o{ collections : "cover_media"
    media ||--o{ exhibitions : "cover_media"

    artworks {
        uuid id PK
        varchar title
        varchar slug UK
        text description
        integer year
        varchar medium
        numeric width
        numeric height
        numeric depth
        numeric price
        varchar status "draft | published | reserved | sold | archived"
        uuid cover_image_id FK
        boolean is_featured
        timestamp created_at
    }

    artwork_ar {
        uuid id PK
        uuid artwork_id FK
        boolean is_enabled
        numeric real_width_cm
        numeric real_height_cm
        numeric default_scale
        boolean frame_enabled
        varchar frame_style "wood | acrylic | antique | black_museum"
        varchar ar_status "ready | needs_attention"
    }

    email_campaigns {
        uuid id PK
        varchar title
        varchar type "artwork_release | newsletter | inquiry_followup"
        varchar subject
        uuid artwork_id FK
        varchar status "draft | scheduled | queued | processing | sent | failed"
        timestamp scheduled_at
        varchar timezone
        integer total_recipients
        integer sent_count
        integer failed_count
    }

    email_jobs {
        uuid id PK
        uuid campaign_id FK
        varchar recipient_email
        varchar job_type "artwork_announcement | inquiry_confirmation | curator_alert"
        varchar status "pending | queued | processing | sent | retrying | failed"
        varchar qstash_message_id
        varchar resend_message_id
        integer attempt_count
        timestamp scheduled_at
        timestamp sent_at
    }

    inquiries {
        uuid id PK
        uuid user_id FK
        uuid artwork_id FK
        varchar name
        varchar email
        varchar phone
        text message
        varchar status "new | read | replied | closed"
        timestamp created_at
    }
```

---

## ⚙️ Environment Configuration (.env)

Create a `.env.local` file in the project root by copying the template below. 

> [!IMPORTANT]
> **Security Notice:** Never commit actual production credentials or private keys to source control. The example below uses illustrative placeholder values.

```bash
# ==============================================================================
# 1. DATABASE CONFIGURATION (Neon Serverless PostgreSQL)
# ==============================================================================
# In development, you can use local postgres or a Neon dev branch
# Remote format: postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/art_gallery"

# ==============================================================================
# 2. AUTHENTICATION (Better Auth)
# ==============================================================================
# Generate a secure 64-character secret using: openssl rand -hex 32
BETTER_AUTH_SECRET="your_secure_random_64_character_secret_key_here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ==============================================================================
# 3. DISTRIBUTED CACHE & RATE LIMITING (Upstash Redis)
# ==============================================================================
# Get your Serverless REST credentials from the Upstash Console: https://console.upstash.com
# If omitted, caching and rate limiting fail-open gracefully to direct DB queries
UPSTASH_REDIS_REST_URL="https://your-upstash-redis-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_rest_token_here"

# ==============================================================================
# 4. ASYNCHRONOUS QUEUES & SCHEDULING (Upstash QStash)
# ==============================================================================
# QStash REST Token and HMAC Signing Keys from Upstash Console
QSTASH_TOKEN="your_upstash_qstash_token_here"
QSTASH_CURRENT_SIGNING_KEY="sig_current_key_from_upstash_console"
QSTASH_NEXT_SIGNING_KEY="sig_next_key_from_upstash_console"

# Delivery mode: 'qstash' (production cloud queue) | 'direct' (local test execution)
EMAIL_DELIVERY_MODE="qstash"

# Optional public webhook URL override (useful when running ngrok tunnels in development)
# e.g., QSTASH_WEBHOOK_URL="https://abc-xyz.ngrok-free.app/api/webhooks/qstash/email"
QSTASH_WEBHOOK_URL=""

# ==============================================================================
# 5. TRANSACTIONAL & MARKETING EMAIL (Resend)
# ==============================================================================
# API Key from Resend: https://resend.com/api-keys
# If omitted, emails log directly to the server terminal for previewing
RESEND_API_KEY="re_your_resend_api_key_here"
ADMIN_EMAIL="curator@latelier-lumineux.art"
EMAIL_FROM="Elena Vance Studio <curator@latelier-lumineux.art>"

# ==============================================================================
# 6. MEDIA & ASSET STORAGE (ImageKit + Cloudflare R2 Coexistence)
# ==============================================================================
# Primary active upload target: 'imagekit' | 'cloudflare'
MEDIA_PROVIDER="imagekit"
IMAGEKIT_STORAGE=true
CLOUDFLARE_STORAGE=true

# ImageKit Configuration (Dynamic transformations & CDN delivery)
IMAGEKIT_PUBLIC_KEY="public_your_imagekit_public_key"
IMAGEKIT_PRIVATE_KEY="private_your_imagekit_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_gallery_alias"

# Cloudflare R2 Storage (S3-compatible persistent storage)
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_ACCESS_KEY_ID="your_cloudflare_access_key"
CLOUDFLARE_SECRET_ACCESS_KEY="your_cloudflare_secret_key"
CLOUDFLARE_BUCKET_NAME="art-gallery-assets"
CLOUDFLARE_PUBLIC_URL="https://assets.your-gallery-domain.com"

# Backward compatibility alias for R2 SDK
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_cloudflare_access_key"
R2_SECRET_ACCESS_KEY="your_cloudflare_secret_key"
R2_BUCKET_NAME="art-gallery-assets"
R2_PUBLIC_URL="https://assets.your-gallery-domain.com"

# ==============================================================================
# 7. OPTIONAL CURATORIAL STOCK INTEGRATION (Unsplash)
# ==============================================================================
# Used inside Admin Media Picker to curate stock textures & exhibition photography
UNSPLASH_ACCESS_KEY="your_unsplash_access_key_here"
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` or `pnpm`
- **PostgreSQL Database**: Neon serverless instance or local PostgreSQL `v15+`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/art-gallery.git
cd art-gallery
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
# Open .env.local and configure your database and provider keys
```

### 4. Push Database Schema & Seed Data
Generate and push the Drizzle schema directly to your PostgreSQL database:
```bash
# Push schema tables and relations
npm run db:push

# Seed gallery with Elena Vance's curated masterworks
npm run db:seed
```

### 5. Provision the Initial Curator Admin
Run the interactive provisioning script to create the initial studio administrator:
```bash
npx tsx scripts/setup-admin.ts
```
Follow the interactive prompts to assign the email and secure password for the `ADMIN` role.

### 6. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Public Gallery:** [http://localhost:3000](http://localhost:3000)
- **AR Showroom:** [http://localhost:3000/ar/[artworkId]](http://localhost:3000)
- **Admin Studio:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Operational CLI Scripts

The project includes an arsenal of automated CLI utilities located in `scripts/`:

| Command | Script | Description |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Starts local Next.js development server with hot-module reloading |
| `npm run build` | `next build` | Compiles type-checked, optimized production distribution |
| `npm run db:push` | `drizzle-kit push` | Applies Drizzle schema definitions directly to PostgreSQL |
| `npm run db:seed` | `tsx src/db/seed.ts` | Populates database with sample artworks, collections & exhibitions |
| `npm run test` | `tsx src/modules/media/__tests__/media.test.ts` | Executes media subsystem and provider test suites |
| `npm run media:migrate` | `tsx scripts/migrate-r2-to-imagekit.ts` | Migrates assets between Cloudflare R2 and ImageKit |
| `npx tsx scripts/setup-admin.ts` | `setup-admin.ts` | Provisions new administrator credentials with `ADMIN` role |
| `npx tsx scripts/test-qstash-pipeline.ts` | `test-qstash-pipeline.ts` | Validates end-to-end QStash message queuing and webhook verification |
| `npx tsx scripts/verify-email-system.ts` | `verify-email-system.ts` | Verifies Resend API credentials, templates, and sending domains |
| `npx tsx scripts/inspect-media.ts` | `inspect-media.ts` | Audits media table entries and validates storage URL availability |

---

## 🛡️ Security, Privacy & Performance Guarantees

### 1. Camera Stream Privacy Protection
- The device camera feed used in the AR Showroom is accessed exclusively through the browser's WebXR / MediaDevices API.
- **Zero-Transmission Guarantee:** Video frames are analyzed locally in device GPU memory for plane raycasting and surface alignment. Under no circumstance are camera frames recorded, stored, or sent to any server.

### 2. Cryptographic Webhook Security
- QStash webhook endpoints (`/api/webhooks/qstash/*`) enforce cryptographic signature verification using HMAC-SHA256 headers (`upstash-signature`).
- Requests missing valid cryptographic headers or bearing stale timestamps are rejected before executing any database mutations.

### 3. Resilient Fail-Open Architecture
- The caching and rate limiting subsystems are architected to fail open: in the event of an Upstash service degradation or missing credentials in development, the system seamlessly falls back to authoritative database queries, ensuring collectors are never blocked from exploring artworks.

### 4. Content Security & Input Sanitization
- All collector inquiries and admin content are strictly validated using runtime Zod schemas.
- Content rendering strictly avoids unsanitized `dangerouslySetInnerHTML`. Administrative descriptions utilize safe structured markdown parsing.

### 5. WCAG 2.2 AA Accessibility Compliance
- Built-in keyboard navigation across all modals and lightboxes.
- Visible high-contrast focus rings and ARIA live regions for dynamic alerts.
- Dedicated admin accessibility dashboard continuously checking for missing descriptive alt text and contrast deficits.

---

## 📄 License & Credits

- **Platform Architecture & Code:** Created for **L'Atelier Lumineux / Elena Vance Studio**.
- **Engineered with:** [Next.js](https://nextjs.org/), [Three.js](https://threejs.org/), [Neon Database](https://neon.tech/), [Upstash](https://upstash.com/), and [Resend](https://resend.com/).
- **License:** Proprietary & Confidential. All rights reserved.

<div align="center">
  <sub>Crafted with passion for contemporary art and cutting-edge web engineering.</sub>
</div>
