import {defineConfig} from 'vite';

const fileExtMap = {
  es: '.js',
  umd: '.c.js',
  cjs: '.c.js',
  iife: '.global.js',
};
export default defineConfig({
  resolve: {
    extensions: ['.js'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    lib: {
      entry: 'src/index.js',
      name: 'mock',
      fileName: (format) => `mock${fileExtMap[format]}`,
      formats: ['es', 'umd'],
    },
  },
});