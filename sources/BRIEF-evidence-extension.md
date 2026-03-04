# BrowserGate: Evidence Collection Extension — Strategic & Technical Brief

*Discussion notes and strategic planning from the source code analysis session.*

---

## Context

We analyzed LinkedIn's production JavaScript bundle (`5fdhwcppjcvqvxsawd8pg1n51.js`, Webpack chunk 905, ~2.7 MB). The full technical analysis is in `sources/ANALYSIS.md`. This document captures the strategic discussion that followed.

---

## Key Findings (Summary)

1. **6,167 Chrome extension IDs** are hardcoded in the JavaScript bundle (line 9571), each paired with a known internal file path.

2. **Two detection methods run simultaneously:**
   - **AED (Active Extension Detection):** Fires `fetch("chrome-extension://{id}/{file}")` for all 6,167 extensions. A successful response means the extension is installed.
   - **Spectroscopy:** Recursively walks the entire DOM tree searching for `"chrome-extension://"` strings in text nodes and element attributes.

3. **Data is exfiltrated** via `AedEvent` and `SpectroscopyEvent` to `https://www.linkedin.com/li/track`, encrypted with RSA before transmission. The encrypted fingerprint is also injected as a header into every subsequent API request during the session.

4. **Extension scanning is part of a 48-signal device fingerprinting system** (APFC/DNA) that also collects canvas fingerprints, WebGL data, audio fingerprints, font lists, battery status, incognito detection, hardware specs, and more.

5. **Three third-party services are loaded silently:**
   - **HUMAN Security** (formerly PerimeterX) via hidden iframe at `li.protechts.net`
   - **Merchant Pool DFP** via script from `merchantpool1.linkedin.com`
   - **Google reCAPTCHA v3 Enterprise** — executes invisibly on page load

6. **Extensions scanned include those that reveal GDPR Article 9 protected categories:**
   - Religious beliefs: PordaAI (Islamic content filter), Deen Shield (Islamic productivity)
   - Political opinions: Anti-Zionist Tag, No more Musk
   - Health data: simplify (neurodivergent accessibility)

7. **Competitive intelligence:** LinkedIn scans for every major Microsoft competitor's browser extensions — Salesforce, HubSpot, Pipedrive — building per-company technology profiles using the user's known name, employer, and role.

8. **The list is growing rapidly.** ~1,000 extensions in May 2025 → 5,398+ by early 2026. The surveillance is accelerating, not winding down.

---

## Vulnerability: Spectroscopy Data Poisoning

The Spectroscopy scanner (lines 9583–9587) has a fundamental weakness:

- It walks the entire DOM looking for `"chrome-extension://"` strings
- It does **zero validation** — doesn't check if the ID is real, doesn't check if it's in the hardcoded list
- It just extracts anything that looks like an extension ID and ships it

**Exploitation:** A browser extension could inject hidden DOM elements containing fake `chrome-extension://` URLs. LinkedIn's scanner would report them all as "detected extensions." If enough users ran such an extension, LinkedIn's extension scanning database would fill with noise and become statistically useless.

**Message injection:** The `parseFoundString` function (line 9582) extracts everything between `chrome-extension://` and the next `/` without validation. Strings like `chrome-extension://gdpr-article-9-violation/x` would land as "extension IDs" in their analytics pipeline.

**Strategic assessment:** Technically interesting, but a distraction. Data poisoning is a guerrilla tactic. The real weapon is evidence collection.

---

## The Evidence Collection Extension

### Concept

A Chrome extension that:
1. Sits passively on LinkedIn pages
2. Observes and records the fingerprinting as it happens in real time
3. Packages the evidence with timestamps and cryptographic hashes
4. Ties each evidence package to a registered, named user

### What It Captures

**The extension scan:**
- Intercepts the 6,167 `fetch()` calls to `chrome-extension://` URLs as they fire
- Records exact timestamps of each probe
- Logs which extensions LinkedIn detected on this specific user's browser

**The data exfiltration:**
- Intercepts POST requests to `https://www.linkedin.com/li/track`
- Captures `AedEvent` and `SpectroscopyEvent` payloads before encryption
- Logs calls to `/platform-telemetry/li/apfcDf` and `/apfc/collect`

**Third-party data sharing:**
- Records the hidden iframe creation for `li.protechts.net` (HUMAN Security)
- Captures the `merchantpool1.linkedin.com` script load
- Logs reCAPTCHA Enterprise execution and token generation

**The DOM scan:**
- Observes the Spectroscopy walker traversing the DOM (via MutationObserver or by monkey-patching `Node.prototype`)

### Evidence Package Format

Each session generates a package containing:
- Raw intercepted network requests and payloads
- DOM modifications (hidden iframes, off-screen elements)
- User's timestamp and timezone
- Session metadata (page URL, user agent)
- SHA-256 hash of the entire evidence bundle
- Optional: hash uploaded to a public timestamping authority (e.g., OpenTimestamps) for independent tamper-proof verification

### Legal Properties

- **Non-invasive:** The extension doesn't block, modify, or interfere with LinkedIn. It's a user observing what happens in their own browser. LinkedIn cannot claim it's an attack or unauthorized access.
- **Per-user, per-session:** Each package is a documented instance of the violation happening to a specific person at a specific time. Not a theoretical code analysis — a log.
- **Machine-generated:** Not a screenshot someone might have doctored. Automated, hashed, timestamped capture of actual network requests.
- **Continuous:** Every day LinkedIn doesn't stop, every user's evidence pool grows. The violation is proven as ongoing and systematic.

---

## The Class Action Pipeline

### Model

1. **User installs the BrowserGate evidence collection extension**
2. **User registers** with name, address, and contact details on browsergate.eu
3. **Extension collects evidence passively** every time the user visits LinkedIn
4. **Evidence packages are uploaded** to BrowserGate's servers, hashed and timestamped
5. **BrowserGate aggregates the evidence** — thousands of named individuals, each with machine-generated proof of unconsented browser scanning
6. **Evidence is passed to law firms** interested in filing GDPR class action suits

### Why This Is Powerful

For a law firm evaluating whether to take a GDPR class action, this is a complete package:

| Requirement | How BrowserGate Provides It |
|------------|---------------------------|
| Prove the mechanism exists | Static source code analysis (`ANALYSIS.md`) |
| Prove it runs against real users | Extension captures it happening per-session |
| Find plaintiffs | Plaintiffs register themselves |
| Prove it's ongoing | Evidence grows daily as long as LinkedIn keeps scanning |
| Prove special category data processing | Extension logs which extensions were detected, mapped to Article 9 categories |
| Prove lack of consent | No consent mechanism exists in LinkedIn's flow — the scan runs silently |

### Financial Context

- GDPR Article 83(5): Violations of Article 9 can result in fines up to **4% of total worldwide annual turnover**
- Microsoft's annual revenue: ~$240 billion
- Theoretical maximum fine: ~$10 billion
- Even a fraction makes this extremely attractive to litigation firms
- Each registered user with evidence is a potential individual damages claim

---

## Technical Implementation Notes (for future development)

### Extension Architecture (High-Level)

```
background.js (Service Worker)
├── Network request interception (chrome.webRequest / fetch monkey-patch)
├── Evidence package assembly
├── SHA-256 hashing
├── Upload to browsergate.eu API
│
content-script.js (injected into linkedin.com)
├── MutationObserver for hidden iframe creation
├── DOM scan detection (watch for recursive tree walks)
├── Override/wrap fetch() to log chrome-extension:// probes
│
popup.html
├── Registration form
├── Evidence log viewer
├── Status dashboard (sessions recorded, evidence packages uploaded)
```

### Key Technical Hooks

| What to Intercept | How |
|-------------------|-----|
| `fetch("chrome-extension://...")` probes | Wrap `window.fetch` before LinkedIn's code runs |
| POST to `li/track` | `chrome.webRequest.onBeforeRequest` or fetch wrapper |
| Hidden iframe creation | `MutationObserver` on `document.body` watching for `li.protechts.net` |
| DOM Spectroscopy walk | Potentially detect via `MutationObserver` or performance monitoring |
| `globalThis.apfcDf` assignment | `Object.defineProperty` trap on `globalThis` |

### Evidence Integrity

- Each evidence package gets a SHA-256 hash at creation time
- Hash can be anchored to a public timestamping service (OpenTimestamps, blockchain, RFC 3161 TSA)
- This proves the evidence existed at a specific time and hasn't been modified
- Chain of custody: user identity → extension capture → hash → timestamp authority → BrowserGate server → law firm

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `5fdhwcppjcvqvxsawd8pg1n51.js` | LinkedIn's production JavaScript bundle (the malicious code) |
| `ANALYSIS.md` | Detailed technical analysis with line numbers and code excerpts |
| `BRIEF-evidence-extension.md` | This file — strategic brief and extension concept |
| `Tracked Plugins - Sheet1.csv` | Extension data (CSV format) |
| `Tracked Plugins.xlsx` | Extension data (Excel format) |

---

*This document captures the discussion and planning from the initial source code analysis session. Use it as a starting point for the evidence collection extension development and the "How This Works" content page on browsergate.eu.*
