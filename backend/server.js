const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mascotasRoutes = require('./routes/mascotas');
const citasRoutes = require('./routes/citas');
const diagnosticosRoutes = require('./routes/diagnosticos');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/mascotas', authMiddleware, mascotasRoutes);
app.use('/api/citas', authMiddleware, citasRoutes);
app.use('/api/diagnosticos', authMiddleware, diagnosticosRoutes);

app.get('/', (req, res) => {
  res.send('API del Backend de Vetcare funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
