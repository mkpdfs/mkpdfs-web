import { MetadataRoute } from 'next'

// Served at /manifest.webmanifest (the dot keeps it out of the next-intl
// middleware matcher). Icons reference the static public/logo.png brand mark.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'mkpdfs - PDF Generation API',
    short_name: 'mkpdfs',
    description:
      'Generate beautiful PDFs at scale. Upload Handlebars templates, call our API, and get professional PDFs instantly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08080A',
    theme_color: '#08080A',
    icons: [
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
