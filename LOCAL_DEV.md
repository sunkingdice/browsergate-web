# Local development (no Homebrew)

Hugo needs **Go** only to download the Docsy theme (Hugo modules). Install it once, then you can run the site with Node/npm.

## 1. Install Go (one-time)

- **Apple Silicon Mac:** [Download `go1.23.x.darwin-arm64.pkg`](https://go.dev/dl/) (or latest)
- **Intel Mac:** [Download `go1.23.x.darwin-amd64.pkg`](https://go.dev/dl/)

Run the `.pkg` installer. It puts Go in `/usr/local/go` and adds it to your PATH.

**Verify:** Open a **new** terminal and run:
```bash
go version
```

## 2. Install project deps and fetch theme

```bash
cd /Users/steven/Projects/browsergate
npm install
npx hugo mod get
```

(`hugo mod get` uses Go to fetch the Docsy theme. You only need to run it once, or after changing `hugo.toml` modules.)

## 3. Start the dev server

```bash
npm run dev
```

Open **http://localhost:1313**

---

**Optional: rebuild Svelte islands**  
If you change anything in `svelte-islands/`:
```bash
cd svelte-islands && npx vite build && cd ..
```
Then refresh the browser.
