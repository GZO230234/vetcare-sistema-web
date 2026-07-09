import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  const handleSecretClick = () => {
    const pwd = prompt("Contraseña:");
    if (pwd === "huellitas123") {
      window.location.href = "/register-employee";
    } else if (pwd !== null) {
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div className="vetcare-container">
      <header className="vetcare-header">
        <div className="header-left"></div>
        <div className="header-center">
          <h1>Vetcare</h1>
        </div>
        <div className="header-right">
          <Link to="/login" className="login-btn">Login</Link>
        </div>
      </header>

      <main className="vetcare-main">
        <div className="hero-section">
          <img src="/images/perros1.png" alt="Perros" className="hero-image" />
          <div className="hero-overlay">
            <div className="hero-content">
              <h2>Bienvenidos a Vetcare</h2>
              <p>Somos un equipo de veterinarios encargados del cuidado de tus mascotas. Brindamos atención de primer nivel con el amor y dedicación que tus mejores amigos merecen.</p>
            </div>
            <Link to="/login" className="cta-btn">Haz tu cita</Link>
          </div>
        </div>

        <footer className="vetcare-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Contacto</h3>
              <p>Teléfono: +123 456 7890</p>
              <p>Email: info@vetcare.com</p>
            </div>
            <div className="footer-section">
              <h3>Dirección</h3>
              <p>Blvrd Juan Pablo II 1302</p>
              <p>Ex hacienda la Cantera, 20200 Aguascalientes, Ags.</p>
            </div>
          </div>
        </footer>
      </main>

      <img 
        src="/images/huella.png" 
        alt="Secret Empleado" 
        className="secret-employee-btn" 
        onClick={handleSecretClick} 
      />
    </div>
  );
}

export default Home;
