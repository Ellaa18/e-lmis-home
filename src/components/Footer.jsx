import { useState } from "react";
import Logo from "./Logo";
import "../styles/footer.css";

function Footer() {
  const [adminCode, setAdminCode] = useState("");

  const handleAdminCode = (event) => {
    const value = event.target.value.replace(/\D/g, "");
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

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/",
      className: "social-facebook",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.5v2.1H7v3.2h2.9V21h3.6Z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/",
      className: "social-instagram",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle className="social-icon-fill" cx="17.5" cy="6.7" r="1.2" />
        </svg>
      ),
    },
    {
      name: "X / Twitter",
      url: "https://x.com/",
      className: "social-x",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.9 3H22l-6.8 7.8L23.2 21h-6.3L12 14.7 5.5 21H2.4l7.3-8.4L1.9 3h6.5l4.5 6 6-6Zm-1.1 16h1.7L7.3 4.9H5.5L17.8 19Z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: "https://www.whatsapp.com/",
      className: "social-whatsapp",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.5 23.5l6-1.6a11.9 11.9 0 0 0 5.7 1.4h.1A11.8 11.8 0 0 0 20.5 3.5ZM12.3 21.3a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.6 1 1-3.5-.3-.5a9.7 9.7 0 1 1 8.3 4.6Zm5.3-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.2 3.2c.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5Z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/",
      className: "social-youtube",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/",
      className: "social-linkedin",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.2 0h3.6v1.6h.1a4 4 0 0 1 3.6-2c3.9 0 4.6 2.5 4.6 5.7V21h-3.8v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.5V9Z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      url: "https://telegram.org/",
      className: "social-telegram",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21.9 4.2 18.6 20c-.2 1.1-.8 1.4-1.7.9l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L6.5 14.1l-4.6-1.4c-1-.3-1-1 .2-1.5L20.2 3c.9-.3 1.8.2 1.7 1.2Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-background-glow" aria-hidden="true" />

      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo-frame">
            <Logo className="footer-logo" />
          </div>

          <p className="footer-title">Expatriate Work Permit System</p>

          <p className="footer-description">
            Your gateway to expatriate work permit information and services.
          </p>
        </div>

        <div className="footer-divider" />

        <div className="footer-social-section">
          <h3 className="footer-social-heading">Connect With Us</h3>

          <p className="footer-social-description">
            Follow us on social media for updates and announcements.
          </p>

          <div className="footer-social-links">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                className={`footer-social-link ${social.className}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${social.name}`}
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © 2026 E-LMIS. All rights reserved.
        </p>

        <div className="footer-bottom-accent" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

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
            pattern="[0-9]*"
          />
          <span className="admin-dash" aria-hidden="true">
            —
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;