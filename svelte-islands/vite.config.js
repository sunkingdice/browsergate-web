import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        'logo-carousel': resolve(__dirname, 'src/logo-carousel-entry.js'),
        'extensions-table': resolve(__dirname, 'src/extensions-table-entry.js'),
        'signup-form': resolve(__dirname, 'src/signup-form-entry.js'),
        'contact-form': resolve(__dirname, 'src/contact-form-entry.js'),
      },
      output: {
        dir: '../static/js/islands',
        entryFileNames: '[name].js',
        format: 'es',
      },
    },
  },
});
