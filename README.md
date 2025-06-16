# Forzak LLC Landing Page

A modern, responsive landing page for Forzak LLC built with HTML5, Tailwind CSS, and Alpine.js.

## Tech Stack

- **Build Tool**: Vite 5.1.4
- **CSS Framework**: Tailwind CSS 3.4.1
- **JavaScript**: Alpine.js 3.13.5
- **Content**: Markdown with frontmatter
- **Deployment**: Netlify (static hosting)

## Prerequisites

- Node.js 18+ 
- npm 9+

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd forzak
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
forzak/
├─ public/              # Static assets
│  ├─ assets/
│  │   ├─ img/         # Images
│  │   └─ icons/       # SVG icons
│  └─ favicon.svg
├─ src/
│  ├─ components/      # Reusable HTML components
│  ├─ content/         # Markdown content files
│  ├─ styles/          # CSS and Tailwind config
│  └─ main.js          # Entry point
├─ tailwind.config.js  # Tailwind configuration
└─ vite.config.js      # Vite configuration
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Content Management

Content is managed through Markdown files in the `src/content` directory. Each section (About, Services, etc.) has its own Markdown file with frontmatter for metadata.

## Deployment

The site is configured for deployment on Netlify. The build process is handled automatically through the `vite build` command.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The site is optimized for performance with:
- Lazy loading of images
- Critical CSS inlining
- Code splitting
- Asset optimization

## Accessibility

The site follows WCAG 2.2 AA guidelines with:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader support

## License

UNLICENSED - All rights reserved 