#!/usr/bin/env node
// Final post-migration sanity check.
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

// 1) admin_profiles
const { data: admins } = await sb.from('admin_profiles').select('*');
console.log('admin_profiles rows:', admins?.length);
for (const a of admins || []) {
  console.log(`  id=${a.id}  email=${a.email}  is_active=${a.is_active}  role=${a.role}`);
}

// 2) auth.users count
const { data: users } = await sb.auth.admin.listUsers({ page: 1, perPage: 100 });
console.log('\nauth.users count:', users.users.length);
for (const u of users.users) console.log(`  id=${u.id}  email=${u.email}  confirmed=${!!u.email_confirmed_at}`);

// 3) Sequence sanity: insert+delete a test row and read what id was assigned
const testName = '___migration_test___';
const { data: ins, error: insErr } = await sb.from('warranty_registrations').insert({
  name: testName, phone: '+910000000000', reg_number: '___', status: 'pending',
}).select('id').single();
if (insErr) { console.log('\nsequence test FAILED:', insErr.message); process.exit(1); }
console.log(`\nsequence next id was: ${ins.id} (should be 26 or higher)`);
await sb.from('warranty_registrations').delete().eq('name', testName);

// 4) Public storage URL sanity
const path = 'ppf/Gentech Image.jpeg';
const { data: pub } = sb.storage.from('gallery').getPublicUrl(path);
console.log('\npublic storage URL:', pub.publicUrl);

console.log('\n✓ Final check done.');
