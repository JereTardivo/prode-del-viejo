// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════
function fmtM(v) {
  const abs = Math.abs(v).toLocaleString('es-AR');
  return (v < 0 ? '-' : '') + ' $\u00a0' + abs + ',00';
}

// ═══════════════════════════════════════════════
//  BUILD SEASON — renders all tabs for a season
// ═══════════════════════════════════════════════
function buildSeason(sid, data, prefix) {
  const p = data.participants;
  const sorted = [...p].sort((a, b) => b.saldo - a.saldo);
  const maxAbs = Math.max(...p.map(x => Math.abs(x.saldo)));

  // ── STATS CARDS ──
  const leader = sorted[0];
  const loser = sorted[sorted.length - 1];
  const maxWins = Math.max(...p.map(x => x.primero));
  const topWinners = p.filter(x => x.primero === maxWins);
  const positives = p.filter(x => x.saldo > 0).length;

  const statsEl = document.getElementById(prefix + '-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="scard gold">
        <div class="scard-label">Líder del Torneo</div>
        <div class="scard-val" style="font-size:clamp(14px,2vw,20px);line-height:1.2">${leader.name}</div>
        <div class="scard-sub">${fmtM(leader.saldo)}</div>
      </div>
      <div class="scard red">
        <div class="scard-label">Mayor Pérdida</div>
        <div class="scard-val" style="font-size:clamp(14px,2vw,20px);line-height:1.2">${loser.name}</div>
        <div class="scard-sub">${fmtM(loser.saldo)}</div>
      </div>
      <div class="scard cyan">
        <div class="scard-label">Más Victorias · ${maxWins}x</div>
        <div class="scard-val" style="font-size:clamp(13px,1.8vw,18px);line-height:1.35">${topWinners.map(x => x.name).join('<br>')}</div>
      </div>
      <div class="scard green">
        <div class="scard-label">En Positivo</div>
        <div class="scard-val">${positives}</div>
        <div class="scard-sub">de ${p.length} participantes</div>
      </div>
      <div class="scard gold">
        <div class="scard-label">Fechas Jugadas</div>
        <div class="scard-val">${data.fechas.filter(f => f.g.length > 0 || f.p.length > 0).length}</div>
        <div class="scard-sub">de ${data.fechas.length} totales</div>
      </div>`;
  }

  // ── TOP 5 / BOT 5 ──
  const top5 = sorted.slice(0, 5);
  const bot5 = sorted.slice(-5).reverse();

  const top5El = document.getElementById(prefix + '-top5');
  if (top5El) {
    top5El.innerHTML = top5.map((x, i) => `
      <tr style="animation:fadeIn 0.3s ease both;animation-delay:${0.05 + i * 0.07}s">
        <td><span class="rnum ${['r1', 'r2', 'r3', 'rx', 'rx'][i]}">${i + 1}</span></td>
        <td>${x.name}</td>
        <td><span class="chip chip-g">${fmtM(x.saldo)}</span></td>
        <td><span class="chip chip-y">${x.primero}×</span></td>
      </tr>`).join('');
  }

  const bot5El = document.getElementById(prefix + '-bot5');
  if (bot5El) {
    bot5El.innerHTML = bot5.map((x, i) => `
      <tr style="animation:fadeIn 0.3s ease both;animation-delay:${0.05 + i * 0.07}s">
        <td><span class="rnum rx">${p.length - i}</span></td>
        <td>${x.name}</td>
        <td><span class="chip chip-r">${fmtM(x.saldo)}</span></td>
        <td><span class="chip chip-n">${x.ultimo}×</span></td>
      </tr>`).join('');
  }

  // ── BARS ──
  const barsEl = document.getElementById(prefix + '-bars');
  if (barsEl) {
    barsEl.innerHTML = sorted.map((x, i) => {
      const pct = (Math.abs(x.saldo) / maxAbs) * 100;
      const pos = x.saldo >= 0;
      return `<div class="brow" style="animation-delay:${i * 0.04}s">
        <div class="bname">${x.name}</div>
        <div class="btrack"><div class="bfill ${pos ? 'p' : 'n'}" style="width:${pct}%"></div></div>
        <div class="bval ${pos ? 'p' : 'n'}">${fmtM(x.saldo)}</div>
      </div>`;
    }).join('');
  }

  // ── FECHAS GRID ──
  const fechasEl = document.getElementById(prefix + '-fechas');
  if (fechasEl) {
    fechasEl.innerHTML = data.fechas.map((f, i) => {
      const label = typeof f.num === 'number' ? 'FECHA ' + f.num : f.num.toUpperCase();
      const delay = `animation-delay:${i * 0.05}s`;
      if (!f.g.length && !f.p.length) return `
        <div class="fcard" style="${delay}">
          <div class="fnum">${label}</div>
          <div style="color:var(--muted);font-size:12px;text-align:center;padding:12px 0">Sin datos</div>
        </div>`;
      const gm = data.gmonto[f.num] || 0;
      const fcClass = f.g.length > 1 ? 'fc-multi' : 'fc-win';
      let html = `<div class="fcard ${fcClass}" style="${delay}"><div class="fnum" style="margin-bottom:10px">${label}</div>`;
      if (f.g.length) {
        html += `<div class="fgroup-label g">Ganadores</div>`;
        f.g.forEach(w => {
          const prize = f.g.length > 1 ? gm / f.g.length : gm;
          html += `<div class="wrow"><div class="wdot g"></div><div class="wname">${w}</div><div class="wamt p">+${fmtM(prize)}</div></div>`;
        });
      }
      if (f.p.length) {
        html += `<div style="height:1px;background:var(--border);margin:8px 0"></div>`;
        html += `<div class="fgroup-label r">Perdedores</div>`;
        f.p.forEach(l => {
          html += `<div class="wrow"><div class="wdot r"></div><div class="wname">${l}</div><div class="wamt r">−${fmtM(data.penalidad || 15000)}</div></div>`;
        });
      }
      html += `</div>`;
      return html;
    }).join('');
  }

  // ── FULL TABLE ──
  const ft = document.getElementById(prefix + '-full');
  if (ft && data.rows && data.rows.length) {
    const numF = data.rows[0].f.length;
    const allVals = data.rows.flatMap(r => r.f).filter(v => v < 0);
    const freq = {};
    allVals.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const baseFee = parseFloat(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);
    const fechaLabels = data.fechas.map(f => typeof f.num === 'number' ? `F${f.num}` : String(f.num).substring(0, 7));
    while (fechaLabels.length < numF) fechaLabels.push(`F${fechaLabels.length + 1}`);
    const headers = ['Participante', ...fechaLabels.slice(0, numF), 'TOTAL'];
    ft.innerHTML = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${data.rows.map(r => {
      const total = r.f.reduce((a, b) => a + b, 0);
      const tclass = total > 0 ? 'total-pos' : total < 0 ? 'total-neg' : 'total-neu';
      const cells = r.f.map(v => {
        if (v > 0) return `<td><span class="cv win">+${v}K</span></td>`;
        if (v < baseFee) return `<td><span class="cv big-loss">${v}K</span></td>`;
        if (v === 0) return `<td><span class="cv zero">—</span></td>`;
        return `<td><span class="cv loss">${v}K</span></td>`;
      }).join('');
      return `<tr><td>${r.name}</td>${cells}<td><span class="cv ${tclass}">${total > 0 ? '+' : ''}${total}K</span></td></tr>`;
    }).join('')}</tbody>`;
  }
}

// ═══════════════════════════════════════════════
//  REBUILD ALL SEASONS (called after Firebase sync)
// ═══════════════════════════════════════════════
function rebuildCurrentSeasons() {
  Object.entries(seasonDataMap).forEach(([sid, data]) => {
    const prefix = seasonPrefixMap[sid];
    if (document.getElementById(prefix + '-fechas')) buildSeason(sid, data, prefix);
  });
}

// ═══════════════════════════════════════════════
//  GLOBAL STATS MODAL
// ═══════════════════════════════════════════════
function buildGlobalStats() {
  const allSeasons = [data2026a, data2025c, data2025a, data2024];
  const map = {};

  allSeasons.forEach(season => {
    season.participants.forEach(p => {
      const name = mergeAlias(p.name);
      if (!map[name]) map[name] = { name, saldo: 0, primero: 0, ultimo: 0, seasons: 0 };
      map[name].saldo += p.saldo;
      map[name].primero += p.primero;
      map[name].ultimo += p.ultimo;
      map[name].seasons += 1;
    });
  });

  const players = Object.values(map).sort((a, b) => b.saldo - a.saldo);
  const maxAbs = Math.max(...players.map(x => Math.abs(x.saldo)));
  const maxWins = Math.max(...players.map(x => x.primero));
  const topWinners = players.filter(x => x.primero === maxWins);
  const topLoser = [...players].sort((a, b) => b.ultimo - a.ultimo)[0];

  document.getElementById('global-stats').innerHTML = `
    <div class="scard gold">
      <div class="scard-label">Mayor Saldo Histórico</div>
      <div class="scard-val" style="font-size:clamp(13px,1.8vw,18px);line-height:1.2">${players[0].name}</div>
      <div class="scard-sub">${fmtM(players[0].saldo)}</div>
    </div>
    <div class="scard red">
      <div class="scard-label">Peor Saldo Histórico</div>
      <div class="scard-val" style="font-size:clamp(13px,1.8vw,18px);line-height:1.2">${players[players.length - 1].name}</div>
      <div class="scard-sub">${fmtM(players[players.length - 1].saldo)}</div>
    </div>
    <div class="scard cyan">
      <div class="scard-label">Más Victorias · ${maxWins}x</div>
      <div class="scard-val" style="font-size:clamp(12px,1.6vw,17px);line-height:1.35">${topWinners.map(x => x.name).join('<br>')}</div>
    </div>
    <div class="scard red">
      <div class="scard-label">Más Derrotas · ${topLoser.ultimo}x</div>
      <div class="scard-val" style="font-size:clamp(13px,1.8vw,18px);line-height:1.2">${topLoser.name}</div>
    </div>
    <div class="scard green">
      <div class="scard-label">Participantes</div>
      <div class="scard-val">${players.length}</div>
      <div class="scard-sub">históricos</div>
    </div>`;

  document.getElementById('global-ranking').innerHTML = players.map((x, i) => {
    const tclass = x.saldo > 0 ? 'chip-g' : x.saldo < 0 ? 'chip-r' : 'chip-n';
    return `<tr>
      <td><span class="rnum ${i < 3 ? 'r' + (i + 1) : 'rx'}">${i + 1}</span></td>
      <td>${x.name}</td>
      <td><span class="chip ${tclass}">${fmtM(x.saldo)}</span></td>
      <td><span class="chip chip-n">${x.seasons} temp.</span></td>
    </tr>`;
  }).join('');

  const byWins = [...players].sort((a, b) => b.primero - a.primero || a.ultimo - b.ultimo);
  document.getElementById('global-wins').innerHTML = byWins.map((x, i) => {
    const ratio = x.ultimo === 0 ? '∞' : (x.primero / x.ultimo).toFixed(1);
    return `<tr>
      <td><span class="rnum ${i < 3 ? 'r' + (i + 1) : 'rx'}">${i + 1}</span></td>
      <td>${x.name}</td>
      <td><span class="chip chip-y">${x.primero}×</span></td>
      <td><span class="chip chip-r">${x.ultimo}×</span></td>
      <td><span class="chip chip-n">${ratio}</span></td>
    </tr>`;
  }).join('');

  document.getElementById('global-bars').innerHTML = players.map(x => {
    const pct = (Math.abs(x.saldo) / maxAbs) * 100;
    const pos = x.saldo >= 0;
    return `<div class="brow">
      <div class="bname">${x.name}</div>
      <div class="btrack"><div class="bfill ${pos ? 'p' : 'n'}" style="width:${pct}%"></div></div>
      <div class="bval ${pos ? 'p' : 'n'}">${fmtM(x.saldo)}</div>
    </div>`;
  }).join('');
}

function showGlobal() {
  buildGlobalStats();
  document.getElementById('global-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function hideGlobal(e) {
  if (e && e.target !== document.getElementById('global-modal')) return;
  document.getElementById('global-modal').classList.remove('open');
  document.body.style.overflow = '';
}
