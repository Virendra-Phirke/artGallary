# CLAUDE.md

# Claude Code Instructions — Art Gallery + AR Platform

## 1. Source of Truth

Before making any change, read and follow:

```text
AGENTS.md
```

`AGENTS.md` is the canonical project engineering specification.

It defines:

- architecture
- technology stack
- security requirements
- accessibility requirements
- AR requirements
- database rules
- storage rules
- testing
- UI/UX guidelines
- coding standards
- implementation phases

Do not contradict `AGENTS.md`.

If this file conflicts with `AGENTS.md`, follow `AGENTS.md`.

---

# 2. Project Context

This is a production-grade website for a **single individual artist / art shop**.

The platform consists of:

```text
Public Gallery
      +
User Authentication
      +
Admin CMS
      +
AR Artwork Preview
```

The core differentiator is:

> Visitors can place a 2D artwork into their physical environment using their device camera.

The public experience must remain accessible without authentication.

Authentication is required when a visitor wants to contact the artist.

---

# 3. Mandatory Architecture

Use:

```text
Next.js
   ↓
Fastify REST API
   ↓
Drizzle ORM
   ↓
Neon PostgreSQL
```

For media:

```text
Next.js / Fastify
       ↓
Cloudflare R2
```

For authentication:

```text
Better Auth
```

For AR:

```text
Three.js
React Three Fiber
WebXR where supported
Browser-compatible fallback
```

Do not introduce a separate technology or service without checking whether it is actually needed.

---

# 4. Technology Restrictions

Do not introduce these unless explicitly requested:

- Firebase
- Supabase
- Clerk
- Auth0
- OAuth providers
- MongoDB
- Redis
- GraphQL
- Express
- microservices
- Kubernetes
- Kafka
- unnecessary queues
- additional databases

The project is intentionally designed around:

```text
Next.js
Fastify
Better Auth
Drizzle
Neon
Cloudflare R2
Three.js
Resend
```

---

# 5. Claude Code Workflow

For every task:

## Step 1 — Inspect

Before writing code:

```text
Inspect repository
Read relevant files
Identify affected modules
Check existing patterns
Check tests
```

Do not guess the architecture.

## Step 2 — Plan

Determine:

- files that need changes
- dependencies
- API changes
- database changes
- security implications
- accessibility implications
- testing requirements

For larger tasks, explain the implementation plan before making extensive changes.

## Step 3 — Implement

Make the smallest coherent implementation.

Prefer modifying existing abstractions over creating duplicates.

## Step 4 — Verify

Run the relevant:

```text
typecheck
lint
tests
build
```

## Step 5 — Review

Before finishing:

```text
Security
Accessibility
Performance
Responsive behavior
Error handling
```

must be considered.

---

# 6. Do Not Fake Functionality

Never create fake implementations for core features.

Do not use:

```text
TODO
coming soon
fake API responses
hardcoded production data
mock AR behavior presented as real AR
```

unless explicitly requested as a temporary prototype.

If a feature genuinely cannot be completed, isolate it behind a clear abstraction and explain what remains.

---

# 7. Frontend Rules

Prefer Server Components.

Use Client Components only when necessary for:

- AR
- Three.js
- camera
- browser APIs
- gestures
- interactive forms
- client-side animation/state

Do not put `"use client"` at the top of entire page trees unnecessarily.

Do not put business logic in visual components.

---

# 8. Backend Rules

Fastify is the authoritative backend.

Business logic belongs in backend domain modules.

Every mutation must follow:

```text
Authenticate
 ↓
Authorize
 ↓
Validate
 ↓
Apply business rules
 ↓
Perform mutation
 ↓
Invalidate cache if necessary
 ↓
Return safe response
```

Never trust the client for:

- roles
- ownership
- permissions
- prices
- statuses
- publication state

---

# 9. Authentication Rules

Use Better Auth.

Authentication is:

```text
Email + Password
```

Do not add OAuth.

Public browsing must work without authentication.

Contact flow:

```text
Visitor
 ↓
Contact Artist
 ↓
Authenticated?
 ├── YES → Form
 └── NO → Login/Register
              ↓
        Return to contact
```

Preserve the user's intended flow and form content whenever possible.

---

# 10. Authorization Rules

Roles:

```text
USER
ADMIN
```

Admin permissions must be checked server-side.

Never rely on:

```text
isAdmin === true
```

from browser state.

The backend must derive authorization from the authenticated server-side session/user record.

---

# 11. Database Rules

Database:

```text
Neon PostgreSQL
```

ORM:

```text
Drizzle
```

Artwork files are NOT database blobs.

Database:

```text
metadata
relationships
configuration
```

R2:

```text
original images
optimized images
thumbnails
AR media
```

Use migrations for schema changes.

Do not manually modify production schema without a migration.

---

# 12. Storage Rules

Use Cloudflare R2.

Preferred upload flow:

```text
Admin
 ↓
API authorization
 ↓
Signed upload URL
 ↓
Browser → R2
 ↓
Metadata registration
 ↓
Neon
```

Never expose R2 secret credentials.

Never use:

```text
NEXT_PUBLIC_R2_SECRET
```

or equivalent.

---

# 13. Artwork Upload Validation

Never trust client-provided file metadata.

Validate:

- actual file type
- file signature
- file size
- dimensions
- image integrity

Use Sharp for processing.

Generate optimized image variants.

Never store raw uploaded files without validating them.

---

# 14. AR Implementation Rules

AR is a major product feature.

The initial use case is:

```text
2D artwork
+
physical dimensions
+
AR plane
+
real environment
```

Do not turn paintings into 3D objects.

Example:

```text
Artwork:
120cm × 80cm

AR:
Plane ratio = 120:80
```

Never stretch artwork independently on X/Y axes.

---

# 15. AR Architecture

AR must be client-side:

```text
Backend
 ↓
Artwork metadata
 ↓
Next.js
 ↓
Three.js / R3F
 ↓
WebXR / compatible AR
 ↓
Device
```

Do not send camera frames to the server.

Do not store camera footage.

Camera permission should only be requested after the user starts the AR experience.

---

# 16. AR Fallback

Never assume AR support.

When unsupported:

```text
AR unavailable
 ↓
Interactive Preview
```

The fallback should still communicate:

- artwork scale
- proportions
- placement
- dimensions

Never leave the user on a broken camera screen.

---

# 17. AR Performance

Do not load Three.js/AR code globally.

Use dynamic imports.

Optimize:

- textures
- memory
- device pixel ratio
- render loops
- disposal
- image resolution

Clean up AR resources when the experience ends.

---

# 18. Public UI Direction

The public site should look like a premium contemporary art gallery.

Prioritize:

```text
Artwork
 ↓
Typography
 ↓
Whitespace
 ↓
Content
 ↓
Navigation
```

Use:

- editorial typography
- large images
- generous spacing
- subtle motion
- minimal interface chrome

Avoid:

- generic SaaS UI
- excessive glassmorphism
- excessive gradients
- excessive shadows
- noisy backgrounds
- excessive cards
- visual gimmicks

---

# 19. Admin UI Direction

The admin dashboard should be professional and efficient.

It should make important information actionable.

Example:

```text
Attention Required

3 artworks missing alt text
2 artworks missing dimensions
1 artwork has incomplete AR configuration
```

Warnings should link directly to the relevant resource.

---

# 20. Accessibility

Target:

```text
WCAG 2.2 AA
```

Every new UI component must consider:

- keyboard navigation
- focus state
- screen readers
- labels
- semantic HTML
- color contrast
- reduced motion
- touch targets

Do not create inaccessible custom controls when a native HTML control works.

---

# 21. Animation

Use Motion deliberately.

Animations should enhance:

- artwork discovery
- transitions
- hierarchy
- spatial understanding

Respect:

```text
prefers-reduced-motion
```

Do not create animations merely because animation is technically possible.

---

# 22. Security Checklist

For every security-sensitive feature verify:

```text
[ ] Authentication
[ ] Authorization
[ ] Input validation
[ ] Output safety
[ ] Rate limiting
[ ] CSRF/origin protection where applicable
[ ] Secure cookies
[ ] Secret isolation
[ ] Audit logging where appropriate
```

Never bypass security for development convenience.

---

# 23. API Security

Validate all:

```text
body
query
params
headers where applicable
```

Use Zod or Fastify schema validation.

Do not trust client-provided:

```text
role
userId
ownerId
status
price
permissions
```

---

# 24. XSS Rules

Avoid:

```tsx
dangerouslySetInnerHTML
```

unless absolutely necessary and content has been sanitized.

Admin-managed:

- descriptions
- biographies
- exhibition text
- homepage content
- SEO content

must not become arbitrary executable HTML.

Never allow arbitrary JavaScript through the theme/CMS.

---

# 25. Secrets

Never hardcode:

- database URLs
- auth secrets
- R2 keys
- Resend keys
- API tokens

Never commit real `.env` files.

Before completing a task involving environment variables, check that private values are not exposed to client bundles.

---

# 26. Performance

When changing the UI, consider:

- bundle size
- image size
- hydration
- server/client boundaries
- database queries
- caching
- layout shift
- AR loading

Do not import heavy libraries globally when a feature is only used on one route.

---

# 27. Testing Expectations

For new business logic:

```text
Unit tests
```

For API/database behavior:

```text
Integration tests
```

For critical user journeys:

```text
Playwright E2E
```

For UI accessibility:

```text
axe + keyboard testing
```

For AR:

```text
real device testing
```

Do not claim AR support based only on desktop simulation.

---

# 28. Database Change Workflow

When changing the database:

```text
Update Drizzle schema
 ↓
Create migration
 ↓
Run migration locally
 ↓
Update affected queries
 ↓
Update types/validation
 ↓
Update tests
```

Do not modify schema without checking existing relationships and indexes.

---

# 29. API Change Workflow

When changing an API:

```text
Update validation schema
 ↓
Update backend route
 ↓
Update service/domain logic
 ↓
Update frontend API client
 ↓
Update shared types if applicable
 ↓
Update tests
```

Avoid breaking existing endpoints without a migration/deprecation plan.

---

# 30. UI Change Workflow

For UI work:

```text
Check existing design tokens
 ↓
Reuse existing components
 ↓
Implement responsive behavior
 ↓
Implement loading state
 ↓
Implement error state
 ↓
Implement empty state
 ↓
Check keyboard accessibility
 ↓
Check reduced motion
```

Do not introduce one-off design patterns if the design system already contains an appropriate component.

---

# 31. Error Handling

Users should never see raw:

- stack traces
- SQL errors
- internal service errors
- API secrets
- filesystem paths

Use safe messages.

Log detailed diagnostic information server-side.

---

# 32. Git

Use focused commits.

Examples:

```text
feat: add artwork CMS
feat: add AR artwork placement
fix: enforce admin authorization
fix: preserve contact form after login
perf: optimize artwork thumbnails
test: add artwork publishing coverage
refactor: extract artwork service
```

Do not create unrelated changes in the same task.

---

# 33. Dependency Management

Before installing a package:

1. Check whether the existing stack already solves the problem.
2. Check maintenance/activity.
3. Check security reputation.
4. Check bundle/runtime impact.
5. Confirm that the dependency is actually needed.

Avoid dependency sprawl.

---

# 34. When Requirements Are Ambiguous

Prefer the solution that best preserves:

```text
Security
Accessibility
Performance
Maintainability
User Experience
```

Do not invent large architectural features just because they might be useful later.

---

# 35. Implementation Order

Respect the project phases in `AGENTS.md`.

Especially:

**Build the AR prototype before deeply integrating AR into the CMS.**

The correct AR sequence is:

```text
Hardcoded artwork
 ↓
AR plane
 ↓
Camera
 ↓
Surface placement
 ↓
Scale
 ↓
Rotation
 ↓
Reset
 ↓
Fallback
 ↓
CMS integration
```

This avoids building an entire CMS around an AR implementation that has not been validated on real devices.

---

# 36. Final Verification

Before reporting completion:

```text
[ ] Typecheck
[ ] Lint
[ ] Relevant tests
[ ] Build
[ ] Security review
[ ] Accessibility review
[ ] Responsive review
[ ] Error/loading/empty states
```

For AR:

```text
[ ] Real Android device tested
[ ] Real iOS device tested where supported
[ ] Camera permission tested
[ ] Surface placement tested
[ ] Scale tested
[ ] Rotation tested
[ ] Reset tested
[ ] Exit tested
[ ] Fallback tested
[ ] No camera upload
```

---

# 37. Important Instruction

Do not stop at:

> "The implementation looks correct."

Actually verify the implementation using the repository's available commands.

If a test or build fails:

1. Diagnose the root cause.
2. Fix it.
3. Re-run the failing check.
4. Only report completion after verification.

---

# 38. Product Principle

Always preserve the central product identity:

> Premium single-artist gallery + secure CMS + polished AR showroom.

The artwork is the product.

The UI, backend, database, and AR system exist to make the artwork easier to discover, understand, experience, and inquire about.
