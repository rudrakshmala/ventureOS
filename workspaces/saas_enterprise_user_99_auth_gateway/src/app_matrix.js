```javascript
const express = require('express');
const redis = require('redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const app = express();
app.use(express.json());

const client = redis.createClient({
    socket: {
        port: 6379,
        host: 'localhost'
    }
});

// Clients table
const clients = {};

// Users table
const users = {};

// Access tokens table
const accessTokens = {};

// Refresh tokens table
const refreshTokens = {};

// Register a client
app.post('/register-client', (req, res) => {
    const clientId = uuid.v4();
    const clientSecret = uuid.v4();
    clients[clientId] = {
        clientId,
        clientSecret,
        redirectUri: req.body.redirectUri,
        grantType: req.body.grantType,
        scope: req.body.scope,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    res.json({ clientId, clientSecret });
});

// Register a user
app.post('/register-user', (req, res) => {
    const userId = uuid.v4();
    const password = bcrypt.hashSync(req.body.password, 10);
    users[userId] = {
        userId,
        username: req.body.username,
        password,
        email: req.body.email,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    res.json({ userId });
});

// Login user
app.post('/login', (req, res) => {
    const userId = req.body.userId;
    const password = req.body.password;
    if (users[userId] && bcrypt.compareSync(password, users[userId].password)) {
        const accessToken = jwt.sign({ userId }, 'secret-key', {
            expiresIn: '1h'
        });
        const refreshToken = uuid.v4();
        accessTokens[accessToken] = {
            userId,
            clientId: req.body.clientId,
            scope: req.body.scope,
            expiresAt: new Date(Date.now() + 3600000),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        refreshTokens[refreshToken] = {
            userId,
            clientId: req.body.clientId,
            expiresAt: new Date(Date.now() + 3600000),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        client.hset('session', userId, JSON.stringify({
            userId,
            clientId: req.body.clientId,
            accessToken,
            expiresAt: new Date(Date.now() + 3600000)
        }));
        res.json({ accessToken, refreshToken });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Get access token
app.post('/get-access-token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshTokens[refreshToken]) {
        const userId = refreshTokens[refreshToken].userId;
        const clientId = refreshTokens[refreshToken].clientId;
        const scope = refreshTokens[refreshToken].scope;
        const expiresAt = refreshTokens[refreshToken].expiresAt;
        const accessToken = jwt.sign({ userId }, 'secret-key', {
            expiresIn: '1h'
        });
        accessTokens[accessToken] = {
            userId,
            clientId,
            scope,
            expiresAt: new Date(Date.now() + 3600000),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        client.hset('session', userId, JSON.stringify({
            userId,
            clientId,
            accessToken,
            expiresAt: new Date(Date.now() + 3600000)
        }));
        res.json({ accessToken });
    } else {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// Validate access token
app.get('/validate-access-token', (req, res) => {
    const accessToken = req.header('Authorization');
    if (accessTokens[accessToken]) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
```