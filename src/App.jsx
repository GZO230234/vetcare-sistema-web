import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterEmployee from './pages/RegisterEmployee';
import Dashboard from './pages/Dashboard';
import Mascotas from './pages/Mascotas';
import MascotaDetalle from './pages/MascotaDetalle';
import Citas from './pages/Citas';
import NuevaCita from './pages/NuevaCita';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-employee" element={<RegisterEmployee />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mascotas" element={<Mascotas />} />
        <Route path="/mascotas/:id" element={<MascotaDetalle />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/citas/nueva" element={<NuevaCita />} />
      </Routes>
    </Router>
  );
}

export default App;
