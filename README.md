Lista de regalos 🎁

Web compartida para apuntar ideas de regalos, con precio, detalles, motivo y agrupación automática por rango de precio. Tres columnas: Mafer, Pau y Monkeynovios.

Guardado en tiempo real con Firebase, así que si tú añades algo desde el móvil, tu novio lo ve al instante en el suyo.

1. Crear el proyecto en Firebase (gratis, 5 min)
Ve a https://console.firebase.google.com y entra con tu cuenta de Google.
Crear proyecto → ponle el nombre que quieras (ej. lista-regalos) → puedes desactivar Google Analytics, no hace falta.
Dentro del proyecto, en la pantalla principal, pulsa el icono </> ("Añadir app web").
Ponle un apodo (ej. regalos-web) y pulsa Registrar app. No hace falta Firebase Hosting.
Firebase te muestra un bloque de código con un objeto firebaseConfig = { apiKey: ..., authDomain: ..., ... }. Cópialo entero.
Abre el archivo firebase-config.js de este proyecto y sustituye el objeto firebaseConfig de ejemplo por el que acabas de copiar.
2. Activar la base de datos (Firestore)
En el menú lateral de Firebase, entra en Compilación → Firestore Database.
Pulsa Crear base de datos. Elige la región más cercana (ej. eur3 - Europa) y modo producción.
Ve a la pestaña Reglas y sustituye el contenido por esto:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /articulos/{itemId} {
         allow read, write: if true;
       }
     }
   }

⚠️ Esto deja la lista editable por cualquiera que tenga la URL de tu web (sin login). Es lo más simple para uso entre dos personas y una web que nadie más va a encontrar. Si más adelante quieres cerrarlo con una contraseña, dímelo y lo añadimos.

Pulsa Publicar.
3. Subir el proyecto a GitHub
Crea un repositorio nuevo en GitHub (público o privado, ambos funcionan con GitHub Pages si tienes cuenta Pro; si es gratis, que sea público).
Sube estos 4 archivos a la raíz del repositorio: index.html, style.css, app.js, firebase-config.js (ya con tus claves rellenas).
Puedes hacerlo arrastrando los archivos directamente en la web de GitHub ("Add file → Upload files") o con git desde terminal:
bash
   git init
   git add .
   git commit -m "Primera versión de la lista de regalos"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
4. Activar GitHub Pages
En el repositorio, ve a Settings → Pages.
En "Source", elige la rama main y la carpeta / (root).
Guarda. En 1-2 minutos tu web estará en: https://TU_USUARIO.github.io/TU_REPO/

Guarda ese link en el móvil de ambos (añádelo a pantalla de inicio) y listo.

Cómo funciona la agrupación por precio

No hace falta definir rangos a mano: la web mira el precio más alto que hay en cada columna y elige automáticamente un "paso" (5€, 10€, 20€, 50€, 100€...) para crear entre 3 y 6 tramos razonables. Según vayas añadiendo artículos más caros o más baratos, los tramos se recalculan solos.

Cómo funciona la imagen

Al crear un artículo, pega en el campo "Imagen" el link directo a la foto del producto (en la tienda online, clic derecho sobre la foto → "Copiar dirección de la imagen"). Si lo dejas vacío, la tarjeta muestra un icono de regalo por defecto.

Renombrar o añadir columnas

Abre app.js y edita este bloque al principio del archivo:

js
const COLUMNS = [
  { id: "mafer", label: "Regalos Mafer" },
  { id: "pau", label: "Regalos Pau" },
  { id: "monkeynovios", label: "Regalos Monkeynovios" },
];

Puedes añadir una cuarta columna, cambiar los nombres, etc. — solo asegúrate de que cada id sea único y en minúsculas sin espacios.

Marcar como comprado

Cada tarjeta tiene un círculo abajo a la derecha: pulsa para marcar el artículo como ya comprado (se queda tachado y algo más apagado, pero sigue en la lista para que no se os olvide quién lo compró).
