// Aviso de éxito o error. Si no hay mensaje no muestra nada.
function Mensaje({ mensaje, onCerrar }) {
  if (!mensaje) return null

  const esExito = mensaje.tipo === 'exito'
  const estilos = esExito
    ? 'border-green-300 bg-green-50 text-green-800'
    : 'border-red-300 bg-red-50 text-red-800'

  return (
    <div
      role={esExito ? 'status' : 'alert'}
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${estilos}`}
    >
      <span>
        {esExito ? '✅ ' : '⚠️ '}
        {mensaje.texto}
      </span>
      <button type="button" onClick={onCerrar} aria-label="Cerrar mensaje" className="font-bold opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  )
}

export default Mensaje
