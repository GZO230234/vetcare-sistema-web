import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
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
              <p>Calle Falsa 123</p>
              <p>Ciudad, País</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Home;
