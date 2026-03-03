# Brand Guidelines

This skill helps keep copy, visuals, and behavior consistent with the BrowserGate brand. Use it when writing content, designing UI, or adding new pages or features so the site feels like one coherent product.

---

## Name and domain

- **Brand name:** **BrowserGate** (capital B, capital G; one word, no space).
- **Domain:** **browsergate.eu** only.
  - Use **https://browsergate.eu** in copy, config, canonical URLs, and links.
  - Never reference the source code hosting platform publicly. The project's infrastructure is not disclosed.

---

## Positioning and tone

- **What this is:** Public documentation of LinkedIn's (Microsoft) mass browser surveillance program — the systematic scanning of 5,459+ Chrome extensions across every visitor's browser without consent or disclosure.
- **Tone:** Investigative, authoritative, unflinching. Think journalism meets legal brief. Every claim is backed by technical evidence or legal analysis. Not activist or hyperbolic — firmly accusatory, letting the facts speak.
- **Audience:** EU residents affected by LinkedIn's scanning, journalists, regulators, privacy advocates, legal professionals, and potential plaintiffs.
- **Tagline:** "LinkedIn: uncovered. unhinged. uncontrolled. unauthorized."

**Default meta description:**
*BrowserGate documents LinkedIn's illegal mass surveillance of browser extensions — 5,459 extensions scanned without consent, exposing religious beliefs, political opinions, disability status, and corporate trade secrets.*

---

## Visual identity

**Colors:**

| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#0E76A8` | Navbar background, LinkedIn accent — used deliberately as LinkedIn's own blue |
| Nav text | `#ffffff` | White text on navbar |
| Links | `#2a76a8` | Body links |
| Body background | `#ffffff` | Page background |
| Sidebar accent | `#0E76A8` | "LinkedIn" text in sidebar root heading |

The use of LinkedIn blue (`#0E76A8`) as the primary brand color is intentional — it turns LinkedIn's own identity into the frame for exposing their practices.

**Fonts:**

Docsy/Bootstrap defaults. No custom fonts. The site prioritizes clarity and readability over typographic flair — the content is the design.

**Logo:**

- **Navbar icon:** `assets/icons/logo.svg` — the "un" mark in white, derived from `assets/un-icon-white.svg`. Displayed at 30px height.
- **Navbar text:** Typewriter animation cycling through words defined in `data/typewriter.yaml` (uncovered, unhinged, uncontrolled, etc.). Falls back to the first word before JavaScript loads.
- **Favicon:** `static/favicons/` — SVG, ICO, 96x96 PNG, apple-touch-icon, webmanifest. Generated from the "un" mark.

**Layout:**

Three-column Docsy docs layout:
- Left sidebar: persistent global navigation
- Center: content area
- Right sidebar: quick links (Downloads, How you can help, Contact us) + page table of contents

No dark mode toggle. Light theme only.

---

## Content principles

1. **Evidence first.** Every claim links to or references technical proof, legal statute, or documented fact.
2. **No speculation.** If something is unconfirmed, say so explicitly.
3. **Name names.** LinkedIn, Microsoft, specific personnel where legally relevant and documented.
4. **Accessible severity.** The content is serious (criminal law, GDPR Article 9 sensitive data) but written so a non-lawyer can understand it.
5. **No GitHub references.** The project's source hosting is never disclosed publicly.

---

## Legal and footer

- **Copyright:** © 2025 BrowserGate. All rights reserved.
- **Last modified dates:** Shown per page via git history (10px font size). No commit links.
- **No "Edit this page" or "Create issue" links.** All repository references are stripped.

---

## Consistency checklist

When adding or changing content or UI:

1. Use **BrowserGate** (one word, capital B, capital G) consistently.
2. Use **browsergate.eu** only — never reference source hosting.
3. Use theme colors via the SCSS variables in `assets/scss/_styles_project.scss` and `assets/scss/_variables_project.scss`.
4. Keep tone investigative and evidence-based; no activist rhetoric or hyperbole.
5. Use the correct logo assets for context (navbar icon, favicon).
6. Every new content section needs `type: docs` in front matter to maintain the sidebar.

For design execution (layout, motion, aesthetics), see [frontend-design.md](./frontend-design.md). For project context and legal background, see [BrowserGate_Project_Brief.md](./BrowserGate_Project_Brief.md).
