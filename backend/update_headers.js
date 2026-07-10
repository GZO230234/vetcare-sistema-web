const fs = require('fs');
const files = ['Dashboard.jsx', 'Mascotas.jsx', 'MascotaDetalle.jsx', 'Citas.jsx', 'CitaDetalle.jsx', 'NuevaCita.jsx', 'Configuracion.jsx'];

files.forEach(f => {
  const filePath = '../src/pages/' + f;
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace headers: { 'Content-Type': 'application/json' }
  code = code.replace(/headers:\s*\{\s*'Content-Type'/g, "headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type'");
  
  // Replace await fetch(endpoint); or await fetch(`url`);
  code = code.replace(/await fetch\((endpoint|`http[^`]+`)\);/g, "await fetch($1, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });");

  fs.writeFileSync(filePath, code);
});

console.log('Fetch headers updated.');
