import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

const dev = true

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    root: "./src/client/",
    build: {
        outDir: "../../out/",
        target: "chrome118"
    },
    base: "./"
})