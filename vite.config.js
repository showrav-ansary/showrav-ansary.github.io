import react from '@vitejs/plugin-react'
import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

const publicDir = fileURLToPath(new URL('./public/', import.meta.url))

/**
 * Exposes `virtual:asset-manifest`: a map of every file in `public/` to its
 * size in bytes. The loading screen uses these sizes (instead of the
 * Content-Length header, which is missing or compressed when the host gzips
 * responses) so the progress bar is always byte-accurate.
 */
function assetManifest() {
    const id = 'virtual:asset-manifest'
    const resolvedId = '\0' + id

    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name)
        return entry.isDirectory() ? walk(path) : [path]
    })

    return {
        name: 'asset-manifest',
        resolveId: (source) => (source === id ? resolvedId : null),
        load(loadId) {
            if (loadId !== resolvedId) return null
            const sizes = {}
            for (const file of walk(publicDir)) {
                this.addWatchFile(file)
                sizes[relative(publicDir, file).split(sep).join('/')] = statSync(file).size
            }
            return `export default ${JSON.stringify(sizes)}`
        }
    }
}

export default {
    plugins:
        [
            react(),
            assetManifest()
        ],
    root: 'src/',
    publicDir: "../public/",
    base: './',
    server:
    {
        host: true,
        open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        // The 3D engine (three + react-three) is lazy-loaded behind the
        // loading screen, so a large scene chunk is expected.
        chunkSizeWarningLimit: 1400
    }
}
