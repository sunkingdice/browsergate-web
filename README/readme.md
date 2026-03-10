# BrowserGate — Technical Brief

## Infrastructure

- **Server:** Hetzner CX22, Ubuntu 24.04, Nuremberg (nbg1)
- **IP:** 89.167.112.105 / 2a01:4f9:c014:df6::1
- **SSH:** `ssh bg-web` (User: deploy, key auth only, root login disabled)
- **Domain:** browsergate.eu (DNS at INWX: ns.inwx.de, ns2.inwx.de, ns3.inwx.eu)
- **Firewall:** ufw — ports 22, 80, 443 only
- **Repo:** git@github.com:sunkingdice/browsergate-web.git
- **Server path:** ~/browsergate/site (cloned from GitHub via deploy key)

## Stack

- **Hugo** — static site generator (extended edition, v0.157.0)
- **Svelte 5** — interactive components compiled as islands
- **Vite** — builds Svelte islands into static JS bundles
- **Caddy** — web server, auto TLS, will reverse proxy SvelteKit later
- **SvelteKit + adapter-node** — complaint app (TODO, will run on port 3000)
- **Pingen API** — sends physical complaint letters via Deutsche Post (€0.86/letter)
- **Stripe** — payment processing (€5/complaint)
- **Claude API** — generates complaint letter text

## Project Structure

```
browsergate/
├── archetypes/
├── content/
├── layouts/
│   └── index.html              # Main template, mounts Svelte islands
├── static/
│   └── js/islands/
│       └── logo-carousel.js    # Compiled Svelte bundle (built from svelte-islands/)
├── svelte-islands/             # Svelte source (NOT deployed, build output goes to static/)
│   ├── src/
│   │   ├── LogoCarousel.svelte
│   │   └── logo-carousel-entry.js
│   ├── vite.config.js
│   ├── svelte.config.js
│   └── package.json
├── hugo.toml
└── .gitignore
```

## Svelte Islands Pattern

Components are standalone Svelte 5 apps compiled by Vite into `static/js/islands/`. CSS is injected (no separate CSS files). Each island has:

1. A `.svelte` component in `svelte-islands/src/`
2. An entry file that imports and mounts it: `mount(Component, { target: document.getElementById('...') })`
3. A `<div id="...">` + `<script type="module">` in the Hugo template

Build: `cd svelte-islands && npx vite build` → outputs to `static/js/islands/`

Vite config uses `svelte.config.js` with `compilerOptions: { css: 'injected' }` (CommonJS, no "type": "module" in package.json).

## Deploy

```bash
# On Mac
git push

# On server (ssh bg-web)
cd ~/browsergate/site
git pull
hugo --minify
```

## Caddy Config (/etc/caddy/Caddyfile)

```caddyfile
browsergate.eu {
    root * /home/deploy/browsergate/site/public
    file_server
    encode gzip zstd
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }
}

www.browsergate.eu {
    redir https://browsergate.eu{uri} permanent
}
```

When SvelteKit complaint app is added, Caddy gets:

```caddyfile
handle /complain* {
    reverse_proxy localhost:3000
}
```

## Utility Scripts

All scripts live in `utils/`.

### `deploy.sh <commit message>`

Builds Svelte islands, commits, pushes to GitHub, SSHs into the production server, pulls, rebuilds Hugo and the SvelteKit app, and restarts the service.

```bash
./utils/deploy.sh "fix typo on landing page"
```

### `restart.sh`

Kills any running local Hugo server, rebuilds Svelte islands, and starts Hugo dev server in the background with `--disableFastRender` (forces full SCSS recompile).

### `update-extensions.js [path-to-bundle] [--fix]`

Updates the scanned extensions database (`static/data/extensions.json`). Extracts extension IDs from LinkedIn's JavaScript bundle, diffs against the existing database, scrapes the Chrome Web Store for metadata of new extensions, and merges them in.

```bash
# Default: uses sources/5fdhwcppjcvqvxsawd8pg1n51.js
node utils/update-extensions.js

# Use a different bundle
node utils/update-extensions.js sources/new-bundle.js

# Fix mode: re-scrape entries with missing names
node utils/update-extensions.js --fix
```

### `update-count.js`

Reads the current count of extensions in `extensions.json` and updates all `.md` content files that mention the old count.

```bash
node utils/update-count.js
```

### `scrape-profiles.js [--list-id <id>] [--push-only] [--test <n>]`

Scrapes all Chrome Web Store extension profile pages, extracts developer contact info, ratings, user counts, and other metadata into a CSV. Optionally bulk-adds developer emails to a Listmonk list.

```bash
# Scrape only — writes exports/extensions-profiles.csv (~2.5 hours)
node utils/scrape-profiles.js

# Scrape + push developer emails to Listmonk
export LISTMONK_USER=api_username
export LISTMONK_PASS=access_token
node utils/scrape-profiles.js --list-id b6fce36a-3f41-4421-bda7-1c3112a384b1

# Push only (scrape already done, progress file exists)
node utils/scrape-profiles.js --push-only --list-id b6fce36a-3f41-4421-bda7-1c3112a384b1

# Test with first N extensions
node utils/scrape-profiles.js --test 5
```

Saves progress every 50 entries to `exports/extensions-profiles.progress.json` — fully resumable if interrupted. Deduplicates emails before pushing to Listmonk (groups by email, uses the extension with most users as primary). Subscribers are created with `source: "detected"` and rich attributes (extensionId, extensionName, category, users, developerCompany, totalExtensions).

### `server-setup.sh`

Installs required dependencies (Go, Node.js, npm, PostCSS) on the production server.

## Listmonk (Mailing Lists)

- **URL:** https://list.browsergate.eu
- **Admin panel:** https://list.browsergate.eu/admin
- **API docs:** https://listmonk.app/docs/apis/subscribers/

### Lists

| List | UUID | Purpose |
|------|------|---------|
| Signup list | `8c475cb9-680e-43e7-b74c-77408feb0326` | Public signups from the website form |
| Detected developers | `b6fce36a-3f41-4421-bda7-1c3112a384b1` | Extension developers scraped from Chrome Web Store |

### API Authentication

The admin API (`/api/*`) uses **HTTP Basic Auth** with an API user. Create one in Admin → Users.

- `LISTMONK_USER` — API username
- `LISTMONK_PASS` — access token (auto-generated, shown once on creation)

The public endpoint (`/api/public/subscription`) requires no auth and is used by the website signup form.

### Integration Points

- **Website signup form** — `app/src/routes/api/subscribe/+server.ts` proxies to the public API
- **Scrape script** — `utils/scrape-profiles.js --list-id` pushes to the admin API
- **Config** — list UUIDs and Listmonk URL in `app/src/lib/config.ts`

## TODO

- SvelteKit complaint app (/complain): form → Claude API → PDF → Pingen → Stripe
- Bunny CDN in front of Caddy
- Logo SVG variants (uncovered, unhinged, uncontrolled, unauthorized)
- Systemd service for SvelteKit app

## Email (Migadu)

- **Domain:** browsergate.org
- **Account:** admin@browsergate.org
- **Webmail:** https://webmail.migadu.com

| Service | Server | Port | Security |
|---------|--------|------|----------|
| IMAP | imap.migadu.com | 993 | TLS |
| SMTP | smtp.migadu.com | 465 | TLS |
| SMTP (alt) | smtp.migadu.com | 587 | StartTLS |
| POP3 | pop.migadu.com | 995 | TLS |
| ManageSieve | imap.migadu.com | 4190 | StartTLS |

All services use password auth with `admin@browsergate.org` as username. Password stored separately (not in repo).

For the contact form, use SMTP on port 465 (TLS).

## Notes

- Ubuntu 24.04 SSH service is `ssh`, not `sshd`
- Caddy runs as user `caddy` — home dirs need chmod 755
- TLS will auto-provision once DNS delegation is working
