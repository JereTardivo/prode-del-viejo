// ═══════════════════════════════════════════════
//  ADMIN SYSTEM — Firebase Auth + Realtime DB
// ═══════════════════════════════════════════════
let adminSeason = 's2026a';
let cachedFB = {};

// ── Firebase listener: cache all saved fechas ──
db.ref(FB_PATH).on('value', snap => {
  cachedFB = snap.val() || {};
});

// ── Apply a fecha record from Firebase into live data ──
function applyFecha(sid, numStr, fd) {
  const data = seasonDataMap[sid];
  if (!data) return;
  const numKey = isNaN(numStr) ? numStr : Number(numStr);
  const existing = data.fechas.find(f => String(f.num) === String(numKey));
  if (existing) {
    existing.g = fd.g || [];
    existing.p = fd.p || [];
  } else {
    data.fechas.push({ num: numKey, g: fd.g || [], p: fd.p || [] });
    data.fechas.sort((a, b) => {
      const an = isNaN(a.num) ? 999 : Number(a.num);
      const bn = isNaN(b.num) ? 999 : Number(b.num);
      return an - bn;
    });
  }
  data.gmonto[numKey] = fd.monto || 0;
}

// ── Start real-time Firebase listener ──
function startFirebaseListener() {
  db.ref(FB_PATH).on('value', snapshot => {
    const all = snapshot.val() || {};
    Object.entries(all).forEach(([sid, fechas]) => {
      Object.entries(fechas).forEach(([numStr, fd]) => applyFecha(sid, numStr, fd));
    });
    rebuildCurrentSeasons();
    refreshSavedList();
  });
}

// ── Saved fecha chips ──
function getSavedForSeason(sid) {
  return cachedFB[sid] || {};
}

function refreshSavedList() {
  const el = document.getElementById('admin-saved-list');
  if (!el) return;
  const fechas = getSavedForSeason(adminSeason);
  const keys = Object.keys(fechas);
  if (!keys.length) {
    el.innerHTML = '<span style="color:var(--muted);font-size:12px">No hay fechas guardadas para esta temporada</span>';
    return;
  }
  el.innerHTML = keys.map(k => {
    const display = isNaN(k.replace(/_/g, ' ')) ? k.replace(/_/g, ' ') : 'Fecha ' + k;
    return `<span class="saved-fecha-chip" onclick="editFecha('${k}')">
      ${display}
      <span class="del" onclick="event.stopPropagation();deleteFecha('${k}')" title="Eliminar">×</span>
    </span>`;
  }).join('');
}

function editFecha(safeKey) {
  const fd = getSavedForSeason(adminSeason)[safeKey];
  if (!fd) return;
  document.getElementById('af-num').value = fd.numRaw || safeKey.replace(/_/g, ' ');
  document.getElementById('af-monto').value = fd.monto || '';
  document.getElementById('af-ganadores').value = (fd.g || []).join('\n');
  document.getElementById('af-perdedores').value = (fd.p || []).join('\n');
}

// ── Save a fecha to Firebase (requires auth) ──
async function saveFecha() {
  if (!auth.currentUser) { alert('Sesión expirada. Volvé a ingresar.'); hideAdminPanel(); return; }
  const numRaw = document.getElementById('af-num').value.trim();
  const monto = parseInt(document.getElementById('af-monto').value) || 0;
  const gRaw = document.getElementById('af-ganadores').value;
  const pRaw = document.getElementById('af-perdedores').value;
  if (!numRaw) { alert('Ingresá el número o nombre de la fecha'); return; }
  const g = gRaw.split('\n').map(s => s.trim()).filter(Boolean);
  const p = pRaw.split('\n').map(s => s.trim()).filter(Boolean);
  const safeKey = numRaw.replace(/[.#$\[\]\/]/g, '_');
  setAdminLoading(true);
  try {
    await db.ref(`${FB_PATH}/${adminSeason}/${safeKey}`).set({ g, p, monto, numRaw });
    const msg = document.getElementById('admin-save-msg');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 2500);
  } catch (e) {
    alert('Error guardando: ' + e.message);
  }
  setAdminLoading(false);
}

// ── Delete a fecha from Firebase ──
async function deleteFecha(numStr) {
  if (!auth.currentUser) return;
  if (!confirm('¿Eliminar fecha ' + numStr + '?')) return;
  const safeKey = numStr.replace(/[.#$\[\]\/]/g, '_');
  try {
    await db.ref(`${FB_PATH}/${adminSeason}/${safeKey}`).remove();
    const data = seasonDataMap[adminSeason];
    const numKey = isNaN(numStr) ? numStr : Number(numStr);
    const idx = data.fechas.findIndex(f => String(f.num) === String(numKey));
    if (idx > -1) { data.fechas[idx].g = []; data.fechas[idx].p = []; }
  } catch (e) {
    alert('Error eliminando: ' + e.message);
  }
}

function setAdminLoading(loading) {
  const btn = document.querySelector('[onclick="saveFecha()"]');
  if (btn) btn.textContent = loading ? '⏳ Guardando...' : '💾 Guardar Fecha';
}

// ── Admin season selector ──
function selectAdminSeason(btn) {
  adminSeason = btn.dataset.s;
  document.querySelectorAll('.admin-season-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  refreshSavedList();
  clearAdminForm();
}

function clearAdminForm() {
  ['af-num', 'af-monto', 'af-ganadores', 'af-perdedores'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const msg = document.getElementById('admin-save-msg');
  if (msg) msg.style.display = 'none';
}

// ═══════════════════════════════════════════════
//  ADMIN UI — LOGIN (Firebase Auth)
// ═══════════════════════════════════════════════
function showAdmin() {
  document.getElementById('admin-login-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('admin-email').focus(), 100);
}

function hideAdminLogin(e) {
  if (e && e.target !== document.getElementById('admin-login-modal')) return;
  _closeAdminLogin();
}

function _closeAdminLogin() {
  document.getElementById('admin-login-modal').classList.remove('open');
  document.getElementById('admin-login-err').style.display = 'none';
  document.getElementById('admin-email').value = '';
  document.getElementById('admin-pass').value = '';
  document.body.style.overflow = '';
}

async function doLogin() {
  const email = document.getElementById('admin-email').value.trim();
  const pass = document.getElementById('admin-pass').value;
  const errEl = document.getElementById('admin-login-err');
  const btn = document.getElementById('admin-login-btn');
  errEl.style.display = 'none';
  btn.textContent = 'Ingresando...';
  btn.disabled = true;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    _closeAdminLogin();
    openAdminPanel();
  } catch (e) {
    errEl.textContent = 'Email o contraseña incorrectos';
    errEl.style.display = 'block';
    document.getElementById('admin-pass').value = '';
  }
  btn.textContent = 'Ingresar';
  btn.disabled = false;
}

async function doLogout() {
  await auth.signOut();
  hideAdminPanel();
}

function openAdminPanel() {
  adminSeason = 's2026a';
  document.querySelectorAll('.admin-season-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.s === 's2026a');
  });
  const userEl = document.getElementById('admin-user-display');
  if (userEl && auth.currentUser) userEl.textContent = auth.currentUser.email;
  refreshSavedList();
  clearAdminForm();
  document.getElementById('admin-panel-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function hideAdminPanel(e) {
  if (e && e.target !== document.getElementById('admin-panel-modal')) return;
  document.getElementById('admin-panel-modal').classList.remove('open');
  document.body.style.overflow = '';
}
