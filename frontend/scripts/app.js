// Main application initialization and configuration
document.addEventListener('DOMContentLoaded', () => {
    // Initialize any global event listeners or configurations
    setupResizeHandlers();
    setupLocationHandlers();
});

function setupResizeHandlers() {
    // Handle window resize events to ensure responsive layout
    window.addEventListener('resize', () => {
        map.resize();
    });
}

// Function to fly to a location with smooth animation
function flyToLocation(coordinates, name = '') {
    map.flyTo({
        center: coordinates,
        zoom: 13,
        essential: true,
        duration: 2000,
        pitch: 60,
        bearing: 30
    });
}

// Function to handle location selection
function handleLocationSelect(location) {
    if (!location || !location.coordinates) return;
    
    // Fly to the location with animation
    flyToLocation(location.coordinates, location.name);
    
    // Update UI to show location info if needed
    updateLocationInfo(location);
}

// Function to update location information in the UI
function updateLocationInfo(location) {
    const infoContainer = document.getElementById('locationInfo');
    if (infoContainer) {
        infoContainer.innerHTML = `
            <h2>${location.name}</h2>
            <p>${location.description || ''}</p>
        `;
    }
}

// Example function to handle a travel itinerary
function handleItinerary(locations) {
    if (!locations || !locations.length) return;

    // Calculate bounds to fit all locations
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(location => {
        bounds.extend(location.coordinates);
    });

    // Fit map to show all locations with padding
    map.fitBounds(bounds, {
        padding: 50,
        duration: 2000
    });
}

// Export functions for use in other modules
window.mapInterface = {
    flyToLocation,
    handleLocationSelect,
    handleItinerary
};
