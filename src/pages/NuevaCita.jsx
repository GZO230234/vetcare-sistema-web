import { useState, useEffect } from 'react';
import { useLocation, Navigate, useNavigate, Link } from 'react-router-dom';
import '../App.css'; 

function NuevaCita() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [mascotas, setMascotas] = useState([]);
  const [formData, setFormData] = useState({
    mascota_id: '',
    fecha: '',
    descripcion: '',
    estatus_cobro: 'pendiente_efectivo'
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch user's mascotas
      fetch(`http://localhost:5000/api/mascotas/usuario/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const mascotasArray = data.mascotas || [];
          setMascotas(mascotasArray);
          if (mascotasArray.length > 0) {
            setFormData(prev => ({ ...prev, mascota_id: mascotasArray[0].id }));
          }
        })
        .catch(err => console.error('Error fetching mascotas:', err));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const response = await fetch('http://localhost:5000/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/citas', { state: { user } });
      } else {
        setError(data.error || 'Error al agendar cita');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="vetcare-container">
      <header className="vetcare-header">
        <div className="header-left">
           <Link to="/citas" state={{ user }} className="login-btn" style={{ backgroundColor: '#555' }}>Volver</Link>
        </div>
        <div className="header-center">
          <h1>Agendar Nueva Cita</h1>
        </div>
        <div className="header-right">
          <Link to="/" className="login-btn" style={{ backgroundColor: '#f44336' }}>Cerrar Sesión</Link>
        </div>
      </header>

      <main className="vetcare-main" style={{ padding: '2rem', maxWidth: '600px', margin: '76px auto 0', width: '100%' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          {error && <div style={{ backgroundColor: '#fee', color: 'red', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Selecciona tu mascota:</label>
              <select 
                value={formData.mascota_id} 
                onChange={(e) => setFormData({...formData, mascota_id: e.target.value})}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                {mascotas.length === 0 ? <option value="">Sin mascotas disponibles</option> : null}
                {mascotas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fecha y Hora (Mínimo 2 días de anticipación):</label>
              <input 
                type="datetime-local" 
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Síntomas / Motivo de consulta:</label>
              <textarea 
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
                rows="4"
                placeholder="Describe brevemente los síntomas de tu mascota..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Método de Pago:</label>
              <select 
                value={formData.estatus_cobro} 
                onChange={(e) => setFormData({...formData, estatus_cobro: e.target.value})}
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                <option value="pendiente_efectivo">Pagar en Efectivo (en sucursal)</option>
                <option value="pagada_paypal">Pagar con PayPal (Próximamente)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={cargando || mascotas.length === 0}
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: (cargando || mascotas.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (cargando || mascotas.length === 0) ? 0.7 : 1
              }}
            >
              {cargando ? 'Agendando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default NuevaCita;
