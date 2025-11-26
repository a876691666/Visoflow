import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';
  const inGithubActions = process.env.GITHUB_ACTIONS === 'true';

  return {
    base: isLib ? undefined : inGithubActions ? '/visoflow/' : '/',
    plugins: [vue(), ...(isLib ? [dts({ include: ['src'] })] : [])],
    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
        '@': resolve(__dirname, 'src')
      }
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Visoflow',
            fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              exports: 'named',
              globals: {
                vue: 'Vue'
              }
            }
          }
        }
      : {
          outDir: 'dist',
          assetsDir: 'assets'
        },
    server: {
      port: 3000,
      open: true
    },
    test: {
      environment: 'jsdom'
    }
  };
});
