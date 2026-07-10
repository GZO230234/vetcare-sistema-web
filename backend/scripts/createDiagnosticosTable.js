const pool = require('../db');

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diagnosticos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
        cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
        encargado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        encargado_nombre VARCHAR(150) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        prescripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Tabla diagnosticos creada exitosamente.');
  } catch (err) {
    console.error('Error creando tabla diagnosticos:', err);
  } finally {
    pool.end();
  }
}

createTable();
