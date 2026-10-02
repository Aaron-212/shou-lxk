# SHOU LXK

A SvelteKit course browser backed by Cloudflare D1. The home page lists course sections by their stored review counts. Search by course name or code, and filter by teacher, college, course type, credits, attribute, or minimum review count. Results support sorting and pagination. Select a section card to read its reviews, with instructor names and review pagination. Teacher names link to profiles listing their course sections and separate teacher reviews. Sections can have multiple teachers. Review text is not searchable.

Cloudflare Workers Builds reads Node.js 26 from `.node-version`. In the Worker dashboard, set **Settings > Build > Build Variables and Secrets** → `PNPM_VERSION=12` so dependency installation uses pnpm 12. The `packageManager` field pins the project's pnpm release.

## Run locally

```sh
pnpm install
pnpm dev
```

Local development uses a local D1 database. See [SCHEMA.md](SCHEMA.md) for the schema, the archived snapshot import, and the migration. The Cloudflare database is `shou-lxk`, configured in `wrangler.jsonc`.

## Review spam protection

Anyone can submit course and teacher reviews after completing Cloudflare Turnstile. Both submission actions validate the token through Cloudflare's Siteverify API before writing a review. Missing, expired, reused, or invalid tokens are rejected. Reviews store only their title, body, and server-set submission date.

Create a managed Turnstile widget in the Cloudflare dashboard and allow the site's hostname. Configure `TURNSTILE_SITE_KEY` as a Worker environment variable and `TURNSTILE_SECRET_KEY` as a Worker secret before deploying. Only the site key is sent to the browser. Submissions are disabled when the site key is missing, and server validation fails closed if the secret is missing or verification is unavailable.

For local development, copy `.dev.vars.example` to `.dev.vars`. It contains Cloudflare's public testing keys; never use these testing keys in production. See the [Turnstile testing documentation](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) for other test outcomes.

## Checks

```sh
pnpm test
pnpm check
pnpm lint
pnpm build
```

The database tests use Node.js 26's built-in SQLite to verify migration integrity, teacher search, review spam protection and validation, pagination, and review-count triggers.
