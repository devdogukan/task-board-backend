import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '#src/app.js';
import { User, Folder, Project, Column, Task } from '#src/models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#src/config/env.js';

// Helper function to generate auth token
const generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('POST /api/tasks/projects/:projectId/tasks', () => {
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
        await Task.deleteMany({});

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

    describe('Successful creation', () => {
        it('should create a task successfully with 201 status', async () => {
            const taskData = {
                columnId: testColumn._id.toString(),
                title: 'Test Task',
                description: 'Test Description',
            };

            const response = await request(app)
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Task created successfully',
                data: {
                    title: taskData.title,
                    description: taskData.description,
                },
            });
            expect(response.body.data.columnId).toBeDefined();
            expect(response.body.data.projectId).toBeDefined();
            expect(response.body.data.columnId._id || response.body.data.columnId).toBe(testColumn._id.toString());
            expect(response.body.data.projectId._id || response.body.data.projectId.id || response.body.data.projectId).toBe(testProject._id.toString());

            // Verify task was created in database
            const task = await Task.findById(response.body.data._id);
            expect(task).toBeTruthy();
            expect(task.title).toBe(taskData.title);
            expect(task.description).toBe(taskData.description);
            expect(task.columnId.toString()).toBe(testColumn._id.toString());
            expect(task.projectId.toString()).toBe(testProject._id.toString());
        });

        it('should create a task with optional fields', async () => {
            const taskData = {
                columnId: testColumn._id.toString(),
                title: 'Test Task',
                description: 'Test Description',
                priority: 'high',
                dueDate: new Date('2024-12-31'),
            };

            const response = await request(app)
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(201);

            expect(response.body.data.priority).toBe('high');
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when columnId is missing', async () => {
            const response = await request(app)
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Task',
                    description: 'Test Description',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'columnId'),
            ).toBe(true);
        });

        it('should return 400 error when title is missing', async () => {
            const response = await request(app)
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn._id.toString(),
                    description: 'Test Description',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(
                response.body.errors.some((e) => e.field === 'title'),
            ).toBe(true);
        });

        it('should return 400 error when description is missing', async () => {
            const response = await request(app)
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn._id.toString(),
                    title: 'Test Task',
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

        it('should return 400 error when priority is invalid', async () => {
            const response = await request(app)
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn._id.toString(),
                    title: 'Test Task',
                    description: 'Test Description',
                    priority: 'invalid-priority',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when priority is invalid', async () => {
            const response = await request(app)
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn._id.toString(),
                    title: 'Test Task',
                    description: 'Test Description',
                    priority: 'invalid-priority',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when projectId format is invalid', async () => {
            const response = await request(app)
                .post('/api/tasks/projects/invalid-id/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn._id.toString(),
                    title: 'Test Task',
                    description: 'Test Description',
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
                .post(`/api/tasks/projects/${testProject._id}/tasks`)
                .send({
                    columnId: testColumn._id.toString(),
                    title: 'Test Task',
                    description: 'Test Description',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('GET /api/tasks/projects/:projectId/tasks', () => {
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
        await Task.deleteMany({});

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

        // Create test tasks
        await Task.create([
            {
                title: 'Task 1',
                description: 'Description 1',
                columnId: testColumn._id,
                projectId: testProject._id,
                orderIndex: 0,
            },
            {
                title: 'Task 2',
                description: 'Description 2',
                columnId: testColumn._id,
                projectId: testProject._id,
                orderIndex: 1,
            },
        ]);
    });

    describe('Successful fetch', () => {
        it('should fetch all tasks for project successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/tasks/projects/${testProject._id}/tasks`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Tasks fetched successfully',
            });
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);
        });

        it('should filter tasks by columnId query parameter', async () => {
            const response = await request(app)
                .get(`/api/tasks/projects/${testProject._id}/tasks?columnId=${testColumn._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });

        it('should filter tasks by priority query parameter', async () => {
            await Task.create({
                title: 'High Priority Task',
                description: 'Description',
                columnId: testColumn._id,
                projectId: testProject._id,
                priority: 'high',
                orderIndex: 2,
            });

            const response = await request(app)
                .get(`/api/tasks/projects/${testProject._id}/tasks?priority=high`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when projectId format is invalid', async () => {
            const response = await request(app)
                .get('/api/tasks/projects/invalid-id/tasks')
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
                .get(`/api/tasks/projects/${testProject._id}/tasks`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('GET /api/tasks/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;
    let testTask;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

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

        testTask = await Task.create({
            title: 'Test Task',
            description: 'Test Description',
            columnId: testColumn._id,
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful fetch', () => {
        it('should fetch task by ID successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Task fetched successfully',
                data: {
                    _id: testTask._id.toString(),
                    title: testTask.title,
                    description: testTask.description,
                },
            });
        });
    });

    describe('Task not found', () => {
        it('should return 404 error when task does not exist', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const response = await request(app)
                .get(`/api/tasks/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Task not found',
            });
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .get('/api/tasks/invalid-id')
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
                .get(`/api/tasks/${testTask._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PUT /api/tasks/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;
    let testTask;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

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

        testTask = await Task.create({
            title: 'Test Task',
            description: 'Test Description',
            columnId: testColumn._id,
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful update', () => {
        it('should update task successfully with 200 status', async () => {
            const updateData = {
                columnId: testColumn._id.toString(),
                title: 'Updated Task',
                description: 'Updated Description',
            };

            const response = await request(app)
                .put(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Task updated successfully',
                data: {
                    _id: testTask._id.toString(),
                    title: updateData.title,
                    description: updateData.description,
                },
            });

            // Verify task was updated in database
            const updatedTask = await Task.findById(testTask._id);
            expect(updatedTask.title).toBe(updateData.title);
            expect(updatedTask.description).toBe(updateData.description);
        });

        it('should update priority', async () => {
            const updateData = {
                columnId: testColumn._id.toString(),
                priority: 'high',
            };

            const response = await request(app)
                .put(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.data.priority).toBe('high');
        });

        it('should update assignees', async () => {
            const updateData = {
                columnId: testColumn._id.toString(),
                assignees: [testUser._id.toString()],
            };

            const response = await request(app)
                .put(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.data.assignees).toBeDefined();
            expect(Array.isArray(response.body.data.assignees)).toBe(true);
            expect(response.body.data.assignees.length).toBe(1);
            expect(response.body.data.assignees[0]._id || response.body.data.assignees[0]).toBe(testUser._id.toString());
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when no fields are provided', async () => {
            const response = await request(app)
                .put(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when priority is invalid', async () => {
            const response = await request(app)
                .put(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn._id.toString(),
                    priority: 'invalid-priority',
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when assignees format is invalid', async () => {
            const response = await request(app)
                .put(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn._id.toString(),
                    assignees: ['invalid-id'],
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
                .put(`/api/tasks/${testTask._id}`)
                .send({
                    title: 'Updated Task',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('DELETE /api/tasks/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;
    let testTask;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

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

        testTask = await Task.create({
            title: 'Test Task',
            description: 'Test Description',
            columnId: testColumn._id,
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful deletion', () => {
        it('should delete task successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/tasks/${testTask._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Task deleted successfully',
            });

            // Verify task was deleted from database
            const deletedTask = await Task.findById(testTask._id);
            expect(deletedTask).toBeNull();
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .delete('/api/tasks/invalid-id')
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
                .delete(`/api/tasks/${testTask._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PATCH /api/tasks/:id/move', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;
    let testColumn2;
    let testTask;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

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

        testColumn2 = await Column.create({
            name: 'Test Column 2',
            projectId: testProject._id,
            orderIndex: 1,
        });

        testTask = await Task.create({
            title: 'Test Task',
            description: 'Test Description',
            columnId: testColumn._id,
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful move', () => {
        it('should move task to different column successfully with 200 status', async () => {
            const response = await request(app)
                .patch(`/api/tasks/${testTask._id}/move`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: testColumn2._id.toString(),
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Task moved successfully',
                data: {
                    _id: testTask._id.toString(),
                },
            });
            expect(response.body.data.columnId).toBeDefined();
            expect(response.body.data.columnId._id || response.body.data.columnId).toBe(testColumn2._id.toString());

            // Verify task was moved in database
            const movedTask = await Task.findById(testTask._id);
            expect(movedTask.columnId.toString()).toBe(testColumn2._id.toString());
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when columnId is missing', async () => {
            const response = await request(app)
                .patch(`/api/tasks/${testTask._id}/move`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when columnId format is invalid', async () => {
            const response = await request(app)
                .patch(`/api/tasks/${testTask._id}/move`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    columnId: 'invalid-id',
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
                .patch(`/api/tasks/${testTask._id}/move`)
                .send({
                    columnId: testColumn2._id.toString(),
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PATCH /api/tasks/:id/reorder', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;
    let testTask;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

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

        testTask = await Task.create({
            title: 'Test Task',
            description: 'Test Description',
            columnId: testColumn._id,
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful reorder', () => {
        it('should reorder task successfully with 200 status', async () => {
            // Create another task so we can reorder
            const testTask2 = await Task.create({
                title: 'Test Task 2',
                description: 'Test Description 2',
                columnId: testColumn._id,
                projectId: testProject._id,
                orderIndex: 1,
            });

            const response = await request(app)
                .patch(`/api/tasks/${testTask._id}/reorder`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    orderIndex: 1,
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Task reordered successfully',
                data: {
                    _id: testTask._id.toString(),
                    orderIndex: 1,
                },
            });

            // Verify orderIndex was updated in database
            const updatedTask = await Task.findById(testTask._id);
            expect(updatedTask.orderIndex).toBe(1);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when orderIndex is missing', async () => {
            const response = await request(app)
                .patch(`/api/tasks/${testTask._id}/reorder`)
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
                .patch(`/api/tasks/${testTask._id}/reorder`)
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
    });

    describe('Authentication required', () => {
        it('should return 401 error when token is not provided', async () => {
            const response = await request(app)
                .patch(`/api/tasks/${testTask._id}/reorder`)
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

describe('POST /api/tasks/:id/assignees', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;
    let testTask;
    let assigneeUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        assigneeUser = await User.create({
            email: 'assignee@example.com',
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

        testTask = await Task.create({
            title: 'Test Task',
            description: 'Test Description',
            columnId: testColumn._id,
            projectId: testProject._id,
            orderIndex: 0,
        });
    });

    describe('Successful assignee addition', () => {
        it('should add assignee to task successfully with 200 status', async () => {
            const response = await request(app)
                .post(`/api/tasks/${testTask._id}/assignees`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    assigneeId: assigneeUser._id.toString(),
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Assignee added successfully',
            });

            // Verify assignee was added in database
            const updatedTask = await Task.findById(testTask._id);
            expect(updatedTask.assignees).toContainEqual(assigneeUser._id);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when assigneeId is missing', async () => {
            const response = await request(app)
                .post(`/api/tasks/${testTask._id}/assignees`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when assigneeId format is invalid', async () => {
            const response = await request(app)
                .post(`/api/tasks/${testTask._id}/assignees`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    assigneeId: 'invalid-id',
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
                .post(`/api/tasks/${testTask._id}/assignees`)
                .send({
                    assigneeId: assigneeUser._id.toString(),
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('DELETE /api/tasks/:id/assignees/:userId', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let testColumn;
    let testTask;
    let assigneeUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: hashedPassword,
        });

        assigneeUser = await User.create({
            email: 'assignee@example.com',
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

        testTask = await Task.create({
            title: 'Test Task',
            description: 'Test Description',
            columnId: testColumn._id,
            projectId: testProject._id,
            orderIndex: 0,
            assignees: [assigneeUser._id],
        });
    });

    describe('Successful assignee removal', () => {
        it('should remove assignee from task successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/tasks/${testTask._id}/assignees/${assigneeUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Assignee removed successfully',
            });

            // Verify assignee was removed from database
            const updatedTask = await Task.findById(testTask._id);
            expect(updatedTask.assignees).not.toContainEqual(assigneeUser._id);
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when task ID format is invalid', async () => {
            const response = await request(app)
                .delete(`/api/tasks/invalid-id/assignees/${assigneeUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when user ID format is invalid', async () => {
            const response = await request(app)
                .delete(`/api/tasks/${testTask._id}/assignees/invalid-id`)
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
                .delete(`/api/tasks/${testTask._id}/assignees/${assigneeUser._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

