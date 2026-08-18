# Soulful Yoga App — Build Brief for Claude Code

Paste this whole file into Claude Code (or reference it with `@soulful-yoga-app-spec.md`) as the starting brief. Build it in the phased order below rather than all at once.

## Project overview

A React Native app (Expo) for Soulful Yoga, a yoga studio in Berghem, NL. Students use it to view the weekly class schedule, book a spot, browse on-demand videos, and manage their strippenkaart (class-pack) balance.

Reference design: `soulful-yoga-app-prototype.html` (in this same folder) — an HTML clickable prototype. Match its layout, colors, type, and the scalloped-arch motif exactly; translate it into React Native components rather than starting the design from scratch.

## Tech stack

- **Framework:** Expo (React Native) — enables cloud builds for iOS without needing a Mac
- **Navigation:** Expo Router or React Navigation, bottom tab bar (Rooster / Video's / Profiel)
- **Backend:** Supabase (Postgres database, auth, storage)
- **Payments:** Mollie (iDEAL support for Dutch customers) — integrated as a direct payment, not an in-app purchase
- **Video hosting:** Mux or Bunny Stream (not YouTube embeds)
- **Fonts:** Fraunces (display/headings), Work Sans (body) — both on Google Fonts, load via `expo-font` or `@expo-google-fonts`

## Design tokens (from the prototype)

```
ivory (background):     #FBF5EA
ink (primary/nav/text):  #2E1F45
marigold (accent):       #E8A33D
rani pink (accent):      #C23B6E
teal (accent):           #1C6B5E
sand (borders/lines):    #E3D5BE
```

Signature element: scalloped arch border (repeating semicircle pattern) beneath each screen header — recreate as a small repeating SVG or background pattern component, reused across all three tabs.

## Data model (Supabase tables)

- `classes` — id, name (Yin Yoga / Flow Yoga / Gentle Yoga), day_of_week, start_time, end_time, capacity
- `bookings` — id, user_id, class_id, class_date, status (booked/cancelled/checked_in), created_at
- `users` — id, name, email, strip_balance (int), role (student/admin), created_at
- `videos` — id, title, style (yin/flow/gentle), duration_minutes, level, video_url, thumbnail_url
- `purchases` — id, user_id, type (single_class / strip_10), amount, mollie_payment_id, created_at

`role` on `users` distinguishes the teacher's account from students. The teacher signs in with her own normal account — no separate admin app or password system. Row-level security in Supabase should only allow writes to another user's `strip_balance` or a booking's `status` when the requesting user has `role = 'admin'`.

## Screens (build in this order)

### 1. Schedule tab (build first — core value)
- Real weekly schedule, grouped by day:
  - Monday: Yin Yoga 19:00–20:00, Yin Yoga 20:15–21:15
  - Tuesday: Yin Yoga 19:00–20:00
  - Wednesday: Flow Yoga 09:00–10:00
  - Thursday: Yin Yoga 19:00–20:00, Yin Yoga 20:15–21:15
  - Friday: Gentle Yoga 09:00–10:00, Yin Yoga 10:15–11:15
- Tap a class → bottom sheet modal with class description + "Boek deze les" button
- Booking deducts one strip from balance (or charges €15 if balance is 0) and writes a row to `bookings`

### 2. Profile tab
- Strippenkaart balance card (X / 10 remaining)
- Pricing list: gratis proefles, €15 losse les, €110 10-strippenkaart
- "Koop strippenkaart" button → Mollie checkout → on success, increments `strip_balance` by 10
- Studio contact info (address, phone, email)

### 3. Videos tab
- Filter chips: Alles / Yin / Flow / Gentle
- Video cards → tap opens a video player screen (use `expo-av` or a Mux player component)
- Gate playback behind login (registered users only)

### 4. Auth (build alongside profile)
- Supabase email/password or magic link sign-in
- Simple onboarding: name + email on first launch

### 5. Docentmodus (admin mode) — build after the student-facing app works
Reachable via a plain text link ("🔒 Docentmodus") at the bottom of the Profile screen — not a separate tab, so it stays out of students' way. Only visible/functional when the logged-in user's `role` is `admin`.

**Screen A — Vandaag (today's classes)**
- List of today's classes only, each showing a booked/capacity pill (e.g. "9 / 10"), colored red-ish when full
- Tap a class to open its roster

**Screen B — Roster (per class)**
- List of everyone booked into that specific class instance
- Each row: name, remaining strip count, a big checkmark button, and small +/– buttons next to the strip count
- Tapping the checkmark checks the student in **and automatically deducts one strip** — this is the core action the teacher does live, once per student, during class. Tapping again undoes it and refunds the strip (for mistakes)
- The +/– buttons let the teacher manually correct a student's strip balance (e.g. she sold a paper strippenkaart in person, or made an error) — this writes directly to `strip_balance` on the `users` table
- A capacity stepper (+ / –) at the top of the roster screen edits that class's max spots directly

**Design priorities for this mode specifically:**
- Big tap targets, minimal text, nothing that requires reading — the teacher is using this one-handed, between poses, not sitting at a desk
- No confirmation dialogs on check-in/strip taps — every action should be instantly visible and instantly undoable (tap again), rather than "are you sure?" popups
- No settings, filters, or configuration in this mode — just today's classes and rosters

## What to explicitly skip for v1

- Push notifications (add after first working version)
- Waitlists for full classes
- Admin/instructor dashboard (manage that data directly in Supabase's table editor for now)
- Social/community features

## Suggested first prompt to Claude Code

```
Set up a new Expo (TypeScript) project called soulful-yoga-app using Expo Router.
Read soulful-yoga-app-spec.md and soulful-yoga-app-prototype.html in this folder for
the full design and feature spec. Start by building the bottom tab navigation
(Rooster / Video's / Profiel) and the Schedule screen with static mock data
matching the real class schedule — no Supabase yet, just get the UI and
navigation working and matching the prototype's look.
```

Once that's working and looks right, the natural next prompts are: "now connect this to a real Supabase backend," then "now add the booking modal and write bookings to the database," and so on — one working slice at a time rather than everything at once.
