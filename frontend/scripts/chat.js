class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        
        // Initialize conversation history with system message
        this.messageHistory = [{
            role: 'system',
            content: `You are a knowledgeable and enthusiastic travel assistant. Provide helpful travel advice and recommendations.`
        }];
        
        // Set minimum date for departure date picker
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        const departureDateInput = document.getElementById('departure-date');
        if (departureDateInput) {
            departureDateInput.min = minDate;
            departureDateInput.value = minDate;
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        const formattedText = this.formatMessage(text);
        messageDiv.innerHTML = formattedText;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\n- /g, '<br>• ');
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        return text;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    generateAIResponse(userMessage) {
        return new Promise((resolve) => {
            let response;
            const lowerMessage = userMessage.toLowerCase();

            if (lowerMessage.includes('hello')) {
                response = "Hello! How can I help you plan your trip?";
            } else if (lowerMessage.includes('trip')) {
                response = "I can suggest some destinations like Algeria, Malaysia, and Indonesia. Which one would you like to know more about?";
            } else if (lowerMessage.includes('algeria')) {
                response = "Algeria is a really good place with rich history and beautiful landscapes. For more details, check this website: [Algeria Info](https://honeydew-worm-328764.hostingersite.com/accueil/)";
            } else if (lowerMessage.includes('malaysia')) {
                response = "Malaysia offers a unique blend of cultures and stunning natural beauty. For more details, check this website: [Malaysia Info](https://honeydew-worm-328764.hostingersite.com/accueil/)";
            } else if (lowerMessage.includes('indonesia')) {
                response = "Indonesia is known for its vibrant culture and breathtaking islands. For more details, check this website: [Indonesia Info](https://honeydew-worm-328764.hostingersite.com/accueil/)";
            } else {
                response = "I'm here to help with your travel plans!";
            }
            resolve(response);
        });
    }

    extractLocations(text) {
        const locations = [
            'paris', 'rome', 'tokyo', 'bangkok', 'new york', 'london', 'barcelona',
            'amsterdam', 'venice', 'kyoto', 'istanbul', 'cairo', 'athens', 'bali',
            'maldives', 'hawaii', 'santorini', 'costa rica', 'iceland', 'peru',
            'singapore', 'dubai', 'sydney', 'berlin', 'prague', 'vienna', 'budapest',
            'marrakech', 'seoul', 'hong kong', 'rio de janeiro', 'cape town'
        ];
        
        const found = [];
        const textLower = text.toLowerCase();
        
        for (const location of locations) {
            if (textLower.includes(location)) {
                found.push(location);
            }
        }
        
        return found;
    }

    async getFlightInfo(origin, destination, departureDate) {
        const flightDetails = document.getElementById('flight-details');
        const maxPriceInput = document.getElementById('max-price');
        const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;

        try {
            flightDetails.innerHTML = '<div class="loading">Searching for flights...</div>';
            
            console.log('Sending flight search request:', { 
                origin, 
                destination, 
                departureDate,
                maxPrice 
            });

            const requestBody = JSON.stringify({ origin, destination, departureDate });
            console.log('Request Body:', requestBody);

            const response = await fetch('/api/flight-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: requestBody
            });

            // Log the full response details
            console.log('Response Status:', response.status);
            console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

            let rawResponseText;
            try {
                rawResponseText = await response.text();
                console.log('Raw Response Text:', rawResponseText);
            } catch (textError) {
                console.error('Error reading response text:', textError);
                throw new Error(`Failed to read response: ${textError.message}`);
            }

            // Attempt to parse the response
            let data;
            try {
                // Trim the response to remove any leading/trailing whitespace
                const trimmedResponseText = rawResponseText.trim();
                
                // Check if the response is empty
                if (!trimmedResponseText) {
                    throw new Error('Empty response received');
                }

                data = JSON.parse(trimmedResponseText);
                console.log('Parsed Response Data:', data);
            } catch (parseError) {
                console.error('Detailed Parsing Error:', {
                    message: parseError.message,
                    rawResponseText: rawResponseText,
                    rawResponseLength: rawResponseText.length,
                    firstChars: rawResponseText.substring(0, 100),
                    lastChars: rawResponseText.substring(rawResponseText.length - 100)
                });
                
                // Create a more informative error message
                const errorMessage = `Unable to parse server response: ${parseError.message}. 
                    Raw response (length: ${rawResponseText.length}): 
                    ${rawResponseText.substring(0, 500)}...`;
                
                // Display detailed error in the UI
                flightDetails.innerHTML = `
                    <div class="error-message">
                        <h3>Server Response Parsing Failed</h3>
                        <p>${errorMessage}</p>
                        <details>
                            <summary>Technical Details</summary>
                            <pre>${JSON.stringify({
                                error: parseError.message,
                                rawResponse: rawResponseText
                            }, null, 2)}</pre>
                        </details>
                    </div>
                `;
                
                throw new Error(errorMessage);
            }
            
            // Check for error response from server
            if (!response.ok) {
                const errorDetails = data.details || data.error || `HTTP error! status: ${response.status}`;
                console.error('Server returned an error:', {
                    errorDetails,
                    fullResponse: data
                });
                
                flightDetails.innerHTML = `
                    <div class="error-message">
                        ${errorDetails}
                        <details>
                            <summary>More Information</summary>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                        </details>
                    </div>
                `;
                
                throw new Error(errorDetails);
            }
            
            // Validate response structure
            if (!data || !data.data || !Array.isArray(data.data)) {
                console.error('Invalid response structure:', {
                    receivedData: data,
                    dataType: typeof data,
                    dataKeys: data ? Object.keys(data) : 'N/A'
                });
                
                flightDetails.innerHTML = `
                    <div class="error-message">
                        Invalid flight data format received
                        <details>
                            <summary>Response Details</summary>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                        </details>
                    </div>
                `;
                
                throw new Error('Invalid flight data format received');
            }
            
            if (data.data.length > 0) {
                const flights = data.data
                    .filter(flight => {
                        const price = parseFloat(flight.price.total);
                        return price <= maxPrice;
                    })
                    .map(flight => {
                        try {
                            const segment = flight.itineraries[0].segments[0];
                            const departureTime = new Date(segment.departure.at);
                            const arrivalTime = new Date(segment.arrival.at);
                            
                            const formatTime = (date) => {
                                return date.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                });
                            };

                            const formatDate = (date) => {
                                return date.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            };

                            return `
                                <div class="flight-option">
                                    <div class="flight-header">
                                        <span class="flight-number">Flight: ${segment.carrierCode} ${segment.number}</span>
                                        <span class="flight-price">€${flight.price.total}</span>
                                    </div>
                                    <div class="flight-times">
                                        <div class="departure">
                                            <div class="time">${formatTime(departureTime)}</div>
                                            <div class="date">${formatDate(departureTime)}</div>
                                            <div class="airport">${segment.departure.iataCode}</div>
                                            ${segment.departure.terminal ? `<div class="terminal">Terminal ${segment.departure.terminal}</div>` : ''}
                                        </div>
                                        <div class="flight-duration">
                                            <div class="duration-line">✈</div>
                                            <div class="duration-time">${segment.duration.replace('PT', '').replace('H', 'h ')}</div>
                                        </div>
                                        <div class="arrival">
                                            <div class="time">${formatTime(arrivalTime)}</div>
                                            <div class="date">${formatDate(arrivalTime)}</div>
                                            <div class="airport">${segment.arrival.iataCode}</div>
                                            ${segment.arrival.terminal ? `<div class="terminal">Terminal ${segment.arrival.terminal}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        } catch (error) {
                            console.error('Error processing individual flight data:', {
                                error,
                                flightData: flight
                            });
                            return '';
                        }
                    }).filter(html => html !== '').join('');
                
                if (flights) {
                    flightDetails.innerHTML = flights;
                } else {
                    flightDetails.innerHTML = `<div class="error-message">No flights found under €${maxPrice}.</div>`;
                }
            } else {
                flightDetails.innerHTML = '<div class="error-message">No flights found for this route.</div>';
            }
        } catch (error) {
            console.error('Comprehensive Error in flight info fetching:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            flightDetails.innerHTML = `<div class="error-message">Failed to fetch flight information: ${error.message}</div>`;
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.addMessage(message, true);
        this.chatInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai typing';
        typingIndicator.textContent = '...';
        this.messagesContainer.appendChild(typingIndicator);

        try {
            const aiResponse = await this.generateAIResponse(message);
            this.messagesContainer.removeChild(typingIndicator);
            this.addMessage(aiResponse);

            this.messageHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );

            if (this.messageHistory.length > 11) {
                this.messageHistory = [
                    this.messageHistory[0],
                    ...this.messageHistory.slice(-10)
                ];
            }

            const locations = this.extractLocations(aiResponse);
            if (locations.length > 0) {
                window.mapInterface?.flyToLocation(locations[0]);
            }

        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.messagesContainer.removeChild(typingIndicator);
            this.addMessage("I apologize, but I'm having trouble connecting to the server. Please try again later.");
        }
    }
}

// Initialize chat interface
const chat = new ChatInterface();

// Example usage
// chat.getFlightInfo('JFK', 'LAX');

window.searchFlights = function() {
    const origin = document.getElementById('origin').value.toUpperCase();
    const destination = document.getElementById('destination').value.toUpperCase();
    const departureDate = document.getElementById('departure-date').value;
    
    console.log('Search Flights Called', {
        origin, 
        destination, 
        departureDate
    });
    
    if (!origin || !destination || !departureDate) {
        console.error('Missing flight search parameters');
        document.getElementById('flight-details').innerHTML = 'Please enter origin, destination airports and select a departure date.';
        return;
    }
    
    chat.getFlightInfo(origin, destination, departureDate);
};

document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleFlightInfo');
    const flightInfo = document.getElementById('flight-info');

    toggleBtn.addEventListener('click', function() {
        flightInfo.classList.toggle('collapsed');
    });
});
