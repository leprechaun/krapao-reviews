# Krapao Reviews — Product Spec

A pad kra pao restaurant review site for Bangkok. Reviewers score restaurants across six culinary dimensions specific to the dish. Deployed as a static SPA to S3 + CloudFront.

---

## Stack

- **Vite + React + TypeScript** — SPA, client-side only
- **react-router-dom** — client-side routing (CloudFront must redirect 404 → index.html)
- **react-i18next** — Thai / English, translations loaded from `/public/locales/{en,th}/translation.json`
- **Tailwind CSS v4 + shadcn/ui** (base-nova style, built on Base UI — no Radix `asChild`)
- **react-leaflet + OSM** — map display
- **Google Places API (New, REST)** — restaurant search when adding new entries
- `VITE_GOOGLE_PLACES_API_KEY` env var required; Places API (New) must be enabled

---

## Routing

| Path | Page |
|------|------|
| `/` | Home — hero, map, featured restaurant cards |
| `/restaurants` | Full list with search |
| `/restaurants/:id` | Restaurant detail — score breakdown + reviews |
| `/restaurants/:id/review` | Submit a review |

---

## Data models

### Restaurant
```
id, name, nameTh, address, addressTh, district, districtTh,
lat, lng, krapaoScore: KrapaoScore, reviewCount
```

### KrapaoScore (restaurant aggregate, all required)
```
overall, aromatic, wok, heat, purity, protein, egg  — all 0–10
overall = mean of the six dimensions
```

### Review
```
id, restaurantId, authorName, comment, visitedAt,
scores: ReviewScores        — partial; any dimension may be absent
purityOffenders?            — only present if purity was rated impure
heatRating?                 — only present if heat was rated
```

### ReviewScores
Partial record of dimension scores (0–10 each) plus optional `overall`. Any field may be absent — the reviewer chose not to rate it.

### HeatRating
```
specified: boolean          — did the reviewer request a spice level when ordering?
match?: 1 | 2 | 3 | 4 | 5  — absent until specified is answered
```

---

## The six review dimensions

| Key | English label | Thai formal | Thai casual |
|-----|--------------|-------------|-------------|
| `aromatic` | Aromatic Authenticity | ความถูกต้องและกลิ่นหอมของใบกะเพรา | กลิ่นกะเพราถึงใจไหม |
| `wok` | Wok Execution | เทคนิคการผัดและความแห้งของเนื้อสัตว์ | ผัดแห้ง คั่วหอมไหม |
| `heat` | Heat Architecture | ความสมดุลของพริกและกระเทียม | พริกกระเทียมถึงเครื่องไหม |
| `purity` | Recipe Purity | ความบริสุทธิ์ของวัตถุดิบ | กะเพราแท้ ไม่ใส่ถั่วฝักยาว |
| `protein` | Protein Geometry | เนื้อสัมผัสจากการสับด้วยมือ | เนื้อสับมือ ไม่ใช่หมูบดเครื่อง |
| `egg` | Kai Dao Execution | การทอดไข่ดาวให้ขอบกรอบไข่แดงเยิ้ม | ไข่ดาวกรอบนอกไข่แดงเป็นลาวา |

**Wok hei callout:** when `wok ≥ 9`, display the phrase *ผัดมีกลิ่นกระทะดีมาก* ("fantastic aroma of the pan") on the score card.

---

## Review form behaviour

**No defaults.** Every field starts empty/null. Submitting with partial data is allowed — absent dimensions are simply omitted from the stored review.

### Sliders (aromatic, wok, protein, egg)
- Range 0–10, step 0.5
- Start faded/inactive; activate and show the numeric value on first touch
- Display `—` until touched

### Heat (two-part)
1. **Did you specify a spice level?** — binary yes / no; must be answered first
2. **How did it land?** — 1–5 buttons, locked until step 1 is answered
   - 1 Much milder than expected
   - 2 Slightly mild
   - 3 Spot on *(target)*
   - 4 Slightly hotter than expected
   - 5 Way hotter than expected
- Changing the yes/no answer resets the 1–5 selection
- For the restaurant aggregate, match scores map to 0–10: `3→10, 2/4→7, 1/5→3`

### Purity (binary + offender list)
- **Pure / Has fillers** — neither pre-selected
- Selecting "Has fillers" expands a checklist of common offenders:
  long beans, onions, carrots, bell peppers, bamboo shoots
- Selecting "Pure" collapses the list and clears any checked offenders
- Stored as `purityOffenders: []` (pure) or `purityOffenders: ['longBeans', ...]`

### Overall
- Auto-calculated as the mean of whichever dimensions have been rated
- Displayed live as the reviewer fills in the form
- Shows `—` until at least one dimension is rated

---

## Home page map

- OSM tiles via react-leaflet, centred on Bangkok
- Markers for all loaded restaurants; clicking opens a popup with name, score, and a link to the detail page
- **Add a restaurant** button opens a dialog:
  1. Google Places Autocomplete (REST, filtered to restaurants/food near Bangkok)
  2. Selecting a suggestion fetches place details in both English and Thai
  3. Preview card shows name, Thai name, address, coordinates
  4. Confirming creates the restaurant in local state and adds a marker immediately

---

## API layer

All API calls live in `src/api/`. Currently backed by in-memory mock data. Migration path: replace function bodies with `fetch()` calls — no call-site changes required.

| Function | Notes |
|----------|-------|
| `searchRestaurants(params)` | filters by query string and/or minScore |
| `getRestaurant(id)` | |
| `getFeaturedRestaurants()` | first 3 in store |
| `createRestaurant(data)` | appends to in-memory store; → `POST /restaurants` later |
| `getReviewsForRestaurant(id)` | |
| `submitReview(review)` | → `POST /reviews` later |
| `autocompletePlaces(input)` | Google Places REST |
| `getPlaceDetails(placeId)` | fetches EN + TH name/address in parallel |

---

## i18n

- Language switcher in the navbar (EN / TH)
- All static UI strings are translated
- Each review dimension has: formal label, casual Thai phrase, English translation of the casual phrase
- Thai casual phrases are shown as secondary labels throughout (form, score display, review cards)
