# SHOU LXK

A SvelteKit course browser backed by Cloudflare D1. The home page shows the five latest course and teacher reviews, a site overview with counts for courses, classes, reviews, and teachers, and a course catalog ranked by stored review counts. Search by course name or code, and filter by teacher, college, course type, credits, attribute, or minimum review count. Results support sorting and pagination. Select a section card to read its reviews, with instructor names and review pagination. Teacher names link to profiles listing their course sections and separate teacher reviews. Sections can have multiple teachers. Review text is not searchable.

Pixi manages the local Windows development environment from conda-forge, with Node.js 26 and pnpm 12. The `packageManager` field pins the project's pnpm release. Cloudflare Workers Builds reads Node.js 26 from `.node-version`; in the Worker dashboard, set **Settings > Build > Build Variables and Secrets** → `PNPM_VERSION=12` so dependency installation uses pnpm 12.

## Run locally

```sh
pixi install
pixi run install
```

`pixi install` creates or updates the locked conda environment. `pixi run install` installs the JavaScript dependencies from `pnpm-lock.yaml`.

Complete the local D1 initialization below, then start the development server with:

```sh
pixi run dev
```

Local development uses a local D1 database. See [SCHEMA.md](SCHEMA.md) for the schema, archived snapshot, and migration details. The target Cloudflare D1 database is `shou-courses` (ID `9e6f10ee-4e0b-4b8c-8662-b598ba79f3ba`) in account `15ce34fcf3c0f4fc58e57f5d7cc10c21`, configured in `wrangler.jsonc`. Its 2026-10-02 archive has been imported and validated remotely: 1,909 courses, 3,286 sections, 970 teachers, 4,406 section-teacher links, 5,597 course reviews, 0 teacher reviews, 97 category options, four migration records, zero foreign-key violations, and matching review counts. Production is live at `https://lxk.shoumc.com`.

The current workspace's local D1 has already been imported and passed its count checks. For a new checkout, initialize the local D1 before running `pixi run dev`. After obtaining `shou-lxk-full-2026-10-02.sql.zip`, extract it and import the SQL directly into the empty local database:

```powershell
New-Item -ItemType Directory -Force .wrangler\shou-lxk-import-2026-10-02 | Out-Null
bz x shou-lxk-full-2026-10-02.sql.zip -o:.wrangler/shou-lxk-import-2026-10-02 -y
# If bz is unavailable, use PowerShell's built-in extractor instead:
# Expand-Archive -LiteralPath shou-lxk-full-2026-10-02.sql.zip -DestinationPath .wrangler\shou-lxk-import-2026-10-02 -Force
pixi run pnpm exec wrangler d1 execute shou-courses --local --file .wrangler/shou-lxk-import-2026-10-02/shou-lxk-full-2026-10-02.sql
```

The archive already contains the current schema and migration records, so do not apply migrations `0001` through `0004` again. The full import and compatibility checks are documented in [SCHEMA.md](SCHEMA.md).

## Review spam protection

Anyone can submit course and teacher reviews after completing Cloudflare Turnstile. Both submission actions validate the token through Cloudflare's Siteverify API before writing a review. Missing, expired, reused, or invalid tokens are rejected. Reviews store only their title, body, and server-set submission date.

Create a managed Turnstile widget in the Cloudflare dashboard and allow the site's hostname. Configure `TURNSTILE_SITE_KEY` as a Worker environment variable and `TURNSTILE_SECRET_KEY` as a Worker secret before deploying. Only the site key is sent to the browser. Submissions are disabled when the site key is missing, and server validation fails closed if the secret is missing or verification is unavailable.

For local development, copy `.dev.vars.example` to `.dev.vars`. It contains Cloudflare's public testing keys; never use these testing keys in production. See the [Turnstile testing documentation](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) for other test outcomes.

## Deploy

Production is deployed manually with Wrangler; this repository does not use Git-based automatic deployment. After installing dependencies and completing `pixi run build`, authenticate with Wrangler and run:

```powershell
pixi run pnpm exec wrangler deploy --config wrangler.jsonc --keep-vars --strict
```

The production `TURNSTILE_SECRET_KEY` is kept as a Worker secret and must be configured separately from the public `TURNSTILE_SITE_KEY` in `wrangler.jsonc`.

## Checks

```sh
pixi run check
pixi run lint
pixi run build
```

The package's `test` script is available as `pixi run test`. This checkout currently does not include a `tests/` directory, so the command reports zero tests until test files are added.
