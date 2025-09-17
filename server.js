const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Dynamic import of fetch (Node.js 18+ has built-in fetch, but node-fetch is used for compatibility)
let fetch;
(async () => {
    if (typeof globalThis.fetch === 'undefined') {
        const { default: nodeFetch } = await import('node-fetch');
        fetch = nodeFetch;
    } else {
        fetch = globalThis.fetch;
    }
})();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-image-preview';

if (!API_KEY) {
    console.error('GEMINI_API_KEY environment variable is required');
    process.exit(1);
}

// Proxy text generation image API
app.post('/api/generate-image', async (req, res) => {
    try {
        // Make sure the fetch is loaded
        if (!fetch) {
            if (typeof globalThis.fetch === 'undefined') {
                const { default: nodeFetch } = await import('node-fetch');
                fetch = nodeFetch;
            } else {
                fetch = globalThis.fetch;
            }
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY,
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Agent image editing API
app.post('/api/edit-image', async (req, res) => {
    try {
        // Make sure the fetch is loaded
        if (!fetch) {
            if (typeof globalThis.fetch === 'undefined') {
                const { default: nodeFetch } = await import('node-fetch');
                fetch = nodeFetch;
            } else {
                fetch = globalThis.fetch;
            }
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY,
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Agent multi-graph generation API
app.post('/api/generate-multi-image', async (req, res) => {
    try {
        // Make sure the fetch is loaded
        if (!fetch) {
            if (typeof globalThis.fetch === 'undefined') {
                const { default: nodeFetch } = await import('node-fetch');
                fetch = nodeFetch;
            } else {
                fetch = globalThis.fetch;
            }
        }
        
        // Verify the request body
        if (!req.body || !req.body.contents || !req.body.contents[0] || !req.body.contents[0].parts) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        const parts = req.body.contents[0].parts;
        
        // Verify that there is at least one image and one text part
        const imageParts = parts.filter(part => part.inline_data);
        const textParts = parts.filter(part => part.text);
        
        if (imageParts.length === 0) {
            return res.status(400).json({ error: 'At least one image is required' });
        }
        
        if (textParts.length === 0) {
            return res.status(400).json({ error: 'Text prompt is required' });
        }
        
        if (imageParts.length > 3) {
            return res.status(400).json({ error: 'Maximum 3 images allowed' });
        }

        console.log(`Processing multi-image generation with ${imageParts.length} images and ${textParts.length} text parts`);
        
        // Record the request details for debugging
        console.log('Request details:', {
            model: MODEL,
            imageCount: imageParts.length,
            textCount: textParts.length,
            imageTypes: imageParts.map(part => part.inline_data.mime_type),
            textLength: textParts.map(part => part.text.length)
        });
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY,
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        console.log('Multi-image generation successful');
        res.json(data);
    } catch (error) {
        console.error('Multi-image generation API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});