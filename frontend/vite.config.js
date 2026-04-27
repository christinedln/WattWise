import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        user: fileURLToPath(new URL('./index.html', import.meta.url)),
        superadmin: fileURLToPath(new URL('./superadmin.html', import.meta.url)),
      },
    },
  },
})
