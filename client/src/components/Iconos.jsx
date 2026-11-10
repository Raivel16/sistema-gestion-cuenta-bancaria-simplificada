// Íconos dibujados en SVG con un mismo trazo (1.75). Heredan el color del texto.
function Base({ children, className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconoDeposito = (props) => (
  <Base {...props}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const IconoRetiro = (props) => (
  <Base {...props}>
    <path d="M5 12h14" />
  </Base>
)

export const IconoTransferencia = (props) => (
  <Base {...props}>
    <path d="M4 8h15m0 0-3-3m3 3-3 3M20 16H5m0 0 3-3m-3 3 3 3" />
  </Base>
)

export const IconoVolver = (props) => (
  <Base {...props}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </Base>
)

export const IconoChip = ({ className = 'h-8 w-11' }) => (
  <svg viewBox="0 0 44 32" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
    <rect x="1" y="1" width="42" height="30" rx="6" />
    <path d="M1 11h42M1 21h42M15 1v30M29 1v30" />
  </svg>
)
