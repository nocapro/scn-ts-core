import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'dist',
  clean: true,
  dts: {
    resolve: true
  },
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  external: ['web-tree-sitter'],
});