# Markdown Share App - Setup Guide

## Prerequisites
- Node.js installed
- A Supabase account (free)

## 1. Setup Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in the sidebar and run this query to create the table:
   ```sql
   create table documents (
     id uuid default gen_random_uuid() primary key,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     content text,
     expires_at timestamp with time zone
   );
   ```
3. Go to **Project Settings** -> **API**.
4. Copy the `Project URL` and `anon` public key.

## 2. Setup Local Project
1. Create a `.env` file in the root of the project (next to `package.json`).
2. Add your Supabase keys:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_KEY=your_anon_key_here
   ```

## 3. Install & Run
Run these commands in your VS Code terminal:

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open the link shown (usually `http://localhost:5173`).

## Features
- **Write**: Type markdown on the left, see it on the right.
- **Code**: Use \`\`\`js blocks for syntax highlighting.
- **Share**: Click "Share (48h)" to get a link.
- **View**: Open the link to see the static content.
- **Expiry**: Links stop working after 48 hours.
- **Dark Mode**: Automatically respects your system's dark mode setting.

## Dependencies Used
- **React + Vite**: Fast frontend.
- **Tailwind CSS**: Styling.
- **Marked**: Markdown parsing.
- **Highlight.js**: Code syntax highlighting.
- **Supabase**: Backend database.
