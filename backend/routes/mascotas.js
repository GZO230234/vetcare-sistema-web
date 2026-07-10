const express = require('express');
const router = express.Router();
const { registrarMascota, obtenerMascotasPorUsuario, obtenerMascotaPorId, obtenerTodasLasMascotas } = require('../controllers/mascotasController');

// GET /api/mascotas
router.get('/', obtenerTodasLasMascotas);

// POST /api/mascotas
router.post('/', registrarMascota);

// GET /api/mascotas/usuario/:usuarioId
router.get('/usuario/:usuarioId', obtenerMascotasPorUsuario);

// GET /api/mascotas/:id
router.get('/:id', obtenerMascotaPorId);

module.exports = router;
