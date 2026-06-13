// =========================================
// 1. 初始化 Mapbox 地图
// =========================================
mapboxgl.accessToken = "pk.eyJ1IjoiancyMDA2IiwiYSI6ImNtcThmbjN0ejBhNHQycHB3OXFtOHA3Z3gifQ.uT9TiSthEqqnlScWtrEcYA";

const map = new mapboxgl.Map({
  container: "map", // 绑定 HTML 中 id 为 'map' 的容器
  center: [-120.97, 38.95], // 默认中心点经纬度 (Auburn SRA 附近)
  style: "mapbox://styles/jw2006/cmq8gk55h00a201rffc6pfpmm", // 你的自定义底图样式
  zoom: 13 // 默认缩放层级
});

// 全局变量：用于存储当前打开的地图弹窗（保证同一时间只弹出一个）
let currentPopup = null;

// =========================================
// 2. 地图加载完成后的核心业务逻辑
// =========================================
map.on("load", async function () {
  // 这是你存放在 GitHub 上的原始数据链接
  const geojsonUrl = "https://raw.githubusercontent.com/cfwang-cmyk/ROP/refs/heads/main/data/Points_in_Auburn.geojson";

  try {
    // 【核心动态获取】：向 GitHub 发送网络请求，实时抓取最新的 JSON 数据
    const response = await fetch(geojsonUrl);
    const geojsonData = await response.json();

    // 将抓取到的地理数据注册到 Mapbox 引擎中
    map.addSource("points-data", {
      type: "geojson",
      data: geojsonData 
    });

    // 告诉 Mapbox 如何将这些数据画在屏幕上（这里画成蓝色的小圆点）
    map.addLayer({
      id: "points-layer",
      type: "circle",
      source: "points-data",
      paint: {
        "circle-color": "#4264FB", // Mapbox 蓝
        "circle-radius": 7, // 圆点半径大小
        "circle-stroke-width": 2, // 白色描边宽度
        "circle-stroke-color": "#ffffff" // 描边颜色
      }
    });

    // 数据加载完毕后，立刻调用函数，根据这份数据生成左侧边栏的列表
    buildSidebar(geojsonData);

    // 绑定事件：当用户在地图上点击了蓝色圆点时触发
    map.on('click', 'points-layer', (e) => {
        // 提取被点击圆点的属性信息和经纬度坐标
        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        
        // Mapbox 官方机制：防止在极度缩放、地图平铺多次时，气泡弹错位置的经度修正
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        // 调用我们自定义的函数，显示信息弹窗
        showPopup(coordinates, feature.properties);
    });

  } catch (error) {
    // 错误处理：如果因为网络问题数据没抓到，给用户一个红色的报错提示
    console.error("Error loading GeoJSON data:", error);
    const listContainer = document.getElementById('location-list');
    if (listContainer) {
        listContainer.innerHTML = `<div style="padding:20px; color:#c62828; font-size:13px;">Failed to load locations.</div>`;
    }
  }

  // UX 优化：鼠标悬停在圆点上时，变成可点击的“小手”图标
  map.on('mouseenter', 'points-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
  // 鼠标移开时恢复默认指针
  map.on('mouseleave', 'points-layer', () => { map.getCanvas().style.cursor = ''; });
});

// =========================================
// 3. 通用功能：生成并显示气泡弹窗
// =========================================
function showPopup(coordinates, properties) {
    // 如果地图上已经有个弹窗了，先关掉它，保持整洁
    if (currentPopup) currentPopup.remove();

    // 拼装弹窗里的 HTML 代码
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

    // 实例化 Mapbox 的 Popup 并在地图上显示
    currentPopup = new mapboxgl.Popup({ offset: 10 }) // offset:10 是为了不遮挡住那个蓝色的点
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map);
}

// =========================================
// 4. 侧边栏列表生成逻辑
// =========================================
function buildSidebar(geojsonData) {
    const listContainer = document.getElementById('location-list');
    if (!listContainer) return;
    
    // 清空 HTML 默认写死的 "Loading places..."
    listContainer.innerHTML = ''; 

    // 遍历 GeoJSON 数据里所有的地理点位数据
    geojsonData.features.forEach(feature => {
        const props = feature.properties;
        const coordinates = feature.geometry.coordinates;
        const newName = props.rop_renaming_new_name || props.feature_name;

        // 为每一个点位创建一个对应的 HTML div 标签
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerHTML = `
            <div class="item-new-name">${newName}</div>
            <div class="item-former-name">Formerly: ${props.rop_renaming_former_name}</div>
        `;

        // 核心交互：监听侧边栏条目的点击动作
        item.addEventListener('click', () => {
            // 1. 命令地图丝滑地飞跃 (flyTo) 到这个点位的上方
            map.flyTo({
                center: coordinates,
                zoom: 14.5, // 放大视角以看清细节
                essential: true, // 确保动画执行不受系统偏好影响
                speed: 1.2 // 飞行速度
            });
            // 2. 并在飞行结束后，自动打开该点位的详细弹窗
            showPopup(coordinates, props);
        });

        // 将创建好的这个块塞入到左侧面板容器中
        listContainer.appendChild(item);
    });
}

// =========================================
// 5. 侧边栏的 展开 / 收起 动画逻辑
// =========================================
// 等待页面基础结构加载完毕后执行
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');

    if(closeBtn && sidebar && openBtn) {
        // 点击“关闭”按钮：侧边栏滑出屏幕，展开按钮现身
        closeBtn.addEventListener('click', () => {
            sidebar.classList.add('collapsed'); // 给侧边栏添加折叠的 CSS class
            openBtn.style.display = 'block'; 
        });

        // 点击“展开”按钮：隐藏按钮，侧边栏滑回屏幕
        openBtn.addEventListener('click', () => {
            sidebar.classList.remove('collapsed'); // 移除折叠 class
            openBtn.style.display = 'none';  
        });
    }
});

// =========================================
// 6. 实时天气获取功能（基于 Open-Meteo API）
// =========================================
async function fetchAuburnWeather() {
    try {
        // 固定为 Auburn 地区的经纬度
        const lat = 38.95;
        const lng = -120.97;
        // 请求天气 API（这是一个全免费、不需要 Key 的开放接口）
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
        const data = await response.json();
        
        // 提取华氏度（四舍五入）和 WMO 天气代码
        const tempF = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        
        // 根据天气代码映射对应的 Emoji 和简短英文描述
        let icon = "🌤️";
        let desc = "Clear";
        
        if (code === 0) { icon = "☀️"; desc = "Clear"; }
        else if (code >= 1 && code <= 3) { icon = "⛅"; desc = "Cloudy"; }
        else if (code >= 45 && code <= 48) { icon = "🌫️"; desc = "Foggy"; }
        else if (code >= 51 && code <= 67) { icon = "🌧️"; desc = "Rain"; }
        else if (code >= 71 && code <= 77) { icon = "❄️"; desc = "Snow"; }
        else if (code >= 95) { icon = "⛈️"; desc = "Storm"; }

        // 获取右侧天气卡片的容器，并将真实数据渲染进去
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
        console.error("Error fetching weather data:", error);
        // 如果抓取天气失败（比如断网），显示兜底文案，防止页面错乱
        const widget = document.getElementById('weather-widget');
        if (widget) {
            widget.innerHTML = `<span style="font-size: 12px;">Weather unavailable</span>`;
        }
    }
}

// 页面脚本加载完毕后，立马执行一次天气请求
fetchAuburnWeather();