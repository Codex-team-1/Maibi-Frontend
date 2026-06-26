# Maibi — handmade Algerian women's fashion

A complete e-commerce storefront for **Maibi**, a brand of limited-edition,
hand-embroidered clothing made by Algerian artisans. Warm-pink editorial design with a
signature dashed-stitch motif, built from the Maibi design system.

## Stack

- **React 19** + **Vite 6** + **TypeScript 5** (strict)
- **Tailwind CSS v4** — design tokens registered via `@theme` (`src/styles/index.css`)
- **React Router v7** — declarative `createBrowserRouter`, one file per route
- **Zustand** (+ `persist`) — cart & wishlist, saved to `localStorage`
- **React Hook Form** + **Zod** — checkout form validation
- **Framer Motion** — page transitions, cart/filter drawers, button press
- **Lucide React** — icons

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (tsc -b) + production build
npm run typecheck  # tsc --noEmit
npm run preview    # serve the production build
```

## Routes

| Path             | Screen                                                            |
| ---------------- | ---------------------------------------------------------------- |
| `/`              | Home — hero, marquee, featured, story, new arrivals, reviews     |
| `/shop`          | Listing — filters (sidebar / bottom-sheet), sort, grid/list view |
| `/product/:id`   | Product detail — size, quantity, add to bag, wishlist            |
| `/wishlist`      | Saved pieces (persisted)                                         |
| `/custom-order`  | 3-step bespoke wizard — photo, size & colour, contact            |
| `/checkout`      | 4-step checkout — shipping, payment, review, success             |

The header search navigates to `/shop?q=…`.

## Project layout

```
src/
├─ main.tsx · router.tsx
├─ styles/index.css        # Tailwind v4 @theme tokens + keyframes
├─ types.ts · data/products.ts
├─ lib/        format.ts, cn.ts
├─ store/      useCart, useWishlist, useUI  (Zustand)
├─ hooks/      useResponsive, useLayoutContext
├─ components/ ui · product · layout · cart · shop · home
└─ routes/     Home, Shop, Product, Wishlist, CustomOrder, checkout/
```

## Notes

- **Product imagery** uses gradient placeholder tiles (`components/ui/Tile.tsx`). The
  `Product` type carries an optional `image` field — set it to swap in real photos with
  no other changes; `ProductCard` / `ProductListCard` already fall back to the tile.
- **Fonts** (Yellowtail, Cormorant Garamond, Quicksand) load from Google Fonts in
  `index.html`. Swap in real foundry files if available.
- **Cart & wishlist** persist across reloads via Zustand's `persist` middleware
  (`maibi-cart`, `maibi-wishlist` in `localStorage`).
