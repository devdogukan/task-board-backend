import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '#src/app.js';
import { User, Folder, Project, Column } from '#src/models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#src/config/env.js';

// Helper function to generate auth token
const generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('POST /api/columns/projects/:projectId/columns', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
        });
    });

    describe('Successful creation', () => {
        it('should create a column successfully with 201 status', async () => {
            const columnData = {
                name: 'Test Column',
            };

            const response = await request(app)
                .post(`/api/columns/projects/${testProject._id}/columns`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(columnData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Column created successfully',
                data: {
                    name: columnData.name,
                },
            });
            expect(response.body.data.projectId).toBeDefined();
            expect(response.body.data.projectId._id || response.body.data.projectId.id || response.body.data.projectId).toBe(testProject._id.toString());

            // Verify column was created in database
            const column = await Column.findById(response.body.data._id);
            expect(column).toBeTruthy();
            expect(column.name).toBe(columnData.name);
            expect(column.projectId.toString()).toBe(testProject._id.toString());
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when name is missing', async () => {
            const response = await request(app)
                .post(`/api/columns/projects/${testProject._id}/columns`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
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

        it('should return 400 error when name is too long', async () => {
            const response = await request(app)
                .post(`/api/columns/projects/${testProject._id}/columns`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'a'.repeat(51),
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when projectId format is invalid', async () => {
            const response = await request(app)
                .post('/api/columns/projects/invalid-id/columns')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Column',
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
                .post(`/api/columns/projects/${testProject._id}/columns`)
                .send({
                    name: 'Test Column',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('GET /api/columns/projects/:projectId/columns', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
        });

        // Create test columns
        await Column.create([
            {
                name: 'Column 1',
                projectId: testProject._id,
                orderIndex: 0,
            },
            {
                name: 'Column 2',
                projectId: testProject._id,
                orderIndex: 1,
            },
        ]);
    });

    describe('Successful fetch', () => {
        it('should fetch all columns for project successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/columns/projects/${testProject._id}/columns`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Columns fetched successfully',
            });
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when projectId format is invalid', async () => {
            const response = await request(app)
                .get('/api/columns/projects/invalid-id/columns')
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
                .get(`/api/columns/projects/${testProject._id}/columns`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('GET /api/columns/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
        });

        testColumn = await Column.create({
            name: 'Test Column',
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful fetch', () => {
        it('should fetch column by ID successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/columns/${testColumn._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Column fetched successfully',
                data: {
                    _id: testColumn._id.toString(),
                    name: testColumn.name,
                },
            });
        });
    });

    describe('Column not found', () => {
        it('should return 404 error when column does not exist', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const response = await request(app)
                .get(`/api/columns/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Column not found',
            });
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .get('/api/columns/invalid-id')
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
                .get(`/api/columns/${testColumn._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PUT /api/columns/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
        });

        testColumn = await Column.create({
            name: 'Test Column',
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful update', () => {
        it('should update column successfully with 200 status', async () => {
            const updateData = {
                name: 'Updated Column',
            };

            const response = await request(app)
                .put(`/api/columns/${testColumn._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Column updated successfully',
                data: {
                    _id: testColumn._id.toString(),
                    name: updateData.name,
                },
            });

            // Verify column was updated in database
            const updatedColumn = await Column.findById(testColumn._id);
            expect(updatedColumn.name).toBe(updateData.name);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when no fields are provided', async () => {
            const response = await request(app)
                .put(`/api/columns/${testColumn._id}`)
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
                .put(`/api/columns/${testColumn._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'a'.repeat(51),
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
                .put(`/api/columns/${testColumn._id}`)
                .send({
                    name: 'Updated Column',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('DELETE /api/columns/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
        });

        testColumn = await Column.create({
            name: 'Test Column',
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful deletion', () => {
        it('should delete column successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/columns/${testColumn._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Column deleted successfully',
            });

            // Verify column was deleted from database
            const deletedColumn = await Column.findById(testColumn._id);
            expect(deletedColumn).toBeNull();
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .delete('/api/columns/invalid-id')
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
                .delete(`/api/columns/${testColumn._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PATCH /api/columns/:id/reorder', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
        });

        testColumn = await Column.create({
            name: 'Test Column',
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful reorder', () => {
        it('should reorder column successfully with 200 status', async () => {
            // Create another column so we can reorder
            const testColumn2 = await Column.create({
                name: 'Test Column 2',
                projectId: testProject._id,
                orderIndex: 1,
            });

            const response = await request(app)
                .patch(`/api/columns/${testColumn._id}/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    orderIndex: 1,
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Column reordered successfully',
                data: {
                    _id: testColumn._id.toString(),
                    orderIndex: 1,
                },
            });

            // Verify orderIndex was updated in database
            const updatedColumn = await Column.findById(testColumn._id);
            expect(updatedColumn.orderIndex).toBe(1);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when orderIndex is missing', async () => {
            const response = await request(app)
                .patch(`/api/columns/${testColumn._id}/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when orderIndex is negative', async () => {
            const response = await request(app)
                .patch(`/api/columns/${testColumn._id}/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    orderIndex: -1,
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when orderIndex is not an integer', async () => {
            const response = await request(app)
                .patch(`/api/columns/${testColumn._id}/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    orderIndex: 1.5,
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
                .patch(`/api/columns/${testColumn._id}/reorder`)
                .send({
                    orderIndex: 5,
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

