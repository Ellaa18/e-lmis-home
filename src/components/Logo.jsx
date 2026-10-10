function Logo({ className = "" }) {
  return (
    <img
      src="/images/logo.jpg"
      alt="E-LMIS"
      className={`site-logo ${className}`}
    />
  );
}

export default Logo;