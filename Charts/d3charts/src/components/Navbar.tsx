import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);  
  };
  const closeMenu = () => {
    setIsMenuOpen(false);  
  };
  return (
    <nav className="navbar">
      <div className="hamburger" onClick={toggleMenu}>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>
      <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/barchart" onClick={closeMenu}>Bar Chart</Link></li>
        <li><Link to="/stackedbarchart" onClick={closeMenu}>Stacked Bar Chart</Link></li>
        <li><Link to="/donutchart" onClick={closeMenu}>Donut Chart</Link></li>
        <li><Link to="/animateddonutchart" onClick={closeMenu}>Animated Donut</Link></li>
        <li><Link to="/sunburstchart" onClick={closeMenu}>Sunburst Chart</Link></li>
        <li><Link to="/cities" onClick={closeMenu}>Cities</Link></li>
        <li><Link to="/savedCities" onClick={closeMenu}>Saved Cities</Link></li>
      </ul>
    </nav>
  );
}
export default Navbar;