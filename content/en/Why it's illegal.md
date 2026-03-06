---
title: Why it's illegal and potentially criminal
linkTitle: Why it's illegal
type: docs
weight: 40
---
LinkedIn scans your browser for installed extensions every time you visit the site. It does this without asking, without telling you, and without any mention in its privacy policy.

This is not a gray area. Under European law, what LinkedIn is doing is prohibited. Not regulated. Not subject to conditions. Prohibited. The law uses that word, and it means what it says.

This page explains the laws LinkedIn is breaking, in plain language, with legal citations you can verify. We start with the most severe violation and work outward.

---

## 1. Prohibited Data Collection (GDPR Article 9)

European data protection law sorts personal data into two tiers. Ordinary personal data (your name, email address, browsing history) can be processed if there is a legal basis. But a second category, called "special category data," is subject to a blanket prohibition. It cannot be processed at all, except under a narrow set of exemptions that do not apply here.

Article 9(1) of the GDPR states:

> Processing of personal data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or trade union membership, and the processing of genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health or data concerning a natural person's sex life or sexual orientation shall be prohibited.

The word "revealing" is critical. The law does not say "directly stating." It says "revealing." The Court of Justice of the European Union has ruled, in three separate cases, that data which allows someone to infer or deduce protected characteristics is covered by this prohibition, regardless of whether the company intended to collect sensitive data.

In Meta Platforms v. Bundeskartellamt (Case C-252/21, July 2023), the Court held that browsing data and app usage data qualify as special category data when they reveal information about health, religion, or political opinions. In the Lindenapotheke case (Case C-21/23, October 2024), the Court confirmed that even purchase data (what medicines someone bought) constitutes health data under Article 9, regardless of the controller's intent.

LinkedIn's extension scan falls squarely within this case law.

### What the scan reveals

LinkedIn scans for extensions that directly identify the religious beliefs, political opinions, health conditions, and employment status of users. These are real extensions from LinkedIn's scan list, with their real descriptions from the Chrome Web Store:

**Religious beliefs**

LinkedIn scans for PordaAI (5,000 users), described as "Blur Haram objects in Images and Videos, Real-time AI for Islamic values." A user who has this extension installed is a practicing Muslim. LinkedIn also scans for Deen Shield (12 users), described as "Blocks haram & distracting sites, Quran Home Tab."

If LinkedIn detects either extension, it has collected data revealing that person's religion. Article 9 prohibits this.

**Political opinions**

LinkedIn scans for Anti-woke ("The anti-wokeness extension. Shows warnings about woke companies"), Anti-Zionist Tag ("Adds a tag to the LinkedIn profiles of Anti-Zionists"), Vote With Your Money ("showing political contributions from executives and employees"), No more Musk ("Hides digital noise related to Elon Musk," 19 users), Political Circus ("Politician to Clown AI Filter," 7 users), LinkedIn Political Content Blocker, and NoPolitiLinked.

Each of these extensions reveals a political position. If LinkedIn detects any of them, it has collected data revealing that person's political opinions. Article 9 prohibits this.

**Health and disability**

LinkedIn scans for "simplify," described as a tool "for neurodivergent users" (79 users). Detecting this extension reveals information about a user's neurological condition.

Article 9 prohibits this.

**Employment status**

LinkedIn scans for 509 job search extensions with a combined user base of 1.4 million people. Detecting a job search extension on the browser of someone who has a current employer listed on their LinkedIn profile reveals that person's employment status: they are looking to leave.

On a platform where employers, recruiters, and current managers can view profiles, this is not abstract. LinkedIn knows who you work for. Now it also knows you are trying to leave. Article 9 treats employment and social security data as requiring heightened protection.

### Why none of the exemptions apply

Article 9(2) lists ten exemptions that can override the prohibition. None of them fit.

**Explicit consent (Art. 9(2)(a)):** LinkedIn never asks for consent to scan extensions. There is no dialog, no toggle, no checkbox. LinkedIn's privacy policy does not mention extension scanning at all.

**Manifestly made public (Art. 9(2)(e)):** This exemption applies when people voluntarily make their own data public, such as announcing their religion on a public social media profile. Installing a browser extension is a private act. Extensions are not visible to websites. The user has not made this information public. LinkedIn had to build a detection system, embed 6,167 probe targets in its JavaScript, and fire thousands of fetch requests to extract this data. That is the opposite of "manifestly made public."

**Legitimate interest:** This is not even an available basis for special category data. Legitimate interest under Article 6(1)(f) cannot be used to process data that falls under Article 9. The prohibition is absolute unless one of the Article 9(2) exemptions applies.

### The penalty

GDPR Article 83(5) assigns the highest penalty tier to violations of Article 9: fines of up to €20 million, or 4% of the company's total worldwide annual turnover, whichever is higher.

LinkedIn is owned by Microsoft. Microsoft's fiscal year 2025 revenue was $281.72 billion. Four percent of that is $11.27 billion.

This penalty applies per violation. LinkedIn has been running this scan across 1 billion registered users in Chrome-based browsers, collecting special category data without consent, without disclosure, and without any legal basis.

### Where this law applies

The GDPR applies directly in all 27 EU member states: Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, and Sweden.

Three additional countries apply the GDPR through the EEA Agreement: Norway, Iceland, and Liechtenstein.

The United Kingdom applies equivalent rules through the UK GDPR (retained EU law), with fines of up to £17.5 million or 4% of global turnover under UK Article 83(5).

Switzerland applies comparable protections under the revised Federal Act on Data Protection (nFADP), which took effect September 1, 2023. The nFADP classifies religious beliefs, political opinions, health data, and trade union membership as "sensitive personal data" requiring heightened protection (Art. 5(c) nFADP).

In total, Article 9 protections or their equivalents apply to roughly 500 million people across 32 countries.

---

## 2. No Legal Basis for Any Processing (GDPR Article 6)

Even setting aside the special category problem, LinkedIn has no legal basis for scanning extensions at all.

GDPR Article 6 requires that every act of processing personal data has a legal basis. There are six options: consent, contract performance, legal obligation, vital interests, public interest, or legitimate interest.

**Consent:** Not obtained. No user has ever been asked whether LinkedIn may scan their browser extensions.

**Contract performance:** Scanning your extensions is not necessary to provide the LinkedIn service. You can use LinkedIn without LinkedIn knowing what extensions you have installed. The service functioned for years with only 38 extensions in the scan list (2017). The scan exists for LinkedIn's purposes, not yours.

**Legitimate interest:** Even if LinkedIn claimed a legitimate interest in fraud prevention (and extension scanning is not fraud prevention), Article 6(1)(f) requires a balancing test. The interests of 405 million users in not having their browsers secretly surveilled outweigh any claimed interest LinkedIn has in knowing what software they use.

**Legal obligation, vital interests, public interest:** None apply.

LinkedIn's privacy policy contains no mention of extension scanning. This is itself a violation of Articles 13 and 14, which require transparent disclosure of processing activities.

---

## 3. Terminal Equipment Access Without Consent (ePrivacy Directive)

The ePrivacy Directive (2002/58/EC, as amended by 2009/136/EC) requires consent before accessing information stored on a user's device. This is the same rule that requires cookie consent banners across the web. It applies equally to browser extension scanning.

When LinkedIn fires 6,167 fetch requests to `chrome-extension://` URLs, it is accessing information stored on the user's terminal equipment: specifically, which software is installed. Each probe is an attempt to read data from the user's device.

Every EU member state has transposed this directive into national law:

**Germany: TTDSG § 25.** "The storage of information in the end user's terminal equipment or access to information already stored in the terminal equipment shall only be permitted if the end user has given consent." Penalty: up to €300,000 per violation. Extension scanning is accessing information on terminal equipment. No consent has been obtained.

**Netherlands: Telecommunicatiewet.** The Dutch transposition of the ePrivacy Directive carries the same consent requirement. Violations are enforceable by the Autoriteit Persoonsgegevens (AP) and can compound with GDPR penalties.

**France: Loi Informatique et Libertés / CNIL guidance.** The CNIL has been among the most active enforcers of terminal equipment access rules, issuing major fines to Google and Facebook for cookie consent violations. The same rules apply to extension scanning.

Every other EU and EEA member state has its own transposition. The principle is the same everywhere: accessing data on a user's device requires their consent. LinkedIn has not obtained it.

---

## 4. German Criminal Law

In Germany, what LinkedIn is doing is not only a regulatory violation. It is a criminal offense.

### § 202a StGB: Unauthorized data access (Ausspähen von Daten)

German law criminalizes obtaining access to data that is not intended for the offender and is specifically protected against unauthorized access. The penalty is up to three years in prison.

Browser extensions are protected against unauthorized access. When an extension developer sets `externally_connectable` to disabled in their manifest, or does not declare files as `web_accessible_resources`, that is an explicit security measure. LinkedIn's three-stage detection system, which probes for known resources and falls back to DOM scanning, constitutes deliberate circumvention.

The German Federal Court of Justice (BGH) confirmed in 5 StR 614/19 that even security measures which can be quickly circumvented still qualify as "special security measures" (besondere Sicherung) under § 202a. The ease of circumvention does not matter. What matters is that a protective measure existed and was deliberately overcome.

### § 202b StGB: Interception of data (Abfangen von Daten)

Transmitting the list of detected extensions to LinkedIn's servers via the `AedEvent` and `SpectroscopyEvent` tracking payloads constitutes interception and transmission of data that was not intended for LinkedIn.

### § 202c StGB: Preparation of data espionage (Vorbereiten des Ausspähens)

The fingerprinting system itself, a piece of software designed to probe for and extract information about installed software without authorization, constitutes a tool prepared for the purpose of committing offenses under § 202a and § 202b.

### § 240 StGB: Coercion (Nötigung)

LinkedIn used the results of BrowserGate scanning to identify users of third-party tools, then sent enforcement emails threatening those users with account restrictions. Using data obtained through criminal means (§ 202a) to threaten people constitutes coercion.

### § 23 GeschGehG: Trade secret theft

Each extension vendor's user base is a trade secret. When LinkedIn scans for a competitor's extension and detects which LinkedIn users have it installed, LinkedIn has obtained that competitor's customer data through improper means. With 6,153 extensions in the scan list, this represents thousands of potential separate offenses.

---

## 5. United Kingdom

The UK applies three bodies of law to LinkedIn's conduct.

### UK GDPR

The UK retained the GDPR after Brexit, and Article 9 applies with identical force. Processing of special category data is prohibited unless an exemption applies. The same extensions that reveal religion, politics, disability, and employment status to LinkedIn in the EU reveal the same information in the UK. Maximum fine: £17.5 million or 4% of global turnover.

### Computer Misuse Act 1990

Section 1 of the Computer Misuse Act criminalizes unauthorized access to computer material. Probing a user's browser for installed software, without their knowledge or consent, by firing thousands of fetch requests to internal extension URLs is unauthorized access to information stored on the user's computer. The maximum penalty is two years' imprisonment.

### Trade Secrets (Enforcement, etc.) Regulations 2018

The UK transposed the EU Trade Secrets Directive into national law. Extension vendors' customer data (who has their extension installed) constitutes a trade secret under this framework. LinkedIn's systematic scanning to identify which users run competitor products constitutes acquisition of trade secrets through unlawful means.

---

## 6. California (United States)

US federal privacy law is weak compared to the EU. But California, where many LinkedIn users and most tech companies are based, has its own regime.

### California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)

The CCPA, as amended by CPRA, gives California consumers the right to know what personal information is being collected about them, the right to delete it, and the right to opt out of its sale or sharing.

LinkedIn collects a list of installed browser extensions, tied to identified users (LinkedIn knows your name, employer, job title, and location). This is "personal information" under CCPA § 1798.140(v). LinkedIn does not disclose this collection in its privacy policy, does not provide an opt-out, and does not honor deletion requests for this data because it does not acknowledge the data exists.

The CPRA added the category of "sensitive personal information," which includes data revealing religious beliefs, health, and other characteristics. The extension scanning reveals exactly these categories for California users, just as it does for EU users.

### California Invasion of Privacy Act (CIPA)

CIPA provides statutory damages of $5,000 per violation, without requiring proof of actual harm. The law targets unauthorized interception of communications and unauthorized access to data. Whether LinkedIn's extension probing qualifies as "interception" under CIPA is a novel legal question. LinkedIn is not intercepting communications between two parties. It is probing for installed software. The statutory fit requires careful legal analysis, but the damages exposure is significant: millions of California LinkedIn users at $5,000 each.

---

## What This Adds Up To

LinkedIn is not in violation of one law. It is in violation of a stack of laws, across multiple jurisdictions, simultaneously.

|Jurisdiction|Law|Violation|Maximum Penalty|
|---|---|---|---|
|EU (27 countries)|GDPR Article 9|Processing prohibited special category data|€20M or 4% of global turnover ($11.27B for Microsoft)|
|EU (27 countries)|GDPR Article 6|No legal basis for processing|€20M or 4% of global turnover|
|EU (27 countries)|GDPR Articles 13/14|No disclosure in privacy policy|€20M or 4% of global turnover|
|EU (27 countries)|ePrivacy Directive|Terminal equipment access without consent|Varies by member state|
|EEA (Norway, Iceland, Liechtenstein)|GDPR via EEA Agreement|Same as EU|Same as EU|
|Germany|§ 202a StGB|Unauthorized data access|Up to 3 years imprisonment|
|Germany|§ 202b StGB|Interception of data|Up to 2 years imprisonment|
|Germany|§ 202c StGB|Preparation of data espionage|Up to 2 years imprisonment|
|Germany|§ 240 StGB|Coercion|Up to 3 years imprisonment|
|Germany|§ 23 GeschGehG|Trade secret theft|Civil and criminal penalties|
|Germany|TTDSG § 25|Terminal equipment access|Up to €300,000 per violation|
|United Kingdom|UK GDPR Article 9|Processing prohibited data|£17.5M or 4% of global turnover|
|United Kingdom|Computer Misuse Act 1990|Unauthorized computer access|Up to 2 years imprisonment|
|United Kingdom|Trade Secrets Regulations 2018|Acquisition by unlawful means|Civil damages|
|Switzerland|nFADP Art. 5(c)|Processing sensitive data without legal basis|Up to CHF 250,000 (individual liability)|
|California|CCPA/CPRA|Undisclosed collection of personal/sensitive info|$2,500-$7,500 per violation|
|California|CIPA|Unauthorized access to data|$5,000 per violation (statutory)|

These are not alternative theories. They are concurrent violations. LinkedIn is breaking multiple laws in multiple countries every time a Chrome user opens linkedin.com.

---

## Who Enforces This

Every EU member state has a data protection authority empowered to investigate, fine, and order LinkedIn to stop. LinkedIn's lead supervisory authority in the EU is the Irish Data Protection Commission (DPC). Any EU resident can also file a complaint with their national authority.

In Germany, criminal complaints (Strafanzeige) can be filed with the Staatsanwaltschaft (public prosecutor's office) for the § 202a, § 202b, and § 240 StGB offenses.

In the UK, the Information Commissioner's Office (ICO) enforces the UK GDPR and can refer Computer Misuse Act violations to police.

In California, the California Privacy Protection Agency (CPPA) enforces the CCPA/CPRA, and the Attorney General retains independent enforcement authority.

You can take action yourself. See [Take Action](/take-action/) for pre-filled complaint templates for every EU data protection authority, GDPR subject access request templates, and more.

---

_This page presents legal analysis based on the statutes, case law, and regulatory guidance cited above. It is not legal advice. The factual basis for this analysis, LinkedIn's extension scanning code and behavior, is documented on the [How It Works](/how-it-works/) page and can be independently verified by anyone with a Chrome browser and developer tools._

_This page will be updated as new jurisdictions are analyzed and as legal proceedings develop._