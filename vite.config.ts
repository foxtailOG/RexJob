import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { webcrypto } from 'node:crypto' // <-- use node:crypto

// Ensure Web Crypto API is available for tools that call crypto.getRandomValues()
if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto as any;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
