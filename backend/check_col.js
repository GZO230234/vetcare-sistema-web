const pool = require('./db');
async function check() {
  try {
    const { rows } = await pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'citas' AND column_name = 'fecha'");
    console.log(rows);
  } catch (e) {
    console.log(e);
  } finally {
    pool.end();
  }
}
check();
