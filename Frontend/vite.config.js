import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
// تأكدي من اسم مكتبة flowbite لو واجهتي مشكلة، الكود ده بناءً على اللي بعتيه
import flowbiteReact from "flowbite-react/plugin/vite"

export default defineConfig({
  // السطر ده هو السر عشان الـ Routing يشتغل صح على Vercel
  base: '/',

  plugins: [
    tailwindcss(),
    react(),
    flowbiteReact()
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: 'all',
  },

  esbuild: {
    // بيمسح الـ console.log عشان الكود يكون احترافي وسريع في الـ Production
    drop: ['console', 'debugger'],
  },

  build: {
    // بيخفي تحذير حجم الملفات الكبيرة
    chunkSizeWarningLimit: 1600,
    // يفضل إضافة ده لضمان إن الـ Assets تطلع في فولدر منظم
    outDir: 'dist',
  }
})