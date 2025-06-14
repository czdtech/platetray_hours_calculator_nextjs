import { defineConfig } from 'vitest/config';

import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react-datepicker/dist/react-datepicker.css': path.resolve(__dirname, 'tests/__mocks__/styleMock.js'),
    },
  },
  plugins: [
    {
      name: 'ignore-css',
      enforce: 'pre',
      resolveId(id) {
        if (id.endsWith('.css')) return id;
      },
      load(id) {
        if (id.endsWith('.css')) return 'export default {};';
      },
    },
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    globals: true,
    css: false,
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
