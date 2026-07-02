import { useLocation, Navigate, Link } from 'react-router-dom';
import '../App.css'; 

function Dashboard() {
  const location = useLocation();
  const user = location.state?.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="vetcare-container">
      {/* Header Verde */}
      <header className="vetcare-header">
        <div className="header-left"></div>
        <div className="header-center">
          <h1>Vetcare</h1>
        </div>
        <div className="header-right">
          <Link to="/" className="login-btn" style={{ backgroundColor: '#f44336' }}>Cerrar Sesión</Link>
        </div>
      </header>

      <main className="vetcare-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ color: '#333', fontSize: '2.5rem' }}>¡Bienvenido/a, {user.nombres}!</h1>
          <p style={{ color: '#666', fontSize: '1.2rem' }}>¿Qué deseas hacer hoy?</p>
        </div>

        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Botón Mascotas */}
          <Link to="/mascotas" state={{ user }} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '250px',
            height: '150px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s, opacity 0.3s',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            🐾 Mascotas
          </Link>

          {/* Botón Citas */}
          <Link to="/citas" state={{ user }} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '250px',
            height: '150px',
            backgroundColor: '#007BFF',
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s, opacity 0.3s',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            📅 Citas
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
