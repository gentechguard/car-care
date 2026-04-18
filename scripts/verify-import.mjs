#!/usr/bin/env node
// Quick verification: count rows in each public table on the new project.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, '.env.new'), 'utf8').split('\n').filter(Boolean).filter(l=>!l.startsWith('#'))
    .map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];})
);
const sb = createClient(env.NEW_SUPABASE_URL, env.NEW_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const EXPECTED = {
  dealers: 31, products: 16, warranty_registrations: 25,
  site_settings: 13, get_in_touch: 5, customer_enquiries: 3,
  dealer_enquiries: 2, admin_profiles: 1, gallery_images: 1,
  distributor_enquiries: 0, otp_verifications: 0, warranty_certificates: 0,
};

console.log('\n=== ROW COUNT VERIFICATION ===');
let ok = true;
for (const [t, expected] of Object.entries(EXPECTED)) {
  const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
  if (error) { console.log(`  ✗ ${t}: ERROR ${error.message}`); ok = false; continue; }
  const status = count === expected ? '✓' : '✗';
  if (count !== expected) ok = false;
  console.log(`  ${status} ${t}: ${count} (expected ${expected})`);
}

console.log('\n=== STORAGE FILE VERIFICATION ===');
for (const b of ['gallery','product','warranty-uploads','warranty-certificates']) {
  async function walk(prefix='') {
    const { data, error } = await sb.storage.from(b).list(prefix, { limit: 1000 });
    if (error) return 0;
    let n = 0;
    for (const it of data) {
      if (!it.id && it.metadata == null) n += await walk(prefix ? `${prefix}/${it.name}` : it.name);
      else n += 1;
    }
    return n;
  }
  const expected = { gallery: 1, product: 12, 'warranty-uploads': 11, 'warranty-certificates': 0 }[b];
  const actual = await walk();
  const status = actual === expected ? '✓' : '✗';
  console.log(`  ${status} ${b}: ${actual} (expected ${expected})`);
  if (actual !== expected) ok = false;
}

console.log(ok ? '\n✓ ALL GOOD' : '\n✗ some mismatches — investigate');
