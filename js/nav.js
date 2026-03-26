// ═══════════════════════════════════════════════
//  TAB NAVIGATION
// ═══════════════════════════════════════════════
function showSeason(id, btn) {
  document.querySelectorAll('.season-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  document.querySelector('.cup-sub').textContent =
    (cupMap[id] || id).toUpperCase();
}

function showITab(btn, seasonId, tab) {
  const panel = document.getElementById(seasonId);
  panel.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
  panel.querySelectorAll('.itab-panel').forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });
  btn.classList.add('active');
  const target = panel.querySelector(`.itab-panel[data-tab="${tab}"]`);
  if (target) { target.style.display = 'block'; target.classList.add('active'); }
}
