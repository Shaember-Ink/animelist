<div align="center">

# 🎬 AnimeList - Premium Streaming Platform Clone

**A high-performance, modern anime discovery and streaming platform built with Next.js, featuring a Netflix-inspired aesthetic.**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Cypress](https://img.shields.io/badge/Cypress-E2E-17202C?style=flat&logo=cypress)](https://www.cypress.io/)
[![API](https://img.shields.io/badge/Jikan-API_v4-ED2626?style=flat)](https://jikan.moe/)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Installation](#-quick-start) • [Testing](#-testing)

---

</div>

## ✨ Key Features

- **📺 Premium Netflix Aesthetic**: Full-bleed dark theme, signature red accents, glassmorphism headers, and smooth hover effects designed for a modern streaming experience.
- **🔥 Dynamic Hero Carousel**: Automatically cycles through top-trending series with smooth fade transitions and interactive indicators.
- **⚡ Instant Navigation**: Architecture optimized with **Client-Side Hydration** and minimal server blocking, ensuring near-instant page transitions without artificial loading delays.
- **🎬 Integrated Video Player**: Watch your favorite anime directly on the platform with a custom-styled player wrapper utilizing the Kodik API.
- **✨ Ambient Player Mode**: A cinematic viewing experience featuring a dynamic, softly glowing aura behind the video player that pulses with the theme color.
- **🔍 Advanced Discovery**: Fast search functionality and a sleek Catalog page with interactive, Netflix-red underscored genre filters.
- **📱 Responsive Layout**: Pixel-perfect alignment adapted for various screen sizes, from mobile to ultra-wide displays.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (Page Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS Modules (Premium custom design system)
- **Data Source (Metadata)**: [Jikan API v4](https://jikan.moe/) (Unofficial MyAnimeList API)
- **Data Source (Video)**: [Kodik API](https://kodik.biz/)
- **Testing**: [Cypress E2E Testing](https://www.cypress.io/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm / yarn / pnpm

### Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd animelist
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing

This project uses Cypress for End-to-End (E2E) testing to ensure core user flows (Navigation, Search, Filtering, and Video Playback) remain stable.

To run the tests:

1. **Ensure your local development server is running:**
   ```bash
   npm run dev
   ```
2. **Open the Cypress Test Runner:**
   ```bash
   npm run cypress:open
   ```
   _(Or run them headlessly in the terminal: `npm run cypress:run`)_

## 📄 License & Disclaimer

This project is created for educational and portfolio presentation purposes.

- Anime metadata provided by the public [Jikan API](https://docs.api.jikan.moe/).
- Video playback functionality provided via iframe embedding from the [Kodik API](https://kodik.biz/). This platform does not host any video content itself.

---

<div align="center">
  Developed for a premium anime browsing experience.
</div>
