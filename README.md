# ROP
## GEOG N183: Cartographic Representation ROP project @UC Berkeley

### Auburn State Recreational Area Renaming Project – Interactive Map

This project is an interactive web map that visualizes cultural renaming efforts within the Auburn State Recreational Area (California). It displays points of interest that feature both contemporary names and, where available, original or historically significant Indigenous names. The map is built with Mapbox GL JS and includes a real‑time weather widget, a collapsible sidebar for location browsing, and custom popups with images and descriptive information.

---

## Overview

The map highlights place‑name restoration or recognition work in the Auburn region. Each point on the map corresponds to a feature (trailhead, historic site, natural landmark, etc.) with:

- A primary name (`feature_name`)
- Optionally, a former name (`rop_renaming_former_name`)
- An Indigenous meaning (`rop_renaming_meaning`)
- The tribal partner involved (`rop_renaming_tribal_partner`)
- A classification (`feature_class`)
- An associated image (when available)

Clicking a point or its entry in the sidebar flies the map to that location and opens a styled popup with all available details.

---

## Features

- **Full‑screen interactive map** powered by Mapbox GL JS.
- **Custom map style** – a winter‑themed basemap (designed for the project).
- **Points layer** – blue circles with white strokes, hover cursor change.
- **Sidebar panel** – lists all locations.  
  - Displays the main name and, if present, the former name.  
  - Click an item to fly to that location and open its popup.  
  - Can be closed (collapses left) and reopened with a floating button.
- **Popup window** – shows an image (if available), name, feature type, Indigenous meaning, tribal partner, and former name (only for non‑null, non‑“N/A” values).
- **Real‑time weather widget** (top‑right) – fetches current temperature (°F) and weather conditions for Auburn from Open‑Meteo, with a matching emoji.
- **Accessible design** – glassmorphic UI panels, custom scrollbar, smooth transitions.
- **Resilient data loading** – GeoJSON is fetched from a GitHub raw URL; errors are handled gracefully, and missing fields are filtered out.

---

## Program Files

| File          | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `index.html`  | Main HTML document – includes Bulma (minimal use), Mapbox CSS/JS, the map container, title, weather widget, sidebar, and script/style links. |
| `style.css`   | All custom styling: glassmorphic panels (title, weather, sidebar), map container positioning, sidebar collapse animation, custom scrollbar, typography (Raleway font). |
| `script.js`   | Application logic – Mapbox initialization, GeoJSON fetching, layer creation, popup/sidebar building, weather API call, and UI interactions. |

---

## Setup & Usage

1. **Clone or download** the three files into a local directory.  
2. **Make sure you have an internet connection** – the page loads Mapbox GL JS, the Raleway font (via the CSS), and remote GeoJSON data.  
3. **Open `index.html` in a modern web browser** (Chrome, Firefox, Safari, Edge).  
   - No local server is required because all external resources use HTTPS and there are no CORS restrictions on the GeoJSON file.  
4. **Interact** with the map:
   - Click any blue dot → see detailed popup.  
   - Hover over a dot → cursor changes to a pointer.  
   - Click the `✕` in the sidebar → sidebar slides out of view.  
   - Click the `☰ SHOW PLACES` button (appears after sidebar is closed) → sidebar slides back in.  
   - Click any location name in the sidebar → map flies to that point and shows its popup.  
5. **Weather** updates automatically when the page loads (no manual refresh needed; uses Open‑Meteo free API).

---

## Dependencies

- [Mapbox GL JS v3.24.0](https://docs.mapbox.com/mapbox-gl-js) – map rendering and interactivity.
- [Bulma CSS v0.7.4](https://bulma.io) – minimal layout help (only used for basic reset; most styling is custom).
- [Open‑Meteo API](https://open-meteo.com) – free weather forecasts (current temperature and weather code).
- [Google Fonts – Raleway](https://fonts.google.com/specimen/Raleway) – clean, cold‑season typography (referenced in `style.css` – though not explicitly linked, the font family is declared; you may want to add the `@import` or `<link>` if missing – but the current design degrades gracefully to sans‑serif).

---

## Data Source

The point data is a GeoJSON file hosted at:  
[https://raw.githubusercontent.com/cfwang-cmyk/ROP/refs/heads/main/data/untitled-2.geojson](https://raw.githubusercontent.com/cfwang-cmyk/ROP/refs/heads/main/data/untitled-2.geojson)

It contains `FeatureCollection` with properties:
- `feature_name`
- `feature_class`
- `rop_renaming_meaning`
- `rop_renaming_tribal_partner`
- `rop_renaming_former_name`
- `image_link`

The map is centered on Auburn, CA (lat 38.95, lng -120.97) at zoom level 13.

---

## Credits

- Project for **GEOG N183 – Cartographic Representation** at UC Berkeley.
- Mapbox style ID: `cmq8gk55h00a201rffc6pfpmm` (owner: `jw2006`).
- Weather data: Open‑Meteo under the Creative Commons BY 4.0 license.
- Indigenous renaming research and field work by the California State Parks‘ Reexamining Our Past Initiative team.

---

## License

This code is provided for educational purposes as part of a university course project. The map style and GeoJSON data remain the property of their respective creators.
