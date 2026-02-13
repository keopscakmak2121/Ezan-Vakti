@"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './'
})
"@ | Out-File -FilePath "C:\Projects\Ezan-Vakti\vite.config.js" -Encoding UTF8