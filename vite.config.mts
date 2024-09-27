import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({command, mode}) => {
  const env = loadEnv(mode, process.cwd(), '')
    return {
    assetsInclude: ['CHANGELOG.md'],
    build: {
      sourcemap: true
    },
    plugins: [
      basicSsl({
        /** name of certification */
        name: 'dev',
        /** custom trust domains */
        domains: [env.DEV_SSL_DOMAIN],
      })
    ]
  }
})