// Set Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNtNGw5MiIsImEiOiJjbTRwaG4zNnkwdTI3MmpxczlkanBjZ2RqIn0.h20uUmHwEJSNQ7MX9D6bPQ';

// Initialize Map with Globe Projection
const map = new mapboxgl.Map({
  container: 'map', // HTML container ID
  style: 'mapbox://styles/mapbox/satellite-v9', // Satellite map style for a realistic Earth view
  projection: 'globe', // Enable the 3D globe projection
  center: [0, 0], // Start at longitude 0, latitude 0 (center of Earth)
  zoom: 1.5, // Initial zoom level
  pitch: 0, // Angle of the globe
  bearing: 0 // Map rotation
});

// Add Navigation Controls (Zoom, Rotate)
map.addControl(new mapboxgl.NavigationControl());

// Animate the globe on load
map.on('load', () => {
  // Set a globe's atmospheric appearance
  map.setFog({
    range: [-1, 2], // Adjusts fog intensity
    color: 'white', // Fog color
    "high-color": "#245bde", // Color closer to the horizon
    "space-color": "#000000", // Color beyond the atmosphere
    "horizon-blend": 0.1 // Blend at the horizon
  });

  console.log('Globe map loaded successfully!');
});
