mapboxgl.accessToken =
  "pk.eyJ1IjoiancyMDA2IiwiYSI6ImNtcThmbjN0ejBhNHQycHB3OXFtOHA3Z3gifQ.uT9TiSthEqqnlScWtrEcYA";

const map = new mapboxgl.Map({
  container: "map", // this is the container ID that we set in the HTML
  center: [-120.97, 38.95], // starting position [lng, lat]. Note that lat must be set between -90 and 90. You can choose what you'd like.
  style: "mapbox://styles/jw2006/cmq8gk55h00a201rffc6pfpmm", // Your Style URL goes here
  zoom: 13 // starting zoom, again you can choose the level you'd like.
});

map.on("load", function () {
  map.addSource("points-data", {
    type: "geojson",
    data:
      "https://raw.githubusercontent.com/cfwang-cmyk/ROP/refs/heads/main/data/Points_in_Auburn.geojson"
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
  // Add click event for popups
map.on('click', 'points-layer', (e) => {
    // Copy coordinates array
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    // Ensure the popup appears over the correct point if the map is zoomed out
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Create popup content using the actual Auburn GeoJSON properties
    const popupContent = `
        <div class="auburn-popup">
            ${properties.image_link ? `<img src="${properties.image_link}" alt="${properties.feature_name}" style="width: 100%; border-radius: 6px; margin-bottom: 10px;">` : ''}
            
            <h3 style="margin: 0 0 8px 0; color: #2b4d70; font-family: 'Raleway', sans-serif;">
                ${properties.rop_renaming_new_name || properties.feature_name}
            </h3>
            
            <p style="margin: 4px 0; font-size: 14px;">
                <strong>Feature Type:</strong> ${properties.feature_class}
            </p>
            
            <p style="margin: 4px 0; font-size: 14px;">
                <strong>Meaning:</strong> ${properties.rop_renaming_meaning}
            </p>
            
            <p style="margin: 4px 0; font-size: 14px;">
                <strong>Tribal Partner:</strong> ${properties.rop_renaming_tribal_partner}
            </p>
            
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
            
            <p style="margin: 0; font-size: 12px; color: #777; font-style: italic;">
                Formerly: ${properties.rop_renaming_former_name}
            </p>
        </div>
    `;

    new mapboxgl.Popup({ offset: 10 }) // Adding a slight offset so the popup doesn't cover the point
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
});

// UX Bonus: Change the cursor to a pointer when hovering over the points
map.on('mouseenter', 'points-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to the default grab cursor when it leaves
map.on('mouseleave', 'points-layer', () => {
    map.getCanvas().style.cursor = '';
});
  

 

});

// 获取并显示天气信息的函数
async function fetchAuburnWeather() {
    try {
        // 使用 Open-Meteo API (无需 API Key)
        const lat = 38.95;
        const lng = -120.97;
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
        const data = await response.json();
        
        const tempF = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        
        // 根据 WMO 天气代码匹配对应的 Emoji 和描述
        let icon = "🌤️";
        let desc = "Clear";
        
        if (code === 0) { icon = "☀️"; desc = "Clear"; }
        else if (code >= 1 && code <= 3) { icon = "⛅"; desc = "Cloudy"; }
        else if (code >= 45 && code <= 48) { icon = "🌫️"; desc = "Foggy"; }
        else if (code >= 51 && code <= 67) { icon = "🌧️"; desc = "Rain"; }
        else if (code >= 71 && code <= 77) { icon = "❄️"; desc = "Snow"; }
        else if (code >= 95) { icon = "⛈️"; desc = "Storm"; }

        // 更新 HTML 内容
        document.getElementById('weather-widget').innerHTML = `
            <div class="weather-header">Current Weather At Auburn</div>
            <div class="weather-body">
                <div style="font-size: 32px; line-height: 1;">${icon}</div>
                <div>
                    <div class="weather-temp">${tempF}°F</div>
                    <div class="weather-desc">${desc}</div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById('weather-widget').innerHTML = `<span style="font-size: 12px;">Weather unavailable</span>`;
    }
}

// 页面加载时执行该函数
fetchAuburnWeather();