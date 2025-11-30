import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '#src/app.js';
import { User } from '#src/models/index.js';
import bcrypt from 'bcryptjs';

describe('POST /api/auth/register', () => {
    const validUserData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
    };

    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});
    });

    describe('Successful registration', () => {
        it('should register a new user successfully with 201 status', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUserData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User registered successfully',
                data: {
                    email: validUserData.email,
                    firstName: validUserData.firstName,
                    lastName: validUserData.lastName,
                },
            });

            // Verify password is not in response
            expect(response.body.data).not.toHaveProperty('password');

            // Verify user was created in database
            const user = await User.findOne({
                email: validUserData.email,
            }).select('+password');
            expect(user).toBeTruthy();
            expect(user.email).toBe(validUserData.email);
            expect(user.firstName).toBe(validUserData.firstName);
            expect(user.lastName).toBe(validUserData.lastName);
            // Password should be hashed
            expect(user.password).not.toBe(validUserData.password);
            expect(user.password).toBeTruthy();
        });
    });

    describe('Duplicate email', () => {
        it('should return 409 error when email already exists', async () => {
            // Create a user first
            const hashedPassword = await bcrypt.hash(validUserData.password, 10);
            await User.create({
                ...validUserData,
                password: hashedPassword,
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send(validUserData)
                .expect(409);

            expect(response.body).toMatchObject({
                success: false,
                message: 'User already exists',
            });
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when email is missing', async () => {
            const { email, ...userDataWithoutEmail } = validUserData;

            const response = await request(app)
                .post('/api/auth/register')
                .send(userDataWithoutEmail)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors.some((e) => e.field === 'email')).toBe(
                true,
            );
        });

        it('should return 400 error when firstName is missing', async () => {
            const { firstName, ...userDataWithoutFirstName } = validUserData;

            const response = await request(app)
                .post('/api/auth/register')
                .send(userDataWithoutFirstName)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'firstName'),
            ).toBe(true);
        });

        it('should return 400 error when lastName is missing', async () => {
            const { lastName, ...userDataWithoutLastName } = validUserData;

            const response = await request(app)
                .post('/api/auth/register')
                .send(userDataWithoutLastName)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'lastName'),
            ).toBe(true);
        });

        it('should return 400 error when password is missing', async () => {
            const { password, ...userDataWithoutPassword } = validUserData;

            const response = await request(app)
                .post('/api/auth/register')
                .send(userDataWithoutPassword)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'password'),
            ).toBe(true);
        });

        it('should return 400 error when email format is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUserData,
                    email: 'invalid-email',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            const emailError = response.body.errors.find(
                (e) => e.field === 'email',
            );
            expect(emailError).toBeTruthy();
        });

        it('should return 400 error when password is too short (<6 characters)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUserData,
                    password: '12345',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            const passwordError = response.body.errors.find(
                (e) => e.field === 'password',
            );
            expect(passwordError).toBeTruthy();
        });

        it('should return 400 error when password is too long (>32 characters)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...validUserData,
                    password: 'a'.repeat(33),
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            const passwordError = response.body.errors.find(
                (e) => e.field === 'password',
            );
            expect(passwordError).toBeTruthy();
        });
    });
});

describe('POST /api/auth/login', () => {
    const validLoginData = {
        email: 'test@example.com',
        password: 'password123'
    };

    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});
        // Create a user first
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });
    });

    describe('Successful login', () => {
        it('should login a user successfully with 200 status', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(validLoginData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User logged in successfully',
                data: {
                    user: {
                        _id: expect.any(String),
                        email: validLoginData.email,
                        firstName: 'John',
                        lastName: 'Doe',
                        avatar: null,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    },
                    token: expect.any(String),
                },
            });
            
            expect(response.body.data.user).not.toHaveProperty('password');
            expect(response.body.data.token).toBeTruthy();
        })
    });

    describe('Invalid login', () => {
        it('should return 400 error when password is incorrect', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    ...validLoginData,
                    password: 'incorrect-password',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Invalid email or password',
            });
        })

        it('should return 400 error when email is not found', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    ...validLoginData,
                    email: 'nonexistent-email@example.com',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Invalid email or password',
            });
        })
    });

    describe('Validation errors', () => {
        it('should return 400 error when email is missing', async () => {
            const { email, ...loginDataWithoutEmail } = validLoginData;

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginDataWithoutEmail)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });

            expect(response.body.errors).toBeInstanceOf(Array);
            const emailError = response.body.errors.find(
                (e) => e.field === 'email',
            );
            expect(emailError).toBeTruthy();
            expect(emailError.message).toBe('Email is required');
        })

        it('should return 400 error when password is missing', async () => {
            const { password, ...loginDataWithoutPassword } = validLoginData;

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginDataWithoutPassword)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });

            expect(response.body.errors).toBeInstanceOf(Array);
            const passwordError = response.body.errors.find(
                (e) => e.field === 'password',
            );
            expect(passwordError).toBeTruthy();
            expect(passwordError.message).toBe('Password is required');
        })

        it('should return 400 error when email is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    ...validLoginData,
                    email: 'invalid-email',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });

            expect(response.body.errors).toBeInstanceOf(Array);
            const emailError = response.body.errors.find(
                (e) => e.field === 'email',
            );
            expect(emailError).toBeTruthy();
            expect(emailError.message).toBe('Email must be a valid email address');
        });

        it('should return 400 error when password is too short (<6 characters)', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    ...validLoginData,
                    password: '12345',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });

            expect(response.body.errors).toBeInstanceOf(Array);
            const passwordError = response.body.errors.find(
                (e) => e.field === 'password',
            );
            expect(passwordError).toBeTruthy();
            expect(passwordError.message).toBe('Password must be at least 6 characters long');
        });

        it('should return 400 error when password is too long (>32 characters)', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    ...validLoginData,
                    password: 'a'.repeat(33),
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });

            expect(response.body.errors).toBeInstanceOf(Array);
            const passwordError = response.body.errors.find(
                (e) => e.field === 'password',
            );
            expect(passwordError).toBeTruthy();
            expect(passwordError.message).toBe('Password must be at most 32 characters long');
        });
    });
});

describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('Successful logout', () => {
        it('should logout a user successfully with 200 status', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User logged out successfully',
            });

            // Verify refreshToken cookie is cleared
            expect(response.headers['set-cookie']).toBeDefined();
            const cookies = response.headers['set-cookie'];
            const refreshTokenCookie = cookies.find((cookie) =>
                cookie.startsWith('refreshToken='),
            );
            expect(refreshTokenCookie).toContain('refreshToken=;');
        });
    });
});

describe('GET /api/auth/me', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('Successful fetch', () => {
        it('should fetch current user successfully with valid token', async () => {
            // Create a user first
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: hashedPassword,
            });

            // Login to get token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                })
                .expect(200);

            const token = loginResponse.body.data.token;

            // Fetch current user
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User fetched successfully',
                data: {
                    _id: user._id.toString(),
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });

            expect(response.body.data).not.toHaveProperty('password');
        });
    });

    describe('Unauthorized access', () => {
        it('should return 401 error when token is not provided', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });

        it('should return 401 error when token is invalid', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
            });
        });

        it('should return 404 error when user does not exist', async () => {
            // Create a user and get token
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: hashedPassword,
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                })
                .expect(200);

            const token = loginResponse.body.data.token;

            // Delete the user
            await User.deleteMany({});

            // Try to fetch current user with token for deleted user
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'User not found',
            });
        });
    });
});

