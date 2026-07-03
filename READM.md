# 🌍 World Explorer v2

> World Explorer es una aplicación de página única (SPA) desarrollada con **Vanilla TypeScript**, **Vite** y **Tailwind CSS**, creada con el objetivo de explorar cómo construir una aplicación frontend moderna sin depender de frameworks de interfaz.

Más allá de consumir una API, este proyecto fue concebido como un ejercicio de ingeniería de software para diseñar una arquitectura modular, escalable y mantenible. Durante su desarrollo se implementaron conceptos como gestión de estado, separación de responsabilidades, transformación de datos, persistencia local, optimización del rendimiento y testing, buscando comprender los fundamentos que suelen abstraer frameworks como React o Vue.

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Vitest-4.x-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest"/>
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="CI"/>
</p>

---

## 📑 Tabla de contenido

- [🚀 Demo y Capturas](#-demo-y-capturas)
- [🎯 Sobre el Proyecto](#-sobre-el-proyecto)
- [✨ Características](#-características)
- [🏗️ Arquitectura](#-arquitectura)
- [🔄 Flujo de Datos](#-flujo-de-datos)
- [🛠️ Stack Técnico](#-stack-técnico)
- [💻 Instalación y Scripts](#-instalación-y-scripts)
- [🧪 Testing](#-testing)
- [⚙️ CI/CD](#-cicd)
- [💡 Decisiones Técnicas](#-decisiones-técnicas)
- [🗺️ Roadmap](#-roadmap)
- [🧠 Lecciones Aprendidas](#-lecciones-aprendidas)
- [👨‍💻 Autor](#-autor)

---

## 🚀 Demo y Capturas

🔗 **[Ver Demo en Vivo](https://joseph160997.github.io/countries--app/)**

<table>
  <tr>
    <td align="center"><strong>🌙 Dark Mode</strong></td>
    <td align="center"><strong>☀️ Light Mode</strong></td>
  </tr>
  <tr>
    <td><img src="./docs/imagenes/dark-mode.jpg" width="400" alt="World Explorer Dark Mode"></td>
    <td><img src="./docs/imagenes/light-mode.jpg" width="400" alt="World Explorer Light Mode"></td>
  </tr>
</table>

---

## 🎯 Sobre el Proyecto

Este proyecto nació como un desafío personal para profundizar en los fundamentos del desarrollo frontend moderno construyendo una aplicación real **sin depender de frameworks de interfaz**.

El objetivo no era simplemente consumir una API REST, sino comprender y poner en práctica conceptos de ingeniería de software que normalmente permanecen ocultos tras herramientas como React, Vue o Angular. A lo largo del desarrollo se buscó aplicar principios como:

- 🧱 **Arquitectura modular** y separación estricta de responsabilidades.
- 📡 **Gestión de estado** mediante el patrón Observer.
- 🔄 **Transformación de datos** (DTOs a modelos de dominio).
- 💾 **Persistencia local** con IndexedDB y LocalStorage.
- ⚡ **Optimización del rendimiento** (caché y renderizado incremental).
- 🛡️ **Desarrollo guiado por tipos** (TypeScript en modo `strict`).

Más que una aplicación para explorar países, **World Explorer** representa un recorrido de aprendizaje orientado a comprender cómo se construyen aplicaciones frontend escalables desde sus cimientos.

---

## ✨ Características

- 🔍 **Búsqueda en tiempo real** con debounce optimizado (350ms).
- 🌎 **Filtrado por región** (África, Américas, Asia, Europa, Oceanía).
- 🔠 **Ordenación** por población descendente o nombre A-Z (persistida entre sesiones).
- ⭐ **Favoritos** guardados en `localStorage`, sin necesidad de backend.
- 📄 **Paginación virtual** — carga 20 países por página, manteniendo todo en RAM.
- 🪟 **Modal de detalle** con navegación entre países fronterizos.
- 🌓 **Modo oscuro / claro** con detección automática de preferencia del sistema.
- 📦 **Caché offline** — estrategia _cache-first_ con IndexedDB (TTL: 24h).
- 💀 **Skeleton loading** — feedback visual durante la carga inicial.
- 📱 **Diseño responsive** — _mobile-first_ con Tailwind CSS v4.

---

## 🏗️ Arquitectura

El proyecto sigue una arquitectura en capas estricta donde cada módulo tiene **una única responsabilidad**. El dato fluye en una sola dirección: de la API hasta el DOM.

```text
REST Countries API
        │
        ▼
  [ Validator ]          ← Valida que el JSON tiene la forma esperada (Type Guards)
        │
        ▼
  [ Mapper ]             ← Transforma RestCountryDTO → Country (modelo de UI)
        │
        ▼
  [ countryService ]     ← Orquesta red, caché e IndexedDB (estrategia cache-first)
        │
        ▼
  [ countryState ]       ← Estado global con patrón Observer + motor de filtros
        │
        ▼
  [ UI / main.ts ]       ← Suscriptores que renderizan el DOM cuando el estado cambia
```

### 📂 Estructura de archivos

```
src/
├── 📁 components/
│ ├── countryCards.ts # Renderiza tarjetas y modal de detalle
│ ├── emptyState.ts # Estado vacío (sin resultados / sin favoritos)
│ ├── layout.ts # Header, main, footer (HTML estático inyectado al inicio)
│ └── skeleton.ts # Grid de tarjetas placeholder durante la carga
│
├── 📁 mappers/
│ └── CountryMapper.ts # DTO → Country. Función pura, sin efectos secundarios
│
├── 📁 services/
│ ├── countryService.ts # Orquestación: red → validación → mapeo → caché
│ ├── favoriteService.ts # CRUD de favoritos sobre localStorage
│ └── themeService.ts # Toggle y persistencia del tema visual
│
├── 📁 state/
│ └── countryState.ts # Estado global, filtros, paginación y Observer
│
├── 📁 types/
│ ├── Country.ts # Modelo de dominio de la UI
│ └── RestCountryDTO.ts # Contrato con la API externa
│
├── 📁 utils/
│ ├── db.ts # Abstracción genérica sobre IndexedDB
│ ├── debounce.ts # Utilidad de antirrebote con cancelación manual
│ ├── http.ts # Cliente HTTP con timeout, validación y abort
│ ├── localStorage.ts # Wrapper tipado sobre localStorage
│ └── toast.ts # Sistema de notificaciones visuales flotantes
│
├── 📁 validators/
│ └── restCountriesValidator.ts # Type Guards para validar la respuesta de la API
│
└── 📄 main.ts # Punto de entrada: inicialización, eventos y arranque
```

---

### 🔄 Flujo de Datos

```
Usuario escribe en el input
        │
        ▼
debounce(350ms)              ← Evita llamadas excesivas al estado
        │
        ▼
setSearchQuery(text)         ← Actualiza el estado privado
        │
        ▼
applyFilters()               ← Recalcula filteredCountries[]
        │
        ▼
notify()                     ← Avisa a todos los listeners suscritos
        │
        ▼
renderUI()                   ← Vuelca el estado al DOM con innerHTML
```
