// Set your Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNtNGw5MiIsImEiOiJjbTRwaG4zNnkwdTI3MmpxczlkanBjZ2RqIn0.h20uUmHwEJSNQ7MX9D6bPQ';
const openWeatherAPIKey = '486d5e6a0a4361ca45f0513941d70dd6';

// Define featured locations
const featuredLocations = [
    {
        name: 'Paris',
        country: 'France',
        coordinates: [2.3522, 48.8566],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/P1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/P2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/P3.webp'
        ],
        description: 'The City of Light, Paris is renowned for its stunning architecture, world-class museums like the Louvre, iconic Eiffel Tower, and exquisite cuisine.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/alger/'
    },
    {
        name: 'London',
        country: 'UK',
        coordinates: [-0.1276, 51.5074],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/L1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/L2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/L3.webp'
        ],
        description: 'A city where tradition meets innovation, London offers iconic landmarks like Big Ben and Tower Bridge, world-renowned museums, diverse neighborhoods, and beautiful royal parks.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/alger/'
    },
    {
        name: 'Djanet',
        country: 'Algeria',
        coordinates: [9.4840, 24.5534],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/dj1.jpg',
            'https://babapicture.blob.core.windows.net/blobabap/dj2.jpg',
            'https://babapicture.blob.core.windows.net/blobabap/dj3.jpg'
        ],
        description: 'An oasis in the heart of the Sahara, Djanet is gateway to the stunning Tassili n\'Ajjer National Park.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/alger/'
    },
    {
        name: 'Kota Kinabalu',
        country: 'Malaysia',
        coordinates: [116.0735, 5.9804],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/M1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/M2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/M3.webp'
        ],
        description: 'Capital of Sabah, Kota Kinabalu offers stunning sunsets over the South China Sea, access to Mount Kinabalu, and rich biodiversity.',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/malaisie/'
    },
    {
        name: 'Surabaya',
        country: 'Indonesia',
        coordinates: [112.7508, -7.2575],
        images: [
            'https://babapicture.blob.core.windows.net/blobabap/In1.webp',
            'https://babapicture.blob.core.windows.net/blobabap/In2.webp',
            'https://babapicture.blob.core.windows.net/blobabap/In3.webp'
        ],
        description: 'Indonesia\'s second-largest city, Surabaya blends colonial heritage with modern urban life. Explore historic sites like the House of Sampoerna',
        bookingUrl: 'https://honeydew-worm-328764.hostingersite.com/circuit-sumatra-nord-et-ile-de-weh/'
    }
];

// Define the travel circuit
const travelCircuit = [
    { name: 'Algiers', coordinates: [3.06667, 36.78333], days: 'Day 1-2' },
    { name: 'Casbah of Algiers', coordinates: [3.06333, 36.78222], days: 'Day 1-2' },
    { name: 'Tipaza', coordinates: [2.48333, 36.55], days: 'Day 3' },
    { name: 'Martyrs’ Memorial', coordinates: [3.06375, 36.77917], days: 'Day 4' },
    { name: 'Djanet', coordinates: [5.48333, 24.01667], days: 'Day 5-8' },
    { name: 'The Weeping Cow', coordinates: [5.51667, 24.05], days: 'Day 5-8' }
];

// Variable to track the visibility of the circuit
let circuitVisible = false;

// Variable to store markers for daily destinations
let markers = [];

// Function to display the travel circuit on the map
function displayTravelCircuit() {
    const routeCoordinates = travelCircuit.map(location => location.coordinates);

    // Create a line on the map connecting the circuit
    map.addSource('route', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
            }
        }
    });

    // Add the route layer
    map.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#888',
            'line-width': 4
        }
    });

    // Add markers for each city
    travelCircuit.forEach(location => {
        const marker = new mapboxgl.Marker()
            .setLngLat(location.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<h3>${location.name}</h3><p>${location.days}</p>`))
            .addTo(map);
        markers.push(marker); // Store marker reference
    });

    // Fit the map bounds to show the entire route
    const bounds = new mapboxgl.LngLatBounds();
    routeCoordinates.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds, {
        padding: { top: 20, bottom: 20, left: 20, right: 20 }
    });
}

// Function to toggle the travel circuit on the map
function toggleTravelCircuit() {
    if (circuitVisible) {
        // Remove the route layer and markers if currently visible
        map.removeLayer('route-layer');
        map.removeSource('route');
        markers.forEach(marker => marker.remove()); // Remove all markers
        markers = []; // Clear the markers array
        circuitVisible = false;
    } else {
        // Display the travel circuit
        displayTravelCircuit();
        circuitVisible = true;
    }
}

// Initialize the Map with Globe Projection
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    projection: 'globe',
    center: [0, 20],
    zoom: 1.8,
    pitch: 0,
    bearing: 0
});

// Store the directions control instance
let directionsControl;

// Add directions control with restricted functionality
directionsControl = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    alternatives: true,
    congestion: true,
    controls: {
        inputs: true,
        instructions: true,
        profileSwitcher: true
    },
    interactive: false,
    flyTo: false
});

map.addControl(directionsControl, 'top-left');

// Disable click-based origin selection
directionsControl.on('origin', function(e) {
    if (!e.feature) {
        // Only allow search-based origin selection
        directionsControl.removeOrigin();
    }
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'top-left');
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

// Weather layer management
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
            tileSize: 256
        });
        map.addLayer({
            id: layerId,
            type: 'raster',
            source: layerId,
            paint: {
                'raster-opacity': 0.6
            }
        });
        activeWeatherLayers[layerId] = true;
    }
}

function clearWeatherLayers() {
    Object.keys(activeWeatherLayers).forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
        if (map.getSource(layerId)) {
            map.removeSource(layerId);
        }
    });
    activeWeatherLayers = {};
}

// Function to fetch weather data
async function getWeatherData(lat, lng) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherAPIKey}&units=metric`
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to create weather info HTML
function createWeatherInfo(weatherData) {
    if (!weatherData) return '<p class="weather-error">Weather data unavailable</p>';

    const weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    
    return `
        <div class="weather-info-container">
            <div class="weather-header">
                <img src="${weatherIcon}" alt="${weatherData.weather[0].description}" class="weather-icon">
                <div class="temperature">
                    <span class="temp-value">${Math.round(weatherData.main.temp)}°C</span>
                    <span class="feels-like">Feels like: ${Math.round(weatherData.main.feels_like)}°C</span>
                </div>
            </div>
            <div class="weather-details">
                <div class="weather-detail">
                    <span class="label">Condition:</span>
                    <span class="value">${weatherData.weather[0].description}</span>
                </div>
                <div class="weather-detail">
                    <span class="label">Humidity:</span>
                    <span class="value">${weatherData.main.humidity}%</span>
                </div>
                <div class="weather-detail">
                    <span class="label">Wind:</span>
                    <span class="value">${weatherData.wind.speed} m/s</span>
                </div>
            </div>
        </div>
    `;
}

// Function to create popup content
async function createPopupContent(location) {
    const container = document.createElement('div');
    container.className = 'popup-container';
    
    // Create carousel container
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-section';
    
    // Create location info section
    const infoSection = document.createElement('div');
    infoSection.className = 'location-info';
    
    const title = document.createElement('h3');
    title.textContent = `${location.name}, ${location.country}`;
    
    // Create collapsible sections container
    const collapsibleContainer = document.createElement('div');
    collapsibleContainer.className = 'collapsible-container';
    
    // Create description section
    const descriptionSection = document.createElement('div');
    descriptionSection.className = 'collapsible-section';
    descriptionSection.innerHTML = `
        <button class="collapsible-header">
            <span>📝 Description</span>
            <span class="toggle-icon">+</span>
        </button>
        <div class="collapsible-content">
            <p>${location.description}</p>
        </div>
    `;
    
    // Create weather section
    const weatherSection = document.createElement('div');
    weatherSection.className = 'collapsible-section';
    weatherSection.innerHTML = `
        <button class="collapsible-header">
            <span>🌤️ Weather</span>
            <span class="toggle-icon">+</span>
        </button>
        <div class="collapsible-content">
            <div class="loading">Loading weather data...</div>
        </div>
    `;
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    
    // Add destination button
    const setEndButton = document.createElement('button');
    setEndButton.textContent = 'Set as Destination';
    setEndButton.className = 'route-button end';
    setEndButton.onclick = () => setRoutePoint('destination', location.coordinates, location.name);
    
    // Add view circuit button
    const viewCircuitButton = document.createElement('button');
    viewCircuitButton.textContent = 'View Circuit';
    viewCircuitButton.className = 'route-button circuit';
    viewCircuitButton.onclick = () => toggleTravelCircuit();
    
    // Add book button
    const bookButton = document.createElement('a');
    bookButton.href = location.bookingUrl;
    bookButton.textContent = 'Book Now';
    bookButton.className = 'book-button';
    bookButton.target = '_blank';
    
    // Assemble the buttons
    buttonsContainer.appendChild(setEndButton);
    buttonsContainer.appendChild(viewCircuitButton);
    
    // Assemble the popup
    collapsibleContainer.appendChild(descriptionSection);
    collapsibleContainer.appendChild(weatherSection);
    
    infoSection.appendChild(title);
    infoSection.appendChild(collapsibleContainer);
    infoSection.appendChild(buttonsContainer);
    infoSection.appendChild(bookButton);
    
    container.appendChild(carouselContainer);
    container.appendChild(infoSection);
    
    // Initialize the carousel
    new ImageCarousel(carouselContainer, location.images);
    
    // Add click handlers for collapsible sections
    const headers = container.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');
            
            // Close other sections
            const otherSections = container.querySelectorAll('.collapsible-section.active');
            otherSections.forEach(otherSection => {
                if (otherSection !== section) {
                    otherSection.classList.remove('active');
                    otherSection.querySelector('.collapsible-content').style.maxHeight = null;
                    otherSection.querySelector('.toggle-icon').textContent = '+';
                }
            });
            
            // Toggle current section
            section.classList.toggle('active');
            if (section.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.textContent = '−';
            } else {
                content.style.maxHeight = null;
                icon.textContent = '+';
            }
        });
    });
    
    // Fetch and update weather data
    const weatherContent = weatherSection.querySelector('.collapsible-content');
    const weatherData = await getWeatherData(location.coordinates[1], location.coordinates[0]);
    weatherContent.innerHTML = createWeatherInfo(weatherData);
    
    return container;
}

// Function to add markers for featured locations
function addFeaturedLocationMarkers() {
    featuredLocations.forEach(async location => {
        const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px',
            className: 'location-popup'
        });

        // Set initial content
        popup.setDOMContent(await createPopupContent(location));

        new mapboxgl.Marker()
            .setLngLat(location.coordinates)
            .setPopup(popup)
            .addTo(map);
    });
}

// Function to set route points
function setRoutePoint(type, coordinates, locationName) {
    if (!directionsControl) return;
    
    const [lng, lat] = coordinates;
    if (type === 'destination') {
        directionsControl.setDestination([lng, lat]);
    }
}

// Function to clear the current route
function clearRoute() {
    if (directionsControl) {
        directionsControl.removeRoutes();
        directionsControl.removeDestination();
    }
}

// Load and configure the map layers
map.on('load', () => {
    // Set atmospheric fog for a realistic effect
    map.setFog({
        'color': 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
    });

    // Add country boundaries
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

    // Add markers for featured locations
    addFeaturedLocationMarkers();

    // Add click handler for weather information
    map.on('click', async (event) => {
        const { lng, lat } = event.lngLat;

        try {
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
        } catch (error) {
            console.error('Error fetching weather data:', error);
            document.getElementById('weather-details').innerHTML = 'Error fetching weather data. Please try again.';
        }
    });

    // Add hover effect for clickable countries
    map.on('mouseenter', 'countries-layer', (e) => {
        if (['Algeria', 'Malaysia', 'Indonesia'].includes(e.features[0].properties.name)) {
            map.getCanvas().style.cursor = 'pointer';
        }
    });

    map.on('mouseleave', 'countries-layer', () => {
        map.getCanvas().style.cursor = '';
    });
});

function flyToLocation(locationName) {
    const location = featuredLocations.find(loc => loc.name.toLowerCase() === locationName.toLowerCase());
    if (location) {
        map.flyTo({
            center: location.coordinates,
            zoom: 12,
            duration: 2000,
            essential: true
        });
    }
}

// Export functions for use in other modules
window.mapInterface = {
    flyToLocation,
    toggleWeatherLayer,
    clearWeatherLayers,
    setRoutePoint,
    clearRoute
};
