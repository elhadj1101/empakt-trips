// Set your Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNtNGw5MiIsImEiOiJjbTRwaG4zNnkwdTI3MmpxczlkanBjZ2RqIn0.h20uUmHwEJSNQ7MX9D6bPQ';

// Initialize the Map with Globe Projection
const map = new mapboxgl.Map({
  container: 'map', // The container ID in HTML
  style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite view with streets and labels
  projection: 'globe', // Enable 3D globe projection
  center: [0, 0], // Initial map center: [Longitude, Latitude]
  zoom: 1.5, // Initial zoom level
  pitch: 0, // Camera angle
  bearing: 0 // Map rotation
});

// Add navigation controls (zoom, rotate, compass)
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

// Add fullscreen control
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

// Load and configure the map layers
map.on('load', () => {
  // Set atmospheric fog for a realistic effect
  map.setFog({
    range: [-1, 2], // Adjust the intensity of the fog
    color: 'white', // Fog color
    "high-color": "#245bde", // Sky color at higher altitudes
    "space-color": "#000000", // Space color above the atmosphere
    "horizon-blend": 0.1 // Blend intensity at the horizon
  });

  // Enhance label visibility
  // Country labels
  map.setPaintProperty('country-label', 'text-color', '#ffffff'); // White country names
  map.setLayoutProperty('country-label', 'text-size', 14); // Larger country names

  // City labels
  map.setPaintProperty('settlement-label', 'text-color', '#dddddd'); // Light gray for cities
  map.setLayoutProperty('settlement-label', 'text-size', 12); // Standard size for cities

  console.log('Satellite map with cities and country names loaded successfully!');
});
