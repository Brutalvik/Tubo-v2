/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;
const externalApiBaseUrl = 'https://generativelanguage.googleapis.com';
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

const staticPath = path.join(__dirname,'dist');
const publicPath = path.join(__dirname,'public');

if (!apiKey) {
    console.error("Warning: GEMINI_API_KEY environment variable is not set!");
} else {
    console.log("API KEY FOUND");
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.set('trust proxy', 1);

// Serve public assets (service worker, etc)
app.use('/public', express.static(publicPath));

// --- PROXY LOGIC ---

const proxyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api-proxy', proxyLimiter);

app.use('/api-proxy', async (req, res, next) => {
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        return next();
    }
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Goog-Api-Key');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.sendStatus(200);
    }

    try {
        const targetPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
        const apiUrl = `${externalApiBaseUrl}/${targetPath}`;
        
        const outgoingHeaders = {};
        for (const header in req.headers) {
            if (!['host', 'connection', 'content-length', 'transfer-encoding', 'upgrade'].includes(header.toLowerCase())) {
                outgoingHeaders[header] = req.headers[header];
            }
        }
        outgoingHeaders['X-Goog-Api-Key'] = apiKey;
        if (!outgoingHeaders['content-type'] && ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            outgoingHeaders['Content-Type'] = 'application/json';
        }

        const axiosConfig = {
            method: req.method,
            url: apiUrl,
            headers: outgoingHeaders,
            responseType: 'stream',
            data: req.body
        };

        const apiResponse = await axios(axiosConfig);
        for (const header in apiResponse.headers) {
            res.setHeader(header, apiResponse.headers[header]);
        }
        res.status(apiResponse.status);
        apiResponse.data.pipe(res);

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Proxy error', details: error.message });
        }
    }
});

// Serves the frontend
app.get('/', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, indexHtmlData) => {
        if (err) return res.sendFile(path.join(publicPath, 'placeholder.html'));
        if (!apiKey) return res.sendFile(indexPath);

        let injectedHtml = indexHtmlData;
        const scripts = `<script src="/public/websocket-interceptor.js" defer></script>
                         <script>if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');</script>`;
        
        if (injectedHtml.includes('<head>')) {
            injectedHtml = injectedHtml.replace('<head>', `<head>${scripts}`);
        } else {
            injectedHtml = `${scripts}${indexHtmlData}`;
        }
        res.send(injectedHtml);
    });
});

app.get('/service-worker.js', (req, res) => res.sendFile(path.join(publicPath, 'service-worker.js')));

app.use(express.static(staticPath));

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});