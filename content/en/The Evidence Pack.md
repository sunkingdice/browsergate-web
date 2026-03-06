---
title: The Evidence Pack
linkTitle: The Evidence Pack
type: docs
weight: 30
---
Everything on this page is independently verifiable. The source code speaks for itself.
Its own engineer, under oath, admits it.

---
## Exhibit 1 — LinkedIn's JavaScript bundle

**File:** `5fdhwcppjcvqvxsawd8pg1n51.js`  
**Size:** ~2.7 MB (13,159 lines of minified JavaScript)  
**Webpack chunk:** `chunk.905`

This is the file LinkedIn serves to every Chrome user who visits linkedin.com. It contains a hardcoded array of 5,459 Chrome extension IDs, each paired with a specific internal file path that LinkedIn engineers mapped for detection.

Line 9571, character offset 443:

```javascript
const r=[
  {id:"aaaeoelkococjpgngfokhbkkfiiegolp", file:"assets/index-COXueBxP.js"},
  {id:"aabfjmnamlihmlicgeoogldnfaaklfon", file:"images/logo.svg"},
  {id:"aacbpggdjcblgnmgjgpkpddliddineni", file:"sidebar.html"},
  // ... 5,456 more entries ...
]
```

The file also contains the detection functions: `fetchExtensions` (active scanning via `fetch()` to `chrome-extension://` URLs), `scanDOMForPrefix` (passive DOM scanning), and `fireExtensionDetectedEvents` (exfiltration to LinkedIn's `li/track` telemetry endpoint via `AedEvent` and `SpectroscopyEvent`).

Any developer can verify this. Open linkedin.com in Chrome, open developer tools, find the JavaScript bundle, search for `fetchExtensions` or any Chrome extension ID. It is there.

[Download JavaScript bundle (ZIP) →](/downloads/linkedin-malicious-javascript.zip)

---

## Exhibit 2 — Video demonstration

<link href="https://cdn.plyr.io/3.7.8/plyr.css" rel="stylesheet">
<video id="player" controls playsinline width="320px"
  poster="https://vz-ff55574e-cf8.b-cdn.net/f60d2c58-2075-4f80-a425-5d475017ed91/thumbnail.jpg">
</video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  const video = document.getElementById('player');
  const src = 'https://vz-ff55574e-cf8.b-cdn.net/f60d2c58-2075-4f80-a425-5d475017ed91/playlist.m3u8';
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  }
</script>

Screen recording of LinkedIn's extension scanning captured in Chrome's developer tools. 
No editing. No narration. The browser shows what LinkedIn's code does: `fetch()` calls to `chrome-extension://` URLs, probing for specific resource files, followed by `fireTrackingPayload` transmitting the results to LinkedIn's servers.

---
## Exhibit 3 — Timestamped evidence package

**File:** `LinkedInLog.zip`   
**Contains:** JavaScript bundle, video demonstration, and RFC 3161 timestamp files  
**Timestamped:** February 19, 2026, 15:58:58 UTC   
**Timestamp authority:** freetsa.org (Free TSA, Würzburg, Germany)  
**Hash algorithm:** SHA-512  
**Serial number:** 0x031E6E6F

```
SHA-512: eb20d4944fb01191eae904b4ca761d58
        a2448a9973c9c0a99ebb87cca876b886
        bf286cca068d5d0fd859126bc54a2a9c
        ceb749a05547e8f41f112a668d1d5f84
```

Exhibits 1 and 2 packaged together with a cryptographic timestamp from an independent authority. The timestamp proves this package existed on February 19, 2026 and has not been altered since. Download it, compute the SHA-512 hash, compare. If any byte has changed, the hash will not match.

To verify:

bash

```bash
openssl ts -verify -in LinkedInLog_zip.tsr \
  -queryfile LinkedInLog_zip.tsq \
  -CAfile cacert.pem -untrusted tsa.crt
```

[Download evidence package →](/downloads/LinkedInBrowserGate.zip)

---

## Exhibit 4 — Sworn affidavit from LinkedIn's Senior Engineering Manager

**Document:** Eidesstattliche Versicherung / Affidavit.  
**Declarant:** Milinda Lakkam, Senior Manager, Software Engineering and Machine Learning, LinkedIn Corporation  
**Filed:** February 6, 2026, Mountain View, California  
**Court reference:** Anlage AG 4

##### And then LinkedIn confirmed it under oath
Lakkam is, by her own statement, the person at LinkedIn responsible for "developing and implementing LinkedIn's scraping-related multi-layered technical anti-abuse systems." She submitted this affidavit under penalty of perjury in German court proceedings.

The code in Exhibit 1 proves LinkedIn scans for extensions. This affidavit is LinkedIn confirming it.

### Key admissions

Paragraph 3:

> "LinkedIn has invested in extension detection mechanisms without which LinkedIn would not have been able to trace the cause of service impacts and outages."

Paragraph 5:

> "The first respondent has also invested in detection technologies for extensions, without which the causes of service disruptions or outages could not have been identified."

### The contradiction

Paragraph 4 contains two claims that cannot both be true.

**Claim 1:**

> "These models do not take the use of any particular browser extension(s) into account."

**Claim 2, same paragraph:**

> LinkedIn's systems "may have taken action against LinkedIn users that happen to have [XXXXXX] installed."

LinkedIn's models do not consider which extensions you have. But LinkedIn took action against users who had a specific extension. Both statements, same paragraph, same sworn document.

### What was never disclosed

This affidavit was submitted to a German court to justify LinkedIn's enforcement actions. It was not submitted to LinkedIn's users. LinkedIn's privacy policy contains zero mention of extension scanning. No user was asked for consent. No user was informed. The admission happened in a courtroom, not on linkedin.com.

[Download full affidavit (PDF) →](/downloads/Lakam-affidavit-redacted.pdf)

---

## Verification

The JavaScript file is served by LinkedIn to every Chrome user. Open linkedin.com and check.

The video can be reproduced by anyone with Chrome developer tools.

The timestamp is cryptographically verifiable against an independent authority.

The affidavit is a public court filing.

Nothing on this page requires you to trust us. Verify it yourself.

---

## Download everything

One ZIP containing every exhibit on this page plus a manifest listing each document with its SHA-512 hash.

[Download complete evidence pack →](/downloads/browsergate-evidence-pack.zip)

---

_If you are a journalist, researcher, or regulator and need additional materials, contact press@browsergate.eu._