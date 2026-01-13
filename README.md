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

## 🖼️ Image assets

All destination imagery is referenced via absolute `/images/...` paths and should be stored locally in `public/images`.

### Required state hero images

Place one hero image per state at:

```
public/images/<state>/hero.jpg
```

Required state folders:

* `public/images/california/hero.jpg`
* `public/images/arizona/hero.jpg`
* `public/images/nevada/hero.jpg`
* `public/images/utah/hero.jpg`
* `public/images/oregon/hero.jpg`
* `public/images/washington/hero.jpg`

### Required city hero image sets

Each city requires three images named `<city>-1.jpg`, `<city>-2.jpg`, and `<city>-3.jpg` inside its state folder:

**California**
* `public/images/california/san-diego-{1,2,3}.jpg`
* `public/images/california/lake-tahoe-{1,2,3}.jpg`
* `public/images/california/joshua-tree-{1,2,3}.jpg`
* `public/images/california/san-francisco-{1,2,3}.jpg`
* `public/images/california/los-angeles-{1,2,3}.jpg`
* `public/images/california/palm-springs-{1,2,3}.jpg`
* `public/images/california/yosemite-{1,2,3}.jpg`
* `public/images/california/big-sur-{1,2,3}.jpg`
* `public/images/california/mammoth-lakes-1.jpg` (used by the location hero)

**Arizona**
* `public/images/arizona/sedona-{1,2,3}.jpg`
* `public/images/arizona/flagstaff-{1,2,3}.jpg`
* `public/images/arizona/tucson-{1,2,3}.jpg`

**Nevada**
* `public/images/nevada/reno-{1,2,3}.jpg`
* `public/images/nevada/las-vegas-{1,2,3}.jpg`
* `public/images/nevada/baker-{1,2,3}.jpg`

**Utah**
* `public/images/utah/moab-{1,2,3}.jpg`
* `public/images/utah/springdale-{1,2,3}.jpg`
* `public/images/utah/park-city-{1,2,3}.jpg`

**Oregon**
* `public/images/oregon/portland-{1,2,3}.jpg`
* `public/images/oregon/bend-{1,2,3}.jpg`
* `public/images/oregon/cannon-beach-{1,2,3}.jpg`

**Washington**
* `public/images/washington/olympic-peninsula-{1,2,3}.jpg`
* `public/images/washington/leavenworth-{1,2,3}.jpg`
* `public/images/washington/seattle-{1,2,3}.jpg`

### Placeholder

If an image fails to load, the UI swaps to `/images/placeholder.jpg`, so add that file in `public/images/placeholder.jpg` when providing assets.

## 📝 How to Add Content

The entire site is driven by `client/src/lib/data.ts`. To add new destinations, you simply add to the `destinations` array.

### Adding a New State

1.  Open `client/src/lib/data.ts`.
2.  Add a new object to the `destinations` array:

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
