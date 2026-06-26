# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at http://localhost:5173
npm run build      # tsc -b + vite production build
npm run typecheck  # tsc --noEmit (type-check only, no emit)
npm run preview    # serve the production build
```

No test runner is configured.

## Architecture

**Maibi** is a React 19 + Vite 6 + TypeScript (strict) e-commerce SPA for Algerian handmade fashion.

### Routing

`src/router.tsx` defines a single `createBrowserRouter` tree with `RootLayout` as the shell and six child routes: `/`, `/shop`, `/product/:id`, `/wishlist`, `/custom-order`, `/checkout`. Each route has one file in `src/routes/`.

### State

Three Zustand stores in `src/store/`:

- `useCart` — cart items, persisted to `localStorage` as `maibi-cart`. Exposes derived selectors `selectCartCount` / `selectSubtotal`.
- `useWishlist` — wishlist items, persisted as `maibi-wishlist`.
- `useUI` — ephemeral UI flags (cart drawer open/closed). Used to avoid prop-drilling between `Header`, bottom-nav, and the product page.

### Design system

All design tokens (brand pink scale, warm neutrals, gold/sage/rose-red accents, font families, type scale, radii, shadows) live in `src/styles/index.css` under a single `@theme` block, consumed by Tailwind CSS v4. Do not add raw hex values inline — reference the token names (`bg-pink-400`, `text-ink-900`, `font-display`, etc.).

Font stacks: `font-script` (Yellowtail), `font-display` (Cormorant Garamond), `font-ui` (Quicksand) — loaded from Google Fonts in `index.html`.

### Data & types

- `src/types.ts` — all shared interfaces (`Product`, `CartItem`, `Promoted`, `Review`, `PaymentMethod`, etc.).
- `src/data/products.ts` — static product array (source of truth; no backend).
- `Product.image` is optional — absent products fall back to the gradient `Tile` component automatically.

### Path alias

`@/` resolves to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). Always use `@/` imports inside `src/`.

### Build chunks

Vite is configured with manual chunks: `react` (react/react-dom/react-router-dom), `motion` (framer-motion), `forms` (react-hook-form + zod).
