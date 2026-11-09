/**
 * Punto de entrada: conecta con MongoDB y levanta el servidor.
 * Se ejecuta con `npm start`.
 */
require('dotenv').config();
const app = require('./app');
const { conectarDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

conectarDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB. Verifique que el servicio este activo:', error.message);
    process.exit(1);
  });
