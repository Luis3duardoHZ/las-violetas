let reservas = [];
let filtroActivo = 'todas';
let token = '';

function login() {
  const pwd = document.getElementById('passwordInput').value;
  if (!pwd) return;
  token = pwd;
  cargarReservas();
}

function logout() {
  token = ''; reservas = [];
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('passwordInput').value = '';
  document.getElementById('loginError').classList.remove('show');
}

async function cargarReservas() {
  try {
    const res = await fetch('/api/reservas', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) { document.getElementById('loginError').classList.add('show'); token = ''; return; }
    if (!res.ok) throw new Error();
    reservas = await res.json();
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    actualizarStats();
    renderTabla();
  } catch { mostrarToast('Error al conectar con el servidor', 'error'); }
}

function actualizarStats() {
  document.getElementById('statTotal').textContent = reservas.length;
  document.getElementById('statPendiente').textContent = reservas.filter(r => r.estado === 'pendiente').length;
  document.getElementById('statConfirmada').textContent = reservas.filter(r => r.estado === 'confirmada').length;
  document.getElementById('statCancelada').textContent = reservas.filter(r => r.estado === 'cancelada').length;
}

function setFiltro(filtro, btn) {
  filtroActivo = filtro;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTabla();
}

function renderTabla() {
  const busqueda = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let lista = reservas;
  if (filtroActivo !== 'todas') lista = lista.filter(r => r.estado === filtroActivo);
  if (busqueda) lista = lista.filter(r =>
    r.nombre.toLowerCase().includes(busqueda) ||
    r.telefono.includes(busqueda) ||
    (r.email || '').toLowerCase().includes(busqueda) ||
    r.servicio.toLowerCase().includes(busqueda)
  );
  const wrap = document.getElementById('tableWrap');
  if (lista.length === 0) {
    wrap.innerHTML = `<div class="empty"><i class="fa-solid fa-calendar-xmark"></i><p>No hay reservas${filtroActivo !== 'todas' ? ' en este estado' : ''}.</p></div>`;
    return;
  }
  wrap.innerHTML = `<table><thead><tr><th>Paciente</th><th>Teléfono</th><th>Email</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Mensaje</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${lista.map(r => `<tr id="row-${r.id}"><td class="name">${r.nombre}</td><td>${r.telefono}</td><td class="muted">${r.email || '—'}</td><td>${r.servicio}</td><td>${formatFecha(r.fecha)}</td><td>${r.hora}</td><td class="muted" style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.mensaje || ''}">${r.mensaje || '—'}</td><td><span class="badge ${r.estado}">${r.estado}</span></td><td><div class="actions">${r.estado !== 'confirmada' ? `<button class="action-btn confirm" onclick="cambiarEstado('${r.id}','confirmada')"><i class="fa-solid fa-check"></i> Confirmar</button>` : ''}${r.estado !== 'cancelada' ? `<button class="action-btn cancel" onclick="cambiarEstado('${r.id}','cancelada')"><i class="fa-solid fa-xmark"></i> Cancelar</button>` : ''}${r.estado !== 'pendiente' ? `<button class="action-btn" style="border-color:#9CA3AF;color:#9CA3AF" onclick="cambiarEstado('${r.id}','pendiente')"><i class="fa-solid fa-rotate-left"></i></button>` : ''}</div></td></tr>`).join('')}</tbody></table>`;
}

async function cambiarEstado(id, estado) {
  const btns = document.querySelectorAll(`#row-${id} .action-btn`);
  btns.forEach(b => b.disabled = true);
  try {
    const res = await fetch('/api/actualizar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, estado })
    });
    if (!res.ok) throw new Error();
    const idx = reservas.findIndex(r => r.id === id);
    if (idx !== -1) reservas[idx].estado = estado;
    actualizarStats();
    renderTabla();
    mostrarToast(estado === 'confirmada' ? 'Reserva confirmada' : estado === 'cancelada' ? 'Reserva cancelada' : 'Estado actualizado', 'success');
  } catch { mostrarToast('Error al actualizar', 'error'); btns.forEach(b => b.disabled = false); }
}

function mostrarToast(msg, tipo = 'success') {
  const toast = document.getElementById('toast');
  toast.querySelector('i').className = tipo === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
  document.getElementById('toastMsg').textContent = msg;
  toast.className = `toast ${tipo} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function formatFecha(fecha) {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}
