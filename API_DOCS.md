# API Documentation

## Base URL
All API routes are prefixed with `/api`. In development, this is `http://localhost:3000/api`.

---

## 1. /api/warranty/register
**Method**: `POST`  
**Purpose**: Submit a new warranty registration. Used by the public website.

**Request Body**: `FormData` (Multipart)
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| name | Text | Yes | Customer Name |
| phone | Text | Yes | Customer Phone |
| email | Text | Yes | Customer Email |
| regNumber | Text | Yes | Vehicle Registration Number |
| chassisNumber | Text | Yes | Vehicle VIN/Chassis Number |
| ppfRoll | Text | Yes | PPF Roll Code |
| ppfCategory | Text | Yes | PPF Product Category |
| dealerName | Text | Yes | Name of Dealer |
| installerMobile | Text | Yes | Installer's Mobile Number |
| installationLocation | Text | Yes | City/Location of install |
| message | Text | No | Optional message |
| vehicleImage | File | No | Image file of Vehicle |
| rcImage | File | No | Image file of RC |

**Response**:
- `200 OK`: `{ success: true }`
- `500 Error`: `{ error: "Error message" }`

**Backend Actions**:
1. Uploads files to Supabase Storage bucket `warranty-uploads`.
2. Inserts record into Supabase Table `warranty_registrations`.
3. Appends row to Google Sheet (using Service Account).

---

## 2. /api/warranty/check
**Method**: `GET`  
**Purpose**: Public warranty status checker.

**Query Parameters**:
- `q`: Search query string (can be Phone, Reg Number, or Chassis Number).

**Response**:
- `200 OK`: Array of matching warranty objects.
- `404 Not Found`: `{ error: "No warranty found matching these details." }`

---

## 3. /api/admin/* (Authentication)
Currently, the Admin Dashboard uses **Client-Side Supabase Authentication**.
This means the Auth logic happens directly between the browser and Supabase using the `@supabase/supabase-js` SDK.

**Flow**:
1. User enters credentials on `/admin`.
2. App calls `supabase.auth.signInWithPassword()`.
3. On success, App queries `admin_profiles` table to check `is_active` boolean.
4. If Active, Router pushes to `/admin/dashboard`.
5. Session is persisted in LocalStorage/Cookies by Supabase SDK.

**Security**:
- **RLS (Row Level Security)**: Enabled on the Database.
- **Table Policies**:
    - `warranty_registrations`: Public `INSERT` allowed. `SELECT`, `UPDATE`, `DELETE` restricted to Authenticated Users (Admins) only (or public lookup via specific RPC/API if needed, currently API handles public lookup).
    - `admin_profiles`: Viewable by public (to allow login check), but editable only by self or superadmin (via SQL).

---

## Google Sheets Integration
- **Credential Path**: `.env.local`
- **Library**: `googleapis`
- **Auth Method**: Service Account (JWT/GoogleAuth)
- **Scope**: `https://www.googleapis.com/auth/spreadsheets`
