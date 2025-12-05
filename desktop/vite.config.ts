import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'src/renderer',
    base: './',
    build: {
        outDir: '../../dist/renderer',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/renderer'),
            '@core': path.resolve(__dirname, 'src/core'),
            '@vision': path.resolve(__dirname, 'src/vision'),
            '@control': path.resolve(__dirname, 'src/control'),
            '@safety': path.resolve(__dirname, 'src/safety'),
        },
    },
    server: {
        port: 5173,
        strictPort: true,
    },
});
