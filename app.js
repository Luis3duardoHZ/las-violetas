// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Form submit — calls backend
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  const data = {
    nombre:   form.querySelector('input[name="nombre"]').value,
    telefono: form.querySelector('input[name="telefono"]').value,
    email:    form.querySelector('input[name="email"]').value,
    servicio: form.querySelector('select[name="servicio"]').value,
    fecha:    form.querySelector('input[name="fecha"]').value,
    hora:     form.querySelector('select[name="hora"]').value,
    mensaje:  form.querySelector('textarea[name="mensaje"]').value
  };

  try {
    const res = await fetch('/api/reservar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Error en el servidor');

    form.reset();
    showToast('¡Reserva enviada! Te contactaremos pronto para confirmar tu cita.', 'success');
  } catch {
    showToast('Hubo un error al enviar. Por favor llámanos directamente al +58 414-000-0000.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Confirmar Reserva';
  }
}

function showToast(msg, tipo = 'success') {
  const toast = document.getElementById('toastMain');
  const icon = document.getElementById('toastMainIcon');
  document.getElementById('toastMainMsg').textContent = msg;
  icon.className = tipo === 'success'
    ? 'fa-solid fa-circle-check'
    : 'fa-solid fa-circle-exclamation';
  toast.className = `toast-main ${tipo} show`;
  setTimeout(() => toast.classList.remove('show'), 5000);
}

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .pricing-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Min date
const dateInput = document.querySelector('input[type="date"]');
if (dateInput) dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
