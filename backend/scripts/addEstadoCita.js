const pool = require('../db');

async function alterTable() {
  try {
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE estado_cita_enum AS ENUM ('en espera', 'atendido');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      ALTER TABLE citas ADD COLUMN IF NOT EXISTS estado estado_cita_enum DEFAULT 'en espera';
    `);

    console.log('Columna estado añadida exitosamente.');
  } catch (err) {
    console.error('Error alterando la tabla citas:', err);
  } finally {
    pool.end();
  }
}

alterTable();
