/**
 * app.js
 * Orquestra: inicializa o mapa, carrega lojas via Overpass API,
 * e conecta os controles com o modelo de Huff e os gráficos.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const BH_BBOX      = '-20.07,-44.10,-19.78,-43.82';

// ── Carrega lojas via Overpass API (OpenStreetMap)
async function carregarLojas() {
  setStatus('Buscando lojas Raia/Drogasil no OpenStreetMap...');

  const queryRD = `[out:json][timeout:30];
(
  node["name"~"Droga Raia|Drogasil",i]["amenity"="pharmacy"](${BH_BBOX});
  way["name"~"Droga Raia|Drogasil",i]["amenity"="pharmacy"](${BH_BBOX});
  node["brand"~"Droga Raia|Drogasil",i](${BH_BBOX});
  way["brand"~"Droga Raia|Drogasil",i](${BH_BBOX});
  node["operator"~"Raia Drogasil",i](${BH_BBOX});
);
out center;`;

  const queryComp = `[out:json][timeout:30];
(
  node["amenity"="pharmacy"](${BH_BBOX});
);
out center 120;`;

  try {
    const [resRD, resComp] = await Promise.all([
      post(OVERPASS_URL, queryRD),
      post(OVERPASS_URL, queryComp),
    ]);

    // Processa RD
    const vistos = new Set();
    resRD.elements.forEach(el => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) return;
      const chave = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (vistos.has(chave)) return;
      vistos.add(chave);
      const nome = el.tags?.name ?? el.tags?.brand ?? 'RD Farmácia';
      const isDs = nome.toLowerCase().includes('drogasil');
      lojasRD.push({
        lat, lng,
        nome,
        cor:    isDs ? '#185fa5' : '#1D9E75',
        label:  isDs ? 'DS'      : 'RD',
        tamanho: 3,
      });
    });

    // Processa concorrentes (remove duplicatas com RD)
    const chavesRD = new Set(lojasRD.map(s => `${s.lat.toFixed(3)},${s.lng.toFixed(3)}`));
    resComp.elements.forEach(el => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!lat || !lng) return;
      const chave = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      if (chavesRD.has(chave)) return;
      const nome = el.tags?.name ?? 'Farmácia';
      if (/raia|drogasil/i.test(nome)) return;
      lojasComp.push({ lat, lng, nome, tamanho: 2 });
    });

    if (lojasRD.length === 0) usarFallback('Nenhuma loja encontrada na API.');
    else {
      setStatus(`${lojasRD.length} lojas RD · ${lojasComp.length} concorrentes encontrados. Clique para simular.`);
      document.getElementById('m-total').textContent = lojasRD.length;
      desenharLojas();
    }
  } catch (err) {
    usarFallback('API indisponível — usando dados locais.');
  }
}

function usarFallback(motivo) {
  lojasRD   = FALLBACK_RD.map(s => ({ ...s }));
  lojasComp = FALLBACK_COMP.map(c => ({ ...c }));
  setStatus(`${motivo} Clique no mapa para simular.`);
  document.getElementById('m-total').textContent = lojasRD.length;
  desenharLojas();
}

async function post(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

// ── Callback do clique no mapa (chamado por map.js)
function onMapClick(latlng) {
  const novaLoja = { lat: latlng.lat, lng: latlng.lng, tamanho: 4 };
  const resultado = simularCanibalizacao(lojasRD, lojasComp, novaLoja, pesoTam);
  atualizarGraficos(resultado, lojasRD);
}

// ── Controles
document.getElementById('radius-sl').addEventListener('input', function () {
  radiusM = parseInt(this.value);
  document.getElementById('radius-lbl').textContent = radiusM + 'm';
  atualizarRaios();
});

document.getElementById('weight-sl').addEventListener('input', function () {
  pesoTam = parseInt(this.value);
  const labels = ['', 'baixo', 'méd-baixo', 'médio', 'méd-alto', 'alto'];
  document.getElementById('weight-lbl').textContent = labels[pesoTam];
  // Re-executa simulação se houver loja posicionada
  if (novoMarcador) onMapClick(novoMarcador.getLatLng());
});

document.getElementById('btn-renda').addEventListener('click', function () {
  mostrarRenda = !mostrarRenda;
  this.classList.toggle('active', mostrarRenda);
  desenharCamadaRenda();
});

document.getElementById('btn-comp').addEventListener('click', function () {
  mostrarComp = !mostrarComp;
  this.classList.toggle('active', mostrarComp);
  desenharLojas();
});

document.getElementById('btn-reset').addEventListener('click', function () {
  removerNovaLoja();
  limparGraficos();
});

// ── Boot
window.addEventListener('load', () => {
  // Marca botões como ativos por padrão
  document.getElementById('btn-renda').classList.add('active');
  document.getElementById('btn-comp').classList.add('active');

  initMap();
  carregarLojas();
});
