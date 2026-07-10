import { useState, useEffect } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../App.css'; 

function Dashboard() {
  const location = useLocation();
  const user = location.state?.user;
  
  const [citas, setCitas] = useState([]);
  const [citasPorDia, setCitasPorDia] = useState({});

  useEffect(() => {
    if (user) {
      fetchCitas();
    }
  }, [user]);

  const fetchCitas = async () => {
    try {
      const endpoint = user.rol === 'empleado' 
        ? 'http://localhost:5000/api/citas/todas'
        : `http://localhost:5000/api/citas/usuario/${user.id}`;
      const response = await fetch(endpoint, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
      if (response.ok) {
        let data = await response.json();
        // Ocultar citas que ya fueron atendidas o marcadas como no asistió
        data = data.filter(cita => cita.estado !== 'atendido' && cita.estado !== 'no_asistio');
        setCitas(data);
        
        // Mapear fechas para el calendario
        const dict = {};
        data.forEach(cita => {
          const dateStr = new Date(cita.fecha).toDateString();
          dict[dateStr] = true;
        });
        setCitasPorDia(dict);
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Filtrar próximas citas (a partir de hoy)
  const ahora = new Date();
  const proximasCitas = citas.filter(c => new Date(c.fecha) >= ahora).slice(0, 5); // Mostrar max 5

  return (
    <div className="vetcare-container">
      {/* Header Verde */}
      <header className="vetcare-header">
        <div className="header-left"></div>
        <div className="header-center">
          <h1>Vetcare</h1>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/configuracion" state={{ user }}>
            <img src="/images/user.png" alt="Configuración" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} title="Configuración de Perfil" />
          </Link>
          <Link to="/" className="login-btn" style={{ backgroundColor: '#f44336' }}>Cerrar Sesión</Link>
        </div>
      </header>

      <main className="vetcare-main" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        padding: '2rem', 
        gap: '2rem',
        minHeight: '80vh',
        backgroundColor: '#f8fafc',
        marginTop: '76px',
        flexWrap: 'wrap'
      }}>
        
        {/* Left Column: Navigation Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1', minWidth: '250px' }}>
          
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ color: '#333', fontSize: '1.8rem', margin: '0' }}>Hola, {user.nombres}!</h1>
            <p style={{ color: '#666', margin: '0' }}>Bienvenido a tu panel</p>
          </div>

          <Link to="/mascotas" state={{ user }} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '120px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.4rem',
            fontWeight: '600',
            borderRadius: '16px',
            boxShadow: '0 10px 20px rgba(76, 175, 80, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 25px rgba(76, 175, 80, 0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(76, 175, 80, 0.2)'; }}>
            🐾 {user?.rol === 'empleado' ? 'Clientes' : 'Mascotas'}
          </Link>

          <Link to="/citas" state={{ user }} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '120px',
            backgroundColor: '#007BFF',
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.4rem',
            fontWeight: '600',
            borderRadius: '16px',
            boxShadow: '0 10px 20px rgba(0, 123, 255, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 25px rgba(0, 123, 255, 0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 123, 255, 0.2)'; }}>
            📅 Citas
          </Link>
        </div>

        {/* Middle Column: Feed */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '300px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🕒 Próximas Citas
            </h2>
            {proximasCitas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {proximasCitas.map(cita => (
                  <div 
                    key={cita.id} 
                    onClick={() => user?.rol === 'empleado' && navigate(`/citas/${cita.id}`, { state: { user } })}
                    style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      borderLeft: '4px solid #007BFF',
                      cursor: user?.rol === 'empleado' ? 'pointer' : 'default',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => user?.rol === 'empleado' && (e.currentTarget.style.backgroundColor = '#e2e6ea')}
                    onMouseOut={(e) => user?.rol === 'empleado' && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                  >
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                      Cita para {cita.mascota_nombre} {user?.rol === 'empleado' && cita.cliente_nombre ? `(Cliente: ${cita.cliente_nombre} ${cita.cliente_apellido})` : ''}
                    </h4>
                    <p style={{ margin: 0, color: '#666' }}>{new Date(cita.fecha).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#f1f5f9', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>No tienes citas próximas</p>
              </div>
            )}
          </div>

          {user?.rol !== 'empleado' && (
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📋 Diagnósticos
              </h2>
              <div style={{ backgroundColor: '#f1f5f9', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay nuevas entradas</p>
              </div>
            </div>
          )}
          
        </div>

        {/* Right Column: Calendar */}
        <div style={{ flex: '1.5', minWidth: '350px', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.5rem', textAlign: 'center' }}>
            📅 Calendario
          </h2>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Calendar 
              tileClassName={({ date, view }) => {
                if (view === 'month') {
                  const dateStr = date.toDateString();
                  if (citasPorDia[dateStr]) {
                    return 'highlighted-date';
                  }
                }
                return null;
              }}
            />
          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
