import sharp from 'sharp'
import {readdir, stat, unlink} from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'public')

// Files to skip entirely (small 3D assets / handled separately)
const SKIP = new Set([
  'icons/3D/iri-32.png',
  'icons/3D/project-model-matcap.png',
  'icons/SVG/vienna_bigloog-nomrla.png',
  'noises/mask-noise.png',
])

const MAX_W = 1920
const QUALITY = 85

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/')
}

const stats = {processed: 0, savedBytes: 0, skipped: 0}

const files = (await walk(ROOT)).filter(f => /\.(png|jpe?g)$/i.test(f))

for (const file of files) {
  const r = rel(file)
  if (SKIP.has(r)) {
    console.log('skip 3D:', r)
    stats.skipped++
    continue
  }
  const before = (await stat(file)).size
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp')
  const img = sharp(file)
  const meta = await img.metadata()
  const resize = meta.width && meta.width > MAX_W ? {width: MAX_W, withoutEnlargement: true} : null
  let pipeline = img
  if (resize) pipeline = pipeline.resize(resize)
  await pipeline.webp({quality: QUALITY, effort: 6}).toFile(out)
  const after = (await stat(out)).size
  stats.processed++
  stats.savedBytes += before - after
  console.log(
    `${r} -> ${rel(out)}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${(((before - after) / before) * 100).toFixed(0)}%)`,
  )
  // delete original only if webp was written and is smaller
  if (after < before && file !== out) {
    await unlink(file)
  } else if (file !== out) {
    // webp bigger than original — remove webp, keep original
    await unlink(out)
    console.log('  (webp bigger, kept original)')
    stats.savedBytes -= before - after
  }
}

console.log('\n--- summary ---')
console.log('processed:', stats.processed)
console.log('skipped:', stats.skipped)
console.log('saved:', (stats.savedBytes / 1024 / 1024).toFixed(2), 'MB')
