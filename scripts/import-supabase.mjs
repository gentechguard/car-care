#!/usr/bin/env node
// Import the exported data + storage files INTO the NEW Supabase project.
// Prerequisites:
//   1. Create the new project in the Supabase dashboard.
//   2. Enable extensions: pgcrypto, uuid-ossp (Dashboard → Database → Extensions).
//   3. Run supabase-export/schema.sql in the new project's SQL Editor.
//   4. Set NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_ROLE_KEY as env vars or in .env.new
//   5. Run seed.sql in SQL Editor (or this script will skip DB inserts and only do storage)
//
// Usage:
//   node scripts/import-supabase.mjs              # creates buckets + uploads all files
//   node scripts/import-supabase.mjs --with-data  # also runs seed.sql inserts via service role (slower)

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const EXPORT_DIR = resolve(ROOT, 'supabase-export');

// Accept credentials from .env.new (preferred) or from process.env
function loadEnv() {
  const envPath = resolve(ROOT, '.env.new');
  if (existsSync(envPath)) {
    return Object.fromEntries(
      readFileSync(envPath, 'utf8').split('\n').filter(Boolean).filter(l => !l.startsWith('#'))
        .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
    );
  }
  return process.env;
}
const env = loadEnv();
const URL = env.NEW_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEW_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('Missing NEW_SUPABASE_URL / NEW_SUPABASE_SERVICE_ROLE_KEY in .env.new'); process.exit(1); }

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const BUCKETS = [
  { name: 'gallery',              public: true, allowedMimeTypes: null },
  { name: 'product',              public: true, allowedMimeTypes: null },
  { name: 'warranty-uploads',     public: true, allowedMimeTypes: null },
  { name: 'warranty-certificates',public: true, allowedMimeTypes: ['application/pdf'] },
];

async function createBuckets() {
  console.log('\n=== CREATING BUCKETS ===');
  for (const b of BUCKETS) {
    const { error } = await sb.storage.createBucket(b.name, {
      public: b.public,
      allowedMimeTypes: b.allowedMimeTypes,
    });
    if (error && !/already exists/i.test(error.message)) {
      console.error(`  ! ${b.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${b.name}` + (error ? ' (already exists)' : ''));
    }
  }
}

function walkDir(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === '_manifest.json') continue;
    const p = resolve(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkDir(p));
    else out.push(p);
  }
  return out;
}

async function uploadStorage() {
  console.log('\n=== UPLOADING STORAGE FILES ===');
  const MIME_BY_EXT = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif', pdf:'application/pdf', svg:'image/svg+xml' };
  let uploaded = 0, failed = 0;
  for (const b of BUCKETS) {
    const dir = resolve(EXPORT_DIR, 'storage', b.name);
    if (!existsSync(dir)) { console.log(`  - ${b.name}: directory missing, skip`); continue; }
    const files = walkDir(dir);
    for (const f of files) {
      const rel = relative(dir, f).replace(/\\/g, '/');
      const ext = rel.split('.').pop().toLowerCase();
      const buf = readFileSync(f);
      const { error } = await sb.storage.from(b.name).upload(rel, buf, {
        contentType: MIME_BY_EXT[ext] || 'application/octet-stream',
        upsert: true,
      });
      if (error) { console.error(`    ! ${b.name}/${rel}: ${error.message}`); failed++; }
      else { uploaded++; }
    }
    console.log(`  ✓ ${b.name}: ${files.length} files`);
  }
  console.log(`  Uploaded: ${uploaded}, Failed: ${failed}`);
}

async function runSeedData() {
  console.log('\n=== INSERTING DATA (JSON → rows via REST) ===');
  const dataDir = resolve(EXPORT_DIR, 'data');
  // Order matters: parents before children for FK
  const ORDER = ['admin_profiles','dealers','products','site_settings','warranty_registrations','warranty_certificates','otp_verifications','customer_enquiries','dealer_enquiries','distributor_enquiries','gallery_images','get_in_touch'];
  for (const t of ORDER) {
    const file = resolve(dataDir, `${t}.json`);
    if (!existsSync(file)) continue;
    let rows = JSON.parse(readFileSync(file, 'utf8'));
    if (!rows.length) { console.log(`  - ${t}: 0 rows`); continue; }
    // For products, parent rows first
    if (t === 'products') {
      rows = [...rows].sort((a,b) => (!a.parent_id && b.parent_id) ? -1 : (a.parent_id && !b.parent_id) ? 1 : 0);
    }
    const { error } = await sb.from(t).upsert(rows);
    if (error) { console.error(`  ! ${t}: ${error.message}`); }
    else { console.log(`  ✓ ${t}: ${rows.length} rows`); }
  }
  // Advance sequence
  const warranties = JSON.parse(readFileSync(resolve(dataDir, 'warranty_registrations.json'), 'utf8'));
  if (warranties.length) {
    const maxId = Math.max(...warranties.map(r => Number(r.id)));
    console.log(`  Set warranty_registrations_id_seq to ${maxId} — run manually in SQL Editor:`);
    console.log(`    SELECT setval('public.warranty_registrations_id_seq', ${maxId});`);
  }
}

(async () => {
  const withData = process.argv.includes('--with-data');
  try {
    await createBuckets();
    await uploadStorage();
    if (withData) await runSeedData();
    console.log('\n✓ Import complete.');
    if (!withData) console.log('Next: run supabase-export/seed.sql in the new project SQL editor for table data.');
  } catch (err) {
    console.error('\nFATAL:', err);
    process.exit(1);
  }
})();
