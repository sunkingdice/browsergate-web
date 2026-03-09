---
title: This Is Not Just a Privacy Violation
linkTitle: The deeper problem
type: docs
weight: 50
---
When people hear that LinkedIn scans browser extensions without consent, the first reaction is usually about personal privacy. That reaction is correct, but it is incomplete.

The problem with BrowserGate is not only that it affects millions of individuals. It is what LinkedIn can do with the data once it has it.

LinkedIn is not Reddit. It is not Twitter. It is not an anonymous forum where people use pseudonyms and joke about their cats. LinkedIn is the world's largest verified professional directory. It has 1.2 billion registered members across 200 countries. More than 67 million companies are listed on the platform. Users register with their real names. Many are verified with photo ID. They list their real employers, real job titles, real education history, real professional connections. In many industries, having a LinkedIn profile is not optional. It is a prerequisite for being hired.

This means LinkedIn does not just know that someone has a religious browser extension installed. It knows that person's name, employer, job title, department, location, and professional network. And it knows the same about every one of their colleagues who also uses LinkedIn.

That is not a privacy breach. That is an intelligence operation.

---

## The individual layer: profiling real people

On an anonymous platform, knowing that a user has the PordaAI extension installed tells you that an anonymous account belongs to a practicing Muslim. That is a privacy violation, but the damage is limited by the anonymity.

On LinkedIn, the same data point is attached to a verified identity. LinkedIn does not just know that someone is a practicing Muslim. It knows that Fatima A., Senior Policy Advisor at the German Federal Ministry of the Interior, Berlin, is a practicing Muslim. Because she has a LinkedIn profile with her real name, real photo, real employer, and real title. And because LinkedIn's JavaScript probed her browser and found PordaAI installed.

The same logic applies to every category of extension LinkedIn scans for:

**Political opinions.** If LinkedIn detects "Anti-Zionist Tag" or "No more Musk" on the browser of a named, verified professional, it has not just collected political opinion data. It has tied that political opinion to a specific person at a specific organization. A diplomat. A procurement officer. A journalist. A judge.

**Health and disability.** If LinkedIn detects "simplify" (described as "for neurodivergent users") on the browser of someone who lists their employer as a law firm, a hospital, or a public school district, LinkedIn now knows that a named employee at that organization has a neurological condition. This is information that employers are legally prohibited from asking about in most jurisdictions, and that LinkedIn has no right to collect.

**Employment status.** If LinkedIn detects one of the 509 job search extensions on the browser of someone whose profile says they currently work at Company X, LinkedIn knows that person is trying to leave. On a platform where their current employer's recruiters, HR department, and managers are also active. LinkedIn has created a system that exposes job seekers to their current employers.

---

## The organizational layer: profiling companies

The individual violations are serious. But the organizational implications are worse.

LinkedIn does not just have data about individuals. It has data about where those individuals work. When you aggregate extension scan results across every employee at a company who uses LinkedIn, you get a profile of the organization itself.

Consider what LinkedIn can determine about a single company:

**Technology stack.** LinkedIn scans for extensions from Salesforce, HubSpot, Apollo, Lusha, ZoomInfo, Adobe, and hundreds of other software vendors. If 47 employees at Company X have the Salesforce extension installed and 3 have HubSpot, LinkedIn knows that Company X is a Salesforce customer and may be evaluating HubSpot. This is competitive intelligence that software vendors pay millions to acquire through legitimate channels.

**Sales and prospecting tools.** LinkedIn scans for 209 sales and prospecting extensions with 3.4 million total users. These include Apollo, Lusha, ZoomInfo, and other tools that directly compete with LinkedIn's own Sales Navigator product, which generates roughly $1 billion per year in revenue. LinkedIn is scanning for its own competitors' customers so it can identify them. It has already used this data to send enforcement threats.

**Security posture.** LinkedIn scans for Malwarebytes Browser Guard (10 million users), VPNs like KeepSolid VPN Unlimited, password managers like Zoho Vault, and privacy tools like LinkedIn Profile Privacy Shield. The presence or absence of security tools across an organization's employees reveals that organization's security posture. Which companies use enterprise security tools? Which ones don't?

**Internal culture.** If LinkedIn detects political extensions across employees at a company, it can infer the political leanings of the workforce. If it detects religious extensions, it knows the religious composition. If it detects job search extensions on 30% of a company's employees, it knows the company has a retention problem.

None of this is hypothetical. The technical architecture documented on the [How It Works](/how-it-works/) page fires up to 6,222 extension probes on every Chrome user who visits LinkedIn. LinkedIn has the user's profile data. It has their employer. It has the scan results. The aggregation is trivial.

---

## The competitive intelligence layer: 6,167 stolen customer lists

Every software product has a customer list. That list is universally recognized as a trade secret, in the EU, in the US, and in every major jurisdiction. Companies spend millions protecting it. Sales teams sign non-compete agreements to prevent its leakage. Lawsuits are filed over it routinely.

LinkedIn has built a system that extracts customer lists from 6,167 software companies simultaneously. Without asking. Without paying. Without the companies knowing.

Here is how it works: Adobe's Acrobat extension has millions of users. LinkedIn scans for it. Every LinkedIn user who has the Adobe Acrobat extension installed is identified, by name, employer, and job title. LinkedIn now has a partial customer list for Adobe, segmented by company, industry, and role. Multiply this across all 6,222 extensions.

LinkedIn is not buying this data on the open market. It is not licensing it from data brokers. It is extracting it from users' browsers through a covert detection system, attaching it to verified professional identities, and transmitting it, encrypted, to its own servers. This is the kind of competitive intelligence that, if obtained by an employee walking out of a company with a USB drive, would result in criminal prosecution.

LinkedIn does it to 6,167 companies at once, continuously, and at scale.

---

## The government layer: who else is on LinkedIn?

LinkedIn's user base does not consist only of private sector employees. Governments, military organizations, intelligence agencies, law enforcement bodies, regulators, international organizations, and NGOs are all represented. Their employees have LinkedIn profiles with their real names, real titles, and real institutional affiliations.

LinkedIn's extension scanning does not distinguish between a marketing manager at a startup and a cybersecurity analyst at a European defense ministry. Both get scanned. Both have their results transmitted to LinkedIn's servers in the United States.

Consider what BrowserGate reveals about government employees:

**Security tool usage.** If a cluster of employees at a government ministry all have Malwarebytes or a specific VPN extension, LinkedIn can map the security tools used inside that ministry. If some employees lack security extensions, LinkedIn knows which ones are unprotected.

**Religious and political composition.** If LinkedIn detects religious extensions among employees at a law enforcement agency, it has data on the religious composition of that agency's workforce. If it detects political extensions among employees at a regulatory body, it has data on the political leanings of the people who regulate it. LinkedIn is currently designated as a DMA-regulated gatekeeper by the European Commission. The very officials responsible for enforcing the DMA against LinkedIn are almost certainly on LinkedIn themselves.

**Job-seeking behavior.** If analysts at an intelligence agency are running job search extensions, LinkedIn knows that agency has a retention problem, what kind of roles those analysts are looking for, and potentially where they are looking. This is operational security intelligence.

**Technology adoption.** Government agencies' technology choices are often classified or sensitive procurement information. Which agencies use which productivity tools, which CRM systems, which security solutions. LinkedIn's extension scanning maps these choices by detecting the tools on individual employees' browsers.

---

## The transatlantic data flow: where does the data go?

LinkedIn is a US company owned by Microsoft, headquartered in Sunnyvale, California. LinkedIn's `li/track` telemetry endpoint, where all scan results are transmitted, resolves to servers under LinkedIn's control.

This means the extension scan data, including information revealing religious beliefs, political opinions, health conditions, security tools, and employment intentions of European citizens, is transmitted to the United States.

This is happening at a time when EU-US data transfer is already legally contested. The EU-US Data Privacy Framework exists precisely because the Court of Justice of the European Union struck down two prior frameworks (Safe Harbor in 2015, Privacy Shield in 2020) on the grounds that US surveillance law does not provide adequate protection for European citizens' data.

The BrowserGate data is not routine browsing data. It includes GDPR Article 9 special category data: religion, politics, health. It covers government employees, regulators, elected officials, military personnel, intelligence professionals. It is collected covertly, transmitted encrypted, and processed without any transparency mechanism.

Under normal circumstances, transferring special category data to the US requires explicit consent and a Data Protection Impact Assessment. LinkedIn has neither.

---

## The monopoly layer: why LinkedIn can do this

LinkedIn can operate this surveillance system because it is a monopolist.

There is no alternative professional network at comparable scale. If you are a professional in most industries, you need a LinkedIn profile. Recruiters expect it. Clients check it. Colleagues connect on it. Refusing to use LinkedIn means accepting a real professional disadvantage.

This gives LinkedIn the power to set terms that no user would accept if they had a choice. No user, if asked, would consent to having their browser scanned for 6,222 extensions every time they visit a website. But LinkedIn does not ask, because it does not have to. Where would you go instead?

The Digital Markets Act was supposed to address exactly this kind of abuse. The EU designated LinkedIn as a gatekeeper platform in September 2023 and required it to open access to third-party tools under Article 6(10). LinkedIn's response was to massively expand its extension scanning. In 2024, the scan list contained roughly 461 extensions. By December 2025, it had grown to 5,459. By February 2026, 6,167. The 10x growth in the scan list directly tracks the period when LinkedIn was supposed to be opening up to competition.

The EU told LinkedIn to allow third-party tools. LinkedIn responded by building a surveillance system to identify and punish every user of those tools.

---

## What this is, taken together

BrowserGate is not one thing. It is several things operating simultaneously:

It is a mass privacy violation affecting every Chrome user who visits LinkedIn.

It is an illegal profiling system that collects data on religion, politics, health, and employment status, tied to verified real-world identities.

It is a corporate intelligence operation that maps the technology stacks, security postures, and internal cultures of tens of millions of companies.

It is a trade secret extraction machine that compiles customer lists for 6,167 software vendors without their knowledge or consent.

It is a tool for surveilling government employees, including the very regulators and legislators responsible for overseeing LinkedIn's compliance with the law.

And it is a monopoly maintenance mechanism, designed to identify and suppress the users of competing tools on a platform where users have no meaningful alternative.

One company, owned by the largest software corporation on earth, with 1.2 billion users' verified professional identities, decided to silently scan every visitor's browser for installed software and transmit the results, encrypted, to its servers. No consent. No disclosure. No oversight.

The question is not whether this violates the law. We have [documented that](/why-its-illegal/). The question is whether the institutions responsible for enforcing the law will act before LinkedIn finishes building the most comprehensive corporate and government intelligence database ever assembled by a private company.

---

_The technical evidence for BrowserGate is documented on the [How It Works](/how-it-works/) page. The legal violations are analyzed on the [Why It's Illegal](/why-its-illegal/) page. The full list of scanned extensions is searchable on the [Extensions Database](/extensions/) page._