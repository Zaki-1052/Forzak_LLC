import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  build: {
    // Enable source maps in production
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about.html',
        contact: './contact.html',
        services: './services.html',
        investments: './investments.html',
        solutions: './investment-solutions.html'
      },
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