---
name: senior-frontend-developer
description: Trigger this for ANY general frontend task, feature creation, or component building. It enforces senior-level web standards, mobile-first responsiveness, strict TypeScript, and high code reusability.
---
# Senior Frontend Developer Execution

## Purpose
Executes front-end tasks using advanced web development standards. It bridges the gap for mobile developers by strictly enforcing responsive web design, semantic HTML (accessibility), and React separation of concerns.

## Execution Steps
1. **Analyze & Plan:** Before writing code, identify the required state, UI components, and API/data needs. 
2. **Architecture (Reusability):** 
   - Separate business logic from the UI.
   - Plan to put state, `useEffect` hooks, and data fetching into a Custom Hook (`useFeatureName`).
   - Keep the UI component as a "dumb" presentation layer.
3. **UI & Responsiveness:**
   - Scaffold the UI using semantic HTML5 tags (`<main>`, `<section>`, `<article>`, `<button>`, `<nav>`) instead of generic `<div>` tags.
   - Apply mobile-first CSS/Tailwind. Base classes must target mobile screens, using min-width breakpoints (e.g., `md:`, `lg:`) to scale up for desktop.
4. **Accessibility (a11y):**
   - Ensure all interactive elements are keyboard navigable.
   - Add `aria-labels` to icon buttons and `alt` tags to images.
5. **Implementation & Typing:** Write the code using strict TypeScript.

## Non-Negotiable Rules
- **No `any` types:** Everything must have an explicit `interface` or primitive type.
- **No Class Components:** Use React Functional Components and arrow functions exclusively.
- **No max-width media queries:** Always design for mobile first, then scale up.

## End State
The task is complete when the feature is built modularly (separated logic and UI), is fully responsive, passes TypeScript strict checks, and is accessible to screen readers.