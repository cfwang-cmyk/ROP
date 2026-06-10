mapboxgl.accessToken =
  "pk.eyJ1IjoiancyMDA2IiwiYSI6ImNtcThmbjN0ejBhNHQycHB3OXFtOHA3Z3gifQ.uT9TiSthEqqnlScWtrEcYA";

const map = new mapboxgl.Map({
  container: "map", // this is the container ID that we set in the HTML
  center: [-120.97, 38.95], // starting position [lng, lat]. Note that lat must be set between -90 and 90. You can choose what you'd like.
  style: "mapbox://styles/jw2006/cmq8gk55h00a201rffc6pfpmm", // Your Style URL goes here
  zoom: 13 // starting zoom, again you can choose the level you'd like.
});