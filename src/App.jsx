import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterEmployee from './pages/RegisterEmployee';
import Dashboard from './pages/Dashboard';
import Mascotas from './pages/Mascotas';
import Citas from './pages/Citas';

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
        <Route path="/citas" element={<Citas />} />
      </Routes>
    </Router>
  );
}

export default App;
