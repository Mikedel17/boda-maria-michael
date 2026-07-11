# Invitación de Boda — Maria & Michael · 26.09.2026

Invitación web interactiva. Paleta tomada del diseño original de Navine Studio
(oliva `#434a31` / marrón `#5b473a` / salvia `#afb892` / crema `#f7f3ec`).

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura y contenido (textos, cuentas, links de Maps) |
| `styles.css` | Diseño general (paleta, tipografías, secciones, galería, marquee) |
| `envelope.css` | Sobre de apertura animado + botón de música |
| `app.js` | Interactividad + **configuración** (bloque al inicio del archivo) |
| `apps-script.gs` | Código para Google Sheets (RSVP) con instrucciones de instalación |
| `fotos/` | Fotos de la galería |
| `musica/` | Canción de fondo |

## Dónde pegar las fotos

Guarda las fotos en la carpeta `fotos/` con estos nombres exactos:

- `foto-1.jpg` — la principal (formato vertical, se muestra grande)
- `foto-2.jpg`, `foto-3.jpg`, `foto-4.jpg` — el resto del collage

La galería se arma sola (collage editorial asimétrico). Si falta alguna foto,
su espacio se oculta; si no hay ninguna, la sección desaparece completa.

## Música

Consigue el archivo MP3 de **Yebba's Heartbreak** y guárdalo como:

```
musica/yebbas-heartbreak.mp3
```

- Empieza a sonar al abrir el sobre (gesto del usuario = autoplay permitido).
- Botón flotante con ecualizador animado para pausar/reanudar.
- Si el archivo no existe, el botón no aparece y todo sigue funcionando.

## Sobre de apertura

Primera pantalla: sobre cerrado con sello de cera "M·M". Al tocar el sello:
1. El sello se desvanece
2. La solapa se abre en 3D
3. La carta con los nombres sale del sobre
4. Todo se desliza y revela la invitación (y arranca la música)

## RSVP → Google Sheets

El formulario guarda: nombre, asistencia, acompañante (+1), alergias y canción.

**Para activarlo** (5 min): sigue las instrucciones dentro de `apps-script.gs`
y pega la URL del Web App en `app.js` → `APPS_SCRIPT_URL`.

Mientras no esté configurado (o si el endpoint falla), las confirmaciones
llegan por WhatsApp al 999 889 033 — no se pierde ninguna.

## Configuración pendiente (bloque CONFIGURACIÓN de `app.js`)

1. `APPS_SCRIPT_URL` — URL del Web App de Apps Script (RSVP a Sheets)

## Publicar en GitHub Pages

```bash
cd boda-maria-michael
git init && git add . && git commit -m "feat: invitacion de boda"
gh repo create boda-maria-michael --public --source=. --push
gh api repos/{owner}/boda-maria-michael/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

URL final: `https://<usuario>.github.io/boda-maria-michael/`

## Probar localmente

```bash
python -m http.server 8765 --directory .
# → http://localhost:8765
```
