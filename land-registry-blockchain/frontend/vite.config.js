import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Replace the string below with your ACTUAL raw Pinata JWT
    // Make sure it is wrapped in double quotes inside the single quotes!
    'import.meta.env.VITE_PINATA_JWT': '"eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."' 
  }
})
