#!/usr/bin/env node
// Export all public-schema table data + all storage bucket files from the OLD Supabase project.
// Reads credentials from .env. Writes everything to ./supabase-export/.
// Usage: node scripts/export-supabase.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const EXPORT_DIR = resolve(ROOT, 'supabase-export');

// Load .env manually (no dotenv dep)
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .filter(l => !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('Missing URL or service role key in .env'); process.exit(1); }

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Table order matters for FK dependencies on restore
const TABLES = [
  'admin_profiles',
  'dealers',
  'products',            // self-referential — order within table handled on insert
  'site_settings',
  'warranty_registrations',
  'warranty_certificates',
  'otp_verifications',
  'customer_enquiries',
  'dealer_enquiries',
  'distributor_enquiries',
  'gallery_images',
  'get_in_touch',
];

const BUCKETS = ['gallery', 'product', 'warranty-uploads', 'warranty-certificates'];

function sqlLiteral(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function rowToInsert(table, row) {
  const cols = Object.keys(row);
  const vals = cols.map(c => sqlLiteral(row[c]));
  return `INSERT INTO public.${table} (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')});`;
}

async function exportTables() {
  console.log('\n=== EXPORTING TABLES ===');
  const seedLines = [
    '-- Gentech Guard data export', `-- Generated ${new Date().toISOString()}`,
    '-- Restore order matches FK dependencies', '',
  ];
  let totalRows = 0;

  for (const t of TABLES) {
    const { data, error } = await sb.from(t).select('*');
    if (error) { console.error(`  ! ${t}: ${error.message}`); continue; }

    // Write JSON (backup + programmatic re-import option)
    writeFileSync(resolve(EXPORT_DIR, 'data', `${t}.json`), JSON.stringify(data, null, 2));

    // For products, sort so parents come before children
    let rows = data;
    if (t === 'products') {
      rows = [...data].sort((a, b) => {
        if (!a.parent_id && b.parent_id) return -1;
        if (a.parent_id && !b.parent_id) return 1;
        return 0;
      });
    }

    seedLines.push(`-- ${t} (${rows.length} rows)`);
    for (const row of rows) seedLines.push(rowToInsert(t, row));

    // Reset warranty_registrations sequence after bulk insert
    if (t === 'warranty_registrations' && rows.length) {
      const maxId = Math.max(...rows.map(r => Number(r.id)));
      seedLines.push(`SELECT setval('public.warranty_registrations_id_seq', ${maxId});`);
    }
    seedLines.push('');
    console.log(`  ✓ ${t}: ${rows.length} rows`);
    totalRows += rows.length;
  }

  writeFileSync(resolve(EXPORT_DIR, 'seed.sql'), seedLines.join('\n'));
  console.log(`  Total: ${totalRows} rows → supabase-export/seed.sql`);
}

async function exportStorage() {
  console.log('\n=== EXPORTING STORAGE ===');
  let totalFiles = 0, totalBytes = 0;

  for (const b of BUCKETS) {
    const outDir = resolve(EXPORT_DIR, 'storage', b);
    mkdirSync(outDir, { recursive: true });

    // Supabase list() returns one dir level at a time — we need recursive listing
    async function walk(prefix = '') {
      const { data, error } = await sb.storage.from(b).list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      const files = [];
      for (const item of data) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (!item.id && item.metadata == null) {
          // it's a folder
          files.push(...(await walk(path)));
        } else {
          files.push({ ...item, path });
        }
      }
      return files;
    }

    const files = await walk();
    const manifest = [];
    for (const f of files) {
      const { data: blob, error: dlErr } = await sb.storage.from(b).download(f.path);
      if (dlErr) { console.error(`    ! ${b}/${f.path}: ${dlErr.message}`); continue; }
      const buf = Buffer.from(await blob.arrayBuffer());
      // Create sub-dirs if path contains /
      const outPath = resolve(outDir, f.path);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, buf);
      manifest.push({ path: f.path, size: buf.length, mime: f.metadata?.mimetype || null });
      totalFiles++; totalBytes += buf.length;
    }
    writeFileSync(resolve(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(`  ✓ ${b}: ${files.length} files`);
  }
  console.log(`  Total: ${totalFiles} files, ${(totalBytes/1024/1024).toFixed(2)} MB`);
}

async function exportAuthUsers() {
  console.log('\n=== EXPORTING AUTH USERS ===');
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) { console.error(`  ! ${error.message}`); return; }
  // Strip out anything that can't round-trip (passwords can't be exported as plaintext)
  const users = data.users.map(u => ({
    id: u.id, email: u.email, phone: u.phone,
    email_confirmed_at: u.email_confirmed_at,
    user_metadata: u.user_metadata, app_metadata: u.app_metadata,
    created_at: u.created_at,
  }));
  writeFileSync(resolve(EXPORT_DIR, 'data', 'auth_users.json'), JSON.stringify(users, null, 2));
  console.log(`  ✓ ${users.length} user(s) — NOTE: passwords cannot be exported, recreate via recovery or re-signup`);
}

(async () => {
  try {
    mkdirSync(resolve(EXPORT_DIR, 'data'), { recursive: true });
    await exportTables();
    await exportStorage();
    await exportAuthUsers();
    console.log('\n✓ Export complete → ./supabase-export/');
  } catch (err) {
    console.error('\nFATAL:', err);
    process.exit(1);
  }
})();
