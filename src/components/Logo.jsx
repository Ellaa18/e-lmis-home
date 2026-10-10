
function Logo({ className = "" }) {
  return (
    <div className={`site-logo-container ${className}`.trim()}>
      <img
        src="/images/logo.jpg"
        alt="E-LMIS"
        className="site-logo"
      />
    </div>
  );
}

export default Logo;
