# Supabase Migration Audit — Gentech Guard

Audit date: 2026-04-18
Source project dashboard: https://supabase.com/dashboard/project/rnscmxjrkqelmaiwrouz

This file is an inventory of **everything** on the current Supabase project that must be replicated on the new account. It is written in migration order.

---

## 1. Project-level metadata

| Field | Current value |
|---|---|
| Project name | **Gentech Guard** |
| Project ref | `rnscmxjrkqelmaiwrouz` |
| API URL | `https://rnscmxjrkqelmaiwrouz.supabase.co` |
| Organization | `p-sai-gowtham` (ref `bycqdhcpwejviheiwcqm`) |
| Billing tier | **Free** |
| Region | **South Asia (Mumbai) — `ap-south-1`** |
| Compute size | `t4g.nano` |
| DB engine | Postgres (default Supabase version) |
| Status | Healthy |
| Migrations in dashboard | None tracked |
| Point-in-time backups | None (Free tier) |
| Branches | None |
| Traffic (last 60 min at audit time) | 13 DB / 5 Auth / 1 Storage / 0 Realtime requests |
| Advisor issues | None |

**On new account create a project with these exact settings:** same name, same region (Mumbai — latency parity), and a compute size ≥ nano. If the new account will also be Free tier, t4g.nano is fine.

---

---

## 2. Database — Schemas, Extensions, Publications

### 2.1 Schemas present (non-system)
`auth`, `extensions`, `public`, `realtime`, `storage`, `vault` — all standard Supabase. No custom schemas.

### 2.2 Installed extensions
| Extension | Version | Schema | Notes |
|---|---|---|---|
| `plpgsql` | 1.0 | pg_catalog | default |
| `pgcrypto` | 1.3 | extensions | UUIDs/hashing — needed |
| `uuid-ossp` | 1.1 | extensions | UUID generation — needed |
| `pg_stat_statements` | 1.11 | extensions | Supabase default |
| `supabase_vault` | 0.3.1 | vault | Secrets vault — may have stored secrets |
| `pg_graphql` | 1.5.11 | graphql | Supabase default |

**On new project**: pgcrypto and uuid-ossp must be enabled before restoring data (they are referenced by default column values).

### 2.3 Publications (for Realtime)
- `supabase_realtime`: INSERT + UPDATE + DELETE enabled, `all_tables = false` (specific tables subscribed — see section 2.5 after deeper introspection).

### 2.4 pg_cron jobs
None installed.

### 2.5 Public tables (12)
All 12 tables in the `public` schema that must be recreated:

1. `admin_profiles`
2. `products`
3. `warranty_registrations`
4. `site_settings`
5. `otp_verifications`
6. `warranty_certificates`
7. `customer_enquiries`
8. `dealer_enquiries`
9. `distributor_enquiries`
10. `gallery_images`
11. `dealers`
12. `get_in_touch`

### 2.6 Table column schemas (full)

#### `admin_profiles`
- `id` uuid PK NOT NULL (no default — populated from auth trigger)
- `email` text NOT NULL
- `full_name` text
- `is_active` boolean default `false`
- `role` text default `'admin'`
- `created_at` timestamptz NOT NULL default `timezone('utc', now())`

#### `customer_enquiries`
- `id` uuid PK default `uuid_generate_v4()`
- `customer_name` text NOT NULL
- `mobile_number` text NOT NULL
- `city_name` text NOT NULL
- `vehicle_name_model` text NOT NULL
- `treatment_type` text NOT NULL — CHECK IN ('PPF','SUNFILM','GRAPHENE_COATING','MULTIPLE')
- `status` text default `'NEW'` — CHECK IN ('NEW','CONTACTED','CONVERTED','CLOSED')
- `source` text default `'WEBSITE_HEADER'`
- `notes` text
- `created_at`, `updated_at` timestamptz default `now()`

#### `dealer_enquiries`
- `id` uuid PK default `uuid_generate_v4()`
- `dealer_name`, `mobile_number`, `studio_name`, `city`, `state` text NOT NULL
- `products_interested` jsonb default `'[]'`
- `investment_capacity` text
- `existing_business` boolean default `false`
- `status` text default `'PENDING'` — CHECK IN ('PENDING','UNDER_REVIEW','APPROVED','REJECTED')
- `created_at`, `updated_at` timestamptz default `now()`

#### `dealers`
- `id` uuid PK default `gen_random_uuid()`
- `dealer_name`, `phone`, `address`, `city`, `state` text NOT NULL
- `contact_person`, `email`, `pincode` text
- `latitude`, `longitude` double precision NOT NULL
- `is_active` boolean default `true`
- `dealer_type` text NOT NULL default `'standard'` — CHECK IN ('premium','standard','coming_soon')
- `created_at` timestamptz default `now()`

#### `distributor_enquiries`
- `id` uuid PK default `uuid_generate_v4()`
- `distributor_name`, `mobile_number`, `firm_name`, `city`, `state` text NOT NULL
- `products_interested` jsonb default `'[]'`
- `gst_number`, `current_distribution_network` text
- `status` text default `'PENDING'` — CHECK IN ('PENDING','UNDER_REVIEW','APPROVED','REJECTED')
- `created_at`, `updated_at` timestamptz default `now()`

#### `gallery_images`
- `id` uuid PK default `gen_random_uuid()`
- `storage_path`, `title`, `category` text NOT NULL — CHECK category IN ('all','installations','products','events','showroom')
- `description` text
- `width`, `height` integer
- `created_at` timestamptz NOT NULL default `timezone('utc', now())`

#### `get_in_touch`
- `id` uuid PK default `gen_random_uuid()`
- `name`, `phone`, `email`, `product` text NOT NULL
- `created_at` timestamptz NOT NULL default `now()`

#### `otp_verifications`
- `id` uuid PK default `gen_random_uuid()`
- `phone`, `otp_code` text NOT NULL
- `dealer_id` uuid → **FK `dealers.id` (NO ACTION)**
- `purpose` text NOT NULL default `'warranty_registration'`
- `attempts` integer default `0`
- `max_attempts` integer default `3`
- `is_verified` boolean default `false`
- `expires_at` timestamptz NOT NULL
- `created_at` timestamptz default `now()`

#### `products`
- `id` **text** PK (manually assigned, no default)
- `name` text NOT NULL, `short_desc` text
- `features`, `specs` jsonb default `'[]'`
- `parent_id` text → **FK `products.id` (ON DELETE CASCADE)** — self-referencing hierarchy
- `image_url` text
- `sort_order` integer default `999`
- `created_at` timestamptz NOT NULL default `timezone('utc', now())`

#### `site_settings`
- `key` text PK
- `value` jsonb NOT NULL
- `updated_at` timestamptz NOT NULL default `now()`

#### `warranty_certificates`
- `id` uuid PK default `gen_random_uuid()`
- `warranty_id` text NOT NULL
- `registration_id` uuid (no FK enforced — soft link to `warranty_registrations.id` via lookup)
- `pdf_storage_path`, `pdf_public_url` text
- `delivered_to_dealer/customer/admin` booleans default `false`
- `delivery_errors` jsonb default `'[]'`
- `created_at` timestamptz default `now()`

#### `warranty_registrations`
- `id` **bigint** PK — uses sequence `warranty_registrations_id_seq`
- `name`, `phone`, `reg_number`, `status` text NOT NULL (status default `'pending'`)
- `email`, `chassis_number`, `ppf_roll`, `ppf_category`, `dealer_name`, `installer_mobile`, `installation_location`, `message`, `vehicle_image_url`, `rc_image_url` text nullable
- `created_at` timestamptz NOT NULL default `now()`

### 2.7 Sequences
- `warranty_registrations_id_seq` (used by `warranty_registrations.id`)

### 2.8 Foreign keys summary
- `products.parent_id` → `products.id` ON DELETE CASCADE (self-reference)
- `otp_verifications.dealer_id` → `dealers.id` NO ACTION

### 2.9 RLS state
RLS is **enabled on every one of the 12 public tables**.

### 2.10 Indexes (non-PK, non-unique)
| Table | Index | Columns |
|---|---|---|
| products | `idx_products_parent` | (parent_id) |
| warranty_registrations | `idx_warranty_phone` | (phone) |
| warranty_registrations | `idx_warranty_reg_number` | (reg_number) |
| warranty_registrations | `idx_warranty_chassis` | (chassis_number) |
| otp_verifications | `idx_otp_phone_active` | (phone, is_verified, expires_at) |
| customer_enquiries | `idx_customer_enquiries_mobile` | (mobile_number) |
| customer_enquiries | `idx_customer_enquiries_created` | (created_at DESC) |
| dealer_enquiries | `idx_dealer_enquiries_mobile` | (mobile_number) |
| dealer_enquiries | `idx_dealer_enquiries_status` | (status) |
| distributor_enquiries | `idx_distributor_enquiries_mobile` | (mobile_number) |
| distributor_enquiries | `idx_distributor_enquiries_status` | (status) |
| gallery_images | `idx_gallery_category` | (category) |
| gallery_images | `idx_gallery_created` | (created_at DESC) |

### 2.11 Functions (`public` schema)
1. **`normalize_phone(phone_input text) returns text`** (plpgsql) — strips non-digits, prepends `+91` to last 10 digits.
2. **`update_updated_at_column() returns trigger`** (plpgsql) — generic BEFORE UPDATE trigger fn that stamps `updated_at = NOW()`.
3. **`get_dealer_stats() returns TABLE(total bigint, premium bigint, standard bigint, coming_soon bigint, cities bigint, states bigint)`** (plpgsql) — ⚠️ **REFERENCES `public.dealers_locations` which does NOT exist in the schema.** This function is broken/stale (probably left over from an earlier rename from `dealers_locations` → `dealers`). You should either delete it or fix it to reference `public.dealers` before migrating.
4. **`handle_new_user() returns trigger` (SECURITY DEFINER)** — inserts a new row into `public.admin_profiles` (id, email, full_name, is_active=false) whenever a user signs up in `auth.users`. This is the admin approval gate.

### 2.12 Triggers
| Trigger | Table | Timing/Event | Function |
|---|---|---|---|
| `on_auth_user_created` | `auth.users` | AFTER INSERT, row | `handle_new_user()` |
| `update_customer_enquiries_updated_at` | `public.customer_enquiries` | BEFORE UPDATE, row | `update_updated_at_column()` |
| `update_dealer_enquiries_updated_at` | `public.dealer_enquiries` | BEFORE UPDATE, row | `update_updated_at_column()` |
| `update_distributor_enquiries_updated_at` | `public.distributor_enquiries` | BEFORE UPDATE, row | `update_updated_at_column()` |

⚠️ The `on_auth_user_created` trigger on `auth.users` is critical — **without this trigger, the admin signup flow breaks** on the new account.

### 2.13 Row-level security policies (public schema)

**admin_profiles** (3 policies)
- `Public profiles are viewable by everyone.` — SELECT to `public`, `USING true`
- `Users can insert their own profile.` — INSERT to `public`, `WITH CHECK (auth.uid() = id)`
- `Users can update own profile.` — UPDATE to `public`, `USING (auth.uid() = id)`

**customer_enquiries / dealer_enquiries / distributor_enquiries** (same pattern, 3 policies each)
- `Allow admin select` — SELECT to `authenticated`, `USING true`
- `Allow admin update` — UPDATE to `authenticated`, `USING true`, `WITH CHECK true`
- `Allow anonymous insert` — INSERT to `anon, authenticated`, `WITH CHECK true`

**dealers** (2 policies)
- `Admin full access to dealers` — ALL to `authenticated`, `USING true`, `WITH CHECK true`
- `Public can view active dealers` — SELECT to `public`, `USING (is_active = true)`

**gallery_images** (2 policies — duplicate purpose, consider consolidating)
- `Public can view gallery` — SELECT to `anon, authenticated`, `USING true`
- `Public can view gallery images` — SELECT to `anon`, `USING true`

**get_in_touch** (3 policies)
- `Allow authenticated delete` — DELETE to `public`, `USING (auth.role() = 'authenticated')`
- `Allow authenticated select` — SELECT to `public`, `USING (auth.role() = 'authenticated')`
- `Allow public insert` — INSERT to `public`, `WITH CHECK true`

**otp_verifications** (1 policy — service-role only; client reads/writes go via edge function)
- `Service role full access to otp_verifications` — ALL to `service_role`, `USING true`, `WITH CHECK true`

**products** (3 policies — note two overlapping SELECT policies)
- `Allow read all products` — SELECT to `public`, `USING true`
- `Enable read access for all users` — SELECT to `public`, `USING true` (duplicate)
- `Enable all access for admins` — ALL to `public`, `USING (EXISTS SELECT 1 FROM admin_profiles WHERE id=auth.uid() AND is_active=true AND role IN ('superadmin','admin'))`

**site_settings** (4 policies)
- `public read site_settings` — SELECT to `anon, authenticated`, `USING true`
- `active admin upsert site_settings` — INSERT to `authenticated`, `WITH CHECK (EXISTS active admin)`
- `active admin update site_settings` — UPDATE to `authenticated`, `USING/CHECK (EXISTS active admin)`
- `active admin delete site_settings` — DELETE to `authenticated`, `USING (EXISTS active admin)`

**warranty_certificates** (4 policies)
- `Public can view warranty certificates` — SELECT to `anon`, `USING true`
- `Anon can insert warranty certificates` — INSERT to `anon`, `WITH CHECK true`
- `Authenticated full access to warranty_certificates` — ALL to `authenticated`
- `Service role full access to warranty_certificates` — ALL to `service_role`

**warranty_registrations** (4 policies)
- `public read warranties` — SELECT to `anon, authenticated`, `USING true`
- `public insert warranties` — INSERT to `anon, authenticated`, `WITH CHECK true`
- `active admin update warranties` — UPDATE to `authenticated`, `USING/CHECK (EXISTS active admin)`
- `active admin delete warranties` — DELETE to `authenticated`, `USING (EXISTS active admin)`

### 2.14 Storage policies (on `storage.objects`)

Storage buckets present (inferred from policies; confirmed in section 3):
- `product`
- `warranty-uploads`
- `gallery`
- `warranty-certificates`

Policies:
- `product` — public SELECT + INSERT + UPDATE + DELETE (4 policies)
- `warranty-uploads` — `public read warranty uploads` (SELECT), `public upload warranty uploads` (INSERT)
- `gallery` — `Public Access Gallery` (SELECT), two additional duplicate SELECT/INSERT policies
- `warranty-certificates` — public SELECT + INSERT

### 2.15 Realtime publication tables
`pg_publication_tables` returned `null` for `supabase_realtime` → **no tables are actually subscribed to realtime**, even though the publication exists with ins/upd/del enabled. Safe to skip Realtime on the new project unless you plan to add it.

### 2.16 Row counts (live at audit time)
| Table | Rows |
|---|---:|
| dealers | **31** |
| warranty_registrations | **25** |
| products | 16 |
| site_settings | 13 |
| get_in_touch | 5 |
| customer_enquiries | 3 |
| dealer_enquiries | 2 |
| admin_profiles | 1 |
| gallery_images | 1 |
| distributor_enquiries | 0 |
| otp_verifications | 0 |
| warranty_certificates | 0 |

---

## 3. Storage

### 3.1 Buckets
All 4 buckets are **public**. None have file-size caps set (defaults to 50 MB). MIME filtering only on `warranty-certificates`.

| Bucket | Public | MIME filter | Created | Files | Policies |
|---|---|---|---|---:|---:|
| `gallery` | yes | none | 2026-02-01 | 1 | 4 |
| `product` | yes | none | 2026-02-01 | 12 | 6 |
| `warranty-certificates` | yes | `application/pdf` only | 2026-02-14 | 0 | 2 |
| `warranty-uploads` | yes | none | 2026-01-31 | 11 | 2 |

Total storage used: **≈13.5 MB (14,195,123 bytes)** across 24 objects — trivially small, migrates in seconds.

### 3.2 Storage migration strategy
Because the total is ~13 MB, the simplest path:
1. Create all 4 buckets on new project with identical names and `public: true`, same MIME filter on `warranty-certificates`.
2. Recreate the 14 storage policies (see section 2.14).
3. Use `supabase-storage` CLI or a short Node/Bash script with the Supabase JS client to loop each bucket → download → upload to new project. I can generate that script when you're ready.

---

## 4. Authentication

### 4.1 User signups settings
| Setting | Value |
|---|---|
| Allow new users to sign up | ✅ Enabled |
| Allow manual linking | ❌ Disabled |
| Allow anonymous sign-ins | ❌ Disabled |
| Confirm email (double opt-in) | ✅ Enabled |

### 4.2 Providers
Only **Email/password** is enabled. Every other provider is disabled (Phone, SAML, Web3, Apple, Azure, Bitbucket, Discord, Facebook, Figma, GitHub, GitLab, Google, Kakao, KeyCloak, LinkedIn OIDC, Notion, Twitch, X/Twitter, Slack OIDC, Spotify, WorkOS, Zoom). No Custom OAuth/OIDC providers configured.

### 4.3 URL Configuration
| Setting | Value |
|---|---|
| Site URL | `http://localhost:3000` |
| Additional redirect URLs | (none) |

⚠️ **Before going live on the new project, update the Site URL to your production domain and add redirect URLs.** For now, the migration just needs parity with what's set.

### 4.4 Email templates
6 templates are available (Confirm signup, Magic Link, Invite, Recovery, Reauthentication, Email change). **I did not visually verify whether any are customized** — templates collapsed in the dashboard UI. Before migrating, open each one in the dashboard: https://supabase.com/dashboard/project/rnscmxjrkqelmaiwrouz/auth/templates and copy the subject + body for any template that was edited. Defaults don't need to be copied.

### 4.5 Users
1 user total. Provider: `email`. The 1 user corresponds to the single row in `public.admin_profiles` (the admin login).

⚠️ **Auth users cannot be recreated via SQL** — their `encrypted_password` hashes in `auth.users` must be preserved. Options:
- Simplest (1 user): manually sign up again on the new project with the same email/password. The `on_auth_user_created` trigger will auto-create the `admin_profiles` row; you'll then set `is_active=true`.
- Programmatic: use `supabase.auth.admin.listUsers()` on the old project and `supabase.auth.admin.createUser({ ..., email_confirm: true })` on the new one, then `UPDATE admin_profiles SET is_active=true`. Passwords will need to be reset (you can send a recovery email).

### 4.6 Other auth settings (unverified — likely defaults)
I did not pull detailed screenshots of these, so treat as "default" unless you know otherwise:
- Rate limits
- Multi-Factor Authentication (likely off)
- Attack Protection
- Auth Hooks (none observed — page not expanded)
- OAuth Server (beta feature, unlikely enabled)
- SMTP custom sender (likely default Supabase mail)

If any of these are customized, open each page and copy the values before migration.

---

## 5. Edge Functions

**No Edge Functions are currently deployed on the Supabase server.**

However, the local codebase at `supabase/functions/send-warranty-whatsapp/index.ts` exists and is referenced by `components/WarrantyForm.tsx` via `supabase.functions.invoke('send-warranty-whatsapp', ...)`. This function is **expected but not deployed** on the current project (invocations from the live site will fail or the code path is only hit in a dev flow). When migrating, you likely want to deploy it on the new project using the CLI:
```
supabase functions deploy send-warranty-whatsapp --project-ref <new-ref>
```

### 5.1 Edge Function secrets
No custom secrets added. Only default `SUPABASE_*` env vars are available. The `send-warranty-whatsapp` function may need additional secrets (e.g. WhatsApp API keys) that should be set explicitly on deploy:
```
supabase secrets set SOME_KEY=... --project-ref <new-ref>
```
Check `supabase/functions/send-warranty-whatsapp/index.ts` for any `Deno.env.get('...')` calls to know which secrets must exist.

---

## 6. Realtime, Webhooks, Vault

### 6.1 Database Webhooks
**Not enabled.** The `supabase_functions` schema trigger for webhooks hasn't been provisioned. Skip on new project unless you want to add them.

### 6.2 Realtime
Publication `supabase_realtime` exists but has no subscribed tables. Skip on new project unless you want Realtime.

### 6.3 Vault (encrypted secrets storage)
No secrets stored in Vault. Nothing to migrate.

---

## 7. API / Integrations / Project settings

### 7.1 Integrations (installed)
Default Supabase integrations only:
- **Data API** (PostgREST) — active, exposes `public` + `graphql_public` schemas
- **GraphiQL** — active (via `pg_graphql` extension)
- **Vault beta** — active but empty

No third-party integrations (no Vercel connection, no GitHub integration, no Foreign Data Wrappers).

### 7.2 API keys
The old project keys (from `.env`):
- `NEXT_PUBLIC_SUPABASE_URL` = `https://rnscmxjrkqelmaiwrouz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_YKoBbaKznLfOehhQ0Ljj1w_...`
- `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_zqClyohpCEcxHMpcnhSzKQ_...`

After migration, replace all three in `.env` and `.env.local` (local dev + any deployed environments — Vercel / Netlify / Capacitor builds). Search the codebase and remote configs for hardcoded references before switching.

### 7.3 Project Settings (general)
Not pulled explicitly. The defaults in play:
- Custom domain: none (Free tier)
- Network restrictions: none (Pro tier only)
- Point-in-time recovery: none (Pro tier only)
- Log drains: none

If you configure any of these on the new project, set them the same way.

---

## 8. Migration Plan (step-by-step execution order)

Do steps in this exact order — each step depends on the previous.

### Prerequisite: install & authenticate tools on your local machine
```bash
npm install -g supabase              # If not already installed
supabase login                       # Login with your Supabase account (NEW account)
```

### Step 1 — Create the new project
1. On the NEW Supabase account, create an organization (or use existing) and a new project:
   - Name: `Gentech Guard` (or a new name)
   - Region: **South Asia (Mumbai) ap-south-1** (same as old)
   - Compute: nano (or larger if budget allows)
2. Copy down the new `project-ref`, API URL, anon key, service role key. **Do not replace anything yet.**

### Step 2 — Enable required Postgres extensions (via Dashboard → Database → Extensions)
Enable these 4 (plpgsql and pg_graphql are on by default):
- `pgcrypto`
- `uuid-ossp`
- `pg_stat_statements`
- `supabase_vault` (already on by default)

### Step 3 — Dump & restore the schema + data via pg_dump / psql
From the old project's Database Settings page, copy the **Connection string** (direct connection, port 5432) — NOT the pooler. Same for the new project.

```bash
# OLD project connection (grab from Dashboard → Settings → Database → Connection string)
OLD_DB="postgresql://postgres:<old_db_password>@db.rnscmxjrkqelmaiwrouz.supabase.co:5432/postgres"
NEW_DB="postgresql://postgres:<new_db_password>@db.<new_ref>.supabase.co:5432/postgres"

# Dump schema (no auth/storage data — those migrate separately)
pg_dump "$OLD_DB" \
  --schema=public \
  --no-owner --no-privileges \
  --format=plain \
  -f schema.sql

# Dump data only (public schema)
pg_dump "$OLD_DB" \
  --schema=public \
  --data-only --no-owner --no-privileges \
  --column-inserts \
  -f data.sql

# Optionally also dump storage.objects metadata (file rows, not the blobs)
pg_dump "$OLD_DB" \
  --table=storage.objects \
  --data-only --no-owner --no-privileges \
  -f storage_objects.sql
```

Restore on new project:
```bash
psql "$NEW_DB" -f schema.sql
psql "$NEW_DB" -f data.sql
```

**Before restoring `data.sql`**, if you see errors about `warranty_registrations.id` conflicting with the sequence: run `SELECT setval('warranty_registrations_id_seq', (SELECT MAX(id) FROM warranty_registrations));` after the restore.

### Step 4 — Fix the stale `get_dealer_stats` function
```sql
-- Either drop it:
DROP FUNCTION IF EXISTS public.get_dealer_stats();
-- Or edit it to reference public.dealers (was referencing a non-existent public.dealers_locations).
```

### Step 5 — Migrate Storage buckets
Run this Node script (save as `migrate-storage.mjs` in project root, then `node migrate-storage.mjs`):

```js
import { createClient } from '@supabase/supabase-js';
const OLD = createClient('https://rnscmxjrkqelmaiwrouz.supabase.co', '<OLD_SERVICE_ROLE>');
const NEW = createClient('https://<NEW>.supabase.co', '<NEW_SERVICE_ROLE>');
const buckets = [
  { name: 'gallery',              public: true,  mime: null },
  { name: 'product',              public: true,  mime: null },
  { name: 'warranty-uploads',     public: true,  mime: null },
  { name: 'warranty-certificates',public: true,  mime: ['application/pdf'] },
];
for (const b of buckets) {
  await NEW.storage.createBucket(b.name, { public: b.public, allowedMimeTypes: b.mime });
  let { data: files } = await OLD.storage.from(b.name).list('', { limit: 1000 });
  for (const f of files) {
    const { data: blob } = await OLD.storage.from(b.name).download(f.name);
    await NEW.storage.from(b.name).upload(f.name, blob, { contentType: f.metadata?.mimetype });
    console.log(b.name + '/' + f.name);
  }
}
```

Then recreate the 14 storage policies in section 2.14 on the new project via Dashboard → Storage → Policies, or via SQL against `storage.objects`.

### Step 6 — Recreate auth users
Only 1 user. Simplest: sign up again on the new project with the same email/password. The `on_auth_user_created` trigger will create a row in `admin_profiles` — then `UPDATE public.admin_profiles SET is_active=true WHERE email='<email>';`.

### Step 7 — Replicate auth settings (GUI)
On the new project's Dashboard:
- Authentication → Sign In / Providers → turn on only "Email", keep "Allow new signups" + "Confirm email" ON
- Authentication → URL Configuration → Site URL = `http://localhost:3000` (for now — change to prod domain when live)
- Authentication → Email → copy over any customized templates (verify against old dashboard)

### Step 8 — Deploy the edge function
```bash
cd "car-care/supabase"
supabase link --project-ref <new-ref>
supabase functions deploy send-warranty-whatsapp
# Set any required secrets the function reads via Deno.env.get:
supabase secrets set NAME=VALUE --project-ref <new-ref>
```

### Step 9 — Update app environment variables
- Local `.env`: replace `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` with the new project's values.
- Any remote environment: Vercel, Netlify, Capacitor android build config, etc.

### Step 10 — Verify
1. `npm run dev` → test warranty form submission end-to-end (triggers DB insert + storage upload + edge function)
2. Test admin login → confirm `admin_profiles.is_active=true` after signup
3. Test public reads of `dealers`, `products`, `gallery_images`
4. Verify storage URLs from the new project load correctly in the Gallery / Hero / Certificate components

---

## 9. Summary

**What must migrate:**
- 12 public tables (schema + RLS + indexes + triggers + functions + sequence)
- 4 extensions (pgcrypto, uuid-ossp, pg_stat_statements, supabase_vault)
- 4 storage buckets with 24 files totaling ≈13.5 MB
- 14 storage policies
- 34 RLS policies (public schema)
- 4 functions (fix `get_dealer_stats` — it's stale)
- 4 triggers (including the critical `on_auth_user_created` on `auth.users`)
- 1 auth user (easiest to recreate manually)
- Email auth provider settings (email + confirm email)
- 1 Edge Function source (`send-warranty-whatsapp`) that's not currently deployed but exists in the codebase

**What's trivially absent (skip):**
- No custom OAuth providers
- No custom email templates (unverified — confirm)
- No database webhooks
- No realtime subscriptions
- No Vault secrets
- No edge function secrets
- No custom domains, network restrictions, PITR, log drains
- No pg_cron jobs
- No third-party integrations (Vercel/GitHub/etc)

**Total data to move:** ~80 rows across tables + 24 storage files. Migration is small and low-risk.



