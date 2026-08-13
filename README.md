# 🌍 Terra · Atlas

Every country on Earth, one atlas.

A modern, interactive atlas of 250+ countries with **live weather**, **Wikipedia summaries**, demographic data and a cinematic day/night experience. Built with strict TypeScript, clean architecture and zero frameworks.

![Terra · Atlas](./docs/imagenes/hero-screenshot.png)

## 📖 Descripción

Más allá de consumir una API, este proyecto fue concebido como un ejercicio de ingeniería de software para diseñar una arquitectura modular, escalable y mantenible.

El resultado es **Terra · Atlas**: un explorador interactivo de países que integra cuatro fuentes de datos en tiempo real (REST Countries, Open-Meteo, Wikipedia y un motor de estado propio), renderizado con un patrón Observer custom y un sistema de slices tipados — sin un solo framework de UI.

Durante el desarrollo se aplicaron conceptos como:

- 🧱 **Clean Architecture** con cuatro capas e inversión de dependencias.
- 📡 **Gestión de estado reactiva** mediante slices inmutables y selectores puros.
- 🔄 **Transformación de datos** con DTOs, validators y mappers por adaptador.
- 💾 **Persistencia local** con IndexedDB (cache-first) y localStorage.
- ⚡ **Optimización del rendimiento**: memoización por fingerprint, paginación virtual, debounce.
- 🛡️ **Desarrollo guiado por tipos**: TypeScript `strict`, `Result<T,E>` para fallos esperados.

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
- [✨ Características](#-características)
- [🏗️ Arquitectura](#-arquitectura)
- [🔄 Flujo de Datos](#-flujo-de-datos)
- [🛠️ Stack Técnico](#-stack-técnico)
- [💻 Instalación y Scripts](#-instalación-y-scripts)
- [🛡️ Guardrails (Git Hooks)](#-guardrails-git-hooks)
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
<td align="center"><strong>🌙 Medianoche</strong></td>
<td align="center"><strong>☀️ Atlas Vivo</strong></td>
</tr>
<tr>
<td><img src="./docs/imagenes/dark-mode.jpg" width="400" alt="Terra · Atlas — Modo Medianoche"></td>
<td><img src="./docs/imagenes/light-mode.jpg" width="400" alt="Terra · Atlas — Modo Atlas Vivo"></td>
</tr>
</table>

---

## ✨ Características

### Exploración

- 🔍 **Búsqueda en tiempo real** con debounce optimizado (350ms).
- 🌎 **Filtrado por región** (África, Américas, Asia, Europa, Oceanía) con badge de color.
- 🔠 **Ordenación** por población, nombre A-Z o área (persistida entre sesiones).
- ⭐ **Favoritos** guardados en `localStorage`, sin necesidad de backend.
- 📄 **Paginación numerada** con elipsis en desktop y ventana compacta en móvil.
- 🎠 **Hero carrusel** con País del Día + destacados curados, efecto Ken Burns y crossfade.

### Detalle y comparación

- 🪟 **Modal de detalle** estilo carnet: bandera en proporción natural, clima en vivo, extracto de Wikipedia, membresías y navegación entre países fronterizos.
- 🌤️ **Clima en vivo** vía Open-Meteo para la capital de cada país (sin API key).
- 📖 **Resumen de Wikipedia** con thumbnail y link directo al artículo.
- ⚖️ **Modo Comparación** — selecciona hasta 3 países y compáralos lado a lado en 14 atributos.

### Navegación avanzada

- 🔗 **Hash routing** (`#/country/:cca3`) — deep links compartibles al modal de cualquier país.
- 🎲 **País aleatorio** — un click y el atlas te sorprende.
- ⌨️ **Command Palette** (`Ctrl+K`) — búsqueda instantánea con navegación por teclado, estilo VS Code / Spotlight.

### Experiencia

- 🌓 **Modo oscuro / claro** con detección automática de preferencia del sistema y anti-FOUC.
- 📦 **Caché offline** — estrategia _cache-first_ con IndexedDB (TTL: 24h) y fallback a caché expirado.
- 💀 **Skeleton loading** — feedback visual durante la carga inicial.
- 📱 **Diseño responsive** — _mobile-first_ con Tailwind CSS v4.

---

## 🏗️ Arquitectura

El proyecto sigue una **Clean Architecture** estricta. Las dependencias apuntan hacia adentro (DIP): el dominio define contratos, la infraestructura los implementa, la presentación los consume.

```
src/
├── main.ts                          # Composition root: cablea capas y arranca
│
├── domain/                          # QUÉ existe — sin frameworks ni efectos
│   ├── country.ts                   #   Entidad Country (23+ campos)
│   ├── errors.ts                    #   Taxonomía AppError
│   ├── weather.ts                   #   WeatherData
│   ├── wiki.ts                      #   WikiSummary
│   └── ports/
│       ├── country.repository.ts    #   Contrato: obtener países
│       ├── keyValue.store.ts        #   Contrato: persistencia clave/valor
│       ├── weather.provider.ts      #   Contrato: clima por coordenadas
│       └── wiki.provider.ts         #   Contrato: resumen de Wikipedia
│
├── shared/                          # Utilidades puras, sin capa
│   ├── result.ts                    #   Result<T,E>: fallos como valores
│   └── debounce.ts
│
├── application/                     # CASOS DE USO — orquestación sin UI
│   └── toggleFavorite.usecase.ts
│
├── infrastructure/                  # CÓMO nos conectamos al mundo
│   ├── http/http.client.ts
│   ├── persistence/
│   │   ├── indexedDb.store.ts
│   │   ├── localStorage.store.ts
│   │   └── favorites.store.ts
│   └── api/
│       ├── restCountries/           #   DTO + validator + mapper + repository
│       ├── openMeteo/               #   DTO + validator + mapper WMO + provider
│       └── wikipedia/               #   DTO + validator + mapper + provider
│
└── presentation/                    # CÓMO se muestra e interactúa
    ├── state/                       #   store.ts (núcleo) + countryState.ts
    ├── slices/                      #   countries, filters, modal, selectors
    ├── controllers/                 #   search, filter, grid, modal, pagination, theme, hero
    ├── renderers/ui.renderer.ts     #   Único punto donde estado toca DOM
    ├── components/                  #   Plantillas: cards, modal, hero, skeletons
    ├── services/                    #   favoriteService, themeService, toast
    └── styles/style.css
```

---

## 🔄 Flujo de datos

```
Acción del usuario (input, click, ESC)
        │
        ▼
  [ Controller ]              ← traduce evento → acción de un slice
        │
        ▼
  [ Slice: setState ]         ← mutación inmutable del estado
        │
        ▼
  [ notify() ]                ← el store avisa si algo cambió de verdad
        │
        ▼
  [ ui.renderer ]             ← deriva y pinta: grid, modal, hero, botones
```

Carga de datos:

```
main.ts → repository.getAll() → Result<Country[], AppError>
  ├─ ok  → countries.slice + applyFilters → render
  └─ err → log + estado vacío visible
```

Modal con datos asíncronos (clima + wiki):

```
openCountryModal(cca3)
  ├─ modal.slice → { selectedCountry, weatherStatus: 'loading' }
  ├─ weatherProvider.getCurrentWeather(lat, lng)
  │     └─ race guard: solo aplica si el país sigue abierto
  └─ wikiProvider.getSummaryFromUrl(url)
        └─ race guard: mismo principio
```

---

## 🧰 Stack técnico

| Categoría     | Tecnología                      | Decisión                              |
| ------------- | ------------------------------- | ------------------------------------- |
| Lenguaje      | TypeScript 5.9 en modo `strict` | Sin `any`, sin excepciones            |
| Bundler       | Vite 7                          | HMR instantáneo, build optimizado     |
| Estilos       | Tailwind CSS v4                 | Utility-first, sin CSS custom         |
| Testing       | Vitest + jsdom                  | Colocación de tests junto al código   |
| Linting       | ESLint + `@typescript-eslint`   | Reglas estrictas de tipos             |
| Formato       | Prettier                        | Consistencia automática               |
| CI/CD         | GitHub Actions                  | Lint → Format → Build → Test → Deploy |
| Caché offline | IndexedDB (nativo)              | Sin librerías externas                |
| Persistencia  | localStorage                    | Favoritos y preferencias              |

---

## ⚙️ Instalación

### Requisitos

- Node.js 18+
- npm 9+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Joseph160997/countries--app.git
cd countries--app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y añadir tu API key de REST Countries v5
```

### Variables de entorno

```bash
VITE_COUNTRIES_API_KEY=your_api_key_here
```

Puedes obtener una API key gratuita en [api.restcountries.com](https://api.restcountries.com).

⚠️ **Nunca** commitees keys reales. Copia `.env.example` a `.env` y rellénalo localmente.

---

## 📜 Scripts disponibles

```bash
npm run dev            # Servidor de desarrollo con HMR
npm run build          # Compilación de producción (tsc + vite build)
npm run preview        # Previsualización del build
npm run verify         # Pipeline local completo: format + lint + test + build
npm run test           # Tests una vez (modo CI)
npm run test:watch     # Tests en modo interactivo
npm run test:ui        # Tests con UI de Vitest
npm run test:coverage  # Tests con reporte de cobertura
npm run lint           # Lint sin fix
npm run lint:fix       # Lint con auto-fix
npm run format         # Formatear todo
npm run format:check   # Verificar formato sin cambiar
```

---

## 🛡️ Guardrails (Git Hooks)

| Hook         | Qué hace                                                     |
| ------------ | ------------------------------------------------------------ |
| `pre-commit` | `lint-staged`: ESLint + Prettier solo sobre archivos staged  |
| `commit-msg` | `commitlint`: rechaza mensajes fuera de Conventional Commits |

Los hooks se instalan solos con `npm install` (script `prepare`).

CI sigue siendo la última barrera: los hooks te protegen a ti, el pipeline protege al equipo.

---

## 🧪 Testing

Tests unitarios para las tres capas con lógica pura: mappers, servicios y estado.

```bash
npm run test          # Todos los tests
npm run test:ui       # Tests con UI interactiva (Vitest UI)
```

### 📊 Cobertura por módulo

| Módulo               | Tests    | Qué se prueba                                                |
| -------------------- | -------- | ------------------------------------------------------------ |
| `CountryMapper`      | 12 tests | Transformación de DTO, fallbacks de capital/bandera/región   |
| `favoriteService`    | 10 tests | CRUD de favoritos, validación de datos corruptos             |
| `countryState`       | 24 tests | Carga, filtros, paginación, modal, favoritos, sort, Observer |
| `openMeteo.mapper`   | 3 tests  | Códigos WMO, iconos día/noche, fallback desconocido          |
| `wikipedia.mapper`   | 5 tests  | Extracción de lang/title, fallback de URL                    |
| `pagination`         | 8 tests  | Ventanas desktop y móvil, elipsis, clamps                    |
| `store`              | 8 tests  | setState, subscribe, unsubscribe, reset                      |
| `explorer.selectors` | 7 tests  | País del día determinista, slides sin duplicados             |

### Filosofía de testing

- **Tests unitarios** sobre funciones puras: los mappers no necesitan red ni DOM.
- **Mocks de dependencias externas**: `localStorage`, `toast` y `countryService` se reemplazan con `vi.mock()`.
- **Patrón AAA** (Arrange / Act / Assert) en todos los tests.
- **Fake repository** en `countryState.test.ts`: implementa el puerto `CountryRepository` directamente, sin `vi.mock()` — más transparente y sin magia de módulos.

---

## 🔁 CI/CD

```
git push
    │
    ▼
GitHub Actions (CI)
    ├── npm run format:check   ← Formato consistente
    ├── npm run lint           ← Sin errores de tipos
    ├── npm run build          ← Compila sin errores
    └── npm run test           ← Todos los tests pasan
              │
              ▼ (solo en main, si CI pasa)
    GitHub Actions (Deploy)
    └── npm run build          ← Build con secrets de producción
              │
              ▼
    GitHub Pages               ← Deploy automático
```

---

## 🧠 Decisiones técnicas

### ¿Por qué sin framework de UI?

React o Vue añaden una capa de abstracción que oculta cómo funciona el DOM. El objetivo era construir desde cero un gestor de estado reactivo, entender el patrón Observer y comprender qué problema resuelven los frameworks, no solo cómo usarlos.

### ¿Por qué la estrategia cache-first?

Los datos de REST Countries cambian raramente. Con IndexedDB como caché de 24 horas, la aplicación carga instantáneamente en visitas repetidas y funciona offline. Si la red falla, se sirve el caché expirado como último recurso.

### ¿Por qué Type Guards en lugar de Zod?

Zod es excelente, pero añade una dependencia externa. Los Type Guards son TypeScript puro y enseñan el mismo concepto de validación en runtime. Para una aplicación de esta escala, la complejidad añadida no se justifica.

### ¿Por qué `innerHTML` en lugar de `appendChild`?

El patrón de renderizado es intencional: cada llamada a `renderUI()` reconstruye el fragmento completo de HTML como string y lo vuelca con `innerHTML`. Es el mismo principio que el Virtual DOM de React, pero sin diferenciación — para este volumen de datos es suficientemente rápido y mucho más sencillo de razonar. La **memoización por fingerprint** evita repintados innecesarios cuando el estado no cambió visualmente.

### ¿Por qué slices en lugar de un solo store?

El estado monolítico (`countryState` como God Object) era difícil de testear y extender. Separar en slices (`countries`, `filters`, `modal`) permite que cada uno tenga su propio ciclo de vida, sus propios tests y que los selectores puros (`computeFilteredCountries`, `buildHeroSlides`) deriven datos sin efectos secundarios.

### ¿Por qué race guards en el modal?

Cuando el usuario abre un país, se disparan fetches asíncronos (clima + wiki). Si cierra el modal o abre otro país antes de que respondan, el resultado llegaría a un estado que ya no corresponde. El guard compara el `cca3` actual del modal con el del fetch antes de aplicar el resultado.

---

## 🧗 Engineering Challenges

Los problemas más difíciles que encontramos durante el desarrollo y cómo los resolvimos. Cada uno representa una lección de arquitectura, CSS o JavaScript que no está en ningún tutorial.

### 1. Modal sin scroll en móvil

**Problema:** El contenido del modal se cortaba en pantallas pequeñas sin posibilidad de hacer scroll.
**Causa raíz:** La columna derecha tenía `md:overflow-y-auto`, lo que significaba que en móvil no tenía scroll. Además, la columna izquierda tenía `shrink-0`, impidiendo que se encogiera y empujando el contenido fuera de la vista.
**Solución:** Quitar el breakpoint `md:` del overflow, añadir `flex-1` a la columna derecha, y cambiar `shrink-0` a `md:shrink-0` para que solo sea rígida en desktop.
**Lección:** Cuando uses flexbox con `overflow`, verifica SIEMPRE el comportamiento sin breakpoints. `md:overflow-y-auto` ≠ `overflow-y-auto` en móvil.

### 2. Parpadeo de banderas al hacer favorito

**Problema:** Al hacer click en ❤️, todas las banderas del grid parpadeaban como si la app se reiniciara.
**Causa raíz:** El fingerprint del grid incluía `isFavorite`. Cambiar un favorito invalidaba el fingerprint → re-render completo → las imágenes con `loading="lazy"` re-disparaban su animación de entrada.
**Solución:** Sacar `isFavorite` del fingerprint y añadir `patchFavoritesOnly()`: compara el set actual de favoritos con el anterior y solo actualiza los botones que cambiaron, sin tocar las cards ni las banderas.
**Lección:** El fingerprint debe incluir solo lo que afecta VISUALMENTE al layout. Los cambios de estado interno (favoritos) pueden parchearse selectivamente sin re-render completo.

### 3. Barra de comparación no mostraba el botón "Compare"

**Problema:** Con 2+ países seleccionados, la barra seguía mostrando "Select at least 2 to compare" en vez del botón de Compare.
**Causa raíz:** El renderer usaba un boolean (`comparisonBarRendered`) que solo trackeaba existencia, no contenido. Cuando `canCompare` cambiaba de `false` a `true`, solo se actualizaba el contador de texto, no el botón.
**Solución:** Reemplazar el boolean por un fingerprint string (`count:canCompare`). Si cualquiera de los dos valores cambia, la barra se re-renderiza completa.
**Lección:** Un flag boolean de "ya rendericé" es insuficiente cuando el contenido puede cambiar sin que el elemento desaparezca. Usa un fingerprint que capture el estado relevante.

### 4. Click en ⚖️ abría el modal del país

**Problema:** Al hacer click en el botón de comparación de una card, se abría el modal del país en vez de solo marcarlo para comparar.
**Causa raíz:** El botón `.btn-compare` está dentro de `.country-card`. El event listener del grid busca `.btn-fav` (early return), pero no `.btn-compare`. El evento burbujaba hasta el handler de `.country-card` y abría el modal.
**Solución:** Añadir un early return para `.btn-compare` en el grid controller, idéntico al que ya existía para `.btn-fav`.
**Lección:** Cuando añades un nuevo elemento interactivo dentro de un contenedor que ya tiene event delegation, SIEMPRE verifica que el evento no burbujee hasta handlers no deseados.

### 5. Race conditions en fetch de clima y Wikipedia

**Problema:** Si el usuario abría un país, cerraba el modal y abría otro antes de que el fetch de clima terminara, el resultado llegaba a un modal que ya no correspondía.
**Causa raíz:** Los fetch de clima y wiki son asíncronos. Si el usuario navega rápido, la respuesta puede llegar cuando el modal ya muestra otro país.
**Solución:** Race guard: antes de aplicar el resultado, verificar que `modalStore.getState().selectedCountry?.cca3` sigue siendo el país que disparó el fetch. Si no, descartar el resultado.
**Lección:** En cualquier fetch disparado por una acción del usuario, SIEMPRE verifica que el estado actual sigue siendo el que originó la petición antes de aplicar el resultado.

### 6. FOUC (Flash of Unstyled Content) en el tema

**Problema:** Al recargar la página, se veía un flash del tema incorrecto antes de que JavaScript aplicara el tema guardado.
**Causa raíz:** El script que aplica el tema estaba en el bundle de Vite, que se carga al final del HTML. Entre el render inicial y la ejecución del JS, el usuario veía el tema default.
**Solución:** Mover la detección del tema a un script inline en el `<head>` del HTML, que se ejecuta síncronamente antes de que el navegador pinte el body.
**Lección:** La lógica que afecta el primer render (tema, idioma, layout) debe ir en el `<head>` como script inline, no en el bundle de JavaScript.

---

## 🛣️ Roadmap

- [x] **Fase 0** — Emergencia: key rotada, FOUC fix, eliminación de regex hacks.
- [x] **Fase 1** — Fundamentos: Clean Architecture, aliases, `Result<T,E>`, Composition Root.
- [x] **Fase 2** — Estado: eliminación del God Object, slices tipados, selectores puros.
- [x] **Fase 3** — Datos: modelo enriquecido, Open-Meteo, Wikipedia.
- [x] **Fase 4** — Visual: branding "Terra · Atlas", temas, hero carrusel, paginación, modal carnet.
- [x] **Fase 5** — Features: hash routing (`#/country/:cca3`), modo comparación (hasta 3), command palette (`Ctrl+K`), botón aleatorio 🎲.
- [ ] **Fase 6** — Calidad: tests e2e con Playwright, MSW para mockear APIs, auditoría de accesibilidad.
- [ ] **Fase 7** — Envío: PWA (Service Worker, instalable), i18n (Español/Inglés).

---

## 💡 Lecciones aprendidas

**El patrón Observer escala sorprendentemente bien** para aplicaciones medianas. La separación entre "quién cambia el estado" y "quién reacciona al cambio" hace el código mucho más fácil de depurar.

**Los Type Guards son más poderosos de lo que parecen.** Una función `isRestCountriesResponse()` bien escrita actúa como contrato entre la API y tu aplicación — si la API cambia su estructura, lo sabrás en runtime, no cuando el usuario vea un crash.

**IndexedDB tiene una API horrible, pero la abstracción lo resuelve.** Envolver las operaciones en Promesas y crear un servicio genérico hizo que el resto de la aplicación olvidara completamente que estaba usando IndexedDB.

**El modo `strict` de TypeScript es incómodo al principio y esencial después.** Fuerza a pensar en cada `undefined` posible, lo que elimina una clase entera de bugs en runtime.

**Los slices no son solo organización — son un contrato.** Cada slice expone un tipo de estado y acciones concretas. El renderer no sabe qué slice cambió: solo recibe el snapshot completo y deriva. Esto hizo trivial añadir el clima y el wiki al modal sin tocar el grid.

**La memoización por fingerprint es un trade-off consciente.** Comparar un string barato antes de hacer `innerHTML` evita reiniciar animaciones de imágenes y parpadeos al abrir el modal. El costo es mantener el fingerprint actualizado cuando cambian los criterios visuales.

---

## 👤 Autor

**Joseph Ortega**

- 🐙 GitHub: [@joseph160997](https://github.com/joseph160997)
- 💼 LinkedIn: [linkedin.com/in/joseph160997](https://linkedin.com/in/joseph160997)
- 🌐 Portfolio: [joseph160997.github.io](https://github.com/Joseph160997)

---

<p align="center">Este proyecto fue construido como una oportunidad para aprender, experimentar y comprender cómo funcionan las aplicaciones frontend modernas desde sus fundamentos.</p>
<p align="center">"Diseñado para comprender cómo funcionan internamente las aplicaciones front-end modernas." Con mucho café ☕</p>

---
