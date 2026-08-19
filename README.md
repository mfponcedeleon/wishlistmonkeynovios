# Lista de regalos 🎁

Web compartida para apuntar ideas de regalos, con precio, detalles, motivo y agrupación automática por rango de precio. Tres columnas: **Mafer**, **Pau** y **Monkeynovios**.

Guardado en tiempo real con Firebase, así que si tú añades algo desde el móvil, tu novio lo ve al instante en el suyo.

---

## 1. Crear el proyecto en Firebase (gratis, 5 min)

1. Ve a **https://console.firebase.google.com** y entra con tu cuenta de Google.
2. **Crear proyecto** → ponle el nombre que quieras (ej. `lista-regalos`) → puedes desactivar Google Analytics, no hace falta.
3. Dentro del proyecto, en la pantalla principal, pulsa el icono **`</>`** ("Añadir app web").
4. Ponle un apodo (ej. `regalos-web`) y pulsa **Registrar app**. **No** hace falta Firebase Hosting.
5. Firebase te muestra un bloque de código con un objeto `firebaseConfig = { apiKey: ..., authDomain: ..., ... }`. **Cópialo entero.**
6. Abre el archivo `firebase-config.js` de este proyecto y sustituye el objeto `firebaseConfig` de ejemplo por el que acabas de copiar.

## 2. Activar la base de datos (Firestore)

1. En el menú lateral de Firebase, entra en **Compilación → Firestore Database**.
2. Pulsa **Crear base de datos**. Elige la región más cercana (ej. `eur3 - Europa`) y modo **producción**.
3. Ve a la pestaña **Reglas** y sustituye el contenido por esto:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /articulos/{itemId} {
         allow read, write: if true;
       }
     }
   }
   ```

   > ⚠️ Esto deja la lista editable por cualquiera que tenga la URL de tu web (sin login). Es lo más simple para uso entre dos personas y una web que nadie más va a encontrar. Si más adelante quieres cerrarlo con una contraseña, dímelo y lo añadimos.

4. Pulsa **Publicar**.

## 3. Subir el proyecto a GitHub

1. Crea un repositorio nuevo en GitHub (público o privado, ambos funcionan con GitHub Pages si tienes cuenta Pro; si es gratis, que sea **público**).
2. Sube estos 4 archivos a la raíz del repositorio: `index.html`, `style.css`, `app.js`, `firebase-config.js` (ya con tus claves rellenas).
3. Puedes hacerlo arrastrando los archivos directamente en la web de GitHub ("Add file → Upload files") o con git desde terminal:

   ```bash
   git init
   git add .
   git commit -m "Primera versión de la lista de regalos"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

## 4. Activar GitHub Pages

1. En el repositorio, ve a **Settings → Pages**.
2. En "Source", elige la rama `main` y la carpeta `/ (root)`.
3. Guarda. En 1-2 minutos tu web estará en:
   `https://TU_USUARIO.github.io/TU_REPO/`

Guarda ese link en el móvil de ambos (añádelo a pantalla de inicio) y listo.

---

## Cómo funciona la agrupación por precio

No hace falta definir rangos a mano: la web mira el precio más alto que hay en cada columna y elige automáticamente un "paso" (5€, 10€, 20€, 50€, 100€...) para crear entre 3 y 6 tramos razonables. Según vayas añadiendo artículos más caros o más baratos, los tramos se recalculan solos.

## Cómo funciona la imagen

Al crear un artículo, pega en el campo **"Imagen"** el link directo a la foto del producto (en la tienda online, clic derecho sobre la foto → "Copiar dirección de la imagen"). Si lo dejas vacío, la tarjeta muestra un icono de regalo por defecto.

## Renombrar o añadir columnas

Abre `app.js` y edita este bloque al principio del archivo:

```js
const COLUMNS = [
  { id: "mafer", label: "Regalos Mafer" },
  { id: "pau", label: "Regalos Pau" },
  { id: "monkeynovios", label: "Regalos Monkeynovios" },
];
```

Puedes añadir una cuarta columna, cambiar los nombres, etc. — solo asegúrate de que cada `id` sea único y en minúsculas sin espacios.

## Marcar como comprado

Cada tarjeta tiene un círculo de check: pulsa para marcar el artículo como ya comprado. Desaparece de la pestaña "Wishlist" y pasa a la pestaña "Comprados", sin borrarse.

## PIN de acceso

La web pide un PIN de 4 dígitos antes de dejar entrar. Por defecto es `1234`. Para cambiarlo:

1. Abre `index.html`.
2. Busca la línea `const SITE_PIN = "1234";`.
3. Cambia `"1234"` por el PIN que queráis (siempre entre comillas).
4. Sube el archivo actualizado a GitHub otra vez (Add file → Upload files, sobrescribe el anterior).

Cada dispositivo recuerda que ya lo desbloqueasteis (usando la memoria del navegador), así que normalmente solo hay que meter el PIN una vez por dispositivo.

⚠️ Este PIN es solo una cortina para que nadie que caiga en el link por casualidad vea la lista — no es seguridad real. Cualquiera con conocimientos técnicos podría saltárselo mirando el código de la página. Si algún día queréis protección de verdad, se puede montar con Firebase Authentication (inicio de sesión con email).
