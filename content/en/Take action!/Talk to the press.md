---
title: Help make browsergate go public
linkTitle: Talk to the press
type: docs
weight: 30
---
Pick a pitch. Find a journalist. Copy, paste, send.

---
## How to find the right journalist

Check the byline on any recent article about Big Tech, privacy, GDPR, or surveillance. That's your person. Find their email on the publication's staff page, their Twitter bio, or their personal website.

No specific journalist in mind? Call any newsroom and say: "I have a story tip for your tech or privacy reporter."

---
## The pitches

Pick the one that fits the journalist's beat. Privacy reporter? Send the religion pitch. Business reporter? Send the competitive intelligence pitch. Tech reporter? Send the source code pitch.

### For privacy and data protection reporters

> **Subject: LinkedIn scans browsers for religious and political extensions without consent**
> 
> Hi [name],
> 
> LinkedIn silently scans every Chrome user's browser for 6,222 installed extensions. The scan detects extensions that reveal religious belief (PordaAI, Deen Shield), political opinion (Anti-Zionist Tag, No more Musk), disability (a neurodivergence tool called "simplify"), and employment status (509 job search extensions covering 1.4 million users).
> 
> This is GDPR Article 9 special category data. No consent. No disclosure. LinkedIn's privacy policy contains zero mention of extension scanning.
> 
> A sworn affidavit from LinkedIn's Senior Manager of Software Engineering confirms the company "invested in extension detection mechanisms" deliberately.
> 
> Full technical evidence, legal analysis, and a searchable database of all 6,222 scanned extensions: browsergate.eu
> 
> Happy to connect you with the research team if you want more detail.

### For tech reporters

> **Subject: LinkedIn's JavaScript bundle contains 6,222 hardcoded Chrome extension IDs**
> 
> Hi [name],
> 
> LinkedIn serves a JavaScript file to every Chrome user that contains a hardcoded array of 6,222 Chrome extension IDs. Each ID is paired with a specific internal file path that LinkedIn engineers mapped for detection.
> 
> The system uses three escalating methods: externally_connectable messaging, web_accessible_resources fetch, and DOM mutation detection. Results are exfiltrated via fireTrackingPayload("AedEvent") to LinkedIn's li/track telemetry endpoint.
> 
> Anyone can verify this. Open linkedin.com, open dev tools, search for "fetchExtensions" in the JS bundle.
> 
> Full code analysis with snippets: browsergate.eu
> 
> Happy to connect you with the research team.

### For business and competition reporters

> **Subject: LinkedIn scans browsers to identify users of competing sales tools**
> 
> Hi [name],
> 
> LinkedIn scans every Chrome user's browser for 209 sales and prospecting extensions, including Apollo, Lusha, and ZoomInfo (3.4 million combined users). Because LinkedIn knows each user's name, employer, and role, this aggregates into company-level competitive intelligence: which companies use which sales tools.
> 
> LinkedIn then enforces Terms of Service clause 8.2.2, a blanket ban on all third-party tools, against identified users. The EU Digital Markets Act says that ban is illegal. LinkedIn expanded the scanning program from 461 extensions to 5,459 in the year following its DMA gatekeeper designation.
> 
> Sales Navigator generates roughly $1 billion per year. The extensions LinkedIn scans for are its competitors.
> 
> Full details: browsergate.eu

### For regulatory and legal reporters

> **Subject: LinkedIn expanded browser surveillance 10x after DMA gatekeeper designation**
> 
> Hi [name],
> 
> LinkedIn scanned 461 Chrome extensions in 2024. By December 2025, the number was 5,459. The 10x expansion correlates with LinkedIn's designation as a DMA gatekeeper in September 2023 and the obligation to allow third-party tool access under Article 6(10).
> 
> The EU mandated interoperability. LinkedIn responded by building a surveillance system to detect and punish users of the exact tools the DMA was meant to protect.
> 
> Meanwhile, LinkedIn's internal API (Voyager) handles 163,000 requests per second. The external API it offers to comply with DMA Article 6(10) handles 0.07 requests per second. That's a 2.25 million to one disparity.
> 
> A Fairlinked e.V. case challenging LinkedIn's practices is pending at LG München I.
> 
> Full legal analysis and technical evidence: browsergate.eu

### For local news and general reporters

> **Subject: LinkedIn secretly scans 405 million users' browsers — here's how to check yours**
> 
> Hi [name],
> 
> LinkedIn scans every Chrome user's browser for 6,222 installed extensions without consent or disclosure. The scan covers sales tools, job search extensions, ad blockers, VPNs, and extensions tied to religion, politics, and disability. About 405 million users are affected.
> 
> Your audience can check if their extensions are on the list at browsergate.eu. The site includes a searchable database of every extension LinkedIn scans for, pulled directly from LinkedIn's own source code.
> 
> Happy to arrange an interview with the research team behind the investigation.

---

## Tips

**Send one pitch per journalist.** Don't send all five.

**Follow up once** after 3 days. One follow-up, not three.

**Don't attach files.** Link to browsergate.eu. Large attachments from strangers go to spam.

**Don't pitch two journalists at the same outlet.** They talk to each other.

For direct press inquiries: press@browsergate.eu