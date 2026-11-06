# Puños de Tuerca

Juego de peleas de robots de bloques (three.js, sin compilación). El usuario es mecánico, sabe poco
de programación y lo trabaja mucho desde el celular. Hablar en español rioplatense (vos), simple.

## Dónde vive

- **Se juega en https://tuercapp.com.ar/pelea/**, dentro de la biblioteca Tuercapp
  (proyecto `C:\Users\djlue\tuercapp-sitio` en la compu, Firebase Hosting).
- La dirección vieja (GitHub Pages, `djluengo55.github.io/Pu-os-de-tuerca/`) sigue prendida solo para
  mandar a la nueva: `juego.js`, apenas arranca, redirige y se lleva el avance guardado en el link
  (`#traer=...`). No sacar ese código mientras alguien pueda tener el juego viejo instalado.
- Todas las rutas a archivos tienen que ser **relativas** (`juego.js`, no `/juego.js`): el juego vive en una carpeta.
- Guardado en localStorage con la clave `punos-de-tuerca-v1` (comparte dominio con las otras apps de Tuercapp).

## Publicar

Subir los cambios a `main` en GitHub NO los publica en tuercapp.com.ar. Desde la compu:
`npm run publicar` (baja lo último de GitHub, copia los archivos a `tuercapp-sitio/public/pelea/`
y publica la biblioteca). El usuario lo corre con `! cd /c/Users/djlue/punos-de-tuerca && npm run publicar`.
Si se agrega un archivo nuevo al juego, sumarlo a `ARCHIVOS` en `scripts/publicar.mjs` y a `FILES` en `sw.js`.
