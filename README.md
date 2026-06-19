# World Explorer - Explorador Mundial

**World Explorer** es una aplicación web moderna construida con Vanilla TypeScript, Vite y Tailwind CSS para descubrir países del mundo.

## Descripción

Esta app es una SPA ligera sin frameworks UI como React. Usa DOM dinámico para renderizar la interfaz y ofrece:

- búsqueda inmediata con debounce,
- filtrado por región,
- favoritos persistentes en `localStorage`,
- almacenamiento en caché con IndexedDB,
- modo claro/oscuro y diseño responsive.

## Características

- Búsqueda de países por nombre con retraso optimizado (`debounce`).
- Filtrado por región mediante un select.
- Ordenación por población y por nombre.
- Selección y renderizado de detalles de país en modal.
- Modo de solo favoritos con contador dinámico.
- Persistencia de favoritos en `localStorage`.
- Estrategia de datos `Network First` con fallback a `IndexedDB`.
- Tema claro/oscuro guardado en el navegador.
- Arquitectura basada en un gestor de estado propio y patrón observador.

## Tecnología

- Vite
- TypeScript
- Tailwind CSS
- IndexedDB
- LocalStorage
- API REST de países

## Requisitos

- Node.js 18+ recomendado.
- `npm` o `pnpm`.

## Instalación

```bash
npm install
```

## Configuración de entorno

Crea un archivo `.env` en la raíz del proyecto con la URL base de la API de países:

```env
VITE_API_COUNTRIES_BASE_URL=https://restcountries.com/v3.1
```

> La aplicación añade internamente la ruta `/all?fields=...` al valor de esta variable.

## Scripts disponibles

- `npm run dev` - iniciar servidor de desarrollo.
- `npm run build` - compilar para producción.
- `npm run preview` - previsualizar la build.

## Estructura principal

- `src/main.ts` - entrada principal y controlador de eventos.
- `src/components/layout.ts` - renderiza header, contenido y footer.
- `src/components/countryCards.ts` - genera tarjetas y modal de país.
- `src/components/emptyState.ts` - muestra mensajes cuando no hay resultados.
- `src/state/countryState.ts` - lógica de estado, filtros y suscripciones.
- `src/services/countryService.ts` - obtiene datos, valida respuesta y cachea.
- `src/services/favoriteService.ts` - guarda favoritos en `localStorage`.
- `src/services/themeService.ts` - gestiona el tema claro/oscuro.
- `src/utils/http.ts` - cliente HTTP con timeout y validación.
- `src/utils/localStorage.ts` - wrapper para `localStorage`.
- `src/utils/db.ts` - abstracción para IndexedDB.
- `src/utils/debounce.ts` - helper de debounce.
- `src/types/Country.ts` - tipos y modelos de país.

## Uso

1. Ejecuta `npm run dev`.
2. Abre `http://localhost:5173`.
3. Busca países por nombre.
4. Filtra por región.
5. Marca favoritos con el botón de corazón.
6. Cambia el tema con el botón del header.

## Notas

- El componente de `feedback-form` está incluido en el layout, pero no está conectado a un backend.
- El proyecto está diseñado como una aplicación de frontend sin frameworks pesados.

## Licencia

Proyecto privado. Ajusta esta sección según tus necesidades.
