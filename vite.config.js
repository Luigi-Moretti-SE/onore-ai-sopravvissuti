import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base path specifically for your GitHub Pages repository
  base: '/onore-ai-sopravvissuti/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure correct entry point
  build: {
    outDir: 'dist',
  },
})