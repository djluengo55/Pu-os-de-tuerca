// Publica el juego en tuercapp.com.ar/pelea/, dentro de la biblioteca Tuercapp
// (proyecto C:\Users\djlue\tuercapp-sitio), y publica la biblioteca entera (Firebase Hosting).
// Se corre con: npm run publicar
//
// El juego no se compila: se copian los archivos tal cual. Antes baja de GitHub lo último
// que se haya hecho desde el celular.
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const JUEGO = fileURLToPath(new URL('..', import.meta.url))
const SITIO = fileURLToPath(new URL('../../tuercapp-sitio', import.meta.url))
const DESTINO = `${SITIO}/public/pelea`

// Los archivos del juego (lo demás del repo, como README o scripts, no se publica)
const ARCHIVOS = [
  'index.html', 'estilo.css', 'juego.js', 'three.module.min.js', 'sw.js', 'manifest.webmanifest',
  'icono.svg', 'icono-192.png', 'icono-512.png', 'icono-mask.png', 'apple-touch-icon.png',
]

const correr = (comando, carpeta) => execSync(comando, { cwd: carpeta, stdio: 'inherit' })

if (!existsSync(`${SITIO}/package.json`)) {
  console.error(`\nNo encuentro la biblioteca Tuercapp en ${SITIO}\n`)
  process.exit(1)
}

console.log('Bajando la última versión del juego de GitHub...')
try {
  correr('git pull --ff-only', JUEGO)
} catch {
  console.error('\nNo se pudo bajar la última versión (¿sin internet o cambios sin guardar?). No publico nada.\n')
  process.exit(1)
}

const faltan = ARCHIVOS.filter((a) => !existsSync(`${JUEGO}/${a}`))
if (faltan.length) {
  console.error(`\nFaltan archivos del juego: ${faltan.join(', ')}\n`)
  process.exit(1)
}

console.log('Copiando el juego a tuercapp.com.ar/pelea/ ...')
rmSync(DESTINO, { recursive: true, force: true })
mkdirSync(DESTINO, { recursive: true })
for (const a of ARCHIVOS) cpSync(`${JUEGO}/${a}`, `${DESTINO}/${a}`)

correr('npm run publicar', SITIO)
