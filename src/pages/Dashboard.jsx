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

      <main className="vetcare-main" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        padding: '2rem', 
        gap: '2rem',
        minHeight: '80vh',
        backgroundColor: '#f8fafc',
        marginTop: '76px'
      }}>
        
        {/* Left Column: Navigation Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1', maxWidth: '300px' }}>
          
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
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🕒 Próximas Citas
            </h2>
            <div style={{ backgroundColor: '#f1f5f9', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay nuevas entradas</p>
            </div>
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
        <div style={{ flex: '1', minWidth: '250px', backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.5rem', textAlign: 'center' }}>
            📅 Calendario
          </h2>
          <div style={{ 
            flex: '1',
            backgroundColor: '#f1f5f9', 
            borderRadius: '12px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            border: '2px dashed #cbd5e1'
          }}>
            <p style={{ color: '#94a3b8', fontWeight: '500' }}>[Vista de Calendario]</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
