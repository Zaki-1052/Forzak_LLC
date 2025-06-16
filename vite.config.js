import { defineConfig } from 'vite'
import Markdown from 'vite-plugin-md'

export default defineConfig({
  plugins: [
    Markdown({
      // Enable frontmatter
      headEnabled: true,
    }),
  ],
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
}) 