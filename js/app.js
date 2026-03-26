// ═══════════════════════════════════════════════
//  APP INIT
// ═══════════════════════════════════════════════
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 500);
  }
}

// Build all seasons from static data first
buildSeason('s2026a', data2026a, '2026a');
buildSeason('s2025c', data2025c, '2025c');
buildSeason('s2025a', data2025a, '2025a');
buildSeason('s2024',  data2024,  '2024');

// Connect Firebase and overlay with live data
startFirebaseListener();

// Hide loader once initial render is done
// Give Firebase a short window to sync before hiding
setTimeout(hideLoadingOverlay, 1200);

// Escape closes any open modal
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  hideGlobal();
  _closeAdminLogin();
  hideAdminPanel();
});

// Persist login state — if already logged in, keep session silently
auth.onAuthStateChanged(user => {
  const adminBtn = document.querySelector('.admin-icon-btn');
  if (adminBtn) {
    adminBtn.title = user ? `Admin (${user.email})` : 'Admin';
  }
});
