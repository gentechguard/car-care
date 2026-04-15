/*
================================================================================
  GENTECH GUARD ADMIN DASHBOARD SETUP GUIDE
================================================================================

This document describes the steps required to set up the Admin System (Supabase Auth & Database)
and explains how to use the Dashboard features.

--------------------------------------------------------------------------------
1. DATABASE & AUTH SETUP (REQUIRED)
--------------------------------------------------------------------------------
The admin portal relies on Supabase Authentication and a custom `admin_profiles` table 
to manage "Active" status approval.

STEP 1: ENABLE AUTH
- Go to your Supabase Project > Authentication
- Ensure "Email/Password" provider is enabled.
- Disable "Confirm Email" if you want easier testing, or keep it on for security.
  (If on, you must verify email before logging in, which might interfere with the "Active" check if not careful).

STEP 2: RUN SQL QUERY
- Go to Supabase Project > SQL Editor.
- Create a new query.
- Copy/Paste the contents of `ADMIN_SQL_SETUP.sql` (found in the root of this project).
- Run the query.

What this does:
1. Creates `admin_profiles` table.
2. Sets up a Trigger: Whenever a new user registers via the /admin page, a row is automatically 
   created in `admin_profiles` with `is_active = FALSE`.
3. Adds RLS policies for security.

--------------------------------------------------------------------------------
2. ONBOARDING WORKFLOW
--------------------------------------------------------------------------------
1. REGISTRATION:
   - Go to `/admin`.
   - Toggle to "Register".
   - Enter Full Name, Email, Password.
   - Click "Request Access".
   - A user is created in Supabase Auth, but their `is_active` flag is FALSE.

2. APPROVAL (SUPERADMIN TASK):
   - Currently, there is no UI to "approve" other users (security measure).
   - Go to Supabase Dashboard > Table Editor > `admin_profiles`.
   - Find the user who just registered.
   - Manually change `is_active` from `FALSE` to `TRUE`.
   - Click Save.

3. LOGIN:
   - Now the user can go to `/admin`, toggle to "Login".
   - Enter credentials.
   - Use the Dashboard.

--------------------------------------------------------------------------------
3. DASHBOARD FEATURES
--------------------------------------------------------------------------------
The Dashboard located at `/admin/dashboard` provides a view of all Warranty Registrations.

A. METRICS (TOP ROW)
   - Total Warranties: Count of all records.
   - New This Month: Count of records created in the current month.
   - System Status: Checks if API connection is live.

B. DATA TABLE
   - Sorting: Click any column header (Date, Customer, etc.) to sort ASC/DESC.
   - Search: The top "Search anything..." bar filters ALL columns. exact match or partial match.
   - View Evidence: Click on the vehicle/RC image thumbnails to open a full-screen modal.
   - Delete: Click the trash icon to delete a record (requires confirmation).

--------------------------------------------------------------------------------
4. API DOCUMENTATION (Detailed)
--------------------------------------------------------------------------------
See `API_DOCS.md` for technical details on the backend routes used by the website and dashboard.

================================================================================
*/
