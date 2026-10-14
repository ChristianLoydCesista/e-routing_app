# Shared dates.json storage (without Supabase)

The site uses a Cloudflare Worker as a small backend. The Worker uses a GitHub token to append confirmed dates to this repository's `dates.json`. The token is stored as a Cloudflare Worker secret and is never included in browser code.

## 1. Create a GitHub token
1. Open GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens.
2. Create a token limited to the `ChristianLoydCesista/e-routing_app` repository.
3. Grant **Contents: Read and write** permission only.
4. Do not paste the token into any repository file or website JavaScript.

## 2. Deploy the Cloudflare Worker
1. Create/sign in to Cloudflare at https://dash.cloudflare.com/.
2. Open Workers & Pages and create a Worker named `date-invitation-storage`.
3. Copy the code from `worker/src/index.js` into the Worker editor and deploy it. Or, with Wrangler installed, run `npx wrangler login` and then `npx wrangler deploy` from the `worker` directory.
4. In the Worker settings, open **Settings > Variables and Secrets**, add a secret named `GITHUB_TOKEN`, and paste the fine-grained GitHub token as its value. Save/redeploy if prompted.
5. Copy the deployed Worker URL (for example, `https://date-invitation-storage.<your-subdomain>.workers.dev`).

## 3. Connect the website
1. Edit `date-storage-config.js` in GitHub.
2. Replace `https://YOUR-WORKER-URL.workers.dev` with your actual Worker URL.
3. Commit the change and wait for GitHub Pages to update.

## 4. Test
Open the invitation, choose a date, and click Confirm date. A successful save displays “Date saved successfully”. Then open `dates.json` in GitHub; each entry has `selected_date` and `created_at`. A GET request to the Worker URL returns the JSON data.

## Security and limits
- The GitHub token is stored only as a Worker secret. Never put it in HTML, JavaScript, or a public JSON file.
- The endpoint is public and does not provide strong anti-spam protection. Add rate limiting or CAPTCHA if needed.
- Each successful selection creates a Git commit. This is suitable for a small invitation, not a high-traffic application.
