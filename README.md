# 🏪 Simulador de Canibalização de Lojas — Raia Drogasil · BH

Ferramenta de **geomarketing interativa** para simular o impacto de uma nova farmácia na rede Raia Drogasil em Belo Horizonte. Clique em qualquer ponto do mapa para ver quais lojas existentes perderiam clientes e qual seria a origem desses clientes.

![screenshot](https://img.shields.io/badge/status-funcional-1D9E75) ![license](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Como usar

### Opção 1 — GitHub Pages (recomendado)
1. Faça o fork deste repositório
2. Vá em **Settings → Pages → Branch: main → / (root)**
3. Acesse `https://seu-usuario.github.io/farmacia-canibalizacao`

### Opção 2 — Local
```bash
git clone https://github.com/seu-usuario/farmacia-canibalizacao.git
cd farmacia-canibalizacao

# Qualquer servidor HTTP funciona:
npx serve .
# ou
python3 -m http.server 8080
```
Abra `http://localhost:8080` no browser.

> ⚠️ **Não abra o `index.html` direto pelo sistema de arquivos** (`file://`). A Overpass API requer CORS, que só funciona via HTTP.

---

## 🗺 Funcionalidades

| Recurso | Descrição |
|---|---|
| **Mapa real** | OpenStreetMap via Leaflet.js |
| **Lojas em tempo real** | Overpass API (OpenStreetMap) — busca lojas Droga Raia e Drogasil em BH |
| **Fallback offline** | 18 lojas geocodificadas manualmente como backup |
| **Camada de renda** | Renda per capita por bairro (IBGE Censo 2010) com gradiente de cores |
| **Concorrentes** | Exibe todas as farmácias concorrentes no mapa |
| **Modelo de Huff** | Simula canibalização com distâncias reais (haversine) |
| **Gráfico de barras** | Ranking de lojas mais impactadas |
| **Gráfico donut** | Origem dos clientes da nova loja (rede própria vs concorrentes) |
| **Controles** | Raio de influência ajustável (200m–1500m) e peso de tamanho |

---

## 🧮 Modelo de Huff

O [Modelo de Huff (1963)](https://en.wikipedia.org/wiki/Huff_model) é um modelo gravitacional clássico de geomarketing:

```
P(ij) = [A(j) / D(ij)^λ] / Σ[A(k) / D(ik)^λ]
```

Onde:
- `P(ij)` = probabilidade do consumidor `i` escolher a loja `j`
- `A(j)` = atratividade da loja (tamanho × peso configurável)
- `D(ij)` = distância em metros (fórmula haversine)
- `λ = 2` = sensibilidade à distância

A simulação amostra uma grade de pontos sobre BH, calcula o delta de market-share antes/depois da nova loja, e distribui os clientes capturados proporcionalmente.

---

## 📁 Estrutura

```
farmacia-canibalizacao/
├── index.html          # Estrutura HTML principal
├── css/
│   └── style.css       # Estilos — design plano, responsivo
├── js/
│   ├── data.js         # Dados estáticos: renda IBGE + fallback de lojas
│   ├── huff.js         # Modelo de Huff + cálculo de canibalização
│   ├── map.js          # Leaflet: camadas, marcadores, controles visuais
│   ├── charts.js       # Atualização dos gráficos (barra + donut)
│   └── app.js          # Orquestrador principal + Overpass API
└── README.md
```

---

## 📊 Fontes de Dados

| Dado | Fonte | Licença |
|---|---|---|
| Localização das farmácias | [OpenStreetMap](https://www.openstreetmap.org) via [Overpass API](https://overpass-api.de) | ODbL |
| Tiles do mapa | OpenStreetMap contributors | ODbL |
| Renda por bairro | [IBGE Censo Demográfico 2010](https://www.ibge.gov.br) | Dados públicos |

---

## 🔧 Personalização

### Trocar a cidade
Em `js/app.js`, altere o `BH_BBOX` para o bounding box da sua cidade:
```js
const BH_BBOX = '-20.07,-44.10,-19.78,-43.82'; // Sul,Oeste,Norte,Leste
```
E em `js/map.js`, altere o centro do mapa:
```js
map = L.map('map').setView([-23.550, -46.633], 13); // São Paulo
```

### Trocar a rede de farmácias
Em `js/app.js`, altere o regex na query da Overpass API:
```js
node["name"~"Pague Menos",i]["amenity"="pharmacy"](${BH_BBOX});
```

### Ajustar os dados de renda
Em `js/data.js`, edite o array `BAIRROS_RENDA` com os valores do IBGE para sua cidade.

---

## 📝 Limitações

- O modelo de Huff é uma **simplificação** — não considera barreiras físicas (rios, viadutos), tempo de deslocamento real, fidelidade à marca, etc.
- Os dados de renda são do **Censo 2010** — valores desatualizados. Para uso profissional, atualize com o Censo 2022.
- O tamanho das lojas é estimado (não há dado público oficial por unidade).
- Estimativas de clientes são ilustrativas.

---

## 📄 Licença

MIT — use livremente para fins educacionais e comerciais.
