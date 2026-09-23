document.addEventListener("DOMContentLoaded", () => {
  console.log("MAP JS LOADED");

  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  const lng = mapDiv.getAttribute("data-lng");
  const lat = mapDiv.getAttribute("data-lat");
  const token = mapDiv.getAttribute("data-token");

  const title = mapDiv.getAttribute("data-title"); 
  const place = mapDiv.getAttribute("data-place");

  locationiq.key = token;

  const map = new maplibregl.Map({
    container: "map",
    style: locationiq.getLayer("Streets"),
    center: [lng, lat],
    zoom: 9
  });

  const marker = new maplibregl.Marker({ color: "#e63946" })
    .setLngLat([lng, lat])
    .addTo(map);

  // POPUP
  const popup = new maplibregl.Popup({ offset: 20 })
    .setHTML(`
      <h4 style="margin:0; font-weight:600;">${title}</h4>
      <p style="margin:0;">${place}</p>
    `);

  marker.setPopup(popup);
});
