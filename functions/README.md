# Guía de Configuración y Despliegue de Cloud Functions - Lunch Lovers GDL

Este subdirectorio contiene la Cloud Function `notificarNuevoPedido`, la cual detecta la creación de nuevos pedidos en Firestore y envía notificaciones por correo electrónico al administrador.

---

## 1. Configuración de Variables de Entorno (.env)

Las Cloud Functions de Firebase v2 cargan automáticamente variables de entorno desde un archivo `.env` ubicado en la carpeta `functions`.

Crea un archivo llamado `.env` en este directorio (`functions/`) y añade los detalles de tu transporte de correo SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo_remitente@gmail.com
SMTP_PASS=tu_clave_de_aplicacion_smtp
ADMIN_EMAIL=admin@lunchlovers.com
```

> **Nota para Gmail**: Si usas una cuenta de Gmail como remitente (`SMTP_USER`), debes activar la autenticación de dos factores en tu cuenta de Google y generar una **"Contraseña de aplicación"** para usarla en `SMTP_PASS`, ya que Gmail bloquea inicios de sesión convencionales por seguridad.

---

## 2. Instalación de Dependencias

Antes de correr localmente o desplegar, instala las dependencias de la función:

1. Abre tu terminal de comandos.
2. Navega a la carpeta de funciones:
   ```bash
   cd C:\Users\misss\OneDrive\Escritorio\LOL\functions
   ```
3. Ejecuta la instalación:
   ```bash
   npm install
   ```

---

## 3. Pruebas Locales con el Simulador (Emulator Suite)

Puedes probar la función localmente en tu máquina sin consumir recursos de tu cuenta de Firebase usando el emulador:

```bash
npm run serve
```

Esto levantará los emuladores locales de Firestore y Cloud Functions. Podrás ingresar al panel de emuladores y crear un documento en la colección `/orders` para verificar si la función se dispara y envía el correo con éxito.

---

## 4. Despliegue a Producción en Firebase

Para subir la Cloud Function a los servidores de Firebase en Google Cloud:

1. Inicia sesión en Firebase CLI desde tu consola (si no lo has hecho):
   ```bash
   firebase login
   ```
2. Asegúrate de estar en el directorio raíz del proyecto:
   ```bash
   cd C:\Users\misss\OneDrive\Escritorio\LOL
   ```
3. Ejecuta el comando de despliegue exclusivo para funciones:
   ```bash
   firebase deploy --only functions
   ```

Una vez que la CLI de Firebase termine el despliegue de forma exitosa, la función estará activa y lista para monitorizar la base de datos en producción.
