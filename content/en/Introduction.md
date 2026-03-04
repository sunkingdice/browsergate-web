---
title: Introduction - What is BrowserGate?
linkTitle: "Intro: What is BrowserGate?"
type: docs
weight: 1
---
## What LinkedIn Does

Every time you visit linkedin.com, a JavaScript program embedded in the page scans your browser for installed Chrome extensions. The program runs silently, without any visible indicator to the user. It does not ask for consent. It does not disclose what it is doing. It reports the results to LinkedIn's servers.

This is not a one-time check. The scan runs on every page load, for every visitor.

## How the Detection Works

LinkedIn's code uses a three-stage fallback chain to detect whether a specific extension is installed in your browser.

**Stage 1: Direct communication.** The code attempts to contact the extension directly using Chrome's `externally_connectable` messaging API. If the extension developer has explicitly disabled this channel in their `manifest.json`, this method fails, and LinkedIn moves to stage 2.

**Stage 2: Resource probing.** The code attempts to fetch a known file from the extension using its `web_accessible_resources`. This is the equivalent of checking whether a door is unlocked by trying the handle. If the extension developer has not exposed any web-accessible resources, this also fails, and LinkedIn moves to stage 3.

**Stage 3: DOM mutation detection.** The code monitors for changes to the page structure that are characteristic of specific extensions injecting elements into LinkedIn's interface. This catches extensions that modify what you see on the page.

When an extension developer explicitly disables `externally_connectable`, they are setting a security boundary. They are saying: "websites should not be able to communicate with this extension." LinkedIn's code treats that boundary as an obstacle to route around. The German Federal Court of Justice (BGH, 5 StR 614/19) has ruled that even quickly circumvented security measures qualify as "besondere Sicherung" (special security measures) under § 202a StGB. Bypassing them constitutes unauthorized data access.

## How the Results Are Sent

Detection results are transmitted to LinkedIn's servers using an internal tracking function called `fireTrackingPayload` with an event type of `"AedEvent"`. The payload includes which extensions were detected. Because the user is logged in, LinkedIn can match the scan results to a specific person, their employer, their job title, and their location.

## Scale and Growth

The number of extensions LinkedIn scans for has grown by two orders of magnitude in seven years.

|Period|Extensions scanned|
|---|---|
|2017|38|
|2024|~461|
|May 2025|~1,000|
|December 2025|5,459|

The acceleration correlates with a specific event. In September 2023, the European Commission designated LinkedIn as a gatekeeper under the Digital Markets Act. The DMA requires LinkedIn to allow third-party tools to interoperate with its platform. LinkedIn's response was not to open up. It was to massively expand its surveillance of the exact tools the regulation was designed to protect.

From 2017 to 2024, LinkedIn added roughly 60 extensions per year. From 2024 to December 2025, it added nearly 5,000.

## What LinkedIn Scans For

The 6,153 extensions break down into several categories.

**762 LinkedIn-specific tools.** Extensions built for LinkedIn productivity, content creation, and networking. These are the tools the DMA explicitly requires LinkedIn to accommodate.

**209 sales and prospecting competitors.** Extensions from companies that compete with LinkedIn's own Sales Navigator product (~$1B/year revenue). This includes Apollo (600,000 users), Lusha (300,000 users), and ZoomInfo (300,000 users), among others. Detecting these tells LinkedIn which of its customers also use competing products.

**509 job search extensions** with a combined 1.4 million users. These extensions reveal that a user is actively looking for work. On LinkedIn, that information is visible in the context of the user's current employer, their colleagues, and their manager.

**VPNs, ad blockers, and security tools.** Including Malwarebytes Browser Guard (10 million users), KeepSolid VPN Unlimited, Zoho Vault, and LinkedIn Profile Privacy Shield. Scanning for privacy and security tools reveals which users are trying to protect themselves online.

**Religious extensions.** PordaAI ("Blur Haram objects in Images and Videos, Real-time AI for Islamic values," 5,000 users) identifies Muslim users. Deen Shield ("Blocks haram & distracting sites, Quran Home Tab") does the same.

**Political extensions.** Anti-woke ("Shows warnings about woke companies"), Anti-Zionist Tag ("Adds a tag to the LinkedIn profiles of Anti-Zionists"), No more Musk ("Hides digital noise related to Elon Musk," 19 users), Political Circus ("Politician → Clown AI Filter," 7 users), and several others that reveal political orientation.

**Disability and neurodivergence tools.** Including "simplify," described as "for neurodivergent users" (79 users).

[Search the full list of 6,153 extensions →](/extensions/)

## Corporate and Institutional Profiling

The scanning does not stop at individuals. Because LinkedIn knows each user's employer, job title, and department, every detected extension is attributed to an organization. If three employees at a company have Apollo installed, LinkedIn now knows that company uses Apollo. If a government ministry's staff use a specific VPN, LinkedIn knows that too.

This amounts to mapping the software infrastructure of millions of companies, institutions, and government agencies, assembled without any organization's knowledge or consent. For LinkedIn's competitors in the sales intelligence market, this is a surveillance system that identifies exactly which customers are evaluating rival products.

## No Disclosure

LinkedIn's [privacy policy](https://www.linkedin.com/legal/privacy-policy) contains zero mention of extension scanning. The practice does not appear in any public-facing document, help page, or developer resource. There is no opt-out mechanism because there is nothing to opt out of. As far as LinkedIn's public disclosures are concerned, this program does not exist.

Under GDPR Articles 13 and 14, data controllers must inform individuals about the processing of their personal data at the time of collection. LinkedIn does not.

Under GDPR Article 9, processing data that reveals religious beliefs, political opinions, or health conditions requires explicit consent. LinkedIn obtains none.

Under TTDSG § 25 (the German transposition of the ePrivacy Directive), accessing information stored on a user's terminal device requires explicit consent, the same legal basis as cookie consent. LinkedIn does not ask.