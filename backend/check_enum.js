const pool = require('./db');
async function check() {
  try {
    const { rows } = await pool.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'estatus_cobro_enum'::regtype");
    console.log(rows);
  } catch (e) {
    console.log(e);
  } finally {
    pool.end();
  }
}
check();
