
import { useState } from "react";
import Logo from "./Logo";

function Footer() {
  const [adminCode, setAdminCode] = useState("");

  const handleAdminCode = (event) => {
    const value = event.target.value;

    setAdminCode(value);

    if (value === "212177") {
      window.location.href = "/admin";
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && adminCode === "212177") {
      window.location.href = "/admin";
    }
  };

  return (
    <footer className="site-footer">
      <Logo className="footer-logo" />

      <p className="footer-title">
        Expatriate Work Permit System
      </p>

      <p className="copyright">
        © 2026 E-LMIS. All rights reserved.
      </p>

      {/* Hidden admin access */}
      <div className="hidden-admin-access">
        <input
          type="password"
          value={adminCode}
          onChange={handleAdminCode}
          onKeyDown={handleKeyDown}
          className="admin-secret-input"
          aria-label="Admin access"
          autoComplete="off"
          maxLength={6}
          inputMode="numeric"
        />

        <span className="admin-dash">—</span>
      </div>
    </footer>
  );
}

export default Footer;
