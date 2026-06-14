# World Explorer - Explorador Mundial

**World Explorer** es una aplicación web construida con Vanilla TypeScript, Vite y Tailwind CSS para explorar países de todo el mundo.

## Descripción

Esta app no usa React ni librerías de UI externas. Está diseñada como una SPA ligera que:

- consume la API de países,
- renderiza la interfaz mediante DOM dinámico,
- aplica filtros en tiempo real,
- permite marcar países como favoritos,
- persiste favoritos en LocalStorage,
- usa IndexedDB como caché de respaldo para soporte offline.

## Características reales

- Búsqueda de países por nombre con debounce para mejorar el rendimiento.
- Filtro de región con select desplegable.
- Guardado de favoritos y contador dinámico.
- Vista de estado vacío cuando no hay resultados o favoritos.
- Persistencia de favoritos en `localStorage`.
- Estrategia de red `Network First` con fallback a `IndexedDB`.
- Maquetación responsive usando Tailwind CSS.
- Motor de estado propio basado en el patrón observador.

## Tecnologías y dependencias

- **Vite** como bundler y entorno de desarrollo.
- **TypeScript** para tipado estricto.
- **Tailwind CSS** para estilos utilitarios.
- **IndexedDB** para caché local de datos.
- **LocalStorage** para persistencia de favoritos.

## Requisitos

- Node.js 18+ recomendado.
- `npm` o `pnpm`.

## Instalación

```bash
npm install
```

## Variables de entorno

La aplicación requiere una URL base para la API de países. Define el archivo `.env` o agrega esta variable a tu entorno:

```env
VITE_API_COUNTRIES_BASE_URL=https://restcountries.com/v3.1/all
```

> Ajusta el valor según el endpoint real de la API que uses.

## Scripts disponibles

- `npm run dev` - iniciar el servidor de desarrollo.
- `npm run build` - compilar el proyecto para producción.
- `npm run preview` - previsualizar la versión build.

## Estructura principal del proyecto

- `src/main.ts` - punto de entrada de la app y orquestador de eventos.
- `src/components/layout.ts` - genera el layout principal y el HTML del DOM.
- `src/components/countryCards.ts` - renderiza las tarjetas de país.
- `src/components/EmptyState.ts` - renderiza el estado vacío.
- `src/state/countryState.ts` - gestor de estado y filtros.
- `src/services/countryService.ts` - obtiene datos de la API y cachea en IndexedDB.
- `src/services/favoriteService.ts` - maneja favoritos y LocalStorage.
- `src/utils/http.ts` - cliente HTTP con timeout y validación.
- `src/utils/localStorage.ts` - capa de abstracción para `localStorage`.
- `src/utils/db.ts` - implementación de IndexedDB.
- `src/utils/debouce.ts` - función de debounce.
- `src/types/Country.ts` - tipos y contratos de datos.

## Cómo usar

1. Ejecuta `npm run dev`.
2. Abre el navegador en `http://localhost:5173`.
3. Busca países por nombre.
4. Filtra por región.
5. Marca y desmarca favoritos.
6. Explora la lista y observa el contador de favoritos.

## Notas adicionales

- El botón `theme-toggle` está presente en la UI, pero su lógica aún no está implementada en el código actual.
- La app está pensada como un proyecto limpio de frontend sin frameworks de UI.

## Licencia

Proyecto privado. Ajusta esta sección según tus necesidades.
