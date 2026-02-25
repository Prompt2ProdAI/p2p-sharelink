import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['marked', 'highlight.js'],
          supabase: ['@supabase/supabase-js'],
          toast: ['react-hot-toast'],
        },
      },
    },
  },
})
