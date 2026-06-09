To test the given implementation, we'll use Jest as our testing framework and Supertest to simulate HTTP requests. We'll create separate test suites for each endpoint to keep the tests organized.

Firstly, let's install the required packages:

```bash
npm install jest supertest
```

Create a new file called `app.test.js` and add the following code:

```javascript
const request = require('supertest');
const app = require('./app');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const redis = require('redis');

describe('app', () => {
    let client;

    beforeAll(() => {
        client = redis.createClient({
            socket: {
                port: 6379,
                host: 'localhost'
            }
        });
    });

    afterAll((done) => {
        client.quit(done);
    });

    describe('POST /register-client', () => {
        it('should register a client', async () => {
            const response = await request(app)
                .post('/register-client')
                .send({
                    redirectUri: 'https://example.com',
                    grantType: 'authorization_code',
                    scope: 'read_write'
                })
                .expect(200);

            expect(response.body).toHaveProperty('clientId');
            expect(response.body).toHaveProperty('clientSecret');
        });
    });

    describe('POST /register-user', () => {
        it('should register a user', async () => {
            const response = await request(app)
                .post('/register-user')
                .send({
                    username: 'john_doe',
                    password: 'password123',
                    email: 'johndoe@example.com'
                })
                .expect(200);

            expect(response.body).toHaveProperty('userId');
        });
    });

    describe('POST /login', () => {
        it('should login a user', async () => {
            // Register a client
            const clientResponse = await request(app)
                .post('/register-client')
                .send({
                    redirectUri: 'https://example.com',
                    grantType: 'authorization_code',
                    scope: 'read_write'
                })
                .expect(200);

            // Register a user
            await request(app)
                .post('/register-user')
                .send({
                    username: 'john_doe',
                    password: 'password123',
                    email: 'johndoe@example.com'
                })
                .expect(200);

            // Login the user
            const response = await request(app)
                .post('/login')
                .send({
                    userId: Object.keys(app.users)[0],
                    password: 'password123',
                    clientId: clientResponse.body.clientId,
                    scope: 'read_write'
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
        });

        it('should return 401 for invalid credentials', async () => {
            await request(app)
                .post('/login')
                .send({
                    userId: 'invalid_user_id',
                    password: 'invalid_password',
                    clientId: 'invalid_client_id',
                    scope: 'read_write'
                })
                .expect(401);
        });
    });

    describe('POST /get-access-token', () => {
        it('should get an access token', async () => {
            // Register a client
            const clientResponse = await request(app)
                .post('/register-client')
                .send({
                    redirectUri: 'https://example.com',
                    grantType: 'authorization_code',
                    scope: 'read_write'
                })
                .expect(200);

            // Register a user
            await request(app)
                .post('/register-user')
                .send({
                    username: 'john_doe',
                    password: 'password123',
                    email: 'johndoe@example.com'
                })
                .expect(200);

            // Login the user
            const loginResponse = await request(app)
                .post('/login')
                .send({
                    userId: Object.keys(app.users)[0],
                    password: 'password123',
                    clientId: clientResponse.body.clientId,
                    scope: 'read_write'
                })
                .expect(200);

            // Get an access token
            const response = await request(app)
                .post('/get-access-token')
                .send({
                    refreshToken: loginResponse.body.refreshToken
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
        });

        it('should return 401 for invalid refresh token', async () => {
            await request(app)
                .post('/get-access-token')
                .send({
                    refreshToken: 'invalid_refresh_token'
                })
                .expect(401);
        });
    });

    describe('GET /validate-access-token', () => {
        it('should validate an access token', async () => {
            // Register a client
            const clientResponse = await request(app)
                .post('/register-client')
                .send({
                    redirectUri: 'https://example.com',
                    grantType: 'authorization_code',
                    scope: 'read_write'
                })
                .expect(200);

            // Register a user
            await request(app)
                .post('/register-user')
                .send({
                    username: 'john_doe',
                    password: 'password123',
                    email: 'johndoe@example.com'
                })
                .expect(200);

            // Login the user
            const loginResponse = await request(app)
                .post('/login')
                .send({
                    userId: Object.keys(app.users)[0],
                    password: 'password123',
                    clientId: clientResponse.body.clientId,
                    scope: 'read_write'
                })
                .expect(200);

            // Validate the access token
            const response = await request(app)
                .get('/validate-access-token')
                .set("Authorization", loginResponse.body.accessToken)
                .expect(200);

            expect(response.body).toHaveProperty('valid', true);
        });

        it('should return invalid for an invalid access token', async () => {
            const response = await request(app)
                .get('/validate-access-token')
                .set("Authorization", 'invalid_access_token')
                .expect(200);

            expect(response.body).toHaveProperty('valid', false);
        });
    });
});
```

This test suite covers all endpoints and scenarios, including registering a client, registering a user, logging in a user, getting an access token, and validating an access token.

Make sure to update the `app.js` file to export the `app` instance and the `users` object:

```javascript
module.exports = { app, users };
```

Run the tests using the following command:

```bash
jest
```