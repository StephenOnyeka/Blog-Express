export default function Footer() {
  const links = [
    'Help', 'Status', 'About', 'Careers', 'Blog',
    'Privacy', 'Terms', 'Text to speech', 'Teams'
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">
        {links.map(link => (
          <span key={link} className="footer-link" style={{ cursor: 'pointer' }}>{link}</span>
        ))}
      </div>
    </footer>
  );
}
