require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testDatabase() {
  console.log("======================================");
  console.log("Script de Diagnóstico de Mascotas");
  console.log("======================================\n");
  try {
    console.log("1. Probando conexión a la base de datos...");
    const client = await pool.connect();
    console.log("✅ Conexión exitosa a PostgreSQL.\n");
    
    console.log("2. Verificando si existe la tabla 'mascotas'...");
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mascotas'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log("✅ La tabla 'mascotas' SÍ existe.\n");
      
      console.log("3. Contando registros en la tabla 'mascotas'...");
      const countCheck = await client.query('SELECT COUNT(*) FROM mascotas');
      console.log(`✅ Hay ${countCheck.rows[0].count} mascotas registradas en total.\n`);
      
      console.log("4. Obteniendo las primeras 5 mascotas registradas...");
      const dataCheck = await client.query('SELECT * FROM mascotas LIMIT 5');
      if (dataCheck.rows.length > 0) {
        console.table(dataCheck.rows);
      } else {
        console.log("⚠️ No hay mascotas registradas aún en la base de datos.");
      }
    } else {
      console.log("❌ ERROR: La tabla 'mascotas' NO existe en la base de datos.");
      console.log("   Necesitas crear la tabla antes de poder registrar mascotas.");
    }

    client.release();
  } catch (err) {
    console.error("❌ ERROR FATAL DURANTE EL DIAGNÓSTICO:\n", err);
  } finally {
    pool.end();
    console.log("\n======================================");
    console.log("Diagnóstico finalizado.");
    console.log("======================================");
  }
}

testDatabase();
