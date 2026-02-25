# Markdown Share App

A Vite + React markdown sharing app backed by Supabase.

## Prerequisites
- Node.js 18+
- A Supabase project

## Local Setup
1. Create a `.env` file in the project root.
2. Add your Supabase keys:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_KEY=your_anon_key_here
```

3. Install and run:

```bash
npm install
npm run dev
```

## Cloudflare Pages Deployment
This project is configured for Cloudflare Pages.

### 1. Connect the repo in Cloudflare Pages
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

### 2. Add environment variables in Pages
Set these for Production (and Preview if needed):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`

### 3. SPA routing fallback
The file `public/_redirects` is included so routes like `/view/:id` resolve to `index.html`.

### 4. Optional CLI deploy
`wrangler.toml` is included with `pages_build_output_dir = "dist"` for `wrangler pages deploy` workflows.

## Notes
- Links are stored in Supabase with expiry metadata.
- The frontend uses `BrowserRouter`, so the `_redirects` file is required on static hosting.
