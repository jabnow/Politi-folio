import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: '.', // frontend folder is the root
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // allows import like "@/components/Component"
    },
  },
  server: {
    port: 5173, // explicit port
    open: true, // automatically open browser
    proxy: {
      '/api': {
        target: 'http://localhost:3002', // backend
        changeOrigin: true,
        secure: false,
        // #region agent log
        configure: (proxy) => {
          proxy.on('error', (err, req, _res) => {
            const code = err && 'code' in err ? (err as NodeJS.ErrnoException).code : undefined;
            fetch('http://127.0.0.1:7243/ingest/5e445279-e792-413c-a50a-7a0966f6f54c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:proxy',message:'proxy error',data:{path:req?.url,target:'http://localhost:3002',code,message:err?.message},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            fetch('http://127.0.0.1:7243/ingest/5e445279-e792-413c-a50a-7a0966f6f54c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:proxy',message:'proxy request',data:{path:req?.url,target:'http://localhost:3002'},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
          });
        },
        // #endregion
      },
    },
  },
  build: {
    outDir: 'dist', // build output folder
  },
});
