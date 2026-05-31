# Collab — Influencer Marketplace (Prototype)

A clickable prototype of a two-sided influencer marketing platform. It shows
**what an influencer sees** (open campaigns/jobs) and **what a business owner sees**
(a marketplace of influencers across every platform, with pricing, offer packages,
and ratings/reviews from other businesses).

## How to run

No install needed — it's a static site.

- **Easiest:** double-click `index.html` to open it in your browser.
- **Or** right-click `index.html` in Cursor and choose *Open with Live Server* (if installed).

> Requires an internet connection the first time, since Tailwind and the font load from a CDN.

## What's in the prototype

### Landing page
- Pick a role: **I'm an Influencer** or **I'm a Business Owner**.
- Switch roles any time from the header.

### Influencer view — "Open campaigns"
- Browse brand campaigns with budget range, required platforms, deliverables, minimum followers, deadline, and location.
- Filter by category (Beauty, Tech, Travel, Fitness, Fashion, …).
- "Apply now" is stubbed with a prototype alert.

### Business view — "Find influencers"
- Grid of influencer cards showing platforms, follower counts, categories, starting price, and rating.
- Filter by platform (Instagram, TikTok, YouTube, X, Twitch) and sort by rating / reach / price.
- Click any influencer to open a detail panel with:
  - **Audience** stats per platform (followers + engagement).
  - **Offers & pricing** — IG Story, IG Reel, IG Post, TikTok Video, YouTube Short, YouTube integration/dedicated, X post, Twitch shoutout — each with a price and delivery time.
  - **Reviews from businesses** — read existing reviews and **write a new one** (rating + text). The average rating updates live.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, header/footer, Tailwind + font setup |
| `app.js` | Routing, all views, filtering/sorting, the review feature |
| `data.js` | Mock data: platforms, offer types, influencers, jobs, reviews |

## Notes & next steps

- All data is mock and in-memory — reviews you add reset on refresh.
- To make it real you'd swap `data.js` for API calls and add auth, payments/escrow, messaging, and an application/booking flow (currently stubbed with alerts).
- Images use [pravatar.cc](https://pravatar.cc) placeholder avatars.
