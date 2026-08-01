/**
 * Taxonomía de errores de la aplicación.
 *
 * Cada error tiene un `kind` discriminable: el caller puede hacer
 * switch(error.kind) y reaccionar distinto (reintentar en "network",
 * mostrar formulario en "validation", etc.) sin adivinar strings.
 */
export type AppError =
  | {
      readonly kind: "network";
      readonly message: string;
      readonly cause?: unknown;
    }
  | { readonly kind: "validation"; readonly message: string }
  | { readonly kind: "storage"; readonly message: string }
  | { readonly kind: "not-found"; readonly message: string };
