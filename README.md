# Lunch Lovers GDL 🥗📦

Plataforma web moderna y responsiva para **Lunch Lovers GDL**, un servicio premium de viandas y planes de alimentación semanales o mensuales. La aplicación cuenta con un portal interactivo para clientes, un panel de administración para la gestión de platos y pedidos, y un asistente virtual de nutrición potenciado por Inteligencia Artificial (Gemini API).

---

## 🚀 Características Principales

- **Landing Page Atractiva y Fluida:** Presentación de la marca con animaciones dinámicas ([Framer Motion](https://www.framer.com/motion/)), catálogo de platos interactivo, tabla de precios de planes y sección de preguntas frecuentes/contacto.
- **Portal de Cliente (Dashboard):** Área privada donde los usuarios autenticados pueden visualizar su plan activo y seleccionar sus comidas semanales personalizadas.
- **Panel de Administración (Admin Dashboard):** Panel protegido exclusivamente para administradores que permite crear, editar y eliminar platos del catálogo, además de supervisar los pedidos y perfiles de usuario.
- **Asistente Nutricional con IA:** Chat interactivo flotante impulsado por el SDK oficial de Google Gemini (`@google/genai`) para resolver dudas de nutrición, ingredientes y recomendar platos del menú.
- **Autenticación y Base de Datos en Tiempo Real:** Integración robusta con **Firebase Authentication** y **Cloud Firestore** para el manejo seguro de usuarios, roles (admin/cliente) y datos.
- **Pasarela de Pago (Simulada/Callback):** Soporte de flujos de redirección y callback integrados para Mercado Pago (actualización automática del plan del usuario al procesar exitosamente el pago).
- **Acceso Directo a Soporte:** Botón flotante interactivo de contacto directo con WhatsApp.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - React 19 (con Hooks, Context API y Suspense para carga perezosa)
  - Vite (Entorno de compilación ultra rápido)
  - Tailwind CSS (Estilos CSS modernos y responsivos)
  - Framer Motion (Transiciones y micro-animaciones fluidas)
  - Lucide React (Biblioteca de iconos vectoriales de alta calidad)
- **Backend & Serverless (Firebase):**
  - Firebase Authentication (Registro e inicio de sesión de usuarios)
  - Cloud Firestore (Base de datos NoSQL documental para menús, platos y usuarios)
  - Cloud Functions (Funciones en Node.js, ej. eliminación segura de cuentas desde el backend)
- **Inteligencia Artificial:**
  - Google Gemini API (Modelo Gemini 1.5/2.0 a través del SDK `@google/genai`)

---

## 📦 Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### 1. Requisitos Previos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada) y Git.

### 2. Clonar el Repositorio
```bash
git clone https://github.com/mizaamx/LunchLovers.git
cd LunchLovers
```

### 3. Instalar Dependencias
Instala los paquetes necesarios definidos en `package.json` en la raíz del proyecto y en la carpeta de funciones (si vas a usar Cloud Functions):
```bash
# Frontend
npm install

# Cloud Functions (Opcional si vas a correrlas localmente)
cd functions
npm install
cd ..
```

### 4. Configurar Variables de Entorno y Firebase
El archivo de configuración de Firebase se encuentra en [config.js](file:///c:/Users/misss/OneDrive/Escritorio/LOL/src/firebase/config.js).
Para tu asistente de IA (Gemini), asegúrate de contar con una API Key válida provista por Google AI Studio.

### 5. Iniciar el Servidor de Desarrollo
Para arrancar la aplicación localmente en modo desarrollo con Vite:
```bash
npm run dev
```
La aplicación estará disponible en la dirección local que indique la terminal (por defecto, `http://localhost:5173`).

---

## 🏗️ Comandos de Compilación y Calidad

- **Iniciar en desarrollo:** `npm run dev`
- **Compilar para producción:** `npm run build` (genera los archivos optimizados listos para desplegar en la carpeta `/dist`)
- **Previsualizar la build de producción:** `npm run preview`
- **Analizar el código (Linter):** `npm run lint`

---

## 📂 Estructura del Proyecto

```text
├── .agents/              # Configuraciones de agentes y herramientas
├── functions/            # Cloud Functions de Firebase (Node.js)
├── public/               # Recursos estáticos (imágenes de platos, iconos, etc.)
├── src/
│   ├── assets/           # Imágenes y logos locales
│   ├── components/       # Componentes de React (Hero, Catalog, AdminDashboard, etc.)
│   ├── context/          # Contextos globales (Autenticación y Selección de Comidas)
│   ├── firebase/         # Archivos de configuración de Firebase
│   ├── App.jsx           # Componente principal y enrutador
│   ├── index.css         # Estilos globales y temas
│   └── main.jsx          # Punto de entrada de la aplicación
├── eslint.config.js      # Reglas de buenas prácticas de ESLint
├── firebase.json         # Configuración del CLI de Firebase (Hosting, Firestore, etc.)
├── package.json          # Dependencias y scripts del proyecto
└── tailwind.config.js    # Personalización de temas y colores en Tailwind
```
