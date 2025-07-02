import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    // Enable source maps in production
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'alpine': ['alpinejs'],
        },
      },
    },
  },
  // Allow importing .md files as text
  assetsInclude: ['**/*.md']
}) 