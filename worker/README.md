# Deploy the date storage Worker

This Worker writes confirmed dates into the repository's `dates.json` through the GitHub API. The GitHub token must be configured as a Cloudflare secret; never put it in source files.

## Deploy with the Cloudflare dashboard (no local setup)
1. Sign in at https://dash.cloudflare.com/ and open **Workers & Pages**.
2. Create a Worker named `date-invitation-storage`.
3. Open the code editor and replace the sample code with all contents of `src/index.js`, then deploy.
4. Open the Worker **Settings > Variables and Secrets** and add a **Secret** named `GITHUB_TOKEN`.
5. Use a GitHub fine-grained personal access token restricted to repository `ChristianLoydCesista/e-routing_app`, with **Contents: Read and write** permission. Save the secret and redeploy if prompted.
6. Copy the Worker URL ending in `.workers.dev`.

## Deploy with Wrangler (optional)
Install Node.js, then run these commands from this `worker` directory:

```sh
npm install
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npm run deploy
```

When asked for the secret, paste the GitHub token into the terminal prompt. Do not put the token in a command argument or commit it.

## Connect the website
Edit the repository-root `date-storage-config.js` and set `endpoint` to your deployed Worker URL. Commit the change and wait for GitHub Pages to publish.

## Verify
Open the Worker URL in a browser to read `dates.json`. Submit a test date through the invitation; a successful confirmation should say `Date saved successfully`, and a new entry should appear in the repository's `dates.json`.

The endpoint is public and has basic origin checks but no strong anti-abuse/rate-limiting mechanism. It is intended for a small personal invitation.
