# SlateMaker.org - Interactive Site

The open source maker community for the Slate EV pickup truck.

## Getting Started

### Prerequisites
- **Node.js** (LTS version) — download from https://nodejs.org
- **Supabase account** — free at https://supabase.com

### Step 1: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Once the project is ready, go to **SQL Editor** (left sidebar)
3. Click "New Query" and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to create all tables and security policies
5. Go to **Settings → API** and copy your:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - Anon/public key (the long string under "Project API keys")

### Step 2: Configure the Project

1. Copy `.env.example` to `.env`:
   ```
   copy .env.example .env
   ```
2. Open `.env` and paste your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 3: Install Dependencies

Open a terminal/command prompt in this folder and run:
```
npm install
```

### Step 4: Run the Development Server

```
npm start
```

The site will open at http://localhost:3000

## Project Structure

```
slatemaker-site/
├── public/
│   ├── index.html          # HTML template
│   └── SlateMakerLogo.jpg  # Logo (copy this here!)
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.js       # Navigation bar
│   │   ├── Footer.js       # Site footer
│   │   └── DesignCard.js   # Design listing card
│   ├── contexts/
│   │   └── AuthContext.js   # Authentication state management
│   ├── lib/
│   │   └── supabase.js     # Supabase client config
│   ├── pages/
│   │   ├── Home.js         # Homepage
│   │   ├── Designs.js      # Design repository browser
│   │   ├── Upload.js       # Upload a design
│   │   ├── Login.js        # Login page
│   │   ├── SignUp.js       # Registration page
│   │   ├── About.js        # About page
│   │   └── Community.js    # Community links
│   ├── App.js              # Main app with routing
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── supabase-schema.sql     # Database schema (run in Supabase)
└── package.json            # Dependencies
```

## Deployment

To build for production:
```
npm run build
```

This creates a `build/` folder you can deploy to Vercel, Netlify, or Cloudflare Pages.

## Features

- **User Authentication** — Sign up, log in, profiles
- **Design Repository** — Upload, browse, search, and filter designs
- **File Uploads** — Drag & drop STL, STEP, 3MF, and other design files
- **Categories & Tags** — Organized by project type
- **Community Links** — All SlateMaker platforms in one place
- **Responsive** — Works on desktop, tablet, and mobile
- **Dark Theme** — Matches the SlateMaker brand

## Coming Soon

- Design detail pages with comments
- Like/favorite designs
- User profile pages
- STL preview viewer
- Premium design marketplace
- Design request board
