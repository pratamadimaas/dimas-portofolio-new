# Muhamad Dimas Pratama — Portfolio

Bespoke React portfolio. "High-Precision Industrial Cybernetics / Minimalist Tech Noir" —
dark "Deep Obsidian" and light "Architectural Blueprint / Clean Titanium" theme, toggled
and persisted via `localStorage`, no flash of unstyled content.

## Stack

- React 18 + Vite
- Tailwind CSS (`darkMode: 'class'`)
- Framer Motion (stagger reveals, spotlight hover, magnetic buttons, terminal typing HUD)
- React Three Fiber / Three.js (interactive wireframe core, auto-disabled on low-power/mobile)
- Lucide React icons
- Self-hosted fonts via `@fontsource` (Space Grotesk, Inter, JetBrains Mono) — no external
  font CDN calls

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  data/portfolioData.js   — identity, stack matrix, projects, timeline (edit content here)
  components/
    ThreeCanvas.jsx        — interactive wireframe 3D core
    Navbar.jsx              — floating HUD dock + theme toggle
    HeroSection.jsx         — command deck hero
    TerminalHUD.jsx         — typing status line
    MagneticButton.jsx      — cursor-attracted CTA button
    ProjectCard.jsx         — bento card with mouse-tracked spotlight border
    ProjectsSection.jsx     — bento matrix grid
    AboutSection.jsx        — dossier bento grid
    SkillsSection.jsx       — capability/stack matrix
    TimelineSection.jsx     — vertical trajectory timeline
    ContactSection.jsx      — terminal-style contact form
    Footer.jsx
  hooks/useTheme.js         — theme state + persistence
```

## Editing content

All personal/project copy lives in `src/data/portfolioData.js` — update names, project
descriptions, stack tags, and timeline entries there without touching component code.

## Notes

- The contact form currently only shows a local "sent" confirmation state — wire it to
  your backend or a form service (e.g. a serverless endpoint) before going live.
- Replace `identity.email` in `portfolioData.js` with the real contact address.
