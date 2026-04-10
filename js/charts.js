/**
 * charts.js
 * Atualiza os gráficos de barra e donut com os resultados da simulação.
 */

/**
 * Limpa os gráficos para o estado inicial (sem simulação ativa).
 */
function limparGraficos() {
  document.getElementById('m-stolen').textContent   = '—';
  document.getElementById('m-internal').textContent = '—';
  document.getElementById('m-external').textContent = '—';

  document.getElementById('bar-chart').innerHTML =
    '<div class="chart-empty">Clique no mapa para simular uma nova loja</div>';

  document.getElementById('donut').innerHTML = `
    <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e5e5" stroke-width="14"/>
    <text x="50" y="54" text-anchor="middle" font-size="12" fill="#aaa">—</text>`;

  document.getElementById('donut-legend').innerHTML = 'Simule uma loja clicando no mapa';
  document.getElementById('donut-legend').className = 'donut-legend-empty';
}

/**
 * Atualiza todos os gráficos com o resultado da simulação.
 * @param {{ porLoja, totalRD, totalComp }} resultado
 * @param {Array} lojasRD
 */
function atualizarGraficos(resultado, lojasRD) {
  if (!resultado) { limparGraficos(); return; }

  const { porLoja, totalRD, totalComp } = resultado;

  // ── Métricas
  const clientesEst = Math.round(totalRD * 3500);
  document.getElementById('m-stolen').textContent   = clientesEst.toLocaleString('pt-BR');
  document.getElementById('m-internal').textContent = Math.round(totalRD * 100) + '%';
  document.getElementById('m-external').textContent = Math.round(totalComp * 100) + '%';

  // ── Gráfico de barras
  const sorted = lojasRD
    .map((s, i) => ({ nome: s.nome.replace('Droga Raia - ', '').replace('Drogasil - ', ''), val: porLoja[i] || 0 }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 10);

  const maxVal = Math.max(...sorted.map(s => s.val), 0.001);

  document.getElementById('bar-chart').innerHTML = sorted.map(s => {
    const w   = Math.round((s.val / maxVal) * 100);
    const pct = Math.round(s.val * 100);
    const cor = s.val > 0.15 ? '#D85A30' : s.val > 0.08 ? '#BA7517' : '#1D9E75';
    return `
      <div class="bar-row">
        <div class="bar-label" title="${s.nome}">${s.nome}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${w}%;background:${cor}"></div>
        </div>
        <div class="bar-val">${pct}%</div>
      </div>`;
  }).join('');

  // ── Donut
  const soma     = totalRD + totalComp || 1;
  const intPct   = totalRD / soma;
  const extPct   = 1 - intPct;
  const r        = 35;
  const circ     = 2 * Math.PI * r;
  const offset   = circ / 4;

  document.getElementById('donut').innerHTML = `
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="#D85A30" stroke-width="14"
      stroke-dasharray="${(intPct * circ).toFixed(2)} ${((1 - intPct) * circ).toFixed(2)}"
      stroke-dashoffset="${offset}"/>
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="#1D9E75" stroke-width="14"
      stroke-dasharray="${(extPct * circ).toFixed(2)} ${((1 - extPct) * circ).toFixed(2)}"
      stroke-dashoffset="${(offset - intPct * circ).toFixed(2)}"/>
    <text x="50" y="47" text-anchor="middle" font-size="11" fill="#1a1a18" font-weight="500">
      ${Math.round(intPct * 100)}%
    </text>
    <text x="50" y="58" text-anchor="middle" font-size="9" fill="#73726c">intern.</text>`;

  document.getElementById('donut-legend').className = 'donut-legend';
  document.getElementById('donut-legend').innerHTML = `
    <div class="dl-item"><div class="dl-sq" style="background:#D85A30"></div>Da rede RD: ${Math.round(intPct * 100)}%</div>
    <div class="dl-item"><div class="dl-sq" style="background:#1D9E75"></div>De concorrentes: ${Math.round(extPct * 100)}%</div>
    <div style="margin-top:8px;font-size:10px;color:#aaa">Modelo de Huff (1963)</div>`;
}
