const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

router.get('/todas', citasController.getTodasCitas);
router.get('/usuario/:usuarioId', citasController.getCitasUsuario);
router.post('/', citasController.crearCita);
router.put('/:id/estado', citasController.actualizarEstadoCita);
router.put('/:id', citasController.actualizarCita);
router.delete('/:id', citasController.eliminarCita);

module.exports = router;
