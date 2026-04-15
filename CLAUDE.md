# CLAUDE.md - Gentech Guard Codebase Guide

## Project Overview

**Gentech Guard** is a premium automotive Paint Protection Film (PPF) company's web and mobile application. It consists of:

- A **customer-facing website** for product showcase, warranty registration/lookup, gallery, and dealer network discovery
- A **secure admin dashboard** for managing warranty registrations, products, users, gallery, and site configuration
- **Android mobile apps** (customer + admin variants) built via Capacitor

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript (strict mode) |
| UI | React 19, Tailwind CSS 4, Radix UI primitives |
| State | React Context API (GlobalStore), Zustand |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| 3D/Effects | Three.js, React Three Fiber/Drei |
| Maps | React-Leaflet, @react-map/india |
| Tables | TanStack React Table |
| Animations | Framer Motion |
| Toasts | Sonner |
| PDF/Images | jsPDF, html-to-image, html2canvas |
| Mobile | Capacitor 8 (Android) |
| Google APIs | googleapis (Sheets integration) |

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Static export to /dist
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run lint         # ESLint
```

### Environment Variables Required

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

For Android builds, also set `JAVA_HOME` and `ANDROID_HOME` (see `package.json` build scripts).

## Directory Structure

```
.
├── app/                          # Next.js App Router (pages & routes)
│   ├── layout.tsx                # Root layout (GlobalProvider, fonts)
│   ├── page.tsx                  # Splash/entry (device detection)
│   ├── globals.css               # Global Tailwind styles
│   ├── home/page.tsx             # Main landing page
│   ├── about/page.tsx            # About page
│   ├── gallery/page.tsx          # Gallery page
│   ├── warranty/page.tsx         # Warranty registration & checker
│   ├── our-network/              # Dealer network page + components
│   │   ├── page.tsx
│   │   └── components/           # DealerList, DealerFilter, IndiaMap, etc.
│   ├── admin/                    # Admin portal
│   │   ├── page.tsx              # Login/Register
│   │   ├── dashboard/            # Protected dashboard
│   │   │   ├── layout.tsx        # Sidebar + ProtectedRoute wrapper
│   │   │   ├── page.tsx          # Main dashboard (metrics + warranty table)
│   │   │   ├── products/         # Product management
│   │   │   ├── users/            # Admin user management
│   │   │   └── config/           # Site configuration
│   │   └── gallery/              # Gallery management
│   ├── sections/                 # Landing page section components
│   └── components/               # Page-scoped components (ImageLightbox, GalleryCard, etc.)
│
├── components/                   # Shared/reusable components
│   ├── Header.tsx                # Site header with navigation
│   ├── Footer.tsx                # Site footer
│   ├── Hero.tsx                  # Landing hero carousel
│   ├── WhySection.tsx            # Benefits section
│   ├── SolutionsSection.tsx      # Product solutions grid
│   ├── ProcessSection.tsx        # PPF process steps
│   ├── WarrantySection.tsx       # Warranty info section
│   ├── WarrantyForm.tsx          # Multi-step warranty registration form
│   ├── WarrantyChecker.tsx       # Warranty status lookup
│   ├── ContactForm.tsx           # Contact inquiry form
│   ├── DealerMap.tsx             # Dealer location map
│   ├── ProductShowcase.tsx       # Product display
│   ├── Beams.tsx                 # WebGL beam effect (desktop only)
│   ├── BeamsMobile.tsx           # CSS fallback for mobile
│   ├── MetallicPaint.tsx         # WebGL metallic shader (desktop)
│   ├── MetallicPaintMobile.tsx   # CSS fallback for mobile
│   ├── FloatingLines.tsx         # Animated lines background
│   ├── GlassSurface.tsx          # Glassmorphism component
│   ├── MobileSplashScreen.tsx    # Mobile app splash
│   ├── Certificate.tsx           # Certificate badge display
│   ├── enquiry/                  # Multi-type enquiry system
│   │   ├── EnquiryDropdown.tsx   # Trigger button
│   │   ├── EnquiryModal.tsx      # Modal routing to form types
│   │   ├── CustomerEnquiryForm.tsx
│   │   ├── DealerEnquiryForm.tsx
│   │   └── DistributorEnquiryForm.tsx
│   ├── admin/                    # Admin-specific components
│   │   ├── AdminSidebar.tsx      # Dashboard sidebar nav
│   │   ├── ProtectedRoute.tsx    # Auth guard wrapper
│   │   └── WarrantiesTable.tsx   # Warranty data table
│   └── ui/                       # Radix UI primitives (CVA-styled)
│       └── button.tsx
│
├── context/
│   └── GlobalStore.tsx           # React Context with products + site settings
│
├── hooks/
│   └── useDealerData.ts          # Dealer filtering, search, selection state
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server-side Supabase client (cookie auth)
│   ├── hooks/
│   │   └── useDeviceCapability.ts # Device detection, WebGL support, reduced motion
│   ├── site-config.ts            # Centralized site configuration (company, contact, socials)
│   ├── gallery-service.ts        # Gallery image fetching from Supabase storage
│   ├── dealers/data.ts           # Static fallback dealer data (Supabase is primary)
│   ├── dealers/map-utils.ts      # Lat/lng to SVG map percentage converter
│   └── utils.ts                  # cn() helper (clsx + tailwind-merge)
│
├── types/
│   ├── gallery.ts                # GalleryImage, GalleryCategory
│   ├── enquiries.ts              # CustomerEnquiry, DealerEnquiry, DistributorEnquiry + enums
│   └── dealer.ts                 # Dealer, DealerFilter, MapState
│
├── public/assets/                # Static images, logos, PDFs
├── dist/                         # Build output (git-ignored)
│
├── capacitor.config.ts           # Capacitor config (customer app: com.gentechguard.app)
├── capacitor.config.admin.ts     # Capacitor config (admin app: com.gentechguard.admin)
├── next.config.ts                # Next.js config (static export, ignoreBuildErrors)
├── tsconfig.json                 # TypeScript config (strict, @/* path alias)
├── eslint.config.mjs             # ESLint (next/core-web-vitals + typescript)
├── postcss.config.mjs            # PostCSS with Tailwind
│
├── ADMIN_GUIDE.md                # Admin setup & usage guide
├── ADMIN_PORTAL.md               # Admin features overview
├── API_DOCS.md                   # API route documentation
├── CONFIG_MIGRATION_PLAN.md      # Config centralization plan
├── ADMIN_SQL_SETUP.sql           # SQL: admin_profiles table + auth trigger
├── ADMIN_PRODUCTS_SETUP.sql      # SQL: products table + seed data
└── DEALERS_SETUP.sql             # SQL: dealers table + seed data
```

## Key Architecture Patterns

### Static Export

The app uses `output: 'export'` in `next.config.ts` with output to `/dist`. This means:
- No server-side rendering at runtime
- All pages are pre-rendered as static HTML/JS/CSS
- API routes (`/api/*`) are documented but not implemented as Next.js route handlers (backend logic uses client-side Supabase SDK directly)
- Images are unoptimized (`images.unoptimized: true`)
- Trailing slashes are enabled for static hosting compatibility

### State Management

**GlobalStore** (`context/GlobalStore.tsx`):
- Wraps the entire app via `GlobalProvider` in root `layout.tsx`
- Fetches products from Supabase `products` table on mount
- Overlays database `site_settings` on top of hardcoded `siteConfig` from `lib/site-config.ts`
- Exposes `useGlobalStore()` hook with `products`, `settings`, `loading`, and `refreshProducts()`

### Authentication Flow

1. User visits `/admin` and logs in or registers
2. `supabase.auth.signInWithPassword()` authenticates against Supabase Auth
3. App checks `admin_profiles.is_active` - new users default to `false`
4. Superadmin must manually set `is_active = true` in Supabase table editor
5. Protected routes are wrapped by `ProtectedRoute` component in `/admin/dashboard/layout.tsx`

### Responsive Design & Performance

- **Device detection**: `useDeviceCapability` hook detects mobile/tablet/desktop, WebGL support, and reduced motion preferences
- **WebGL effects** (Beams, MetallicPaint) load only on capable desktops via `React.lazy()` + `Suspense`
- **CSS fallbacks** (`BeamsMobile`, `MetallicPaintMobile`) render on mobile/low-end devices
- Breakpoints: mobile < 768px, tablet 768-1024px, desktop >= 1024px

### Path Aliases

Use `@/*` to import from the project root:
```typescript
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/site-config"
import { useGlobalStore } from "@/context/GlobalStore"
```

## Database Schema (Supabase PostgreSQL)

### Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `admin_profiles` | Admin user profiles with approval gate (`is_active`) | Public SELECT, self INSERT/UPDATE |
| `warranty_registrations` | Customer warranty submissions | Public INSERT, authenticated SELECT/UPDATE/DELETE |
| `products` | PPF product catalog (JSONB features/specs) | Public SELECT, admin full access |
| `dealers` | Dealer locations with lat/lng for map pins | Public SELECT (active), admin full access |
| `site_settings` | Dynamic config overrides (key/value) | Varies |
| `gallery_images` | Gallery image metadata | Varies |

### Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `warranty-uploads` | Vehicle and RC images from warranty registrations |
| `gallery` | Gallery images |

### Key SQL Files

- `ADMIN_SQL_SETUP.sql` - Creates `admin_profiles` table, RLS policies, and `on_auth_user_created` trigger
- `ADMIN_PRODUCTS_SETUP.sql` - Creates `products` table with RLS and seeds 5 PPF products
- `DEALERS_SETUP.sql` - Creates `dealers` table with lat/lng, RLS policies, and seeds 15 dealers

## Build & Deployment

### NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Static export to `/dist` |
| `npm run typecheck` | TypeScript checking (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run build:main` | Build customer Android APK via Capacitor |
| `npm run build:admin` | Build admin Android APK (swaps Capacitor config) |

### Mobile Build Notes

- Customer app: `com.gentechguard.app` (uses `capacitor.config.ts`)
- Admin app: `com.gentechguard.admin` (uses `capacitor.config.admin.ts`)
- `build:admin` script temporarily swaps config files, builds, then restores
- Environment variable `NEXT_PUBLIC_ADMIN_APK` controls app variant behavior

## Conventions & Guidelines

### Code Style

- **TypeScript strict mode** is enabled
- `ignoreBuildErrors: true` is set in `next.config.ts` - the build won't fail on TS errors, but always run `npm run typecheck` to verify
- Use `cn()` from `@/lib/utils` for conditional class merging (combines `clsx` + `tailwind-merge`)
- Styling uses Tailwind CSS 4 utility classes throughout
- UI primitives use Radix UI with CVA (class-variance-authority) for variant styling

### Component Patterns

- **Page-level components** go in `app/` subdirectories (e.g., `app/our-network/components/`)
- **Shared components** go in `components/` at project root
- **Admin components** go in `components/admin/`
- **UI primitives** go in `components/ui/`
- Heavy visual effects have separate desktop (WebGL) and mobile (CSS) variants
- Use `useDeviceCapability` hooks to conditionally render effects

### Adding New Pages

1. Create `app/<route>/page.tsx` (Next.js App Router convention)
2. Use `'use client'` directive for client-side interactivity
3. Import shared components from `@/components/`
4. Access global state via `useGlobalStore()` hook

### Configuration

- Site-wide config (company info, contact, socials, navigation) lives in `lib/site-config.ts`
- Database can override config values via `site_settings` table
- Components should import from `siteConfig` rather than hardcoding values

### Types

- Define shared types in `types/` directory
- Use existing type files: `gallery.ts`, `enquiries.ts`, `dealer.ts`
- Product types are inferred from the database schema (JSONB fields for features/specs)

## Common Tasks

### Adding a new product
1. Insert into `products` table via Supabase or admin dashboard
2. Products auto-appear in `SolutionsSection` and `WarrantyForm` dropdown via `GlobalStore`

### Modifying site contact info
1. Edit `lib/site-config.ts` - all components reference this
2. Alternatively, update `site_settings` table in Supabase for runtime overrides

### Adding a dealer
1. Insert into `dealers` table via Supabase (authoritative source)
2. Include `latitude` / `longitude` fields — map pin positions are computed automatically via `lib/dealers/map-utils.ts`
3. Static fallback data in `lib/dealers/data.ts` is used when Supabase is unavailable

### Adding a new admin page
1. Create route under `app/admin/dashboard/<page>/page.tsx`
2. It inherits the dashboard layout (sidebar + `ProtectedRoute` guard) automatically
3. Add navigation link in `components/admin/AdminSidebar.tsx`
