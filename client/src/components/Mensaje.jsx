// Aviso de éxito o error. Si no hay mensaje no muestra nada.
function Mensaje({ mensaje, onCerrar }) {
  if (!mensaje) return null

  const esExito = mensaje.tipo === 'exito'
  const estilos = esExito
    ? 'border-acento/30 bg-acento-claro text-acento-osc'
    : 'border-egreso/30 bg-egreso-claro text-egreso'

  return (
    <div
      role={esExito ? 'status' : 'alert'}
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${estilos}`}
    >
      <span>{mensaje.texto}</span>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar mensaje"
        className="-my-1 rounded px-2 text-lg leading-none opacity-70 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}

export default Mensaje
