import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: 'inherit',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
            h1: { marginBottom: "1.5rem", fontWeight: '800' },
            h2: { marginTop: "2.5rem", marginBottom: "1.25rem", fontWeight: '700' },
            h3: { marginTop: "2rem", marginBottom: "1rem" },
            p: { marginTop: "1.25rem", marginBottom: "1.25rem", lineHeight: '1.75' },
            table: { 
              marginTop: "2.5rem", 
              marginBottom: "2.5rem",
              width: '100%',
              borderCollapse: 'collapse',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            },
            thead: {
              backgroundColor: "#f9fafb",
              borderBottomWidth: '1px',
            },
            'thead th': {
              padding: "0.875rem 1rem",
              fontWeight: '600',
              textAlign: 'left',
              color: '#111827',
            },
            'tbody td': {
              padding: "0.875rem 1rem",
              borderBottomWidth: '1px',
              borderColor: '#f3f4f6',
            },
            '.dark thead': {
               backgroundColor: '#1f2937',
            },
            '.dark thead th': {
               color: '#f9fafb',
            },
            '.dark tbody td': {
               borderColor: '#374151',
            }
          },
        },
      },
    },
  },
  plugins: [typography],
}