const pool = require('../db');

async function createTable() {
  try {
    // Create ENUM for estatus_cobro if not exists
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE estatus_cobro_enum AS ENUM ('pendiente_efectivo', 'pagada_paypal');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create table citas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS citas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
        fecha TIMESTAMP NOT NULL,
        descripcion TEXT NOT NULL,
        estatus_cobro estatus_cobro_enum DEFAULT 'pendiente_efectivo',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabla citas y tipo ENUM estatus_cobro creados correctamente.');
  } catch (err) {
    console.error('Error creando la tabla citas:', err);
  } finally {
    pool.end();
  }
}

createTable();
