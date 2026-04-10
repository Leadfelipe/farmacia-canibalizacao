/**
 * data.js
 * Dados estáticos: renda por bairro (IBGE Censo 2010) e
 * fallback de lojas caso a Overpass API esteja indisponível.
 */

// Renda per capita aproximada por bairro de BH (R$/mês, Censo 2010)
// Fonte: IBGE Censo Demográfico 2010 - Agregados por Setor Censitário
const BAIRROS_RENDA = [
  { nome: "Savassi",           renda: 4200, lat: -19.938, lng: -43.938, raio_graus: 0.012 },
  { nome: "Lourdes",           renda: 5100, lat: -19.942, lng: -43.943, raio_graus: 0.010 },
  { nome: "Funcionários",      renda: 4800, lat: -19.935, lng: -43.932, raio_graus: 0.010 },
  { nome: "Belvedere",         renda: 6200, lat: -19.975, lng: -43.940, raio_graus: 0.013 },
  { nome: "Mangabeiras",       renda: 5800, lat: -19.973, lng: -43.930, raio_graus: 0.011 },
  { nome: "Serra",             renda: 3600, lat: -19.946, lng: -43.928, raio_graus: 0.012 },
  { nome: "Sion",              renda: 4400, lat: -19.958, lng: -43.944, raio_graus: 0.010 },
  { nome: "Buritis",           renda: 3200, lat: -19.979, lng: -43.969, raio_graus: 0.016 },
  { nome: "Luxemburgo",        renda: 3800, lat: -19.956, lng: -43.967, raio_graus: 0.010 },
  { nome: "Pampulha",          renda: 2800, lat: -19.868, lng: -43.969, raio_graus: 0.020 },
  { nome: "Cidade Nova",       renda: 2200, lat: -19.906, lng: -43.939, raio_graus: 0.014 },
  { nome: "Centro",            renda: 1800, lat: -19.920, lng: -43.938, raio_graus: 0.014 },
  { nome: "Floresta",          renda: 2100, lat: -19.910, lng: -43.927, raio_graus: 0.010 },
  { nome: "Santa Efigênia",    renda: 1900, lat: -19.914, lng: -43.942, raio_graus: 0.010 },
  { nome: "Colégio Batista",   renda: 2600, lat: -19.931, lng: -43.920, raio_graus: 0.009 },
  { nome: "Padre Eustáquio",   renda: 2400, lat: -19.921, lng: -43.967, raio_graus: 0.012 },
  { nome: "Carlos Prates",     renda: 2000, lat: -19.916, lng: -43.960, raio_graus: 0.010 },
  { nome: "Lagoinha",          renda: 1400, lat: -19.907, lng: -43.948, raio_graus: 0.010 },
  { nome: "Venda Nova",        renda: 1200, lat: -19.862, lng: -43.940, raio_graus: 0.018 },
  { nome: "Barreiro",          renda: 1100, lat: -20.002, lng: -44.028, raio_graus: 0.020 },
  { nome: "Nordeste de BH",    renda: 1000, lat: -19.850, lng: -43.910, raio_graus: 0.018 },
  { nome: "Betânia",           renda: 1600, lat: -19.960, lng: -44.010, raio_graus: 0.015 },
  { nome: "Santa Mônica",      renda: 1700, lat: -19.870, lng: -43.953, raio_graus: 0.014 },
  { nome: "Glória",            renda: 2000, lat: -19.980, lng: -43.990, raio_graus: 0.013 },
  { nome: "Cinquentenário",    renda: 2300, lat: -19.963, lng: -43.956, raio_graus: 0.012 },
  { nome: "Nova Granada",      renda: 3100, lat: -19.970, lng: -43.978, raio_graus: 0.013 },
  { nome: "Jardim Atlântico",  renda: 2700, lat: -19.876, lng: -43.982, raio_graus: 0.014 },
  { nome: "Itatiaia",          renda: 2500, lat: -19.948, lng: -43.996, raio_graus: 0.011 },
];

// Fallback: lojas reais geocodificadas manualmente a partir de endereços públicos
// (usado quando a Overpass API estiver indisponível)
const FALLBACK_RD = [
  { lat: -19.9200, lng: -43.9378, nome: "Droga Raia - Rua da Bahia",           cor: '#1D9E75', label: 'RD', tamanho: 4 },
  { lat: -19.9377, lng: -43.9383, nome: "Droga Raia - Savassi",                cor: '#1D9E75', label: 'RD', tamanho: 5 },
  { lat: -19.9147, lng: -43.9670, nome: "Droga Raia - Padre Eustáquio",        cor: '#1D9E75', label: 'RD', tamanho: 3 },
  { lat: -19.9090, lng: -43.9270, nome: "Droga Raia - Floresta",               cor: '#1D9E75', label: 'RD', tamanho: 3 },
  { lat: -19.9786, lng: -43.9400, nome: "Droga Raia - Belvedere",              cor: '#1D9E75', label: 'RD', tamanho: 4 },
  { lat: -19.9556, lng: -43.9680, nome: "Droga Raia - Luxemburgo",             cor: '#1D9E75', label: 'RD', tamanho: 3 },
  { lat: -19.9050, lng: -43.9400, nome: "Drogasil - Cidade Nova",              cor: '#185fa5', label: 'DS', tamanho: 3 },
  { lat: -19.8680, lng: -43.9690, nome: "Drogasil - Pampulha",                 cor: '#185fa5', label: 'DS', tamanho: 4 },
  { lat: -19.9620, lng: -44.0100, nome: "Droga Raia - Betânia",                cor: '#1D9E75', label: 'RD', tamanho: 3 },
  { lat: -19.8620, lng: -43.9400, nome: "Drogasil - Venda Nova",               cor: '#185fa5', label: 'DS', tamanho: 3 },
  { lat: -19.9160, lng: -43.9600, nome: "Droga Raia - Av. Francisco Sales",    cor: '#1D9E75', label: 'RD', tamanho: 4 },
  { lat: -19.9708, lng: -43.9780, nome: "Droga Raia - Nova Granada",           cor: '#1D9E75', label: 'RD', tamanho: 3 },
  { lat: -19.9480, lng: -43.9970, nome: "Droga Raia - Itatiaia",               cor: '#1D9E75', label: 'RD', tamanho: 3 },
  { lat: -20.0020, lng: -44.0280, nome: "Drogasil - Barreiro",                 cor: '#185fa5', label: 'DS', tamanho: 4 },
  { lat: -19.9208, lng: -43.9200, nome: "Droga Raia - Colégio Batista",        cor: '#1D9E75', label: 'RD', tamanho: 3 },
  { lat: -19.9316, lng: -43.9540, nome: "Droga Raia - Av. do Contorno",        cor: '#1D9E75', label: 'RD', tamanho: 4 },
  { lat: -19.9440, lng: -43.9200, nome: "Drogasil - Serra",                    cor: '#185fa5', label: 'DS', tamanho: 3 },
  { lat: -19.8720, lng: -43.9530, nome: "Droga Raia - Santa Mônica",           cor: '#1D9E75', label: 'RD', tamanho: 3 },
];

const FALLBACK_COMP = [
  { lat: -19.9370, lng: -43.9250, nome: "Pague Menos - Savassi",        tamanho: 3 },
  { lat: -19.9180, lng: -43.9490, nome: "Farmácia Guararapes",          tamanho: 2 },
  { lat: -19.8700, lng: -43.9700, nome: "Drogaria São João - Pampulha", tamanho: 3 },
  { lat: -19.9800, lng: -43.9900, nome: "Pague Menos - Buritis",        tamanho: 3 },
  { lat: -19.9050, lng: -43.9600, nome: "Farmácia Popular - Lagoinha",  tamanho: 2 },
  { lat: -19.9600, lng: -43.9200, nome: "Drogaria Araujo - Serra",      tamanho: 3 },
  { lat: -20.0020, lng: -44.0100, nome: "Pague Menos - Barreiro",       tamanho: 3 },
  { lat: -19.9200, lng: -43.9550, nome: "Farmácia Pacheco - Centro",    tamanho: 2 },
];
