document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const themeToggle = document.getElementById('theme-toggle'); // optional button
  const root = document.documentElement;

  // ===== Mobile Menu Toggle =====
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navLinks.classList.remove('collapsed');
  });

  // ===== Responsive Handling =====
  const handleResize = () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('collapsed', 'open');
      navLinks.style.display = 'flex';
    } else {
      navLinks.classList.add('collapsed');
      navLinks.style.display = 'none';
    }
  };
  window.addEventListener('resize', handleResize);
  handleResize(); // Initial trigger

  // ===== Theme Toggle (Dark/Light) =====
  function setTheme(mode) {
    const icon = document.getElementById('theme-icon');
  
    if (mode === 'light') {
      document.body.setAttribute('data-theme', 'light');
      icon.style.transform = 'rotate(180deg)';
      localStorage.setItem('theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
      icon.style.transform = 'rotate(0deg)';
      localStorage.setItem('theme', 'dark');
    }
  }
  

  // Optional: Button click handler
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  // On load: Check saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    setTheme('light');
  }
});
