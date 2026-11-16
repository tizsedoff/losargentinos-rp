# Los Argentinos RP · Web oficial

Sitio del servidor de roleplay **Los Argentinos RP** (Buenos Aires).
Sitio estático: HTML, CSS y JavaScript sin build ni dependencias.

## Estructura

```
index.html        Página principal (hero, info, fundación, facciones, liveries, chat bot, staff)
css/styles.css    Estilos, tokens de color en :root y animaciones
js/config.js      Configuración editable (links, staff abierto/cerrado, fundadores, facciones, liveries)
js/main.js        Animaciones: scroll 3D, carrusel, contadores, tilt, formulario
assets/logo.png   Logo del server
```

## Cómo editar

Casi todo se configura desde `js/config.js`:

- `discordUrl`, `tiktokUrl`, `botUrl`: links reales.
- `staffOpen`: `true` abre las postulaciones, `false` las cierra.
- `founders`: nombre, usuario de Discord y URL del avatar.
- `factions`: nombre, descripción y color de cada facción.
- `liveries`: título y nota de cada diseño del carrusel.

Para la cantidad de usuarios y las facciones, el número del contador está en `index.html` (`data-count`).

## Animaciones incluidas

- Hero con logo que rota en 3D al hacer scroll y letras que entran una por una.
- Secciones que aparecen rotando en 3D al entrar en pantalla.
- Tarjetas con tilt 3D y brillo que sigue al mouse (solo en dispositivos con mouse).
- Carrusel de liveries con flechas, puntos, teclado, deslizamiento con el dedo y autoplay.
- Contadores animados y barra de progreso de scroll.
- Botones magnéticos y chat bot con burbujas animadas.

Todo respeta `prefers-reduced-motion`.

## Pendiente

- El formulario de staff valida el ID de Discord en el navegador, pero **no envía datos**.
  Para recibir postulaciones hace falta un backend (Supabase, un webhook de Discord o similar).
- Reemplazar las liveries de ejemplo por imágenes reales en `assets/liveries/`.

## Publicar

Sirve con cualquier hosting estático: GitHub Pages, Vercel o Netlify. No hace falta build.
