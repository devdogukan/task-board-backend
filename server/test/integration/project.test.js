import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '#src/app.js';
import { User, Folder, Project } from '#src/models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '#src/config/env.js';

// Helper function to generate auth token
const generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('POST /api/projects/folders/:folderId/projects', () => {
    let authToken;
    let testUser;
    let testFolder;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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

    describe('Successful creation', () => {
        it('should create a project successfully with 201 status', async () => {
            const projectData = {
                name: 'Test Project',
                description: 'Test Description',
            };

            const response = await request(app)
                .post(`/api/projects/folders/${testFolder._id}/projects`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(projectData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Project created successfully',
                data: {
                    name: projectData.name,
                    description: projectData.description,
                    status: 'active',
                },
            });
            expect(response.body.data.folderId).toBeDefined();
            expect(response.body.data.owner).toBeDefined();
            expect(response.body.data.folderId._id || response.body.data.folderId).toBe(testFolder._id.toString());
            expect(response.body.data.owner._id || response.body.data.owner).toBe(testUser._id.toString());

            // Verify project was created in database
            const project = await Project.findById(response.body.data._id);
            expect(project).toBeTruthy();
            expect(project.name).toBe(projectData.name);
            expect(project.description).toBe(projectData.description);
            expect(project.folderId.toString()).toBe(testFolder._id.toString());
            expect(project.owner.toString()).toBe(testUser._id.toString());
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when name is missing', async () => {
            const response = await request(app)
                .post(`/api/projects/folders/${testFolder._id}/projects`)
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
                .post(`/api/projects/folders/${testFolder._id}/projects`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Project',
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

        it('should return 400 error when folderId format is invalid', async () => {
            const response = await request(app)
                .post('/api/projects/folders/invalid-id/projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Project',
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
                .post(`/api/projects/folders/${testFolder._id}/projects`)
                .send({
                    name: 'Test Project',
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

describe('GET /api/projects/folders/:folderId/projects', () => {
    let authToken;
    let testUser;
    let testFolder;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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

        // Create test projects
        await Project.create([
            {
                name: 'Project 1',
                description: 'Description 1',
                folderId: testFolder._id,
                owner: testUser._id,
            },
            {
                name: 'Project 2',
                description: 'Description 2',
                folderId: testFolder._id,
                owner: testUser._id,
            },
        ]);
    });

    describe('Successful fetch', () => {
        it('should fetch all projects for folder successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/projects/folders/${testFolder._id}/projects`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Projects fetched successfully',
            });
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when folderId format is invalid', async () => {
            const response = await request(app)
                .get('/api/projects/folders/invalid-id/projects')
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
                .get(`/api/projects/folders/${testFolder._id}/projects`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('GET /api/projects/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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

    describe('Successful fetch', () => {
        it('should fetch project by ID successfully with 200 status', async () => {
            const response = await request(app)
                .get(`/api/projects/${testProject._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Project fetched successfully',
                data: {
                    _id: testProject._id.toString(),
                    name: testProject.name,
                    description: testProject.description,
                },
            });
        });
    });

    describe('Project not found', () => {
        it('should return 404 error when project does not exist', async () => {
            const nonExistentId = '507f1f77bcf86cd799439999';
            const response = await request(app)
                .get(`/api/projects/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Project not found',
            });
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .get('/api/projects/invalid-id')
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
                .get(`/api/projects/${testProject._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PUT /api/projects/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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

    describe('Successful update', () => {
        it('should update project successfully with 200 status', async () => {
            const updateData = {
                name: 'Updated Project',
                description: 'Updated Description',
            };

            const response = await request(app)
                .put(`/api/projects/${testProject._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Project updated successfully',
                data: {
                    _id: testProject._id.toString(),
                    name: updateData.name,
                    description: updateData.description,
                },
            });

            // Verify project was updated in database
            const updatedProject = await Project.findById(testProject._id);
            expect(updatedProject.name).toBe(updateData.name);
            expect(updatedProject.description).toBe(updateData.description);
        });

        it('should update only name when only name is provided', async () => {
            const updateData = {
                name: 'Updated Name Only',
            };

            const response = await request(app)
                .put(`/api/projects/${testProject._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.description).toBe(testProject.description);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when no fields are provided', async () => {
            const response = await request(app)
                .put(`/api/projects/${testProject._id}`)
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
                .put(`/api/projects/${testProject._id}`)
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
                .put(`/api/projects/${testProject._id}`)
                .send({
                    name: 'Updated Project',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('DELETE /api/projects/:id', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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

    describe('Successful deletion', () => {
        it('should delete project successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/projects/${testProject._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Project deleted successfully',
            });

            // Verify project was deleted from database
            const deletedProject = await Project.findById(testProject._id);
            expect(deletedProject).toBeNull();
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when ID format is invalid', async () => {
            const response = await request(app)
                .delete('/api/projects/invalid-id')
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
                .delete(`/api/projects/${testProject._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('PATCH /api/projects/:id/status', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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
            status: 'active',
        });
    });

    describe('Successful status update', () => {
        it('should update project status to archived successfully', async () => {
            const response = await request(app)
                .patch(`/api/projects/${testProject._id}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'archived',
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Project status updated successfully',
                data: {
                    _id: testProject._id.toString(),
                    status: 'archived',
                },
            });

            // Verify status was updated in database
            const updatedProject = await Project.findById(testProject._id);
            expect(updatedProject.status).toBe('archived');
        });

        it('should update project status to completed successfully', async () => {
            const response = await request(app)
                .patch(`/api/projects/${testProject._id}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'completed',
                })
                .expect(200);

            expect(response.body.data.status).toBe('completed');
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when status is missing', async () => {
            const response = await request(app)
                .patch(`/api/projects/${testProject._id}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when status is invalid', async () => {
            const response = await request(app)
                .patch(`/api/projects/${testProject._id}/status`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    status: 'invalid-status',
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
                .patch(`/api/projects/${testProject._id}/status`)
                .send({
                    status: 'archived',
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

describe('POST /api/projects/:id/members', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let memberUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
        });
    });

    describe('Successful member addition', () => {
        it('should add member to project successfully with 200 status', async () => {
            const response = await request(app)
                .post(`/api/projects/${testProject._id}/members`)
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
            const updatedProject = await Project.findById(testProject._id);
            expect(updatedProject.members).toContainEqual(memberUser._id);
        });
    });

    describe('Validation errors', () => {
        it('should return 400 error when memberId is missing', async () => {
            const response = await request(app)
                .post(`/api/projects/${testProject._id}/members`)
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
                .post(`/api/projects/${testProject._id}/members`)
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
                .post(`/api/projects/${testProject._id}/members`)
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

describe('DELETE /api/projects/:id/members/:userId', () => {
    let authToken;
    let testUser;
    let testFolder;
    let testProject;
    let memberUser;

    beforeEach(async () => {
        await User.deleteMany({});
        await Folder.deleteMany({});
        await Project.deleteMany({});

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

        testProject = await Project.create({
            name: 'Test Project',
            description: 'Test Description',
            folderId: testFolder._id,
            owner: testUser._id,
            members: [memberUser._id],
        });
    });

    describe('Successful member removal', () => {
        it('should remove member from project successfully with 200 status', async () => {
            const response = await request(app)
                .delete(`/api/projects/${testProject._id}/members/${memberUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Member removed successfully',
            });

            // Verify member was removed from database
            const updatedProject = await Project.findById(testProject._id);
            expect(updatedProject.members).not.toContainEqual(memberUser._id);
        });
    });

    describe('Invalid ID format', () => {
        it('should return 400 error when project ID format is invalid', async () => {
            const response = await request(app)
                .delete(`/api/projects/invalid-id/members/${memberUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error',
            });
        });

        it('should return 400 error when user ID format is invalid', async () => {
            const response = await request(app)
                .delete(`/api/projects/${testProject._id}/members/invalid-id`)
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
                .delete(`/api/projects/${testProject._id}/members/${memberUser._id}`)
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Bearer token is not provided',
            });
        });
    });
});

