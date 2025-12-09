import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin tracing root to this project to avoid monorepo lockfile auto-detection noise.
  outputFileTracingRoot: path.join(__dirname)
}

export default nextConfig

