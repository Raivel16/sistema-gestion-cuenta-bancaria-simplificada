// Funciones para mostrar montos y fechas en la interfaz.

export function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(valor)
}

export function formatoFecha(fecha) {
  return new Date(fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
}
