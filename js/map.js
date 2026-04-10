/**
 * map.js
 * Inicialização do mapa Leaflet + camadas de renda e marcadores de lojas.
 */

let map;
let rdCircles      = [];
let rendaCamadas   = [];
let novoMarcador   = null;
let novoCirculo    = null;

// Estado global (lido/escrito por app.js)
let lojasRD   = [];
let lojasComp = [];
let radiusM   = 600;
let pesoTam   = 3;
let mostrarRenda = true;
let mostrarComp  = true;

/**
 * Interpola duas cores hex.
 */
function lerpHex(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const r = Math.round(((ah >> 16) & 0xff) + (((bh >> 16) & 0xff) - ((ah >> 16) & 0xff)) * t);
  const g = Math.round(((ah >>  8) & 0xff) + (((bh >>  8) & 0xff) - ((ah >>  8) & 0xff)) * t);
  const bl= Math.round(( ah        & 0xff) + (( bh        & 0xff) - ( ah        & 0xff)) * t);
  return '#' + [r, g, bl].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Retorna cor para um valor de renda.
 */
function corRenda(renda) {
  const stops = [
    [900,  '#4d1600'],
    [1500, '#993c1d'],
    [2200, '#d85a30'],
    [3000, '#efca80'],
    [4000, '#b8dfa8'],
    [5000, '#5dca87'],
    [6500, '#0f6e56'],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (renda <= stops[i][0]) {
      const t = (renda - stops[i-1][0]) / (stops[i][0] - stops[i-1][0]);
      return lerpHex(stops[i-1][1], stops[i][1], t);
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * Desenha a barra de gradiente da legenda de renda.
 */
function desenharBarraRenda() {
  const bar = document.getElementById('renda-bar');
  bar.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const d = document.createElement('div');
    d.style.flex = '1';
    d.style.background = corRenda(900 + (i / 23) * (6500 - 900));
    bar.appendChild(d);
  }
}

/**
 * Desenha/remove a camada de renda dos bairros.
 */
function desenharCamadaRenda() {
  rendaCamadas.forEach(l => map.removeLayer(l));
  rendaCamadas = [];
  if (!mostrarRenda) return;

  BAIRROS_RENDA.forEach(b => {
    const cor = corRenda(b.renda);
    const raioMetros = b.raio_graus * 111000;
    const circle = L.circle([b.lat, b.lng], {
      radius: raioMetros,
      color: cor,
      fillColor: cor,
      fillOpacity: 0.32,
      weight: 0.5,
    });
    circle.bindTooltip(
      `<b>${b.nome}</b><br>Renda per capita: R$ ${b.renda.toLocaleString('pt-BR')}/mês<br><small>IBGE Censo 2010</small>`,
      { sticky: true }
    );
    circle.addTo(map);
    rendaCamadas.push(circle);
  });
}

/**
 * Cria ícone SVG para marcador de loja.
 */
function criarIcone(cor, label, tamanho) {
  const sz = 20 + tamanho * 2;
  return L.divIcon({
    html: `<div style="
      background:${cor};color:#fff;
      border:2px solid #fff;border-radius:50%;
      width:${sz}px;height:${sz}px;
      display:flex;align-items:center;justify-content:center;
      font-size:8px;font-weight:700;
      box-shadow:0 1px 3px rgba(0,0,0,0.3)
    ">${label}</div>`,
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  });
}

/**
 * Desenha todas as lojas no mapa.
 */
function desenharLojas() {
  rdCircles.forEach(c => map.removeLayer(c));
  rdCircles = [];

  lojasRD.forEach(s => {
    const raio = radiusM * (0.65 + s.tamanho * 0.09);
    const c = L.circle([s.lat, s.lng], {
      radius: raio,
      color: s.cor,
      fillColor: s.cor,
      fillOpacity: 0.09,
      weight: 1,
    }).addTo(map);
    rdCircles.push(c);

    L.marker([s.lat, s.lng], { icon: criarIcone(s.cor, s.label, s.tamanho) })
      .addTo(map)
      .bindPopup(`<b>${s.nome}</b><br><span style="color:#666">Rede RD (Raia/Drogasil)</span>`);
  });

  if (mostrarComp) {
    lojasComp.slice(0, 80).forEach(c => {
      const icon = L.divIcon({
        html: `<div style="
          background:#888;color:#fff;
          border:1.5px solid #fff;border-radius:50%;
          width:14px;height:14px;
          display:flex;align-items:center;justify-content:center;
          font-size:7px;font-weight:700;
          box-shadow:0 1px 2px rgba(0,0,0,0.2)
        ">C</div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([c.lat, c.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${c.nome}</b><br><span style="color:#888">Concorrente</span>`);
    });
  }
}

/**
 * Atualiza raios dos círculos existentes.
 */
function atualizarRaios() {
  rdCircles.forEach((c, i) => {
    c.setRadius(radiusM * (0.65 + lojasRD[i].tamanho * 0.09));
  });
  if (novoCirculo) novoCirculo.setRadius(radiusM);
}

/**
 * Posiciona o marcador da nova loja e dispara a simulação.
 */
function posicionarNovaLoja(latlng) {
  if (novoMarcador) map.removeLayer(novoMarcador);
  if (novoCirculo)  map.removeLayer(novoCirculo);

  novoCirculo = L.circle(latlng, {
    radius: radiusM,
    color: '#D85A30',
    fillColor: '#D85A30',
    fillOpacity: 0.10,
    weight: 2,
    dashArray: '7 4',
  }).addTo(map);

  const icon = L.divIcon({
    html: `<div style="
      background:#D85A30;color:#fff;
      border:2.5px solid #fff;border-radius:50%;
      width:30px;height:30px;
      display:flex;align-items:center;justify-content:center;
      font-size:8px;font-weight:700;
      box-shadow:0 1px 4px rgba(0,0,0,0.3)
    ">NOVA</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
  novoMarcador = L.marker(latlng, { icon })
    .addTo(map)
    .bindPopup('<b>Nova loja simulada</b><br>Clique para reposicionar');

  document.getElementById('map-hint').classList.add('hidden');
}

/**
 * Remove a nova loja do mapa.
 */
function removerNovaLoja() {
  if (novoMarcador) { map.removeLayer(novoMarcador); novoMarcador = null; }
  if (novoCirculo)  { map.removeLayer(novoCirculo);  novoCirculo  = null; }
  document.getElementById('map-hint').classList.remove('hidden');
}

/**
 * Inicializa o mapa.
 */
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([-19.917, -43.934], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  desenharCamadaRenda();
  desenharBarraRenda();

  map.on('click', e => {
    posicionarNovaLoja(e.latlng);
    // Dispara simulação via app.js
    onMapClick(e.latlng);
  });
}
