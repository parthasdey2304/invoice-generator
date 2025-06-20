# Supabase Setup Instructions

## Current Issue
You're seeing "relation does not exist" errors because the Supabase tables haven't been created yet. Here's how to fix this:

## Step 1: Access Your Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project (the one with URL: `https://vwebfnsfdmrcemgjjcls.supabase.co`)

## Step 2: Create the Database Tables

### Option A: Use the Safe Setup Script (RECOMMENDED)
1. In your Supabase dashboard, click on the **SQL Editor** tab (in the left sidebar)
2. Click **"New query"** 
3. Copy and paste the entire contents of `database_setup_safe.sql` file into the SQL editor
4. Click **"Run"** to execute the SQL

**Benefits**: This script can be run multiple times without errors and handles conflicts gracefully.

### Option B: Use the Original Script (If Option A doesn't work)
1. Copy and paste the entire contents of `database_schema.sql` file into the SQL editor
2. Click **"Run"** to execute the SQL
3. If you get duplicate key errors, that's normal - it means some data already exists

## Step 3: Verify Tables Were Created
After running the SQL, you should see these tables in your **Table Editor**:
- `invoices`
- `receivers` 
- `invoice_items`
- `tax_details`
- `bank_details`
- `item_suggestions`
- `form_field_history`

## Step 4: Check Sample Data
1. Go to **Table Editor** and click on `item_suggestions`
2. You should see sample items like "2 MODULAR CONCEALED MS BOXES", etc.
3. If the table is empty, re-run the SQL script

## Troubleshooting the Duplicate Key Error

**Error**: `duplicate key value violates unique constraint "item_suggestions_description_key"`

**Fix**: This happens when trying to insert items that already exist. The updated scripts now handle this with:
- `ON CONFLICT (description) DO NOTHING` - ignores duplicates
- `IF NOT EXISTS` clauses for table creation
- Proper error handling for PostgreSQL

## Step 5: Test the Connection
1. Refresh your React app
2. The console errors should disappear
3. The yellow warning banner should disappear
4. You should now see the invoice form working properly with database-backed suggestions

## Alternative: Quick Fix for Development
If you want to quickly test without setting up policies:

1. Go to **Table Editor** 
2. For each table (`item_suggestions`, `form_field_history`), click the settings icon and **disable Row Level Security**
3. **WARNING**: Only do this for development. Enable RLS for production.

## Current Environment Variables
Your `.env` file is correctly configured with:
- VITE_SUPABASE_URL=https://vwebfnsfdmrcemgjjcls.supabase.co
- VITE_SUPABASE_ANON_KEY=(configured)

## Final Notes
- The app has fallback data, so it works even if DB setup is incomplete
- Both SQL scripts are safe to run multiple times
- Use `database_setup_safe.sql` if you encounter any conflicts
- After successful setup, all console errors will disappear and the app will have full database functionality
