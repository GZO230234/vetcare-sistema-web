const express = require('express');
const router = express.Router();
const diagnosticosController = require('../controllers/diagnosticosController');

router.post('/', diagnosticosController.crearDiagnostico);
router.get('/cita/:citaId', diagnosticosController.getDiagnosticosPorCita);
router.get('/mascota/:mascotaId', diagnosticosController.getDiagnosticosPorMascota);

module.exports = router;
