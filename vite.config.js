import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: "**/*.jsx",
  })],
  // Set base path specifically for your GitHub Pages repository
  base: '/onore-ai-sopravvissuti/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure correct entry point and JSX handling
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})