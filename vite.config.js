import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import viteFastifyReact from "@fastify/react/plugin";

const path = fileURLToPath(import.meta.url);

export default defineConfig({
  root: join(dirname(path), "client"),
  plugins: [react(), viteFastifyReact()],
  ssr: {
    external: ["use-sync-external-store"],
  },
  server: {
    hmr: {
      protocol: 'ws',
    },
  },
});
