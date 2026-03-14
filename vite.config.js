import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.GITHUB_PAGES === 'true'
    ? process.env.GITHUB_PAGES_BASE_PATH || '/'
    : './',
})
