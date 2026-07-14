# Documentación del Ambiente de Desarrollo

#### **Asignatura:** Construcción y Evolución de Software

#### **Proyecto:** Sistema Transcriptor de Texto a Braille

#### **Versión:** Segunda versión del programa

#### **Ubicación del documento:** Carpeta `Dumentacion/`

---

## 1. Introducción

Este documento describe el ambiente de desarrollo de la segunda versión del proyecto `ces_proyecto_braille`, un sistema web para la transcripción de texto español a Braille y la conversión inversa desde Braille a español. La aplicación mantiene una arquitectura frontend basada en Next.js y amplía la primera versión con soporte para Unicode Braille, teclado virtual, exportación de resultados y una capa de visualización más completa.

La finalidad de esta documentación es servir como referencia técnica para configurar el entorno, conocer las herramientas utilizadas, entender la estructura del repositorio y seguir el flujo de trabajo del equipo.

## 2. Ecosistema de Desarrollo

### 2.1 Lenguaje y plataforma

- **Lenguaje principal**: TypeScript 5.4
- **Plataforma de ejecución**: Node.js 18.17 o superior
- **Framework web**: Next.js 14 con App Router
- **Librería de interfaz**: React 18.3
- **Sistema de estilos**: Tailwind CSS 3.4

### 2.2 Herramientas de construcción y ejecución

- **Gestor de paquetes**: npm
- **Servidor de desarrollo**: Next.js (`npm run dev`)
- **Compilación de producción**: Next.js (`npm run build`)
- **Ejecución en producción**: Next.js (`npm run start`)
- **Linter**: ESLint (`npm run lint`)
- **Suite de pruebas**: Jest (`npm test`)

### 2.3 Dependencias principales

#### Producción

- `next` — framework principal de la aplicación.
- `react` — biblioteca base de componentes.
- `react-dom` — renderizado de React en el DOM.
- `jspdf` — generación de exportaciones PDF.
- `lucide-react` — biblioteca de íconos.
- `@radix-ui/react-slot` — composición accesible de componentes.
- `class-variance-authority` — definición de variantes visuales.
- `clsx` — combinación condicional de clases CSS.
- `tailwind-merge` — fusión inteligente de clases Tailwind.
- `tailwindcss-animate` — utilidades de animación para Tailwind.

#### Desarrollo

- `typescript` — verificación estática del código.
- `eslint` — análisis de estilo y calidad.
- `eslint-config-next` — reglas recomendadas para Next.js.
- `jest` — pruebas unitarias y de integración ligera.
- `babel-jest` — soporte de transformación para Jest.
- `@testing-library/react` — pruebas de componentes React.
- `@testing-library/jest-dom` — aserciones extendidas para DOM.
- `@types/node` — tipos para Node.js.
- `@types/react` — tipos para React.
- `@types/react-dom` — tipos para React DOM.
- `@types/jest` — tipos para Jest.
- `autoprefixer` — compatibilidad CSS cruzada.
- `postcss` — procesamiento de hojas de estilo.

### 2.4 Configuración de TypeScript

Archivos clave:

- `tsconfig.json`
- `next-env.d.ts`

Configuración relevante:

- `strict: true` — comprobación estricta de tipos.
- `noEmit: true` — no generar salida en la verificación de tipos.
- `moduleResolution: bundler` — resolución compatible con bundlers modernos.
- `jsx: preserve` — preserva JSX para Next.js.
- `baseUrl: .` — base de resolución en el raíz del proyecto.

Alias configurados:

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/utils/*` → `./src/utils/*`

### 2.5 Configuración de pruebas

Jest está configurado con `next/jest` y utiliza `jest-environment-jsdom` para pruebas de componentes.

Archivos relevantes:

- `jest.config.js`
- `jest.setup.js`
- `tests/braille-transcriber.test.ts`

## 3. Requisitos del Entorno

### 3.1 Requisitos mínimos

- **Sistema operativo**: Windows, macOS o Linux
- **Node.js**: 18.17 o superior, recomendado 20.x LTS
- **npm**: 9 o superior
- **Git**: instalado y configurado
- **Editor recomendado**: Visual Studio Code

### 3.2 Verificación rápida

Antes de trabajar en el proyecto, confirma la versión de las herramientas:

```bash
node --version
npm --version
git --version
```

## 4. Configuración del Proyecto

### 4.1 Dependencias instaladas

Las dependencias del proyecto están definidas en `package.json`.

### 4.2 Archivos de configuración principales

- `next.config.js`
- `postcss.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `jest.config.js`
- `jest.setup.js`

### 4.3 Entorno de ejecución esperado

- El proyecto se ejecuta como una aplicación frontend de Next.js.
- No requiere un backend propio para funcionar.
- El procesamiento de Braille ocurre en el navegador.
- La carpeta `.next/` se genera automáticamente durante desarrollo o compilación y no debe editarse manualmente.

## 5. Estructura del Proyecto

El proyecto utiliza la convención del App Router de Next.js y una arquitectura basada en carpetas para separar responsabilidades.

### 5.1 Carpetas principales dentro de `src/`

- `src/app/`
	- `layout.tsx` — layout global de la aplicación.
	- `page.tsx` — página principal del transcriptor.
	- `globals.css` — estilos globales.
- `src/components/`
	- `Header.tsx` — cabecera y navegación.
	- `Hero.tsx` — sección principal de bienvenida.
	- `Features.tsx` — bloque de características.
	- `Footer.tsx` — pie de página.
	- `braille/` — componentes específicos del dominio Braille.
	- `ui/` — componentes de interfaz reutilizables.
- `src/lib/`
	- `braille-mapper.ts` — mapeo de caracteres españoles a Braille.
	- `braille-transcriber.ts` — transcripción de español a Braille.
	- `braille-to-spanish-transcriber.ts` — transcripción inversa de Braille a español.
	- `unicode-braille-converter.ts` — conversión entre Unicode Braille y puntos.
- `src/types/`
	- Definiciones de tipos y contratos de Braille.
- `src/utils/`
	- Utilidades generales, como `cn` para concatenación de clases.

### 5.2 Archivos relevantes fuera de `src/`

- `tests/` — pruebas automatizadas del motor de transcripción.
- `Dumentacion/` — documentación técnica, de ambiente y otros artefactos del proyecto.

## 6. Componentes y responsabilidades técnicas

### 6.1 Dominio Braille

- `src/lib/braille-mapper.ts` — mapeo de caracteres a símbolos Braille.
- `src/lib/braille-transcriber.ts` — motor de transcripción español -> Braille.
- `src/lib/braille-to-spanish-transcriber.ts` — motor de transcripción Braille -> español.
- `src/lib/unicode-braille-converter.ts` — conversión Unicode Braille <-> puntos.
- `src/types/braille.ts` — modelos, contratos y estadísticas del dominio.

### 6.2 Entrada y visualización

- `src/components/braille/TextInput.tsx` — entrada de texto, validación y carga de archivos.
- `src/components/braille/BrailleDisplay.tsx` — visualización de resultados, modos de vista y exportación.
- `src/components/braille/BrailleSymbol.tsx` — renderizado individual de un cuadratín Braille.
- `src/components/braille/BrailleVirtualKeyboard.tsx` — teclado Braille virtual para construir celdas manualmente.

### 6.3 Componentes de UI general

- `src/components/Header.tsx` — navegación y barra superior.
- `src/components/Footer.tsx` — contacto, enlaces y pie legal.
- `src/components/Hero.tsx` — presentación inicial del sitio.
- `src/components/Features.tsx` — listado visual de características.
- `src/components/ui/Button.tsx` — botón reutilizable con variantes.

## 7. Comandos de uso

### 7.1 Instalación

```bash
npm install
```

### 7.2 Desarrollo

```bash
npm run dev
```

La aplicación se ejecuta por defecto en:

```bash
http://localhost:3000
```

### 7.3 Construcción y ejecución

```bash
npm run build
npm run start
```

### 7.4 Pruebas

```bash
npm test
npm run test:watch
```

### 7.5 Lint

```bash
npm run lint
```

## 8. Flujo de trabajo del equipo

### 8.1 Estrategia de ramificación

El equipo trabaja con ramas separadas para estabilizar la integración y evitar conflictos entre módulos.

- `main`:
	- contiene la versión estable del proyecto.
- `develop`:
	- rama de integración continua.
- `documentacion`:
	- rama dedicada a documentación y artefactos de apoyo.
- `feature/*`:
	- ramas específicas por funcionalidad o responsable.

### 8.2 Reparto de trabajo observado en la primera versión

- **Marlon Chimarro** — interfaz principal.
- **Kevin Palacios** — motor de transcripción Braille.
- **Martin Davalos** — entrada de texto.
- **Carlos Troya** — visualización Braille.
- **Antony Cobos** — navegación y componentes UI.

Para la segunda versión, este esquema sigue siendo útil como referencia de organización, aunque el proyecto ya integra nuevas capacidades como conversión inversa, teclado virtual y exportación.

### 8.3 Reglas de integración recomendadas

- Trabajar siempre desde `develop`.
- Crear ramas `feature/*` para cambios acotados.
- Usar commits descriptivos y semánticos.
- Validar con `npm run lint` y `npm test` antes de integrar cambios.

## 9. Observaciones del entorno actual

- La carpeta de documentación usada por el proyecto es `Dumentacion/`.
- El código fuente está organizado bajo `src/` con estructura compatible con Next.js App Router.
- La solución actual está orientada a accesibilidad, transcripción Braille y presentación visual responsiva.
- El repositorio incluye una carpeta `.next/` generada por compilaciones previas; no debe editarse manualmente.

## 10. Recomendaciones para desarrollo

- Mantener Node.js en una versión LTS para evitar diferencias entre máquinas.
- Ejecutar pruebas antes de cada entrega para validar la lógica de transcripción y la conversión inversa.
- Mantener el uso de alias de TypeScript para evitar rutas relativas largas.
- No modificar manualmente los archivos generados por Next.js.
- Documentar cualquier cambio en mapeos Braille, exportación o entrada virtual en la carpeta de documentación.

## 11. Resumen

El entorno del proyecto está basado en **Next.js + React + TypeScript + Tailwind CSS**, con pruebas en **Jest** y una estructura preparada para desarrollo modular. En esta segunda versión se incorporan también conversión Braille -> español, soporte Unicode Braille, teclado virtual y exportaciones, por lo que la documentación de ambiente sirve como guía para instalar, ejecutar y mantener una solución más completa que la versión inicial.