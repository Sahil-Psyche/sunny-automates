import { defineConfig } from 'astro/config';

export default defineConfig({
  trailingSlash: 'never',
  compressHTML: true,
  devToolbar: {
    enabled: false,
  },
});
