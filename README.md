# 🌍 Global Disaster Map  
Real-time Worldwide **Earthquake**, **Wildfire**, and **Severe Storm** Tracking  
(USGS Earthquake GeoJSON + NASA EONET API)

This project is an interactive web application that visualizes real-time earthquakes, wildfires, and severe storms across the world.  
Data is fetched live from **USGS Earthquake GeoJSON** and **NASA EONET v3** APIs.  
The project is fully frontend-based and built with HTML, CSS, and JavaScript.

---

## 🚀 Features

### 🌎 Interactive Global Map
- Leaflet.js map with smooth panning and zooming  
- MarkerCluster for grouping markers  
- Detailed popups for every event  

### 🌋 Real-time Earthquakes (USGS)
- Color scale based on magnitude  
- Displays location, depth, time, and USGS detail link  
- Time range filters:
  - Last 24 hours  
  - Last 7 days  
  - Last 30 days  

### 🔥 Active Wildfires (NASA EONET)
- Open wildfire events retrieved via EONET  
- 7 / 14 / 30 / 60 day filter  

### 🌪️ Severe Storms (NASA EONET)
- Severe storm event markers  
- Clustered view for clarity  

### 📊 Earthquake Magnitude Histogram
A dynamic magnitude distribution chart powered by Chart.js.

0–1
1–2
2–3
3–4
4–5
5–6
6+

yaml
Kodu kopyala

### 🎛️ UI Controls
- Toggle layers (Earthquakes / Wildfires / Storms)  
- Select earthquake time window  
- Select wildfire/storm day range  
- Refresh button  
- Live status indicator  

---

## 🛠️ Technologies Used

| Area | Technology |
|------|------------|
| Map | Leaflet.js, MarkerCluster |
| Charts | Chart.js 4.x |
| Styling | Vanilla CSS |
| Logic | JavaScript (Fetch API) |
| Data Sources | USGS, NASA EONET |

---

## 📁 Project Structure

/ (root)
│── index.html → Main UI
│── styles.css → Styling
│── app.js → Logic, API calls, map & chart setup

yaml
Kodu kopyala

---

## 🔗 Data Sources

### USGS Earthquake GeoJSON  
https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php

### NASA EONET v3  
https://eonet.gsfc.nasa.gov/api/v3/events

---

## ▶️ Running the Project

This project requires **no backend**.  
It runs directly in the browser.

### Easiest ways:
1. Double-click `index.html` → Opens in your browser.  
2. (Recommended) VS Code → Right-click → **Open with Live Server**.  

---

## 🌟 Planned Features (To-Do)

- [ ] Depth-based earthquake icons  
- [ ] Improved mobile layout  
- [ ] Search & filtering panel  
- [ ] Political boundary overlay  
- [ ] Light/Dark theme toggle  
- [ ] “Latest earthquake” notification system  
- [ ] API response caching for performance  

---

## ✨ Author  
**İlayda Çınar**

