import express from 'express';
import dotenv from 'dotenv';
import itemsRouter from './routes/items.js';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear URL encoded
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/items', itemsRouter);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de manejo de base de datos PostgreSQL',
    endpoints: {
      'GET /items': 'Obtener todos los items',
      'GET /items/:id': 'Obtener un item por ID',
      'POST /items': 'Crear un nuevo item',
      'PUT /items/:id': 'Actualizar un item',
      'DELETE /items/:id': 'Eliminar un item'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Función para verificar la conexión a la base de datos antes de iniciar el servidor
async function iniciarServidor() {
  try {
    // Probar la conexión
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos verificada');

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Endpoints disponibles:`);
      console.log(`   GET    http://localhost:${PORT}/items`);
      console.log(`   POST   http://localhost:${PORT}/items`);
      console.log(`   PUT    http://localhost:${PORT}/items/:id`);
      console.log(`   DELETE http://localhost:${PORT}/items/:id`);
    });
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    console.error('   Verifica tu configuración en el archivo .env');
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

iniciarServidor();

