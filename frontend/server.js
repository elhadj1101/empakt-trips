require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const qs = require('querystring');
const path = require('path');

const app = express();
const port = 5502;

// Amadeus API configuration
const AMADEUS_BASE_URL = 'api.amadeus.com'; // Update Amadeus API base URL

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// CORS configuration
app.use(cors({
    origin: ['http://127.0.0.1:5502', 'http://localhost:5502'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(__dirname));

// Middleware to log all incoming requests with extensive details
app.use((req, res, next) => {
    console.log('===== INCOMING REQUEST =====', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        headers: JSON.stringify(req.headers, null, 2),
        body: JSON.stringify(req.body, null, 2),
        query: JSON.stringify(req.query, null, 2),
        params: JSON.stringify(req.params, null, 2)
    });

    // Log request body parsing
    console.log('Request Body Parsing:', {
        contentType: req.headers['content-type'],
        bodyParsed: !!req.body,
        bodyKeys: req.body ? Object.keys(req.body) : 'N/A'
    });

    next();
});

// Middleware to ensure body is parsed
app.use((req, res, next) => {
    if (req.method === 'POST' && req.path === '/api/flight-info') {
        console.log('Pre-processing flight-info request', {
            contentType: req.headers['content-type'],
            bodyParsed: !!req.body,
            bodyKeys: req.body ? Object.keys(req.body) : 'N/A'
        });
    }
    next();
});

// Error handling middleware with detailed logging
app.use((err, req, res, next) => {
    console.error('===== GLOBAL ERROR HANDLER =====', {
        error: err,
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        method: req.method,
        path: req.path,
        headers: JSON.stringify(req.headers, null, 2),
        body: JSON.stringify(req.body, null, 2)
    });

    res.status(500).json({
        error: 'Unexpected Server Error',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Amadeus API configuration
let amadeusAccessToken = null;
let tokenExpiryTime = null;

async function getAmadeusToken() {
    if (amadeusAccessToken && tokenExpiryTime && new Date() < tokenExpiryTime) {
        return amadeusAccessToken;
    }

    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
        console.error('Amadeus API credentials are missing');
        throw new Error('Amadeus API credentials not configured');
    }

    try {
        console.log('Attempting to get new Amadeus token...');
        const response = await axios({
            method: 'post',
            url: `https://${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({
                grant_type: 'client_credentials',
                client_id: process.env.AMADEUS_API_KEY,
                client_secret: process.env.AMADEUS_API_SECRET
            }),
            timeout: 10000,  // 10 seconds timeout
            responseType: 'json'
        });

        console.log('Token retrieval response:', {
            status: response.status,
            data: response.data
        });

        // Validate token response
        if (!response.data || !response.data.access_token) {
            console.error('Invalid token response:', response.data);
            throw new Error('Failed to retrieve valid access token');
        }

        console.log('Successfully obtained Amadeus token');
        amadeusAccessToken = response.data.access_token;
        
        // Calculate expiry time, subtracting 5 minutes for safety
        const expiresIn = response.data.expires_in ? 
            (response.data.expires_in - 300) * 1000 : 
            3600000; // Default to 1 hour if not specified
        
        tokenExpiryTime = new Date(Date.now() + expiresIn);
        
        return amadeusAccessToken;
    } catch (error) {
        console.error('Error getting Amadeus token:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });

        throw new Error(`Failed to retrieve Amadeus token: ${error.message}`);
    }
}

// Add OPTIONS handler for preflight requests
app.options('/api/flight-info', cors());

// Add explicit route for flight-info POST endpoint
app.post('/api/flight-info', cors(), async (req, res) => {
    console.log('===== FLIGHT INFO ENDPOINT CALLED =====', {
        timestamp: new Date().toISOString(),
        requestBody: JSON.stringify(req.body, null, 2),
        requestHeaders: JSON.stringify(req.headers, null, 2)
    });

    // Detailed input validation and logging
    console.log('Input Validation', {
        origin: req.body.origin,
        destination: req.body.destination,
        departureDate: req.body.departureDate,
        missingFields: {
            origin: !req.body.origin,
            destination: !req.body.destination,
            departureDate: !req.body.departureDate
        }
    });
    
    const { origin, destination, departureDate } = req.body;
    
    if (!origin || !destination || !departureDate) {
        console.error('Invalid Input Parameters', { 
            origin, 
            destination, 
            departureDate
        });
        return res.status(400).json({
            error: 'Invalid Parameters',
            details: 'Origin, destination, and departure date are required',
            receivedData: { origin, destination, departureDate }
        });
    }

    // Validate API credentials with detailed logging
    console.log('Checking API Credentials', {
        hasApiKey: !!process.env.AMADEUS_API_KEY,
        hasApiSecret: !!process.env.AMADEUS_API_SECRET
    });

    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
        console.error('Missing Amadeus API Credentials');
        return res.status(500).json({
            error: 'Server Configuration Error',
            details: 'Amadeus API credentials not configured'
        });
    }

    try {
        console.log('Attempting to get Amadeus Token');
        const token = await getAmadeusToken();
        console.log('Amadeus Token Retrieved Successfully', {
            tokenLength: token.length,
            tokenFirstChars: token.substring(0, 10)
        });

        // Prepare Amadeus API request parameters
        const params = {
            originLocationCode: origin.toUpperCase(),
            destinationLocationCode: destination.toUpperCase(),
            departureDate: departureDate,
            adults: '1',
            max: '250'  // Increased max results
        };

        console.log('Prepared Amadeus API Request Parameters', {
            params: JSON.stringify(params, null, 2)
        });

        // Make Amadeus API request with comprehensive error handling
        let apiResponse;
        try {
            console.log('Making request to Amadeus Flight Offers API');
            apiResponse = await axios({
                method: 'get',
                url: `https://${AMADEUS_BASE_URL}/v2/shopping/flight-offers`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json, application/vnd.amadeus+json',
                    'Content-Type': 'application/json'
                },
                params: params,
                timeout: 15000,  // 15 seconds timeout
                responseType: 'json'
            });

            console.log('Amadeus API Response Received', {
                status: apiResponse.status,
                headersReceived: Object.keys(apiResponse.headers),
                dataType: typeof apiResponse.data,
                dataKeys: apiResponse.data ? Object.keys(apiResponse.data) : 'N/A'
            });
        } catch (axiosError) {
            console.error('Amadeus API Request Failed', {
                errorName: axiosError.name,
                errorMessage: axiosError.message,
                errorCode: axiosError.code,
                responseStatus: axiosError.response?.status,
                responseData: JSON.stringify(axiosError.response?.data, null, 2),
                requestParams: JSON.stringify(params, null, 2)
            });

            return res.status(axiosError.response?.status || 500).json({
                error: 'Flight Search Failed',
                details: axiosError.message,
                debugInfo: {
                    requestParams: params,
                    responseStatus: axiosError.response?.status,
                    responseData: axiosError.response?.data
                }
            });
        }

        // Validate API response structure
        if (!apiResponse.data || !apiResponse.data.data) {
            console.error('Invalid Amadeus API Response Structure', {
                receivedData: JSON.stringify(apiResponse.data, null, 2),
                dataType: typeof apiResponse.data,
                dataKeys: apiResponse.data ? Object.keys(apiResponse.data) : 'N/A'
            });

            return res.status(500).json({
                error: 'Invalid Response',
                details: 'Unexpected response format from Amadeus API',
                rawResponse: apiResponse.data
            });
        }

        // Prepare and send response
        const responseToSend = {
            data: apiResponse.data.data,
            meta: apiResponse.data.meta || {},
            dictionaries: apiResponse.data.dictionaries || {}
        };

        console.log('Sending Response to Client', {
            flightCount: responseToSend.data.length,
            metaInfo: JSON.stringify(responseToSend.meta, null, 2)
        });

        res.json(responseToSend);
    } catch (unexpectedError) {
        console.error('Unexpected Error in Flight Search', {
            errorName: unexpectedError.name,
            errorMessage: unexpectedError.message,
            errorStack: unexpectedError.stack
        });

        res.status(500).json({
            error: 'Unexpected Server Error',
            details: unexpectedError.message,
            debugInfo: process.env.NODE_ENV === 'development' ? unexpectedError.stack : undefined
        });
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    if (!openai) {
        return res.status(503).json({
            error: 'OpenAI service not available',
            details: 'OpenAI API key not configured'
        });
    }

    try {
        const { messages } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 500
        });

        res.json({ 
            message: completion.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request' 
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
