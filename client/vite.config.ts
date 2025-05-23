import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // 기존 @client 별칭은 @src/* 와 @src2/* 로 분리되었으므로,
      // tsconfig.json 과 일치하도록 수정하거나 둘 다 추가합니다.
      // 만약 @client를 계속 사용하고 싶다면 tsconfig.json에도 추가해야 합니다.
      // 여기서는 tsconfig.json에 정의된 별칭들을 기준으로 설정합니다.

      {
        find: '@src', // tsconfig.json의 "@src/*"에 해당
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: '@src2', // tsconfig.json의 "@src2/*"에 해당
        replacement: path.resolve(__dirname, './src2'),
      },
      {
        find: '@shared', // tsconfig.json의 "@shared/*"에 해당 (추가한 경우)
        replacement: path.resolve(__dirname, '../shared/src'),
      },
      // 만약 기존의 "@client" 별칭을 유지하고 싶다면 (그리고 tsconfig.json에도 있다면)
      // {
      //   find: '@client',
      //   replacement: path.resolve(__dirname, './src'), // 또는 ./src 와 ./src2 둘 다 커버하도록 설정
      // },
      // 기존 @server 별칭은 tsconfig.json에는 없지만, Vite에서만 사용한다면 유지 가능
      // 하지만 일관성을 위해 tsconfig.json에도 정의하는 것이 좋음
      {
        find: '@server',
        replacement: path.resolve(__dirname, '../server/src'),
      },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/signin': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/signout': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/manage': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/r2': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    }
  }
})
