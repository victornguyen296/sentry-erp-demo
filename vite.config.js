import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Đổi '/sentry-erp-demo/' thành đúng tên repo GitHub của anh
  base: '/sentry-erp-demo/',
})
