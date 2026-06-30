import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';
import viteCssStyles from '../../../scripts/vite-css-styles.mjs';

export default defineConfig({
  plugins: [
    viteCssStyles(),
    solidPlugin({
      solid: {
        generate: 'universal',
        moduleName: 'avalonia-jsx'
      }
    })
  ],
  resolve: {
    alias: {
      'avalonia-jsx': path.resolve(__dirname, '../../../avalonia-jsx/src/index.ts')
    },
    dedupe: ['solid-js']
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.js',
      formats: ['iife'],
      name: 'AvaloniaBridge',
      fileName: () => 'bridge.bundle.js'
    },
    rollupOptions: {
      external: []
    }
  }
});
