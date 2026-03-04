# Technical Analysis: LinkedIn's Browser Extension Fingerprinting System

**Source file:** `5fdhwcppjcvqvxsawd8pg1n51.js`  
**File size:** ~2.7 MB (13,159 lines of minified JavaScript, single line 9571 alone is 409,920 characters)  
**Webpack chunk ID:** `chunk.905`  
**Framework:** Ember.js (via `globalThis.webpackChunk_ember_auto_import_`)

---

## Executive Summary

LinkedIn deploys a client-side JavaScript system that silently scans every Chrome user's browser for the presence of **6,167 specific Chrome extensions**. The scan uses the `fetch()` API to probe `chrome-extension://` URLs — a brute-force technique that exploits how Chrome exposes extension resources. Detected extension IDs are transmitted to LinkedIn's servers via two tracking events (`AedEvent` and `SpectroscopyEvent`) through the `li/track` telemetry endpoint. The extension scanning is one component of a larger device fingerprinting system called **APFC** (Anti-fraud Platform Features Collection), which also harvests canvas fingerprints, WebGL data, audio fingerprints, font lists, hardware specs, and more — all encrypted before transmission.

---

## 1. Architecture Overview

The file is a Webpack bundle containing multiple modules. Three distinct systems collaborate:

| System | Internal Name | Purpose |
|--------|--------------|---------|
| **APFC / DNA** | `triggerApfc`, `triggerDnaApfcEvent` | Device fingerprinting engine — collects 48 browser features |
| **AED** | `AedEvent`, `fetchExtensions` | Active Extension Detection — brute-force extension scanning via `fetch()` |
| **Spectroscopy** | `SpectroscopyEvent`, `scanDOMForPrefix` | Passive extension detection — scans the DOM for `chrome-extension://` strings injected by extensions |

All three systems feed into LinkedIn's unified `li/track` telemetry pipeline.

---

## 2. The Extension List

### Location

**Line 9571, character offset 443**, inside webpack module `75023`:

```javascript
const r=[
  {id:"aaaeoelkococjpgngfokhbkkfiiegolp", file:"assets/index-COXueBxP.js"},
  {id:"aabfjmnamlihmlicgeoogldnfaaklfon", file:"images/logo.svg"},
  {id:"aacbpggdjcblgnmgjgpkpddliddineni", file:"sidebar.html"},
  // ... 6,164 more entries ...
  {id:"pppndnondekehijelkdnlihcfehjacfe", file:"..."},
  {id:"ppppdkjdnjpomdkpamemnhcebkbpbcma", file:"..."}
]
```

### Structure

Each entry in the array `r` is an object with two fields:

- **`id`**: The Chrome Web Store extension ID (a 32-character lowercase string), e.g. `efaidnbmnnnibpcajpcglclefindmkaj` (Adobe Acrobat)
- **`file`**: A known resource path inside that extension's package, e.g. `popup.html`, `icon.png`, `manifest.json`, `inject.js`

The `file` field is critical to the detection technique (see Section 3). LinkedIn's engineers have manually or programmatically catalogued a specific internal file path for each of the 6,167 extensions — a file that is known to be web-accessible from that extension.

### Scale

- **6,167 extension IDs** are hardcoded directly in the JavaScript bundle
- The array alone occupies **~409,000 characters** of the source file
- Extension IDs span from `aaa...` to `ppp...` alphabetically

---

## 3. Detection Technique: `fetch()` Resource Probing

### How It Works

Chrome extensions can expose internal files to web pages via their `manifest.json`'s `web_accessible_resources` declaration. LinkedIn exploits this by attempting to `fetch()` a known file from each extension's internal URL scheme:

```
chrome-extension://{extensionId}/{filePath}
```

If the extension is installed and the file is web-accessible, the `fetch()` succeeds. If the extension is not installed, Chrome blocks the request and the promise rejects.

### Implementation — Method 1: Parallel Batch Scan (function `c`)

**Lines 9573–9576:**

```javascript
async function c() {
  const e = [],
    t = r.map(({id: t, file: n}) => {
      return fetch(`chrome-extension://${t}/${n}`)
    });
  (await Promise.allSettled(t)).forEach((t, n) => {
    if ("fulfilled" === t.status && void 0 !== t.value) {
      const t = r[n];
      t && e.push(t.id);
    }
  });
  return e;
}
```

This function:
1. Iterates over all 6,167 entries in the array `r`
2. Fires a `fetch()` request to `chrome-extension://{id}/{file}` for each one
3. Uses `Promise.allSettled()` to wait for all requests to complete
4. Any request that resolves as `"fulfilled"` means the extension **is installed**
5. Collects the IDs of all detected extensions into an array

All 6,167 fetch requests are fired **simultaneously** using `Promise.allSettled()`.

### Implementation — Method 2: Staggered Sequential Scan

**Lines 9578–9579:**

```javascript
async function(e) {
  const t = [];
  for (const {id: n, file: i} of r) {
    try {
      await fetch(`chrome-extension://${n}/${i}`) && t.push(n);
    } catch(e) {}
    e > 0 && await new Promise(t => setTimeout(t, e));
  }
  return t;
}
```

This alternative scans extensions **one at a time** with a configurable delay (`staggerDetectionMs`) between each probe. This is likely used to avoid detection by network monitoring tools or to reduce CPU load. Each failed fetch is silently caught and ignored.

### Which Method Is Used

**Lines 9577–9579** show the selection logic:

```javascript
const {
  useRequestIdleCallback: i = false,
  timeout: o = 2000,
  staggerDetectionMs: l = 0
} = n;

const d = async () => {
  const n = l > 0
    ? await staggeredScan(l)   // Method 2: sequential with delay
    : await c();               // Method 1: parallel batch
  // ...fire tracking events...
};

i && "function" == typeof window.requestIdleCallback
  ? window.requestIdleCallback(d, {timeout: o})
  : await d();
```

- If `staggerDetectionMs > 0`, it uses the slower staggered scan
- Otherwise, it uses the parallel batch scan (all 6,167 requests at once)
- The scan can be deferred to `requestIdleCallback` to run when the browser is idle, making it less detectable to the user

---

## 4. Spectroscopy: Passive DOM Scanning

In addition to the active `fetch()` probes, LinkedIn runs a **second, independent detection system** that scans the entire DOM for evidence of installed extensions.

### Implementation

**Lines 9581–9587:**

```javascript
const d = "chrome-extension://";

function f() { return window.document; }

function u(e) {
  const t = e.indexOf(d);
  return -1 === t ? "" : e.substring(t + d.length).split("/")[0];
}

function p(e, t, n) {
  // Scan text nodes
  if (e.nodeType === Node.TEXT_NODE
      && void 0 !== e.textContent
      && e.textContent.includes(t))
    n.push(u(e.textContent));

  // Scan element attributes
  if (e.nodeType === Node.ELEMENT_NODE)
    for (let i = 0; i < e.attributes.length; i++) {
      const o = e.attributes.item(i);
      void 0 !== o.value && o.value.includes(t) && n.push(u(o.value));
    }

  // Recurse into children
  for (let i = 0; i < e.childNodes.length; i++)
    p(e.childNodes[i], t, n);
}

function h(e, t) {
  if (!a() || !s()) return;  // Only runs in Chrome browsers
  const n = [];
  p(f(), d, n);
  Array.isArray(n) && n.length > 0
    && e.fireTrackingPayload("SpectroscopyEvent", {browserExtensionIds: n, ...t});
}
```

This system:
1. Recursively walks the **entire DOM tree** starting from `document`
2. Inspects every **text node** and every **element attribute** for the string `"chrome-extension://"`
3. When found, extracts the extension ID from the URL (the 32-character string after `chrome-extension://` and before the next `/`)
4. Collects all discovered extension IDs and fires a `SpectroscopyEvent`

This catches extensions that inject content into the page (content scripts, injected UI elements, modified `src` attributes, etc.) — even if those extensions don't have web-accessible resources that the `fetch()` method could probe.

### Why Two Methods?

| Method | Technique | Catches |
|--------|-----------|---------|
| **AED** (`fetchExtensions`) | Probes `chrome-extension://` URLs via `fetch()` | Extensions with web-accessible resources (active scan of known list) |
| **Spectroscopy** (`scanDOMForPrefix`) | Walks the DOM looking for `chrome-extension://` strings | Extensions that inject content into the page (passive scan, no predefined list needed) |

Together, they cast a wide net. The AED scan detects extensions that are merely installed (even if they don't inject anything into the current page). The Spectroscopy scan catches extensions that are actively modifying the page, even if they're not in LinkedIn's hardcoded list.

---

## 5. Data Exfiltration

### Tracking Events

Detected extension IDs are sent to LinkedIn's servers via two custom tracking events:

**Line 9580 — AedEvent (Active Extension Detection):**
```javascript
Array.isArray(n) && n.length > 0
  && e.fireTrackingPayload("AedEvent", {browserExtensionIds: n, ...t});
```

**Line 9587 — SpectroscopyEvent (Passive DOM Detection):**
```javascript
Array.isArray(n) && n.length > 0
  && e.fireTrackingPayload("SpectroscopyEvent", {browserExtensionIds: n, ...t});
```

Both events carry a `browserExtensionIds` array — the list of Chrome extension IDs that were successfully detected on the user's browser.

### The `li/track` Telemetry Endpoint

**Line 2026 / 4288 / 11785:**
```javascript
"https://www.linkedin.com/li/track"
```

The `fireTrackingPayload` method feeds into LinkedIn's main telemetry transporter, which:
- Batches events (up to 29 per batch, line 2098/4360)
- Sends them via POST to `https://www.linkedin.com/li/track`
- Includes retry logic with 4 attempts (line 2098)
- Supports LZ-based compression before transmission (function `compressToBase64`, lines 9587–9601)

### Encryption Before Transmission

**Line 9528:**
```javascript
f.encryptWithKeyFromDifferentSources(
  JSON.stringify(t),
  "apfcDfPK",    // Public key identifier
  "apfcDfPKV",   // Public key version
  n, r
).then(t => {
  globalThis.apfcDf = t;
  // ... send to telemetryCollectPath ...
});
```

The fingerprint payload (including extension data) is:
1. Serialized to JSON
2. Encrypted using a public key (`apfcDfPK`) obtained from LinkedIn's servers or injected into the page
3. Stored on `globalThis.apfcDf` for synchronous header injection into subsequent API requests
4. Transmitted to `/platform-telemetry/li/apfcDf` (line 2456/4718/9512)

---

## 6. The APFC Fingerprinting Engine

The extension scanning is just one component of LinkedIn's **APFC** (Anti-fraud Platform Features Collection) system, internally also called **DNA** (Device Network Analysis). This system collects **48 browser fingerprinting signals**:

### All 48 Collected Features (Line 2260)

| # | Feature Key | What It Collects |
|---|------------|-----------------|
| 1 | `webrtc` | WebRTC local IP address discovery |
| 2 | `enumerateDevices` | Connected media devices (cameras, microphones, speakers) |
| 3 | `appName` | `navigator.appName` |
| 4 | `tsSeed` | Timestamp-based seed value |
| 5 | `appVersion` | `navigator.appVersion` |
| 6 | `appCodeName` | `navigator.appCodeName` |
| 7 | `location` | Page URL components (protocol, hostname, port, origin, href, hash, pathname) |
| 8 | `javascripts` | JavaScript engine characteristics |
| 9 | `platform` | `navigator.platform` (e.g. "Win32", "MacIntel") |
| 10 | `product` | `navigator.product` |
| 11 | `productSub` | `navigator.productSub` |
| 12 | `cpuClass` | CPU class identifier |
| 13 | `oscpu` | Operating system and CPU info |
| 14 | `hardwareConcurrency` | Number of CPU cores (`navigator.hardwareConcurrency`) |
| 15 | `deviceMemory` | Device RAM in GB (`navigator.deviceMemory`) |
| 16 | `vendor` | Browser vendor string |
| 17 | `vendorSub` | Browser vendor sub-string |
| 18 | `language` | Browser language (`navigator.language`) |
| 19 | `timezoneOffset` | `new Date().getTimezoneOffset()` |
| 20 | `timezone` | IANA timezone string |
| 21 | `userAgent` | Full user agent string |
| 22 | `webdriver` | Whether browser is controlled by WebDriver/automation |
| 23 | `doNotTrack` | Do Not Track setting (collected but excluded from hash) |
| 24 | `incognito` | Whether the user is in incognito/private browsing mode |
| 25 | `colorDepth` | Screen color depth |
| 26 | `pixelDepth` | Screen pixel depth |
| 27 | `pixelRatio` | Device pixel ratio (collected but excluded from hash) |
| 28 | `screenResolution` | Screen dimensions |
| 29 | `screenOrientation` | Portrait/landscape orientation |
| 30 | `availableScreenResolution` | Available screen area (excluding taskbar) |
| 31 | `sessionStorage` | Whether `sessionStorage` is available |
| 32 | `localStorage` | Whether `localStorage` is available |
| 33 | `indexedDb` | Whether IndexedDB is available |
| 34 | `addBehavior` | IE-specific behavior detection |
| 35 | `openDatabase` | Whether Web SQL is available |
| 36 | `canvas` | Canvas fingerprint (rendering a hidden canvas element and hashing the result) |
| 37 | `webgl` | WebGL renderer, vendor, extensions, and 65+ parameter values |
| 38 | `signals` | Browser lie detection (spoofed OS, browser, resolution, language) |
| 39 | `touchSupport` | Touch screen capabilities |
| 40 | `networkInfo` | Network connection type, downlink speed, RTT |
| 41 | `battery` | Battery level, charging status, discharge time |
| 42 | `audio` | AudioContext fingerprint (creates oscillator, compressor, analyser nodes) |
| 43 | `automation` | Automation framework detection |
| 44 | `plugins` | Browser plugin list |
| 45 | `mimetyps` | Supported MIME types |
| 46 | `fonts` | Installed system fonts (detected via width measurement technique) |
| 47 | `fontsFlash` | Flash-based font enumeration (legacy) |
| 48 | `getFeatures` | Meta-feature: the collection process itself |

### Data Encoding for Transmission (Line 9605)

Before transmission, feature names are replaced with numeric codes to reduce payload size:

**Top-level flat keys (`D`):**
```javascript
D = {
  appVersion:1, numOfCores:2, webrtc:3, timezone:6, plugins:7,
  localStorage:8, incognito:9, language:10, appCodeName:11,
  platform:13, javascripts:14, automation:15, pixelDepth:16,
  availableScreenResolution:18, timezoneOffset:19, oscpu:20,
  vendor:22, sessionStorage:23, webdriver:24, audio:25,
  openDatabase:26, screenResolution:27, vendorSub:28, product:30,
  appName:32, cpuClass:34, indexedDb:35, userAgent:36,
  deviceMemory:37, productSub:38, addBehavior:39, colorDepth:43,
  tsSeed:45, errors:46, pixelRatio:47
}
```

**Nested keys (`O`):**
```javascript
O = {
  touchSupport:4, webgl:5, battery:12, screenOrientation:17,
  fonts:21, enumerateDevices:29, canvas:31, mimetyps:33,
  signals:40, networkInfo:41, location:42, FPDataCookie:44
}
```

**WebGL sub-keys (`w`):** 65 individual WebGL parameters are encoded to numbers 1–65.

**WebGL extensions (`R`):** 53 WebGL extension names encoded to numbers 67–119.

**Font names (`N`):** Common system font names encoded to numeric values.

---

## 7. Third-Party Integrations

The APFC system also integrates with external anti-fraud services:

### PerimeterX / HUMAN Security (Lines 9536–9552)

```javascript
c = "https://li.protechts.net/index.html?ts=" + r
    + "&r_id=" + encodeURIComponent(o)
    + "&app_id=" + a + "&uc=scraping"
```

LinkedIn loads a hidden iframe from `li.protechts.net` (HUMAN Security, formerly PerimeterX), passing:
- A timestamp
- The page's tree ID
- A hashed session cookie (`bcookie`)
- The app ID (`PXdOjV695v` in production)

The iframe is set to 0×0 pixels, positioned off-screen at `left: -9999px`, and marked `aria-hidden="true"`.

It also reads and sets PerimeterX cookies (`_px3`, `_pxhd`, `_pxvid`, `pxcts`) via cross-origin `postMessage`.

### Merchant Pool / DFP (Lines 9529–9535)

```javascript
const n = `https://merchantpool1.linkedin.com/mdt.js
  ?session_id=${bcookie}&instanceId=${instanceId}`
```

A separate Device Fingerprinting (DFP) system loads a script from `merchantpool1.linkedin.com`, passing the user's session cookie and a hardcoded instance ID (`fb6bbd47-fa7c-4264-b4e9-b25948407586` in production).

### Google reCAPTCHA v3 (Lines 9553–9560)

LinkedIn also loads Google reCAPTCHA Enterprise (`https://www.google.com/recaptcha/enterprise.js`), executing it on page load with action `"onPageLoad"` and collecting the resulting token.

---

## 8. Feature Flags and A/B Testing (LIX System)

The fingerprinting systems are controlled by LinkedIn's **LIX** (LinkedIn Internal eXperimentation) feature flag system:

**Lines 2666 / 4928 / 12551–12557:**

| LIX Flag | Controls |
|----------|---------|
| `pemberly.tracking.fireApfcEvent` | DNA fingerprint collection |
| `pemberly.tracking.human.integration` | HUMAN Security integration |
| `pemberly.tracking.dfp.integration` | Merchant Pool DFP integration |
| `pemberly.tracking.recaptcha.v3` | reCAPTCHA v3 integration |
| `pemberly.tracking.apfc.network.interceptor` | Network request interception |
| `pemberly.web.ondemand` | On-demand fingerprinting mode |
| `sync.apfc.headers` | Sync fingerprint via HTTP headers |
| `sync.apfc.couchbase` | Sync fingerprint to Couchbase |
| `fingerprinting.collection.skip.performance.marker.check` | Skip perf marker check |

These flags allow LinkedIn to selectively enable or disable fingerprinting for specific users, gradually roll out changes, and run A/B tests on their surveillance capabilities.

---

## 9. Synchronization: Fingerprint in Every Request

**Line 9528:**
```javascript
globalThis.apfcDf = encryptedPayload;
```

The encrypted fingerprint is stored on `globalThis.apfcDf` and can be injected as an HTTP header into subsequent API requests. The `SyncCollectionHandler` (line 9525) periodically sends the fingerprint data and can attach it to outgoing requests, ensuring LinkedIn's backend receives the device fingerprint alongside normal API traffic.

This means the fingerprint doesn't just get sent once — it can be attached to **every API call** the user makes during their session.

---

## 10. Module Exports (Line 9269)

The extension scanning module exports these functions, revealing the system's API:

```javascript
{
  AbuseFeaturesCollectionCoordinator,  // Orchestrates all fingerprinting
  CommonFeaturesAccessor,              // Reads cached fingerprint data
  EXTENSION_PREFIX,                    // "chrome-extension://"
  compressToBase64,                    // LZ compression for payloads
  encodeDNA,                           // Encodes fingerprint to numeric keys
  encodeDFPAndroid,                    // Android DFP encoding
  encodeDFPIos,                        // iOS DFP encoding
  fetchExtensions,                     // Active extension scanning (fetch)
  fireExtensionDetectedEvents,         // Fires AedEvent
  fireSpectroscopyEvent,               // Fires SpectroscopyEvent (DOM scan)
  getDocument,                         // Returns window.document
  isBrowser,                           // Environment check
  isUserAgentChrome,                   // Chrome detection
  parseFoundString,                    // Extracts extension ID from URL
  scanDOMForPrefix                     // Recursive DOM walker
}
```

---

## 11. Browser Targeting

**Lines 9572–9577:**

```javascript
function a() {
  return "undefined" != typeof window
    && window
    && "node" !== window.appEnvironment;
}

function s() {
  return window?.navigator?.userAgent?.indexOf("Chrome") > -1;
}

// Guard clause: only scan in Chrome browsers
if (!a() || !s()) return;
```

The extension scan **only runs in Chrome-based browsers**. The `isUserAgentChrome()` function checks for `"Chrome"` in the user agent string. The `isBrowser()` function excludes server-side rendering environments.

---

## 12. Telemetry Configuration (Line 9512 / 2456)

```javascript
const G = {
  preprocessor: null,
  audio: { timeout: 1000, excludeIOS11: true },
  fonts: {
    swfContainerId: "apfcDf",
    swfPath: "flash/compiled/FontList.swf",
    userDefinedFonts: [],
    extendedJsFonts: undefined,
    hashOnly: false
  },
  screen: { detectScreenOrientation: true },
  plugins: { sortPluginsFor: [/palemoon/i], excludeIE: false },
  webgl: { hashOnly: false },
  telemetryCollectPath: "/platform-telemetry/li/apfcDf",
  gloablIntegrationDataCollectionPath: "/apfc/collect",  // [sic: typo in source]
  extraComponents: [],
  excludes: { pixelRatio: true, doNotTrack: true, fontsFlash: true },
  debug: false,
  NOT_AVAILABLE: "n/a",
  ERROR: "err",
  EXCLUDED: "excluded",
  useRequestIdleCallBack: true
};
```

Notable:
- **`telemetryCollectPath: "/platform-telemetry/li/apfcDf"`** — the server endpoint for fingerprint data
- **`gloablIntegrationDataCollectionPath: "/apfc/collect"`** — secondary collection endpoint (note the typo "gloabl" in LinkedIn's source code)
- **`doNotTrack: true` in `excludes`** — ironically, LinkedIn excludes the Do Not Track flag from fingerprint hashing, while simultaneously ignoring the user's DNT preference entirely
- **`useRequestIdleCallBack: true`** — fingerprinting deferred to idle time to avoid impacting page performance

---

## 13. Summary of Data Flow

```
1. Page loads LinkedIn
         │
         ▼
2. Webpack loads chunk.905
         │
         ├──► APFC/DNA engine initializes
         │    └── Collects 48 browser features
         │        (canvas, WebGL, audio, fonts, etc.)
         │
         ├──► AED: fetchExtensions()
         │    └── Fires 6,167 fetch() requests to chrome-extension:// URLs
         │    └── Collects IDs of installed extensions
         │    └── Fires "AedEvent" with browserExtensionIds[]
         │
         ├──► Spectroscopy: scanDOMForPrefix()
         │    └── Walks entire DOM tree
         │    └── Searches for "chrome-extension://" in text nodes & attributes
         │    └── Fires "SpectroscopyEvent" with browserExtensionIds[]
         │
         ├──► HUMAN Security iframe (li.protechts.net)
         ├──► Merchant Pool DFP (merchantpool1.linkedin.com)
         └──► reCAPTCHA v3 Enterprise
         │
         ▼
3. All data encrypted with RSA public key ("apfcDfPK")
         │
         ▼
4. Transmitted to:
   • https://www.linkedin.com/li/track (event tracking)
   • /platform-telemetry/li/apfcDf (fingerprint telemetry)
   • /apfc/collect (global integration)
         │
         ▼
5. Encrypted fingerprint stored on globalThis.apfcDf
   └── Injected as header into subsequent API requests
       (fingerprint accompanies every API call in the session)
```

---

## 14. Key Line References

| Line(s) | Content |
|---------|---------|
| 1 | Webpack chunk identifier (`chunk.905`) |
| 2260 | Fingerprint component definitions (48 features) |
| 2456 / 4718 / 9512 | APFC configuration object (telemetry paths, feature flags) |
| 2472 / 4734 / 9528 | `getFeatures()` → encrypt → transmit flow |
| 2519 / 4781 / 12345 | `AbuseFeaturesCollectionCoordinator.collectFeatures()` |
| 2551 / 4813 / 12377 | `abuseDeviceSignalCollectionConfig` — feature flag checks |
| 2666 / 4928 / 12551 | LIX feature flag evaluation for fingerprinting systems |
| 9269 | Module exports — full API surface of the extension scanning module |
| **9571** | **The hardcoded array of 6,167 extension IDs and probe files** |
| 9572 | `isBrowser()` — environment guard |
| 9573 | `isUserAgentChrome()` — Chrome-only targeting |
| 9573–9576 | `fetchExtensions()` — parallel `fetch()` scan (Method 1) |
| 9578–9579 | Staggered sequential scan with delay (Method 2) |
| 9580 | `fireTrackingPayload("AedEvent", {browserExtensionIds})` |
| 9581 | `EXTENSION_PREFIX = "chrome-extension://"` |
| 9583–9584 | `scanDOMForPrefix()` — recursive DOM walker |
| 9587 | `fireTrackingPayload("SpectroscopyEvent", {browserExtensionIds})` |
| 9587–9601 | LZ-String compression (`compressToBase64`) |
| 9605 | DNA/DFP encoding maps (numeric key compression) |
| 9528 | RSA encryption of fingerprint payload |
| 9529–9535 | Merchant Pool DFP integration |
| 9536–9552 | HUMAN Security (PerimeterX) integration |
| 9553–9560 | Google reCAPTCHA v3 Enterprise integration |
| 9569 | Cookie-based fingerprint data (`li_apfcdc`) |
| 2026 / 4288 / 11785 | `li/track` endpoint URL |

---

## 15. Terminology Glossary

| Term | Meaning |
|------|---------|
| **APFC** | Anti-fraud Platform Features Collection — LinkedIn's device fingerprinting framework |
| **DNA** | Device Network Analysis — the core fingerprint data payload |
| **DFP** | Device Fingerprinting — a separate third-party fingerprinting layer |
| **AED** | Active Extension Detection — the `fetch()` brute-force extension scanner |
| **Spectroscopy** | Passive extension detection via DOM scanning |
| **LIX** | LinkedIn Internal eXperimentation — feature flag / A/B testing system |
| **Pemberly** | LinkedIn's internal name for their web platform/framework |
| **HUMAN** / **PerimeterX** | Third-party bot detection service (li.protechts.net) |
| **Merchant Pool** | LinkedIn's first-party DFP service (merchantpool1.linkedin.com) |
| **bcookie** | LinkedIn's browser identification cookie |
| **li_apfcdc** | Cookie storing fingerprint data for cross-page persistence |
| **apfcDfPK** | RSA public key identifier for encrypting fingerprint payloads |

---

*Analysis performed on the production JavaScript bundle served by LinkedIn. The code is minified and obfuscated, but variable names in module exports, string literals, API endpoints, and control flow are sufficiently preserved to reconstruct the system's architecture and intent.*
