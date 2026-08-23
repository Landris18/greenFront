import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [{ find: /^src(.+)/, replacement: `${process.cwd()}/src$1` }],
    },
    server: {
        port: 5173,
        host: true,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
                    charts: ['apexcharts', 'react-apexcharts'],
                    query: ['@tanstack/react-query', 'axios'],
                    router: ['react-router-dom'],
                },
            },
        },
    },
});
