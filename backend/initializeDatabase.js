const pool = require('./db');

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      correo VARCHAR(255) NOT NULL UNIQUE,
      contrasena_hash TEXT NOT NULL,
      nombres VARCHAR(100) NOT NULL,
      apellidos VARCHAR(100) NOT NULL,
      telefono VARCHAR(30),
      direccion TEXT,
      codigo_postal VARCHAR(20),
      rol VARCHAR(30) NOT NULL DEFAULT 'cliente',
      fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
      verificado BOOLEAN NOT NULL DEFAULT false,
      token_validacion TEXT
    );
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE tipo_mascota AS ENUM ('perro', 'gato', 'conejo', 'canario', 'otro');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE estado_cita_enum AS ENUM ('en espera', 'atendido', 'no_asistio');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await pool.query("ALTER TYPE estado_cita_enum ADD VALUE IF NOT EXISTS 'no_asistio';");

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE estatus_cobro_enum AS ENUM ('pendiente_efectivo', 'pendiente_paypal', 'pagada_paypal');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await pool.query("ALTER TYPE estatus_cobro_enum ADD VALUE IF NOT EXISTS 'pendiente_paypal';");
  await pool.query("ALTER TYPE estatus_cobro_enum ADD VALUE IF NOT EXISTS 'pagada_paypal';");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mascotas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre VARCHAR(100) NOT NULL,
      tipo tipo_mascota NOT NULL,
      raza VARCHAR(100),
      edad VARCHAR(50),
      descripcion TEXT,
      activo BOOLEAN NOT NULL DEFAULT true,
      fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query('ALTER TABLE mascotas ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS citas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
      fecha TIMESTAMP NOT NULL,
      descripcion TEXT NOT NULL,
      estado estado_cita_enum NOT NULL DEFAULT 'en espera',
      estatus_cobro estatus_cobro_enum NOT NULL DEFAULT 'pendiente_efectivo',
      fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query("ALTER TABLE citas ADD COLUMN IF NOT EXISTS estado estado_cita_enum NOT NULL DEFAULT 'en espera';");
  await pool.query("ALTER TABLE citas ADD COLUMN IF NOT EXISTS estatus_cobro estatus_cobro_enum NOT NULL DEFAULT 'pendiente_efectivo';");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS diagnosticos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
      cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
      encargado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      encargado_nombre VARCHAR(150) NOT NULL,
      titulo VARCHAR(200) NOT NULL,
      descripcion TEXT NOT NULL,
      prescripcion TEXT,
      fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = initializeDatabase;