---
title: Tell others about Browsergate
linkTitle: Share this
type: docs
---

There are 1.2 billion Linkedin users. 

Most have no idea LinkedIn scans their browser and shares their data illegally with others.   
Copy a post below and fix that.

---
## LinkedIn

Yes, post it on LinkedIn. That's the point.

### Post 1 — The basics

> LinkedIn scans your browser for 5,459 Chrome extensions every time you visit the site.  
> No consent. No disclosure. No mention of it in their privacy policy.
> 
> The scan reveals which tools you use for sales, job searching, ad blocking, VPN, and security.  
> It also detects extensions related to religion, politics, and disability.
> 
> LinkedIn's privacy policy contains zero mention of extension scanning. Zero.
> 
> This is called BrowserGate.  
> The full technical analysis, legal breakdown, and the complete list of scanned extensions is at browsergate.eu

### Post 2 — For salespeople

> If you use Apollo, Lusha, ZoomInfo, or any other sales tool as a Chrome extension, LinkedIn already knows.
> 
> LinkedIn scans your browser for 209 sales and prospecting extensions. That's not a guess. It's in their JavaScript code, verifiable by anyone with dev tools.
> 
> They use this data to identify users of competing products. Then they enforce their Terms of Service clause 8.2.2, which bans all third-party tools.
> 
> The EU Digital Markets Act says that ban is illegal. LinkedIn expanded the scanning program anyway.
> 
> Full details: browsergate.eu

### Post 3 — For job seekers

> LinkedIn scans for 509 job search extensions. That's 1.4 million users whose employment status is being recorded without consent.
> 
> On a platform where your current employer, your recruiter, and your next boss can all see your profile, LinkedIn is silently flagging that you're looking for work.
> 
> They never asked. They never told you. It's not in their privacy policy.
> 
> browsergate.eu

### Post 4 — For developers and extension makers

> LinkedIn probes your extension using three methods: externally_connectable messaging, web_accessible_resources fetch, and DOM mutation detection. Results are exfiltrated via fireTrackingPayload("AedEvent").
> 
> If you disabled externally_connectable in your manifest.json, they try the next method. Then the next. It's a deliberate fallback escalation chain.
> 
> They've catalogued a specific internal file path for each of the 5,459 extensions they scan for. Someone at LinkedIn manually mapped your extension's resources.
> 
> The full technical analysis with code snippets from LinkedIn's JavaScript bundle: browsergate.eu

---

## X (Twitter)

### Tweet 1

> LinkedIn scans your browser for 5,459 Chrome extensions. No consent. No disclosure. Their privacy policy mentions none of it.
> 
> The scan reveals religion, politics, disability, and employment status.
> 
> browsergate.eu

### Tweet 2

> LinkedIn detects 509 job search extensions. 1.4 million users silently flagged as job seekers on a platform where your current employer can see your profile.
> 
> browsergate.eu

### Tweet 3

> LinkedIn scans for religious extensions like PordaAI and Deen Shield. Political extensions like Anti-Zionist Tag and No more Musk. A neurodivergence tool called "simplify" with 79 users.
> 
> This is GDPR Article 9 special category data. No consent was given.
> 
> browsergate.eu

### Tweet 4

> LinkedIn went from scanning 38 extensions in 2017 to 5,459 in 2025. The 10x jump happened right after they were designated a DMA gatekeeper and forced to allow third-party tools.
> 
> They responded to regulation with surveillance.
> 
> browsergate.eu

---

## Mastodon / Bluesky

### Post 1

> LinkedIn runs a silent browser scan on every Chrome user who visits the site. 5,459 extensions. ~405 million users affected. No consent, no disclosure, no mention in their privacy policy.
> 
> The scan identifies your sales tools, VPN, ad blocker, job search extensions, and extensions tied to religion, politics, and disability.
> 
> The full technical breakdown, legal analysis, and searchable database of every scanned extension: browsergate.eu

### Post 2

> Fun fact: LinkedIn's JavaScript bundle contains a hardcoded list of 5,459 Chrome extension IDs, each paired with a specific internal file path that LinkedIn engineers mapped manually.
> 
> They probe your browser using three escalating detection methods. If one fails, they try the next.
> 
> It's not subtle. It's in the source code. Anyone can verify it.
> 
> browsergate.eu

---

## Facebook

### Post 1

> If you've ever visited LinkedIn on Chrome, they scanned your browser for installed extensions. Without asking. Without telling you.
> 
> The list covers 5,459 extensions with a combined user base of about 405 million people. It includes job search tools, sales software, ad blockers, VPNs, and extensions related to religion, political views, and disability.
> 
> None of this is mentioned in LinkedIn's privacy policy.
> 
> A group of researchers and developers published the full technical evidence, the legal analysis, and a searchable database of every extension LinkedIn scans for. Check if your extensions are on the list: browsergate.eu

---

## Email to a friend

> **Subject:** LinkedIn is scanning your browser extensions
> 
> You should look at this. LinkedIn runs a scan on every Chrome user's browser, checking for 5,459 specific extensions. No consent, nothing in their privacy policy about it.
> 
> It detects sales tools, job search extensions, ad blockers, VPNs, and extensions tied to religion and politics. They've been doing it since at least 2017 and expanded it massively in 2025.
> 
> The full breakdown with evidence from LinkedIn's actual code: browsergate.eu

---

## Notes for sharing

Every claim in these posts can be verified at browsergate.eu. The extension list is extracted from LinkedIn's own JavaScript bundle (file: 5fdhwcppjcvqvxsawd8pg1n51.js, webpack chunk 905). The detection methods, extension IDs, and exfiltration mechanisms are documented with code snippets.

If someone challenges you, point them to the source code. That ends the argument.