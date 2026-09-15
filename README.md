# Math Solution & Exam Center Mymensingh

A complete coaching center website with student dashboard, online MCQ exams, and admin panel.

## Tech Stack

- **Frontend:** Astro 7 + React 19 + Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **File Storage:** Supabase Storage
- **Hosting:** Vercel / Cloudflare Pages (free tier)

## Quick Start

### 1. Clone and Install

```bash
cd math_academy
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run the schema from `supabase/schema.sql`
4. Go to Settings > API and copy:
   - Project URL
   - Anon/Public Key

### 3. Configure Environment

Create `.env` file:

```env
PUBLIC_SUPABASE_URL=your_project_url_here
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:4321

## Project Structure

```
math_academy/
├── src/
│   ├── layouts/          # Page layouts
│   │   ├── PublicLayout.astro
│   │   ├── StudentLayout.astro
│   │   └── AdminLayout.astro
│   ├── pages/
│   │   ├── index.astro           # Home
│   │   ├── about.astro           # About
│   │   ├── classes.astro         # Classes
│   │   ├── notice.astro          # Notices
│   │   ├── gallery.astro         # Gallery
│   │   ├── admission.astro       # Online Admission
│   │   ├── contact.astro         # Contact
│   │   ├── login.astro           # Student Login
│   │   ├── register.astro        # Student Register
│   │   ├── dashboard/            # Student Dashboard
│   │   │   ├── index.astro
│   │   │   ├── exams.astro
│   │   │   ├── exam/[id].astro   # Take Exam
│   │   │   ├── results.astro
│   │   │   ├── result/[id].astro
│   │   │   ├── routine.astro
│   │   │   ├── materials.astro
│   │   │   └── profile.astro
│   │   └── admin/                # Admin Panel
│   │       ├── index.astro
│   │       ├── students.astro
│   │       ├── admissions.astro
│   │       ├── exams.astro
│   │       ├── results.astro
│   │       ├── routines.astro
│   │       ├── notices.astro
│   │       ├── materials.astro
│   │       ├── gallery/
│   │       └── settings.astro
│   ├── lib/
│   │   └── supabase.ts          # Supabase client
│   ├── types/
│   │   └── database.ts          # TypeScript types
│   └── styles/
│       └── global.css           # Tailwind + Design system
├── supabase/
│   └── schema.sql               # Database schema
└── public/
    └── favicon.svg
```

## Features

### Public Pages
- Home with hero, features, stats
- About with mission, team, map
- Classes (Grades 5-10)
- Notices & Announcements
- Photo Gallery
- Online Admission Form
- Contact with Google Maps

### Student Dashboard
- Personal dashboard with stats
- Class/Exam routine
- Online MCQ exams with timer
- Results with detailed breakdown
- Study materials download
- Profile management

### Admin Panel
- Dashboard with analytics
- Student management
- Admission management
- Exam creation & management
- Question bank management
- Result publishing
- Routine management
- Notice management
- Study material uploads
- Gallery management
- Website settings

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy

### Cloudflare Pages

1. Push to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
3. Connect repository
4. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
5. Add environment variables
6. Deploy

## Database Setup

Run the SQL from `supabase/schema.sql` in Supabase SQL Editor. This creates:
- All required tables
- Row Level Security policies
- Default classes and batches
- Default website settings

## Default Admin Account

After setting up Supabase Auth, create an admin user:
1. Register a new user through the website
2. In Supabase SQL Editor, run:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user_uuid_here';
```

## Cost

| Service | Free Tier | When to Upgrade |
|---------|-----------|-----------------|
| Vercel | $0 | >100GB bandwidth |
| Supabase | $0 | >500MB database |
| **Total** | **$0/month** | **~$20/month** |

## License

MIT
