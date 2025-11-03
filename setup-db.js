import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('📦 Configurando base de datos...');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar el script SQL (dividido por punto y coma)
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✅ Base de datos configurada correctamente');
    console.log('📊 Verificando datos...');

    // Verificar que los datos se insertaron
    const result = await pool.query('SELECT COUNT(*) FROM items');
    console.log(`✅ Total de registros en la tabla: ${result.rows[0].count}`);

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al configurar la base de datos:', err.message);
    console.error('   Código de error:', err.code);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();

