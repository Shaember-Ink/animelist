# AnimeList - Technical Documentation

This document provides a comprehensive overview of the AnimeList project architecture, key technical decisions, API integrations, and a guide for future expansion. It is intended for developers who want to maintain, extend, or understand the codebase.

## 🏗 Architecture Overview

AnimeList is a modern web application built with **Next.js 14 (Pages Router)** and **React 18**. It utilizes a hybrid rendering approach to maximize both SEO and user experience:

- **Static Generation (SSG)**: The home page (`/`) uses `getStaticProps` with `revalidate` (Incremental Static Regeneration - ISR) to pre-render the trending anime list on the server. This ensures the initial load is lightning-fast and SEO-friendly.
- **Client-Side Rendering (CSR)**: Detail pages (`/anime/[id]`, `/watch/[id]`) and Search/Catalog pages heavily rely on client-side data fetching (`useEffect`). Initially, these pages used Server-Side Rendering (SSR), which caused a 3-second navigation lag due to sequential API fetching. Moving secondary data to the client enables instant page transitions while skeleton loaders provide immediate feedback.
- **TypeScript**: The entire codebase strictly adheres to TypeScript for robust type checking, primarily utilizing interfaces like `Anime`, `Character`, and `ApiResponse` to map external API responses to internal component props.

## 🎨 Styling System & Theme

The project uses a **Vanilla CSS Modules** approach (`[name].module.css`) to prevent global namespace collisions.

### Design Philosophy

The aesthetic is a **"Premium Streaming Platform Clone" (Netflix-inspired)**.

- **Global Variables**: Defined in `styles/globals.css`, dictating the core theme:
  - `--background`: `#000000` (Pitch black)
  - `--surface`: `#141414` (Slightly elevated gray cards)
  - `--primary`: `#E50914` (Netflix Red accents)
- **Glassmorphism**: Headers and sticky elements use `backdrop-filter: blur(10px)` with semi-transparent dark backgrounds to create depth.
- **Ambient Mode**: The `/watch/[id]` page features a cinematic "ambient glow" behind the video player. This is achieved using a heavily blurred `::before` pseudo-element with a keyframe animation (`pulseGlow`) to simulate backlight bleed.

## 🔌 API Integrations

### 1. Jikan API (V4)

The unofficial MyAnimeList API used for all metadata (titles, synopsis, images, characters, genres).

- **Rate Limiting**: Jikan is publicly accessible but aggressively rate-limited.
- **`fetchWithRetry` Utility**: Found in `utils/api.ts`, this is a critical wrapper function. It intercepts `429 Too Many Requests` responses, artificially delays the execution with exponential backoff (`delay()`), and retries the fetch. **Do not remove this utility**, or the app will break under heavy navigation.

### 2. Kodik API

A third-party video host used for streaming playback.

- **Implementation**: Handled in `/pages/watch/[id].tsx`. We fetch an iframe URL from Kodik based on the Anime's title or MAL ID, and embed it inside our custom styled `.videoWrapper` container.

## 📁 Directory Structure

```text
animelist/
├── components/          # Reusable React components
│   ├── Layout.tsx       # Global layout wrapper (Navbar & Footer)
│   ├── HeroBanner.tsx   # Homepage animated carousel
│   ├── AnimeCard.tsx    # Standardized generic card UI
│   └── ...
├── pages/               # Next.js file-based routing
│   ├── _app.tsx         # Global app wrapper (imports globals.css)
│   ├── index.tsx        # Homepage (SSG/ISR)
│   ├── search.tsx       # Search interface
│   ├── anime.tsx        # Catalog & Genre Filtering
│   ├── anime/
│   │   └── [id].tsx     # Anime Details Page (Dynamic Route)
│   └── watch/
│       └── [id].tsx     # Dedicated Player Page (Dynamic Route)
├── styles/              # CSS Modules
│   ├── globals.css      # CSS Variables and base resets
│   ├── Card.module.css  # Global card styles (used across Home, Search, Catalog)
│   └── ...
├── cypress/             # E2E Testing Framework
│   ├── e2e/             # Cypress spec files (`core_flows.cy.ts`)
│   └── support/         # Cypress configuration and custom commands
└── utils/               # Helper functions (`api.ts` for fetch wrappers)
```

## 🧪 Testing Strategy

The project uses **Cypress** for End-to-End (E2E) UI testing.

- The master test suite is located at `cypress/e2e/core_flows.cy.ts`.
- **Methodology**: It verifies the critical user journey: Navigation -> Search -> Catalog Filtering -> Details Page -> Video Player Render.
- **Best Practice**: The tests intercept API calls (`cy.intercept`) where possible to avoid Jikan rate limits during CI/CD pipelines, and they rely on Cypress's built-in retryability rather than hardcoded `cy.wait` times for UI elements.
- **Running Tests**: `npm run cypress:open` (interactive) or `npm run cypress:run` (headless).

## 🚀 Future Expansion Guide

If you wish to expand AnimeList, follow these guidelines to maintain architectural consistency:

### 1. Adding a New Page

1. Create a straightforward `.tsx` file in `/pages` (e.g., `pages/favorites.tsx`).
2. Wrap the return JSX in `<Layout>...</Layout>` to inherit the Navbar and Footer automatically.
3. If the page fetches significant data, **default to Client-Side Rendering (`useEffect`)** mixed with a skeleton loader. Avoid `getServerSideProps` unless SEO is paramount for that specific page, as it blocks the client router.

### 2. Implementing User Authentication

The project currently has Prisma and NextAuth installed (`package.json`), though they are unused in the current UI iteration.

- **To activate**: Set up `pages/api/auth/[...nextauth].ts` using the provided Prisma adapter.
- Create a `User` model in `prisma/schema.prisma`.
- Wrap the `pages/_app.tsx` component in `<SessionProvider>`.

### 3. Creating New Components

- Always create a paired CSS Module (`MyComponent.module.css`).
- Never use inline styles or standard CSS cascading classes unless necessary.
- Rely on the variables in `globals.css` (e.g., `var(--primary)`) rather than hardcoding `#E50914` repeatedly. This ensures the theme can be swapped easily in the future (e.g., changing from Netflix Red to Crunchyroll Orange).

### 4. Adding More Video Sources

Currently, the app relies heavily on Kodik. If Kodik fails or lacks a specific anime, you can implement a fallback player integration:

- Modify `pages/watch/[id].tsx` to try fetching from an alternative API (e.g., Anilibria or a generic remote iframe source) if the first fetch fails or returns a 404.
