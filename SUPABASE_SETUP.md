# Shared date storage setup

The invitation uses Supabase as its shared backend. GitHub Pages cannot write directly into a repository JSON file, so `dates.json` is an example/placeholder only; real submissions go to the Supabase `date_selections` table.

## Setup
1. Create a project at https://supabase.com/.
2. In the Supabase SQL Editor, run all SQL in `supabase-schema.sql`.
3. Open Project Settings > API (or API Keys), and copy the Project URL and the publishable/anon key.
4. Edit `supabase-config.js`: replace `https://YOUR_PROJECT_ID.supabase.co` with your Project URL and `YOUR_SUPABASE_ANON_KEY` with the publishable/anon key.
5. Commit the file and wait for GitHub Pages to redeploy.

Only use the publishable/anon key in this public website. Never put a service-role key or database password in client-side code.

## What happens
When a visitor confirms a date, the site attempts to insert it into `date_selections`. If saved, the confirmation appears. If Supabase isn't configured or the request fails, the date still displays locally and the page tells the visitor it wasn't saved online. Recent selections can be viewed in Supabase Table Editor > date_selections.

The SQL policies allow anonymous visitors to insert dates and read all dates. This is intentionally simple for a small demo, but it is public and can be spammed. For a production site, add server-side validation/rate limiting and restrict read access if dates should not be public.
