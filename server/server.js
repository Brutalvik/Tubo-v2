/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const path = require('path');
const WebSocket = require('ws');
const crypto = require('crypto');
const { URLSearchParams, URL } = require('url');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;
const externalApiBaseUrl = 'https://generativelanguage.googleapis.com';
const externalWsBaseUrl = 'wss://generativelanguage.googleapis.com';
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

const staticPath = path.join(__dirname,'dist');
const publicPath = path.join(__dirname,'public');

// --- DATABASE SETUP (Simple JSON File) ---
const DB_FILE = path.join(__dirname, 'users.db.json');

// Helper to read DB
const readDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
        return [];
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Helper to hash password
const hashPassword = (password, salt) => {
    if (!salt) salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { hash, salt };
};

// Validate password
const validatePassword = (password, hash, salt) => {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

if (!apiKey) {
    console.error("Warning: GEMINI_API_KEY environment variable is not set!");
} else {
    console.log("API KEY FOUND");
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.set('trust proxy', 1);

// --- AUTH API ENDPOINTS ---

// Register
app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password || !firstName) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const users = readDb();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: "Email already exists" });
    }

    const { hash, salt } = hashPassword(password);
    const newUser = {
        uid: 'u_' + Date.now(),
        displayName: `${firstName} ${lastName}`,
        email,
        auth: { hash, salt },
        photoURL: "",
        role: 'GUEST',
        currency: 'USD',
        isHostRegistered: false,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    users.push(newUser);
    writeDb(users);

    // Return user without auth data
    const { auth, ...userProfile } = newUser;
    res.json(userProfile);
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = readDb();
    const user = users.find(u => u.email === email);

    if (!user || !user.auth) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!validatePassword(password, user.auth.hash, user.auth.salt)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const { auth, ...userProfile } = user;
    res.json(userProfile);
});

// Social Login (Simulated Provider, Real Persistence)
app.post('/api/auth/social-login', (req, res) => {
    const { provider, email, firstName, lastName, photoURL } = req.body;
    const users = readDb();
    
    let user = users.find(u => u.email === email);
    
    if (!user) {
        // Create new social user
        user = {
            uid: `u_${provider}_${Date.now()}`,
            displayName: `${firstName} ${lastName}`,
            email,
            photoURL: photoURL || "",
            role: 'GUEST',
            currency: 'USD',
            isHostRegistered: false,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            provider: provider // mark as social
        };
        users.push(user);
        writeDb(users);
    }

    // If user exists but no photo and we have one now, update it
    if (user && !user.photoURL && photoURL) {
        user.photoURL = photoURL;
        writeDb(users);
    }

    const { auth, ...userProfile } = user;
    res.json(userProfile);
});

// Update Profile (e.g., Image Upload)
app.post('/api/user/update', (req, res) => {
    const { uid, updates } = req.body;
    const users = readDb();
    const userIndex = users.findIndex(u => u.uid === uid);

    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    // Apply updates
    users[userIndex] = { ...users[userIndex], ...updates };
    
    // Remove sensitive fields if they tried to update them directly
    if (users[userIndex].auth) delete users[userIndex].auth; // Don't return auth data

    writeDb(users);
    
    // Re-read to get clean object or just use modified
    // We need to strip auth before returning
    const updatedUser = { ...users[userIndex] };
    if (updatedUser.auth) delete updatedUser.auth;

    res.json(updatedUser);
});


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
app.use('/public', express.static(publicPath));
app.use(express.static(staticPath));

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// WebSocket Proxy logic would go here (omitted for brevity as per previous implementation)
