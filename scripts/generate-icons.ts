// Generates all PWA icon sizes from public/apple-touch-icon.svg.
// Run with: bun run scripts/generate-icons.ts
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join } from 'path'

const publicDir = join(import.meta.dir, '..', 'public')
const masterSvg = readFileSync(join(publicDir, 'apple-touch-icon.svg'))

// Maskable icons get cropped to a circle/squircle by the OS, so the artwork
// must sit inside the central 80% safe zone — render the logo smaller on a
// solid background.
const maskableSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#141414"/>
  <g transform="translate(76,76) scale(2)">
    <polyline points="28,132 68,88 108,102 152,48" stroke="#e07070" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="28" cy="132" r="9" fill="#e07070"/>
    <circle cx="68" cy="88" r="7" fill="#e07070" opacity="0.7"/>
    <circle cx="108" cy="102" r="7" fill="#e07070" opacity="0.7"/>
    <circle cx="152" cy="48" r="9" fill="#e07070"/>
  </g>
</svg>`)

const jobs: Array<[Buffer, number, string]> = [
  [masterSvg, 64, 'pwa-64x64.png'],
  [masterSvg, 192, 'pwa-192x192.png'],
  [masterSvg, 512, 'pwa-512x512.png'],
  [masterSvg, 180, 'apple-touch-icon.png'],
  [masterSvg, 48, 'favicon.png'],
  [maskableSvg, 512, 'maskable-icon-512x512.png'],
]

for (const [src, size, name] of jobs) {
  await sharp(src, { density: 300 }).resize(size, size).png().toFile(join(publicDir, name))
  console.log(`generated ${name}`)
}
