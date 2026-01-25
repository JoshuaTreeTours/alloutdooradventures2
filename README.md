# All Outdoor Adventures V2

A scalable, Vercel-first outdoor adventure website built with React, Tailwind CSS, and a template-driven architecture.

## 🚀 Project Overview

Version 2 of AllOutdoorAdventures.com is designed for massive content expansion. It moves away from fragile dependencies and complex build steps in favor of a robust, static-first architecture that can easily scale to thousands of destination pages.

### Key Features

*   **Vercel-First Architecture**: Optimized for edge deployment with fast static rendering.
*   **Template-Driven**: A single set of templates generates hundreds of pages from structured data.
*   **Scalable Content**: Add new states, cities, and tours via simple JSON updates.
*   **Design System**: "The Modern Naturalist" aesthetic—clean, readable, and authoritative.
*   **Performance**: Minimal JS payload, fast LCP, and responsive images.

## 🛠️ Tech Stack

*   **Framework**: React 19 + Vite (Static Generation)
*   **Routing**: Wouter (Lightweight, client-side routing)
*   **Styling**: Tailwind CSS 4 + Shadcn UI
*   **Icons**: Lucide React
*   **Fonts**: Inter Tight (Headings), Newsreader (Body), JetBrains Mono (Data)

## 📂 Project Structure

```
/client
  /public           # Static assets (images, robots.txt)
  /src
    /components     # Reusable UI components
      /ui           # Shadcn primitives
      Header.tsx    # Global navigation
      Footer.tsx    # Global footer
      Hero.tsx      # Reusable hero section
      Section.tsx   # Standard layout container
    /lib
      data.ts       # Core data source (The "Database")
      utils.ts      # Helper functions
    /pages
      Home.tsx      # Landing page
      StatePage.tsx # Template for /tours/{state}
      CityPage.tsx  # Template for /tours/{state}/{city}
      TourPage.tsx  # Template for /tours/{state}/{city}/{tour}
    App.tsx         # Main router configuration
```

## 📝 How to Add Content

The entire site is driven by `src/data/destinations.ts`. To add new destinations, you simply add to the `states` array.

### Adding a New State

1.  Open `src/data/destinations.ts`.
2.  Add a new object to the `states` array:

```typescript
{
  id: "ca",
  slug: "california",
  name: "California",
  abbreviation: "CA",
  description: "...",
  heroImage: "/images/ca-hero.jpg",
  featured: false,
  cities: [] // Add cities here
}
```

### Adding a New City

Inside a State object's `cities` array:

```typescript
{
  id: "yosemite",
  slug: "yosemite",
  name: "Yosemite National Park",
  description: "...",
  heroImage: "/images/yosemite.jpg",
  highlights: ["Half Dome", "El Capitan"],
  bestTimeToVisit: "May to October",
  climate: [...], // Monthly weather data
  thingsToDo: [...],
  tours: [] // Add tours here
}
```

### Adding a New Tour

Inside a City object's `tours` array:

```typescript
{
  id: "half-dome-hike",
  slug: "half-dome-guided-hike",
  title: "Half Dome Guided Hike",
  description: "...",
  price: 250,
  duration: "10-12 hours",
  difficulty: "Extreme",
  image: "/images/half-dome.jpg",
  highlights: [...],
  included: [...],
  whatToBring: [...],
  meetingPoint: "Curry Village",
  season: "Summer",
  rating: 4.9,
  reviewCount: 450,
  fareharborId: "12345"
}
```

## 🧭 Tours (Data-Driven + CSV)

Tours are now powered by a single data source that is generated at build time.

* **Source of truth (generated):** `src/data/tours.generated.ts`
* **Manual overrides (optional):** `src/data/tours.ts` → `MANUAL_TOURS`
* **CSV import script:** `scripts/import-tours-from-csv.ts`
* **Pricing cache refresh:** Run `npm run fetch:fareharbor-prices` after adding new tours to update cached FareHarbor starting prices.

### Adding a New Tour (manual entry)

1. Open `src/data/tours.ts`.
2. Add a new object to `MANUAL_TOURS` using the `Tour` shape from `src/data/tours.types.ts`.
3. Ensure `bookingUrl` includes your affiliate tracking parameters.

### How to add/edit tours via CSV

1. Drop a CSV file into `/data`, `data/northeast`, or `data/deep-south` (nested folders are supported under the regional directories).
2. Run `npm run prebuild` (or `npx tsx scripts/import-tours-from-csv.ts`) to regenerate `src/data/tours.generated.ts` plus the regional destination files.
3. Build/deploy as usual.

**Please implement CSV parsing at build time (prebuild) so it works on Vercel without needing a backend.**

#### Required CSV columns

* `location`
* `item_name`

#### Optional columns

* `item_id`
* `company_name`
* `company_shortname`
* `location_lat`
* `location_long`
* `category`
* `tags`
* `image_url`
* `booking_url`
* `calendar_link`
* `regular_link`
* `short_description`
* `operator`
* `availability_count`
* `quality_score`

#### CSV mapping table

| CSV column | Internal field |
| --- | --- |
| `item_id` or `item_name` + `location` + `operator` | `id` |
| `item_name` | `title` |
| `item_id` | `slug` (used to keep slugs unique) |
| `location` | `destination.state`, `destination.city` |
| `image_url` | `heroImage`, `galleryImages[0]` |
| `tags` | `tagPills[]`, `badges.tagline`, `tags[]` |
| `category` + inferred keywords | `activitySlugs[]`, `primaryCategory` |
| `short_description` | `shortDescription` |
| `company_name`/`operator` | `operator` |
| `quality_score` | `badges.rating` |
| `availability_count` | `badges.reviewCount`, `badges.likelyToSellOut` |
| `booking_url` or `regular_link` | `bookingUrl` |
| `calendar_link` | `bookingWidgetUrl` |

#### Adding more Northeast CSVs

* Place additional CSVs anywhere under `data/northeast/` (nested folders are fine).
* The importer will auto-detect them, infer categories (Hiking/Cycling/Canoeing), and build/update Northeast state + city pages automatically on the next `npm run prebuild`.

#### Adding more Deep South CSVs

* Place additional CSVs anywhere under `data/deep-south/` (nested folders are fine).
* The importer will auto-detect them, infer categories (Hiking/Cycling/Canoeing), and build/update Deep South state + city pages automatically on the next `npm run prebuild`.

### Affiliate disclosure

Affiliate disclosure text is configured in `src/data/tours.ts` for each provider and displayed on the Tour detail + booking pages when required.

## 🎨 Design Philosophy: "The Modern Naturalist"

We chose a design that mimics a trusted field guide.

*   **Typography**: We use *Inter Tight* for authoritative headings and *Newsreader* for body text to encourage reading.
*   **Color**: "Earth & Signal" palette. Warm off-whites and deep forest greens form the base, with safety orange/blue for interactive elements.
*   **Layout**: Asymmetric modularity. We avoid generic centered layouts in favor of sidebar-heavy designs that organize complex data (weather, prices) effectively.

## 🚀 Deployment

This project is ready for Vercel.

1.  Push to GitHub.
2.  Import project in Vercel.
3.  Framework Preset: **Vite**.
4.  Build Command: `npm run build`.
5.  Output Directory: `dist`.

## 🔄 Migration Notes (V1 to V2)

*   **Removed**: Complex server-side rendering (SSR) in favor of fast client-side routing for simplicity and cost.
*   **Removed**: Heavy animation libraries. We use CSS transitions for better performance.
*   **Simplified**: Navigation structure is now strictly hierarchical (State > City > Tour).

---

Built by Manus AI for All Outdoor Adventures.
