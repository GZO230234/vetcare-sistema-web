const pool = require('./db');
async function fix() {
  try {
    // Add value to ENUM
    await pool.query(`ALTER TYPE estatus_cobro_enum ADD VALUE IF NOT EXISTS 'pendiente_paypal';`);
    console.log("ENUM actualizado correctamente");
  } catch (e) {
    console.log("Error intentando actualizar el ENUM:", e.message);
  } finally {
    pool.end();
  }
}
fix();
