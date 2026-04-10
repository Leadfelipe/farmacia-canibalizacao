/**
 * huff.js
 * Implementação do Modelo de Huff para análise de canibalização de mercado.
 *
 * O Modelo de Huff (1963) é um modelo gravitacional de geomarketing que estima
 * a probabilidade de um consumidor visitar uma loja com base em:
 *   - Atratividade da loja (tamanho, serviços)
 *   - Distância do consumidor à loja
 *
 * Fórmula: P(ij) = [A(j) / D(ij)^λ] / Σ[A(k) / D(ik)^λ]
 * Onde:
 *   P(ij) = probabilidade do consumidor i visitar a loja j
 *   A(j)  = atratividade da loja j
 *   D(ij) = distância do consumidor i à loja j
 *   λ     = parâmetro de sensibilidade à distância (aqui = 2)
 */

const HUFF_LAMBDA = 2; // sensibilidade à distância

/**
 * Calcula distância haversine em metros entre dois pontos lat/lng.
 */
function haversineMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calcula o score de Huff de um ponto para uma loja.
 * @param {{lat, lng}} ponto   - consumidor
 * @param {{lat, lng, tamanho}} loja - loja
 * @param {number} pesoTamanho  - multiplicador de atratividade
 */
function huffScore(ponto, loja, pesoTamanho = 3) {
  const dist = haversineMetros(ponto.lat, ponto.lng, loja.lat, loja.lng) || 1;
  const atratividade = loja.tamanho * pesoTamanho;
  return atratividade / Math.pow(dist, HUFF_LAMBDA);
}

/**
 * Simula canibalização ao inserir uma nova loja.
 * Amostra uma grade de pontos dentro do bbox de BH e calcula,
 * para cada ponto, quanto de market-share muda entre o cenário
 * sem e com a nova loja.
 *
 * @param {Array} lojasRD       - lojas existentes da rede RD
 * @param {Array} lojasConcComp - lojas dos concorrentes
 * @param {{lat, lng, tamanho}} novaLoja - loja a simular
 * @param {number} pesoTamanho
 * @returns {{ porLoja: Object, totalRD: number, totalComp: number }}
 */
function simularCanibalizacao(lojasRD, lojasComp, novaLoja, pesoTamanho = 3) {
  const BBOX = { latMin: -20.05, latMax: -19.82, lngMin: -44.08, lngMax: -43.85 };
  const STEP = 0.004; // ~450m por passo

  const fromRD   = Object.fromEntries(lojasRD.map((_, i) => [i, 0]));
  let fromComp   = 0;
  let totalAmostrado = 0;

  for (let lat = BBOX.latMin; lat < BBOX.latMax; lat += STEP) {
    for (let lng = BBOX.lngMin; lng < BBOX.lngMax; lng += STEP) {
      const pt = { lat, lng };

      // Cenário SEM nova loja
      const todasSem = [...lojasRD, ...lojasComp];
      let scoresSem = todasSem.map(l => huffScore(pt, l, pesoTamanho));
      const totalSem = scoresSem.reduce((a, b) => a + b, 0) || 1;
      scoresSem = scoresSem.map(s => s / totalSem);

      // Cenário COM nova loja
      const todasCom = [...lojasRD, ...lojasComp, novaLoja];
      let scoresCom = todasCom.map(l => huffScore(pt, l, pesoTamanho));
      const totalCom = scoresCom.reduce((a, b) => a + b, 0) || 1;
      scoresCom = scoresCom.map(s => s / totalCom);

      const novaShare = scoresCom[todasCom.length - 1];
      if (novaShare < 0.005) continue;

      totalAmostrado += novaShare;

      // Distribui a nova share entre as origens (proporcional ao score sem nova loja)
      lojasRD.forEach((_, i) => {
        fromRD[i] += scoresSem[i] * novaShare;
      });
      lojasComp.forEach((_, i) => {
        fromComp += scoresSem[lojasRD.length + i] * novaShare;
      });
    }
  }

  if (totalAmostrado === 0) return null;

  let totalRD = 0;
  const porLoja = {};
  lojasRD.forEach((_, i) => {
    porLoja[i] = fromRD[i] / totalAmostrado;
    totalRD += porLoja[i];
  });

  return {
    porLoja,
    totalRD,
    totalComp: fromComp / totalAmostrado,
  };
}
