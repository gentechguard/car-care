Admin Portal (/admin)
I have built a complete, secure Admin Backend Portal.

Features Implemented:
Secure Login/Register (/admin):
Professional split-screen login page.
New Registration Logic: When a user registers, they are created in Supabase but CANNOT login immediately.
"Active" Guard: A trigger I wrote (SQL provided) automatically marks new users as active: false. You (the Superadmin) must manually approve them in the Database to let them in.
Admin Dashboard (/admin/dashboard):
Layout: Sidebar + Main Content layout. Light/Clean "SaaS" aesthetic for professional use, contrasting with the dark consumer site.
Stats Cards: Overview of Total Warranties, New this Month, and System Status.
Live Data Table:
Omni-Search: Search by Name, Phone, Reg Number, or anything else instantly.
Sorting: Click any header to sort.
Logic: Fetches live data from your existing warranty_registrations table.
Evidence Viewer:
Clicking on any small evidence image (Car/RC) in the table opens a full-screen, high-res modal view.
Delete Action: Admins can delete invalid entries.
Action Required: Database Setup
Because I cannot run SQL commands on your behalf, you must run the setup script one time to enable the "Admin Profile" system.

Open 
ADMIN_SQL_SETUP.sql
 (I created this file in your project root).
Copy the contents.
Go to Supabase Dashboard > SQL Editor.
Paste and Run.
This creates the admin_profiles table, enables Security (RLS), and sets up the "Auto-Create Inactive User" trigger.

Documentation
I have created two detailed guides in your project folder:

ADMIN_GUIDE.md
: Complete user manual for the dashboard and setup details.
API_DOCS.md
: Technical documentation of all API routes (/register, /check, etc.) for your reference.
You can now test the flow:

Go to /admin, Register a new user.
Go to Supabase -> Table Editor -> admin_profiles -> Change is_active to TRUE.
Go back to /admin, Login.
See the Dashboard populated with your warranty data.