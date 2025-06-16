# Forzak LLC – Modern Business Landing Page Specification

## 1. Project Overview

Forzak LLC requires a contemporary, single‑page **investment‑consulting** landing website that re‑imagines the content and aesthetic of its legacy brochure (see “Copy of forzak v3.pdf”) using modern **HTML5**, **CSS3**, and **Tailwind CSS**. The page must signal *trust, expertise, and global reach* while remaining performant, accessible, and easy to maintain.

---

## 2. High‑Level Goals & Success Criteria

| Goal                                 | Success Metric                                                      |
| ------------------------------------ | ------------------------------------------------------------------- |
| Convey professionalism & credibility | Visual parity with original brochure; positive stakeholder feedback |
| Increase lead conversions            | ≥ 5 % click‑through on “Contact Us” CTA within 3 months             |
| Mobile‑first responsiveness          | Lighthouse “Best Practices” ≥ 95 on mobile & desktop                |
| Accessibility compliance             | WCAG 2.2 AA pass on automated audit                                 |
| SEO ready                            | Core Web Vitals pass; relevant schema; meta‑tags present            |
| Easy content updates                 | All textual content isolated in structured JSON / Markdown          |

---

## 3. Technical Stack & Tooling

* **Frontend Framework**: Vanilla HTML enhanced with **Alpine.js** (optional) – low overhead interactivity.
* **Styling**: Tailwind CSS v3 (JIT). Custom theme tokens configured in `tailwind.config.js`.
* **Bundler / Build**: Vite for local dev hot‑reload + production asset optimization.
* **Deployment**: Static hosting (Netlify / Vercel) with CI pipeline (GitHub Actions) running lint, unit tests, and Lighthouse CI.
* **Version Control**: Git (GitHub repo). Conventional Commits & semantic versioning.

---

## 4. Information Architecture

> Single‑page layout with smooth‑scroll navigation.

| Anchor ID      | Section Title         | Original Brochure Mapping               | Purpose                                |
| -------------- | --------------------- | --------------------------------------- | -------------------------------------- |
| `#hero`        | Hero Banner           | Visual brand cue (global finance motif) | Immediate value proposition & CTA      |
| `#about`       | About Us              | Pages 1‑2                               | Company background & key personnel     |
| `#services`    | Our Services          | Pages 3‑5                               | Consulting offerings overview          |
| `#investments` | Financial Investments | Pages 6‑10                              | Investment capabilities & track record |
| `#contact`     | Contact / CTA         | *New*                                   | Lead generation (form + details)       |
| `#footer`      | Global Footer         | Brochure footer elements                | Legal, social links, © notice          |

---

## 5. Visual Design System

### 5.1 Color Palette *(tailwind custom colors)*

| Token         | Hex       | Usage                      |
| ------------- | --------- | -------------------------- |
| `primary`     | `#003366` | Headlines, primary buttons |
| `secondary`   | `#0055A5` | Accents, link hover        |
| `neutral‑100` | `#F5F7FA` | Background tint            |
| `neutral‑800` | `#1F2937` | Body copy                  |
| `accent‑gold` | `#C9A54B` | Highlights, KPI icons      |

### 5.2 Typography

* **Headings**: `"Poppins", sans‑serif; font‑weight 700` – modern, geometric
* **Body**: `"Merriweather", serif; font‑weight 400` – professional readability
* **Scale**: 1.25 major third modular scale (`text‑base = 1rem`)

### 5.3 Imagery Guidelines

* Use high‑resolution, royalty‑free imagery matching the brochure’s themes (teamwork, finance, strategy). Placeholders: `/assets/img/{slug}.jpg`.
* Apply `object-cover`, aspect‑ratio utilities, and lazy‑loading (`loading="lazy"`).

### 5.4 Iconography

* [Lucide](https://lucide.dev) icons for list bullets (`triangle`, `check‑circle`) and UI cues.

### 5.5 Layout Grid

* **Container**: `max‑w‑7xl mx‑auto px‑4 sm:px‑6 lg:px‑8`.
* **Columns**: CSS Grid with Tailwind `grid-cols-12` for complex splits (e.g., text 7 / image 5).

---

## 6. Component‑Level Specification

### 6.1 Navigation Bar

```
<Nav>
  Logo (SVG)  |  Desktop links -> anchor tags  |  Mobile menu button
</Nav>
```

* Sticky, transparent until scrolled (`backdrop‑blur` + shadow).
* Accessibility: `<button aria‑controls="mobile-nav" aria‑expanded="false">`.
* Mobile slide‑in menu via Alpine.js `<x-transition>`.

### 6.2 Hero Banner (`#hero`)

* Full‑viewport (`h‑[100dvh]`) section with background gradient overlay on financial skyline image.
* Headline: “Global Investment & Advisory Excellence.”
* Sub‑headline: Single sentence value prop.
* Primary CTA: “Schedule Consultation” → `#contact`.
* Secondary CTA: “Download Brochure” (PDF).
* Optional scroll cue arrow with `animate‑bounce`.

### 6.3 About Us (`#about`)

* Two‑column grid: text vs. portrait image.
* Include **Key Personnel** carousel (Alpine.js) with cards:

  * Photo / Name / Title / 80‑char bio & “LinkedIn” icon link.
* KPI stats bar (years in business, assets managed, global offices) using accent‑gold numbers.

### 6.4 Services (`#services`)

* Tabbed interface or accordion grouping for *Management Consulting*, *Corporate Restructuring*, etc.
* Each service block:

  * Icon (Lucide), Heading, 2‑sentence summary.
  * “Learn More” button triggers modal with bulleted details (mirrors brochure lists).
* Background alternating light / white for section separation.

### 6.5 Investments (`#investments`)

* **Timeline / Steps** component illustrating Private Equity → Placements → Buyouts → DIP Financing.
* Industry expertise vertical marquee (auto‑scroll logos or pill badges for 20+ industries).
* Featured Case Study cards (image, metric overlay, 150‑word summary, *Read PDF* link).

### 6.6 Contact CTA (`#contact`)

* Short form (`name`, `company`, `email`, `message`) with honeypot + client‑side validation.
* Submit via Netlify Forms or serverless function; success toast.
* Right‑side map or HQ image.

### 6.7 Footer (`#footer`)

* Columns: About blurb | Quick links | Social icons | Newsletter signup.
* Dark theme (`bg‑neutral‑800 text‑neutral‑100`).
* Copyright, privacy & terms links.

---

## 7. Interaction & Motion

| Element          | Motion Spec                                  |
| ---------------- | -------------------------------------------- |
| Section entrance | `data‑aos="fade-up"` on scroll (AOS library) |
| Button hover     | Tailwind `transition‑colors duration‑200`    |
| Modal open       | Alpine `<x-transition.opacity.scale>`        |

---

## 8. Accessibility (WCAG 2.2 AA)

* Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`).
* `aria‑label` on icons; `alt` text on all images.
* Color contrast ≥ 4.5:1; provide focus outlines (`focus:ring‑2`).
* Keyboard navigable modals & menus.
* Prefers‑reduced‑motion media queries to disable heavy animations.

---

## 9. SEO & Metadata

* `<title>` dynamic per hash fragment (`Hero – Forzak LLC`).
* Meta description 150‑160 chars.
* Open Graph & Twitter Card tags with placeholder images.
* JSON‑LD Organization schema.
* Sitemap.xml & robots.txt generated via build.

---

## 10. Performance & Best Practices

* Image optimization (AVIF / WebP fallback).
* Critical CSS inlined; rest loaded via `rel="preload"`.
* Minify & gzip (handled by Vite).
* Use `font‑display: swap`.
* Lazy‑load below‑fold components via Intersection Observer.

---

## 11. Content Management Strategy

* Store copy in `/src/content/*.md` (front‑matter for headings, blurb, etc.).
* Simple flat Markdown parsed at build (e.g., using `vite-plugin-md`).
* Enables non‑dev edits without touching HTML.

---

## 12. Folder Structure (pseudocode)

```
forzak-landing/
├─ public/
│  ├─ assets/
│  │   ├─ img/
│  │   │   ├─ hero.jpg
│  │   │   └─ team.jpg
│  │   └─ icons/
│  └─ favicon.svg
├─ src/
│  ├─ components/
│  │   ├─ NavBar.html
│  │   ├─ ServiceCard.html
│  │   └─ Modal.html
│  ├─ content/
│  │   ├─ about.md
│  │   └─ services.md
│  ├─ styles/
│  │   └─ main.css
│  └─ main.js
├─ tailwind.config.js
└─ vite.config.js
```

---

## 13. Open Questions for Stakeholder

1. **Navigation depth** – Is a single‑page scroll sufficient, or do you prefer separate routes per major section? -- separate routes/tabs per major section
2. **Brand assets** – Will a finalized logo & color palette be provided, or should the dev team propose options? - Logo will be provided, blue color palette, rest will be black and white, professional
3. **Lead capture** – Preferred backend (Netlify, custom API, CRM integration)? - Netlify hosting, no backend required
4. **Analytics** – Google Analytics 4, Plausible, or other? -- Google is fine
5. **Compliance** – Any specific legal disclaimers or regulatory footers required (e.g., FINRA, SEC notices)? -- None
