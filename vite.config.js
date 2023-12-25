import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src',
                import.meta.url))
        }
    },
    server: {
        //   host: "0.0.0.0", //打开显示本地地址
        open: true, // 是否自动启动浏览器
        proxy: {
            // 本地开发环境通过代理实现跨域
            '/api': {
                target: 'http://localhost:8010/', //后端本地地址
                //target: 'http://47.115.226.106:8010/', //后端云端地址
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            }
        }

    },
})