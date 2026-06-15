mapboxgl.accessToken = "pk.eyJ1IjoiancyMDA2IiwiYSI6ImNtcThmbjN0ejBhNHQycHB3OXFtOHA3Z3gifQ.uT9TiSthEqqnlScWtrEcYA";

const map = new mapboxgl.Map({
  container: "map", 
  center: [-120.97, 38.95], 
  style: "mapbox://styles/jw2006/cmq8gk55h00a201rffc6pfpmm", 
  zoom: 13 
});

let currentPopup = null;

function isValidField(value) {
    if (value === null || value === undefined) return false;
    const str = value.toString().trim();
    if (str === "" || str.toUpperCase() === "N/A") return false;
    return true;
}

function showPopup(coordinates, properties) {
    if (currentPopup) currentPopup.remove();

    let popupContent = `<div class="auburn-popup">`;
    
    if (isValidField(properties.image_link)) {
        popupContent += `<img src="${properties.image_link}" alt="${properties.feature_name}" style="width: 100%; border-radius: 6px; margin-bottom: 10px;">`;
    }
    
    const featureName = properties.feature_name ? properties.feature_name : "Unnamed Location";
    popupContent += `
        <h3 style="margin: 0 0 8px 0; color: #2b4d70; font-family: 'Raleway', sans-serif; font-weight: 700;">
            ${featureName}
        </h3>
    `;
    
    if (isValidField(properties.feature_class)) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Feature Type:</strong> ${properties.feature_class}</p>`;
    }
    
    if (isValidField(properties.rop_renaming_meaning)) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Meaning:</strong> ${properties.rop_renaming_meaning}</p>`;
    }
    
    if (isValidField(properties.rop_renaming_tribal_partner)) {
        popupContent += `<p style="margin: 4px 0; font-size: 14px;"><strong>Tribal Partner:</strong> ${properties.rop_renaming_tribal_partner}</p>`;
    }
    
    if (isValidField(properties.rop_renaming_former_name)) {
        popupContent += `
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 12px; color: #777; font-style: italic;">
                Formerly: ${properties.rop_renaming_former_name}
            </p>
        `;
    }
    
    popupContent += `</div>`;

    currentPopup = new mapboxgl.Popup({ offset: 10 })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
}

function buildSidebar(geojsonData) {
    const listContainer = document.getElementById('location-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';

    let validCount = 0;
    
    geojsonData.features.forEach((feature, index) => {
        try {
            const props = feature.properties || {};
            const coordinates = feature.geometry?.coordinates;
            if (!coordinates || coordinates.length < 2) {
                // console.warn(`点 ${index} 缺少有效坐标，跳过侧边栏项`);
                return;
            }
            
            const featureName = props.feature_name ? props.feature_name : "Unnamed Location";
            const formerName = isValidField(props.rop_renaming_former_name) ? props.rop_renaming_former_name : null;
            
            const item = document.createElement('div');
            item.className = 'sidebar-item';
            
            let itemHTML = `<div class="item-new-name">${featureName}</div>`;
            if (formerName) {
                itemHTML += `<div class="item-former-name">Formerly: ${formerName}</div>`;
            }
            item.innerHTML = itemHTML;
            
            item.addEventListener('click', () => {
                map.flyTo({
                    center: coordinates,
                    zoom: 14.5,
                    essential: true,
                    speed: 1.2
                });
                showPopup(coordinates, props);
            });
            
            listContainer.appendChild(item);
            validCount++;
        } catch (err) {
            // console.error(`处理第 ${index} 个点位时出错:`, err, feature);
        }
    });
    
    // console.log(`侧边栏成功加载 ${validCount} 个地点，总数: ${geojsonData.features.length}`);
    if (validCount === 0 && geojsonData.features.length > 0) {
        listContainer.innerHTML = `<div style="padding:20px; color:#c62828;">无法显示地点列表，请检查控制台错误</div>`;
    }
}

map.on("load", async function () {
  const geojsonUrl = "https://raw.githubusercontent.com/cfwang-cmyk/ROP/refs/heads/main/data/untitled-2.geojson";

  try {
    const response = await fetch(geojsonUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojsonData = await response.json();
    
    // console.log(`成功加载 GeoJSON，共 ${geojsonData.features.length} 个点`);
    
    map.addSource("points-data", {
      type: "geojson",
      data: geojsonData 
    });
    
    map.addLayer({
      id: "points-layer",
      type: "circle",
      source: "points-data",
      paint: {
        "circle-color": "#4264FB", 
        "circle-radius": 7, 
        "circle-stroke-width": 2, 
        "circle-stroke-color": "#ffffff" 
      }
    });
    
    buildSidebar(geojsonData);
    
    map.on('click', 'points-layer', (e) => {
        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        showPopup(coordinates, feature.properties);
    });
    
    map.on('mouseenter', 'points-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'points-layer', () => { map.getCanvas().style.cursor = ''; });
    
  } catch (error) {
    // console.error("加载 GeoJSON 失败:", error);
    const listContainer = document.getElementById('location-list');
    if (listContainer) {
        listContainer.innerHTML = `<div style="padding:20px; color:#c62828;">Failed to load locations. Please check network/console.</div>`;
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');

    if(closeBtn && sidebar && openBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.add('collapsed'); 
            openBtn.style.display = 'block'; 
        });

        openBtn.addEventListener('click', () => {
            sidebar.classList.remove('collapsed'); 
            openBtn.style.display = 'none';  
        });
    }
});

async function fetchAuburnWeather() {
    try {
        const lat = 38.95;
        const lng = -120.97;
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
        const data = await response.json();
        
        const tempF = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        
        let icon = "🌤️";
        let desc = "Clear";
        
        if (code === 0) { icon = "☀️"; desc = "Clear"; }
        else if (code >= 1 && code <= 3) { icon = "⛅"; desc = "Cloudy"; }
        else if (code >= 45 && code <= 48) { icon = "🌫️"; desc = "Foggy"; }
        else if (code >= 51 && code <= 67) { icon = "🌧️"; desc = "Rain"; }
        else if (code >= 71 && code <= 77) { icon = "❄️"; desc = "Snow"; }
        else if (code >= 95) { icon = "⛈️"; desc = "Storm"; }

        const widget = document.getElementById('weather-widget');
        if (widget) {
            widget.innerHTML = `
                <div class="weather-header">Current Weather At Auburn</div>
                <div class="weather-body">
                    <div style="font-size: 32px; line-height: 1;">${icon}</div>
                    <div>
                        <div class="weather-temp">${tempF}°F</div>
                        <div class="weather-desc">${desc}</div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        // console.error("Error fetching weather data:", error);
        const widget = document.getElementById('weather-widget');
        if (widget) widget.innerHTML = `<span style="font-size: 12px;">Weather unavailable</span>`;
    }
}

fetchAuburnWeather();