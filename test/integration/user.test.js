import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '#src/app.js';
import { User } from '#src/models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#src/config/env.js';

// Helper function to generate auth token
const generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('GET /api/users/:id', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});

        // Create a test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        // Generate auth token
        authToken = generateAuthToken(testUser._id.toString());
    });

    describe('Successful fetch', () => {
        it('should fetch a user by ID successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User fetched successfully',
                data: {
                    _id: testUser._id.toString(),
                    email: testUser.email,
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                },
            });

            // Verify password is not in response
            expect(response.body.data).not.toHaveProperty('password');
        });
    });

    describe('User not found', () => {
        it('should return 404 error when user does not exist', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const response = await request(app)
                .get(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'User not found',
            });
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .get('/api/users/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'id'),
            ).toBe(true);
        });
    });

    describe('Authentication required', () => {
        it('should return 401 error when token is not provided', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });

        it('should return 401 error when token is invalid', async () => {
            const response = await request(app)
                .get(`/api/users/${testUser._id}`)
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });
});

describe('PUT /api/users/:id', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});

        // Create a test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        // Generate auth token
        authToken = generateAuthToken(testUser._id.toString());
    });

    describe('Successful update', () => {
        it('should update a user successfully with 200 status', async () => {
            const updateData = {
                firstName: 'Jane',
                lastName: 'Smith',
            };

            const response = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User updated successfully',
                data: {
                    _id: testUser._id.toString(),
                    email: testUser.email,
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
            });

            // Verify password is not in response
            expect(response.body.data).not.toHaveProperty('password');

            // Verify user was updated in database
            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser.firstName).toBe('Jane');
            expect(updatedUser.lastName).toBe('Smith');
        });

        it('should update email successfully', async () => {
            const updateData = {
                email: 'newemail@example.com',
            };

            const response = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.data.email).toBe('newemail@example.com');

            // Verify user was updated in database
            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser.email).toBe('newemail@example.com');
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when email format is invalid', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
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

        it('should return 400 error when no fields are provided', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
        });

        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .put('/api/users/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    firstName: 'Jane',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });
    });

    describe('Authentication required', () => {
        it('should return 401 error when token is not provided', async () => {
            const response = await request(app)
                .put(`/api/users/${testUser._id}`)
                .send({
                    firstName: 'Jane',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('DELETE /api/users/:id', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});

        // Create a test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        // Generate auth token
        authToken = generateAuthToken(testUser._id.toString());
    });

    describe('Successful deletion', () => {
        it('should delete a user successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User deleted successfully',
            });

            // Verify user was deleted from database
            const deletedUser = await User.findById(testUser._id);
            expect(deletedUser).toBeNull();
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .delete('/api/users/invalid-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'id'),
            ).toBe(true);
        });
    });

    describe('Authentication required', () => {
        it('should return 401 error when token is not provided', async () => {
            const response = await request(app)
                .delete(`/api/users/${testUser._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('GET /api/users', () => {
    let authToken;

    beforeEach(async () => {
        // Clean up database before each test
        await User.deleteMany({});

        // Create test users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user1 = await User.create({
            email: 'test1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        const user2 = await User.create({
            email: 'test2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            password: hashedPassword,
        });

        // Generate auth token
        authToken = generateAuthToken(user1._id.toString());
    });

    describe('Successful fetch', () => {
        it('should fetch all users successfully with 200 status', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Users fetched successfully',
            });
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);

            // Verify passwords are not in response
            response.body.data.forEach((user) => {
                expect(user).not.toHaveProperty('password');
            });
        });

        it('should handle query parameters for pagination', async () => {
            const response = await request(app)
                .get('/api/users?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when page is invalid', async () => {
            const response = await request(app)
                .get('/api/users?page=0')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when limit is too high', async () => {
            const response = await request(app)
                .get('/api/users?limit=11')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });
    });

    describe('Authentication required', () => {
        it('should return 401 error when token is not provided', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

