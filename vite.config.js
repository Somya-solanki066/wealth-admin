import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-html-headers',
      transformIndexHtml(html) {
        const builtAt = new Date().toISOString()
        return html.replace(
          '</head>',
          `    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta name="build-time" content="${builtAt}" />
  </head>`
        )
      },
    },
  ],
  build: {
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
  },
})
