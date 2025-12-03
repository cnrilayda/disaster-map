// ====== Yardımcı ======
const qs = (sel) => document.querySelector(sel);
const $status = qs('#status');

function setStatus(msg){
  $status.textContent = msg || '';
}

// Deprem renk skalası (magnitüd -> renk)
function magColor(m){
  if (m >= 6) return '#b30000';
  if (m >= 5) return '#d7301f';
  if (m >= 4) return '#ef6548';
  if (m >= 3) return '#fc8d59';
  if (m >= 2) return '#fdbb84';
  return '#fdd49e';
}

// Küçük renkli nokta ikonu (cluster edilebilir)
function dotIcon(hex){
  return L.divIcon({
    className: 'dot-icon',
    html: `<span style="
      display:inline-block;width:12px;height:12px;border-radius:50%;
      background:${hex};border:1px solid rgba(255,255,255,.6);
      box-shadow:0 0 0 2px rgba(0,0,0,.25);"></span>`,
    iconSize: [12,12]
  });
}

// Tarihi okunur yap
function fmtDate(d){
  try{
    return new Date(d).toLocaleString();
  }catch{ return d }
}

// ====== Harita ======
const map = L.map('map', {
  worldCopyJump: true,
  preferCanvas: true
}).setView([20, 0], 2);

// OSM taban katmanı
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 7,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Katman grupları
const quakeCluster = L.markerClusterGroup({ disableClusteringAtZoom: 6 });
const fireCluster  = L.markerClusterGroup({ disableClusteringAtZoom: 6 });
const stormCluster = L.markerClusterGroup({ disableClusteringAtZoom: 6 });

// Layer toggle kontrolleri
qs('#toggle-quakes').addEventListener('change', e=>{
  if(e.target.checked) map.addLayer(quakeCluster); else map.removeLayer(quakeCluster);
});
qs('#toggle-fires').addEventListener('change', e=>{
  if(e.target.checked) map.addLayer(fireCluster); else map.removeLayer(fireCluster);
});
qs('#toggle-storms').addEventListener('change', e=>{
  if(e.target.checked) map.addLayer(stormCluster); else map.removeLayer(stormCluster);
});

// Varsayılan açık
map.addLayer(quakeCluster);
map.addLayer(fireCluster);
map.addLayer(stormCluster);

// ====== Chart.js (magnitüd histogram) ======
const ctx = document.getElementById('magChart');
let magChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['0–1','1–2','2–3','3–4','4–5','5–6','6+'],
    datasets: [{
      label: 'Deprem adedi',
      data: [0,0,0,0,0,0,0]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#e8ecf1' } },
      y: { ticks: { color: '#e8ecf1' } }
    }
  }
});

function updateMagChart(mags){
  const bins = [0,0,0,0,0,0,0];
  mags.forEach(m=>{
    if (m < 1) bins[0]++; else
    if (m < 2) bins[1]++; else
    if (m < 3) bins[2]++; else
    if (m < 4) bins[3]++; else
    if (m < 5) bins[4]++; else
    if (m < 6) bins[5]++; else bins[6]++;
  });
  magChart.data.datasets[0].data = bins;
  magChart.update();
}

// ====== Veri çekme (USGS Depremler) ======
async function loadQuakes(range='day'){
  // USGS: all_day/week/month
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${range}.geojson`;
  setStatus(`Depremler yükleniyor (${range})...`);
  quakeCluster.clearLayers();
  const mags = [];

  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`USGS ${res.status}`);
    const gj = await res.json();

    gj.features.forEach(f=>{
      const [lon, lat, depth] = f.geometry.coordinates;
      const m = f.properties.mag ?? 0;
      const place = f.properties.place || 'Bilinmiyor';
      const time = f.properties.time ? new Date(f.properties.time) : null;
      const url = f.properties.url || f.properties.detail || '#';

      const marker = L.marker([lat, lon], { icon: dotIcon(magColor(m)) });
      marker.bindPopup(`
        <div>
          <strong>Deprem</strong><br/>
          <b>Magnitüd:</b> ${m?.toFixed?.(1) ?? '—'}<br/>
          <b>Derinlik:</b> ${depth ?? '—'} km<br/>
          <b>Yer:</b> ${place}<br/>
          <b>Zaman:</b> ${time ? time.toLocaleString() : '—'}<br/>
          <a href="${url}" target="_blank" rel="noopener">USGS detay</a>
        </div>
      `);
      quakeCluster.addLayer(marker);
      if (typeof m === 'number') mags.push(m);
    });

    updateMagChart(mags);
    setStatus(`Deprem: ${mags.length} olay`);
  }catch(err){
    console.error(err);
    setStatus('Deprem verisi yüklenemedi.');
  }
}

// ====== Veri çekme (NASA EONET: Yangınlar & Fırtınalar) ======
// EONET GeoJSON: category=wildfires | severeStorms, status=open, days=N
async function loadEONET(category='wildfires', days=30){
  const url = `https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=${category}&status=open&days=${days}`;
  const targetCluster = category === 'wildfires' ? fireCluster : stormCluster;
  const label = category === 'wildfires' ? 'Yangın' : 'Fırtına';
  setStatus(`${label} verisi yükleniyor...`);
  targetCluster.clearLayers();

  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`EONET ${res.status}`);
    const gj = await res.json();

    gj.features.forEach(f=>{
      // EONET geojson: Point veya Polygon olabilir; Point ise coordinates=[lon,lat]
      let lat=null, lon=null;
      if (f.geometry && f.geometry.type === 'Point'){
        [lon, lat] = f.geometry.coordinates;
      } else if (f.geometry && f.geometry.type === 'Polygon'){
        // Poligonun ilk noktasını kullan (basit gösterim)
        [lon, lat] = f.geometry.coordinates?.[0]?.[0] || [null,null];
      }
      if (lat==null || lon==null) return;

      const title = f.properties.title || label;
      const link = f.properties.link || '#';
      const date = f.properties['closed'] || f.properties['date'] || f.properties['edate'] || null;

      const color = category === 'wildfires' ? '#ff6b6b' : '#64b5f6';
      const marker = L.marker([lat, lon], { icon: dotIcon(color) });
      marker.bindPopup(`
        <div>
          <strong>${label}</strong><br/>
          <b>Başlık:</b> ${title}<br/>
          <b>Tarih:</b> ${date ? fmtDate(date) : '—'}<br/>
          <a href="${link}" target="_blank" rel="noopener">Kaynak / detay</a>
        </div>
      `);
      targetCluster.addLayer(marker);
    });

    setStatus(`${label}: ${targetCluster.getLayers().length} olay`);
  }catch(err){
    console.error(err);
    setStatus(`${label} verisi yüklenemedi.`);
  }
}

// ====== UI & Başlat ======
const rangeButtons = [...document.querySelectorAll('#quake-range .chip')];
rangeButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    rangeButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const r = btn.dataset.range;
    loadQuakes(r);
  });
});

qs('#refresh').addEventListener('click', ()=>{
  const activeRange = document.querySelector('#quake-range .chip.active')?.dataset.range || 'day';
  const days = parseInt(qs('#eonet-days').value, 10) || 30;
  loadQuakes(activeRange);
  loadEONET('wildfires', days);
  loadEONET('severeStorms', days);
});

// İlk yükleme
loadQuakes('day');
loadEONET('wildfires', 30);
loadEONET('severeStorms', 30);
