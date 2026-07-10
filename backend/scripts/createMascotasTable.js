const pool = require('../db');

async function createTable() {
  try {
    // Create ENUM
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE tipo_mascota AS ENUM ('perro', 'gato', 'conejo', 'canario', 'otro');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mascotas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        tipo tipo_mascota NOT NULL,
        raza VARCHAR(100),
        edad VARCHAR(50),
        descripcion TEXT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabla mascotas y tipo ENUM creados correctamente.');
  } catch (err) {
    console.error('Error creando la tabla mascotas:', err);
  } finally {
    pool.end();
  }
}

createTable();
