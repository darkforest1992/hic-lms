import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Hoặc plugin tương ứng
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <- Nếu dòng này gây lỗi
  ],
})
