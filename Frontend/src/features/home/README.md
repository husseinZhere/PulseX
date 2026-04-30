# PulseX Home Module 🏠

The Home module powers the public-facing landing experience of PulseX.
It is built from modular sections to keep content easy to update and extend.

## Folder Structure

```text
home/
├─ components/
│  ├─ Hero/
│  ├─ Features/
│  ├─ Doctors/
│  ├─ PatientStories/
│  ├─ JourneyTimeline/
│  ├─ CustomSlider/
│  ├─ SectionHeader/
│  ├─ SectionWrapper/
│  ├─ HomeWrapper/
│  └─ ...
└─ pages/
   └─ Home/
```

## Purpose of Each Part

- `pages/Home/`
  Route-entry page for the public home screen.

- `components/`
  Section-based UI blocks used to compose the landing experience.

This approach keeps the home page flexible for marketing/content updates.

## High-Level Home Flow

1. User opens the root route (`/`).
2. Home page composes sections in a clear narrative order.
3. Users discover platform value, key features, and entry points for deeper journeys.

## Responsive Behavior

- Section layout is mobile-first and stacks naturally on small screens.
- Typography and spacing scale by breakpoints.
- Sliders and media components adapt to viewport width.
- Wrappers preserve consistent content width across devices.

## Extension Guidelines

- Add new homepage blocks under `components/`.
- Keep section files focused and reusable.
- Use shared wrappers/headers to maintain visual consistency.

## Summary

The Home module is optimized for clear storytelling, modular composition, and responsive presentation.
