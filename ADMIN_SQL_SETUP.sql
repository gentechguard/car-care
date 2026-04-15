-- Admin Users & Profiles Setup

-- 1. Create a table for admin profiles
create table public.admin_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  is_active boolean default false,
  role text default 'admin', -- 'superadmin' or 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.admin_profiles enable row level security;

-- 3. Create policies
create policy "Public profiles are viewable by everyone." on public.admin_profiles
  for select using (true);

create policy "Users can insert their own profile." on public.admin_profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.admin_profiles
  for update using (auth.uid() = id);

-- 4. Create a Trigger to handle new user signup automatically
-- This function runs every time a new user signs up via Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.admin_profiles (id, email, full_name, is_active)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', false);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Grant permissions (if needed, usually service_role handles this)
grant usage on schema public to anon, authenticated, service_role;
grant all on public.admin_profiles to anon, authenticated, service_role;

-- 6. Add policy for Superadmins to edit others (optional, for now we rely on direct DB edit or service role)
