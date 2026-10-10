import { useState } from "react";
import Logo from "./Logo";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header">

      <div className="navbar">

        <a
          href="/"
          className="navbar-logo-link"
          onClick={closeMenu}
        >
          <Logo />
        </a>

        <button
          type="button"
          className={`menu-button ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

      {menuOpen && (
        <nav className="mobile-menu">

          <a href="/" onClick={closeMenu}>
            Home
          </a>

          <a href="/application" onClick={closeMenu}>
            New Application
          </a>

          <a href="#developments" onClick={closeMenu}>
            Latest Developments
          </a>

          <a href="#guides" onClick={closeMenu}>
            Helping Guides
          </a>

        </nav>
      )}

    </header>
  );
}

export default Navbar;