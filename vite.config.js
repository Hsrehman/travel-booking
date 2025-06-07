import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
    },
    envPrefix: 'VITE_',
    server: {
      hmr: true,
      watch: {
        usePolling: true
      }
    },
    build: {
      sourcemap: true
    }
  }
})
