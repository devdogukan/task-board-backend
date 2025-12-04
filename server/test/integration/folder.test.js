import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '#src/app.js';
import { User, Folder } from '#src/models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#src/config/env.js';

// Helper function to generate auth token
const generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('POST /api/folders', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        authToken = generateAuthToken(testUser._id.toString());
    });

    describe('Successful creation', () => {
        it('should create a folder successfully with 201 status', async () => {
            const folderData = {
                name: 'Test Folder',
                description: 'Test Description',
            };

            const response = await request(app)
                .post('/api/folders')
                .set('Authorization', `Bearer ${authToken}`)
                .send(folderData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Folder created successfully',
                data: {
                    name: folderData.name,
                    description: folderData.description,
                },
            });
            expect(response.body.data.owner).toBeDefined();
            expect(response.body.data.owner._id).toBe(testUser._id.toString());

            // Verify folder was created in database
            const folder = await Folder.findById(response.body.data._id);
            expect(folder).toBeTruthy();
            expect(folder.name).toBe(folderData.name);
            expect(folder.description).toBe(folderData.description);
            expect(folder.owner.toString()).toBe(testUser._id.toString());
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when name is missing', async () => {
            const response = await request(app)
                .post('/api/folders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    description: 'Test Description',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'name'),
            ).toBe(true);
        });

        it('should return 400 error when description is missing', async () => {
            const response = await request(app)
                .post('/api/folders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Folder',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'description'),
            ).toBe(true);
        });

        it('should return 400 error when name is too long', async () => {
            const response = await request(app)
                .post('/api/folders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'a'.repeat(101),
                    description: 'Test Description',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when description is too long', async () => {
            const response = await request(app)
                .post('/api/folders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Folder',
                    description: 'a'.repeat(501),
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
                .post('/api/folders')
                .send({
                    name: 'Test Folder',
                    description: 'Test Description',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });

        it('should return 401 error when token is invalid', async () => {
            const response = await request(app)
                .post('/api/folders')
                .set('Authorization', 'Bearer invalid-token')
                .send({
                    name: 'Test Folder',
                    description: 'Test Description',
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
        });
    });
});

describe('GET /api/folders', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        authToken = generateAuthToken(testUser._id.toString());

        // Create test folders
        await Folder.create([
            {
                name: 'Folder 1',
                description: 'Description 1',
                owner: testUser._id,
            },
            {
                name: 'Folder 2',
                description: 'Description 2',
                owner: testUser._id,
            },
        ]);
    });

    describe('Successful fetch', () => {
        it('should fetch all folders for user successfully with 200 status', async () => {
            const response = await request(app)
                .get('/api/folders')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Folders fetched successfully',
            });
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('Authentication required', () => {
        it('should return 401 error when token is not provided', async () => {
            const response = await request(app)
                .get('/api/folders')
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('GET /api/folders/:id', () => {
    let authToken;
    let testUser;
    let testFolder;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        authToken = generateAuthToken(testUser._id.toString());

        testFolder = await Folder.create({
            name: 'Test Folder',
            description: 'Test Description',
            owner: testUser._id,
        });
    });

    describe('Successful fetch', () => {
        it('should fetch folder by ID successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/folders/${testFolder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Folder fetched successfully',
                data: {
                    _id: testFolder._id.toString(),
                    name: testFolder.name,
                    description: testFolder.description,
                },
            });
        });
    });

    describe('Folder not found', () => {
        it('should return 404 error when folder does not exist', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const response = await request(app)
                .get(`/api/folders/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Folder not found or you do not have access',
            });
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .get('/api/folders/invalid-id')
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
                .get(`/api/folders/${testFolder._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PUT /api/folders/:id', () => {
    let authToken;
    let testUser;
    let testFolder;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        authToken = generateAuthToken(testUser._id.toString());

        testFolder = await Folder.create({
            name: 'Test Folder',
            description: 'Test Description',
            owner: testUser._id,
        });
    });

    describe('Successful update', () => {
        it('should update folder successfully with 200 status', async () => {
            const updateData = {
                name: 'Updated Folder',
                description: 'Updated Description',
            };

            const response = await request(app)
                .put(`/api/folders/${testFolder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Folder updated successfully',
                data: {
                    _id: testFolder._id.toString(),
                    name: updateData.name,
                    description: updateData.description,
                },
            });

            // Verify folder was updated in database
            const updatedFolder = await Folder.findById(testFolder._id);
            expect(updatedFolder.name).toBe(updateData.name);
            expect(updatedFolder.description).toBe(updateData.description);
        });

        it('should update only name when only name is provided', async () => {
            const updateData = {
                name: 'Updated Name Only',
            };

            const response = await request(app)
                .put(`/api/folders/${testFolder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.description).toBe(testFolder.description);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when no fields are provided', async () => {
            const response = await request(app)
                .put(`/api/folders/${testFolder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when name is too long', async () => {
            const response = await request(app)
                .put(`/api/folders/${testFolder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'a'.repeat(101),
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
                .put(`/api/folders/${testFolder._id}`)
                .send({
                    name: 'Updated Folder',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('DELETE /api/folders/:id', () => {
    let authToken;
    let testUser;
    let testFolder;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        authToken = generateAuthToken(testUser._id.toString());

        testFolder = await Folder.create({
            name: 'Test Folder',
            description: 'Test Description',
            owner: testUser._id,
        });
    });

    describe('Successful deletion', () => {
        it('should delete folder successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/folders/${testFolder._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Folder deleted successfully',
            });

            // Verify folder was deleted from database
            const deletedFolder = await Folder.findById(testFolder._id);
            expect(deletedFolder).toBeNull();
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .delete('/api/folders/invalid-id')
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
                .delete(`/api/folders/${testFolder._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('POST /api/folders/:id/members', () => {
    let authToken;
    let testUser;
    let testFolder;
    let memberUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        memberUser = await User.create({
            email: 'member@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            password: hashedPassword,
        });

        authToken = generateAuthToken(testUser._id.toString());

        testFolder = await Folder.create({
            name: 'Test Folder',
            description: 'Test Description',
            owner: testUser._id,
        });
    });

    describe('Successful member addition', () => {
        it('should add member to folder successfully with 200 status', async () => {
            const response = await request(app)
                .post(`/api/folders/${testFolder._id}/members`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    memberId: memberUser._id.toString(),
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Member added successfully',
            });

            // Verify member was added in database
            const updatedFolder = await Folder.findById(testFolder._id);
            expect(updatedFolder.members).toContainEqual(memberUser._id);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when memberId is missing', async () => {
            const response = await request(app)
                .post(`/api/folders/${testFolder._id}/members`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when memberId format is invalid', async () => {
            const response = await request(app)
                .post(`/api/folders/${testFolder._id}/members`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    memberId: 'invalid-id',
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
                .post(`/api/folders/${testFolder._id}/members`)
                .send({
                    memberId: memberUser._id.toString(),
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('DELETE /api/folders/:id/members/:userId', () => {
    let authToken;
    let testUser;
    let testFolder;
    let memberUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        memberUser = await User.create({
            email: 'member@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            password: hashedPassword,
        });

        authToken = generateAuthToken(testUser._id.toString());

        testFolder = await Folder.create({
            name: 'Test Folder',
            description: 'Test Description',
            owner: testUser._id,
            members: [memberUser._id],
        });
    });

    describe('Successful member removal', () => {
        it('should remove member from folder successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/folders/${testFolder._id}/members/${memberUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Member removed successfully',
            });

            // Verify member was removed from database
            const updatedFolder = await Folder.findById(testFolder._id);
            expect(updatedFolder.members).not.toContainEqual(memberUser._id);
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when folder ID format is invalid', async () => {
            const response = await request(app)
                .delete(`/api/folders/invalid-id/members/${memberUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when user ID format is invalid', async () => {
            const response = await request(app)
                .delete(`/api/folders/${testFolder._id}/members/invalid-id`)
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
                .delete(`/api/folders/${testFolder._id}/members/${memberUser._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

