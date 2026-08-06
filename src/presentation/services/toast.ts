/**
 * Servicio de Notificaciones Visuales (Toasts) dinámicas en tiempo de ejecución.
 * Este módulo proporciona una función `showToast` que puede ser llamada desde cualquier parte de la aplicación
 */

export type ToastType = "success" | "error" | "info";

/**
 * Muestra una alerta flotante en la esquina de la pantalla.
 * @param message - Texto que verá el usuario.
 * @param type - Estilo visual de la alerta ('success' | 'error' | 'info')
 */
export const showToast = (message: string, type: ToastType = "info"): void => {
  // 1. Buscamos o creamos un contenedor global para los toasts en el body
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    // Clases del contenedor: fijo, arriba a la derecha, alta prioridad (z-50)
    container.className =
      "fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none";
    document.body.appendChild(container);
  }

  // 2. Creamos el elemento del Toast individual
  const toast = document.createElement("div");

  // Definimos los colores basados en el tipo de notificación
  let bgStyles = "bg-paper-card text-ink border border-slate-200/60";
  if (type === "success") bgStyles = "bg-accent text-white";
  if (type === "error") bgStyles = "bg-red-600 text-white";
  if (type === "info")
    bgStyles = "bg-space-card text-starlight border border-starlight-faint/15";

  // Secuencia de diseño del Toast flotante
  toast.className = `p-4 rounded-xl shadow-2xl ${bgStyles} font-semibold text-sm tracking-tight transition-all duration-300 transform translate-x-20 opacity-0 pointer-events-auto flex items-center gap-2`;
  toast.textContent = message;

  // Inyectamos el toast en el contenedor
  container.appendChild(toast);

  // 3. Animación de entrada (Micro-tarea para que el navegador capte la transición)
  setTimeout(() => {
    toast.classList.remove("translate-x-20", "opacity-0");
  }, 10);

  // 4. Auto-destrucción programada tras 3 segundos (3000ms)
  setTimeout(() => {
    // Animación de salida
    toast.classList.add("translate-x-20", "opacity-0");
    // Lo removemos del DOM real cuando termine la animación
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};
