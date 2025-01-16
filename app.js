// API Keys
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNtNGw5MiIsImEiOiJjbTRwaG4zNnkwdTI3MmpxczlkanBjZ2RqIn0.h20uUmHwEJSNQ7MX9D6bPQ';
const openWeatherAPIKey = '486d5e6a0a4361ca45f0513941d70dd6';

// Map Initialization
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [0, 0],
  zoom: 2,
  projection: 'globe',
});

// Controls
map.addControl(new mapboxgl.NavigationControl(), 'top-left');
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
map.addControl(new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  controls: { inputs: true },
  interactive: false,
}), 'top-left');

// Weather Layers
const activeWeatherLayers = {};
function toggleWeatherLayer(layer) {
  const layerId = `weather-${layer}`;
  if (activeWeatherLayers[layerId]) {
    map.removeLayer(layerId);
    map.removeSource(layerId);
    delete activeWeatherLayers[layerId];
  } else {
    map.addSource(layerId, {
      type: 'raster',
      tiles: [`https://tile.openweathermap.org/map/${layer}_new/{z}/{x}/{y}.png?appid=${openWeatherAPIKey}`],
      tileSize: 256,
    });
    map.addLayer({
      id: layerId,
      type: 'raster',
      source: layerId,
    });
    activeWeatherLayers[layerId] = true;
  }
}

function clearWeatherLayers() {
  Object.keys(activeWeatherLayers).forEach(layerId => {
    map.removeLayer(layerId);
    map.removeSource(layerId);
  });
}

// Click Events
map.on('click', async (event) => {
  const { lng, lat } = event.lngLat;

  const features = map.queryRenderedFeatures(event.point, {
    layers: ['countries-layer']
  });

  if (features.length > 0) {
    const region = features[0].properties.name;
    const regionLinkMap = {
      'Algeria': 'https://honeydew-worm-328764.hostingersite.com/accueil/',
      'Malaysia': 'https://honeydew-worm-328764.hostingersite.com/accueil/',
      'Indonesia': 'https://honeydew-worm-328764.hostingersite.com/accueil/'
    };
    const link = regionLinkMap[region];

    if (link) {
      // Remove any existing markers
      const markers = document.getElementsByClassName('mapboxgl-marker');
      while (markers.length > 0) {
        markers[0].remove();
      }

      // Fetch Weather Data
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherAPIKey}&units=metric`
      );
      const data = await response.json();

      // Show Popup with Generic "Visit the Country"
      new mapboxgl.Popup()
        .setLngLat([lng, lat])
        .setHTML(`
          <a href="${link}" target="_blank"><strong>Visit the Country</strong></a><br>
          <strong>Temperature:</strong> ${data.main.temp}°C<br>
          <strong>Condition:</strong> ${data.weather[0].description}<br>
          <strong>Wind Speed:</strong> ${data.wind.speed} m/s<br>
          <strong>Cloudiness:</strong> ${data.clouds.all}%
        `)
        .addTo(map);
      return;
    }
  }

  // Show Weather Info for other regions
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherAPIKey}&units=metric`
  );
  const data = await response.json();
  document.getElementById('weather-details').innerHTML = `
    <strong>Temperature:</strong> ${data.main.temp}°C<br>
    <strong>Condition:</strong> ${data.weather[0].description}<br>
    <strong>Wind Speed:</strong> ${data.wind.speed} m/s<br>
    <strong>Cloudiness:</strong> ${data.clouds.all}%
  `;
});

// Add default style for clickable icons
map.on('load', () => {
  map.addSource('countries', {
    type: 'geojson',
    data: 'countries.geojson'
  });

  map.addLayer({
    id: 'countries-layer',
    type: 'fill',
    source: 'countries',
    layout: {},
    paint: {
      'fill-color': '#ffffff',
      'fill-opacity': 0
    }
  });

  map.on('mouseenter', 'countries-layer', (e) => {
    if (['Algeria', 'Malaysia', 'Indonesia'].includes(e.features[0].properties.name)) {
      map.getCanvas().style.cursor = 'pointer';
    }
  });

  map.on('mouseleave', 'countries-layer', () => {
    map.getCanvas().style.cursor = '';
  });
});
