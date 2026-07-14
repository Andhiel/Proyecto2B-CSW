# Manual de Instalación

Este documento detalla los pasos necesarios para configurar, instalar y ejecutar el proyecto del Transcriptor de Español a Braille en un entorno de desarrollo local.

## 1. Requisitos del Sistema

Antes de comenzar, asegúrese de tener instaladas las siguientes herramientas en su sistema:

*   **Node.js**: Versión 18.0.0 o superior.
*   **Gestor de Paquetes**: `npm` (incluido con Node.js) o `yarn`.
*   **Git**: Para clonar el repositorio.

## 2. Pasos para la Instalación

Siga estos pasos para ejecutar el proyecto en su máquina local:

### Paso 1: Clonar el Repositorio

Abra una terminal o línea de comandos y clone el repositorio del proyecto:

```bash
git clone <url-del-repositorio>
cd Proyecto2B-CSW
```

### Paso 2: Instalar Dependencias

Instale todas las dependencias necesarias de React, Next.js y Tailwind CSS ejecutando:

```bash
npm install
```
*(Si utiliza yarn, ejecute `yarn install`)*

### Paso 3: Ejecutar el Servidor de Desarrollo

Una vez instaladas las dependencias, inicie el servidor de desarrollo:

```bash
npm run dev
```

El servidor se iniciará y la aplicación estará disponible en `http://localhost:3000`. Abra este enlace en su navegador web.

## 3. Scripts Disponibles

El proyecto incluye los siguientes scripts definidos en el archivo `package.json` para diferentes tareas:

*   `npm run dev`: Inicia la aplicación en modo de desarrollo con recarga en caliente (hot-reloading).
*   `npm run build`: Construye la aplicación optimizada para producción. Los archivos generados se guardan en la carpeta `.next`.
*   `npm run start`: Inicia el servidor de producción utilizando la build previamente generada.
*   `npm run lint`: Ejecuta ESLint para analizar el código en busca de problemas de sintaxis o malas prácticas.
*   `npm run test`: Ejecuta la suite de pruebas unitarias utilizando Jest.
*   `npm run test:watch`: Ejecuta las pruebas unitarias en modo interactivo/observación.

## 4. Estructura del Proyecto (Referencia Rápida)

*   `src/app/`: Contiene el App Router de Next.js y las páginas de la aplicación.
*   `src/components/`: Componentes de interfaz de usuario de React, incluyendo los relacionados a la lógica Braille.
*   `src/lib/`: Lógica de negocio, clases y utilidades para la transcripción Braille.
*   `src/types/`: Definiciones de tipos e interfaces de TypeScript.
*   `src/docs/`: Archivos de documentación (incluyendo este manual).
*   `tests/`: Archivos de configuración y pruebas para Jest.
