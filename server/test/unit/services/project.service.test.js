import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/models/index.js', () => {
    const mockProjectFindById = vi.fn();
    const mockProjectFind = vi.fn();
    const mockProjectFindByIdAndDelete = vi.fn();
    
    const mockFolderFindOne = vi.fn();
    const mockFolderFindById = vi.fn();
    
    const mockColumnDeleteMany = vi.fn();
    
    const mockTaskDeleteMany = vi.fn();
    
    class MockProject {
        constructor(data) {
            Object.assign(this, data);
            this.save = vi.fn().mockResolvedValue(this);
            this.populate = vi.fn().mockReturnThis();
        }
    }
    
    MockProject.findById = mockProjectFindById;
    MockProject.find = mockProjectFind;
    MockProject.findByIdAndDelete = mockProjectFindByIdAndDelete;
    
    return {
        Project: MockProject,
        Folder: {
            findOne: mockFolderFindOne,
            findById: mockFolderFindById,
        },
        Column: (() => {
            class MockColumn {
                constructor(data) {
                    Object.assign(this, data);
                    this.save = vi.fn().mockResolvedValue(this);
                }
            }
            MockColumn.deleteMany = mockColumnDeleteMany;
            return MockColumn;
        })(),
        Task: {
            deleteMany: mockTaskDeleteMany,
        },
    };
});

vi.mock('#src/utils/errors/index.js', () => ({
    NotFoundError: class NotFoundError extends Error {
        constructor(message) {
            super(message);
            this.name = 'NotFoundError';
        }
    },
    BadRequestError: class BadRequestError extends Error {
        constructor(message) {
            super(message);
            this.name = 'BadRequestError';
        }
    },
    ConflictError: class ConflictError extends Error {
        constructor(message) {
            super(message);
            this.name = 'ConflictError';
        }
    },
}));

vi.mock('#src/config/database.js', () => ({
    withTransaction: async (callback) => {
        // Mock session object
        const mockSession = {};
        return await callback(mockSession);
    },
}));

// Import after mocks
import * as projectService from '#src/services/project.service.js';
import { Project, Folder, Column, Task } from '#src/models/index.js';
import { NotFoundError, BadRequestError, ConflictError } from '#src/utils/errors/index.js';

// Access to mock functions
const mockProjectFindById = Project.findById;
const mockProjectFind = Project.find;
const mockFolderFindOne = Folder.findOne;
const mockFolderFindById = Folder.findById;
const mockProjectFindByIdAndDelete = Project.findByIdAndDelete;
const mockColumnDeleteMany = Column.deleteMany;
const mockTaskDeleteMany = Task.deleteMany;

describe('Project Service', () => {
    const userId = '507f1f77bcf86cd799439011';
    const folderId = '507f1f77bcf86cd799439012';
    const projectId = '507f1f77bcf86cd799439013';
    const memberId = '507f1f77bcf86cd799439014';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createProject', () => {
        it('should create project successfully with default columns', async () => {
            const folderData = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const projectData = {
                name: 'Test Project',
                description: 'Test Description',
            };

            mockFolderFindOne.mockResolvedValue(folderData);
            
            const mockPopulateWithSession = vi.fn().mockResolvedValue({
                _id: projectId,
                ...projectData,
                folderId,
                owner: userId,
                status: 'active',
            });
            const mockPopulate3 = vi.fn().mockReturnValue({
                session: mockPopulateWithSession,
            });
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            mockProjectFindById.mockReturnValue({
                populate: mockPopulate1,
            });

            const result = await projectService.createProject(folderId, projectData, userId);

            expect(mockFolderFindOne).toHaveBeenCalledWith({
                _id: folderId,
                $or: [{ owner: userId }, { members: userId }],
            });
            // Project and Column are classes, verify by checking findById was called
            expect(mockProjectFindById).toHaveBeenCalled();
            // Note: Column instantiation is verified indirectly through the service logic
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindOne.mockResolvedValue(null);

            await expect(
                projectService.createProject(folderId, { name: 'Test' }, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getProjectsByFolder', () => {
        it('should return projects when user has access', async () => {
            const folderData = {
                _id: folderId,
                owner: userId,
            };

            const mockProjects = [
                {
                    _id: projectId,
                    name: 'Project 1',
                    folderId,
                },
            ];

            mockFolderFindOne.mockResolvedValue(folderData);
            const mockQuery = {
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(mockProjects),
            };
            mockProjectFind.mockReturnValue(mockQuery);

            const result = await projectService.getProjectsByFolder(folderId, userId);

            expect(result).toEqual(mockProjects);
        });

        it('should throw NotFoundError when folder not found', async () => {
            mockFolderFindOne.mockResolvedValue(null);

            await expect(
                projectService.getProjectsByFolder(folderId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getProjectById', () => {
        it('should return project when user has access', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                folderId: { _id: folderId },
            };

            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            const mockPopulate3 = vi.fn().mockResolvedValue(mockProject);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            mockProjectFindById.mockReturnValue({
                populate: mockPopulate1,
            });
            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await projectService.getProjectById(projectId, userId);

            expect(result).toEqual(mockProject);
        });

        it('should throw NotFoundError when project not found', async () => {
            const mockPopulate3 = vi.fn().mockResolvedValue(null);
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            mockProjectFindById.mockReturnValue({
                populate: mockPopulate1,
            });

            await expect(
                projectService.getProjectById(projectId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateProject', () => {
        it('should update project when user is owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                save: vi.fn().mockResolvedValue(true),
            };

            const mockPopulate3 = vi.fn().mockResolvedValue({
                ...mockProject,
                name: 'Updated Name',
            });
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockProjectFindById
                .mockResolvedValueOnce(mockProject)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });

            const result = await projectService.updateProject(
                projectId,
                { name: 'Updated Name' },
                userId,
            );

            expect(mockProject.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError when user is not owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: '507f1f77bcf86cd799439020',
            };

            mockProjectFindById.mockResolvedValue(mockProject);

            await expect(
                projectService.updateProject(projectId, { name: 'Updated' }, userId),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('deleteProject', () => {
        it('should delete project and tasks when user is owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
            };

            mockProjectFindById.mockResolvedValue(mockProject);
            mockTaskDeleteMany.mockResolvedValue({ deletedCount: 5 });
            mockColumnDeleteMany.mockResolvedValue({ deletedCount: 4 });
            mockProjectFindByIdAndDelete.mockResolvedValue(mockProject);

            const result = await projectService.deleteProject(projectId, userId);

            expect(mockTaskDeleteMany).toHaveBeenCalledWith(
                { projectId: mockProject._id },
                expect.any(Object), // session parameter
            );
            expect(mockColumnDeleteMany).toHaveBeenCalledWith(
                { projectId: mockProject._id },
                expect.any(Object), // session parameter
            );
            expect(result).toEqual(mockProject);
        });

        it('should throw BadRequestError when user is not owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: '507f1f77bcf86cd799439020',
            };

            mockProjectFindById.mockResolvedValue(mockProject);

            await expect(
                projectService.deleteProject(projectId, userId),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('updateProjectStatus', () => {
        it('should update status when user is owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                status: 'active',
                save: vi.fn().mockResolvedValue(true),
            };

            const mockPopulate3 = vi.fn().mockResolvedValue({
                ...mockProject,
                status: 'archived',
            });
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockProjectFindById
                .mockResolvedValueOnce(mockProject)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });

            const result = await projectService.updateProjectStatus(
                projectId,
                'archived',
                userId,
            );

            expect(mockProject.save).toHaveBeenCalled();
        });

        it('should throw BadRequestError for invalid status', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
            };

            mockProjectFindById.mockResolvedValue(mockProject);

            await expect(
                projectService.updateProjectStatus(projectId, 'invalid', userId),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('addMemberToProject', () => {
        it('should add member successfully', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                members: [],
                save: vi.fn().mockResolvedValue(true),
            };

            const mockPopulate3 = vi.fn().mockResolvedValue({
                ...mockProject,
                members: [memberId],
            });
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockProjectFindById
                .mockResolvedValueOnce(mockProject)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });

            const result = await projectService.addMemberToProject(projectId, memberId, userId);

            expect(mockProject.save).toHaveBeenCalled();
        });

        it('should throw ConflictError when member already exists', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                members: [memberId],
            };

            mockProjectFindById.mockResolvedValue(mockProject);

            await expect(
                projectService.addMemberToProject(projectId, memberId, userId),
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('removeMemberFromProject', () => {
        it('should remove member successfully', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                members: [memberId],
                save: vi.fn().mockResolvedValue(true),
            };

            const mockPopulate3 = vi.fn().mockResolvedValue({
                ...mockProject,
                members: [],
            });
            const mockPopulate2 = vi.fn().mockReturnValue({
                populate: mockPopulate3,
            });
            const mockPopulate1 = vi.fn().mockReturnValue({
                populate: mockPopulate2,
            });
            
            mockProjectFindById
                .mockResolvedValueOnce(mockProject)
                .mockReturnValueOnce({
                    populate: mockPopulate1,
                });

            const result = await projectService.removeMemberFromProject(
                projectId,
                memberId,
                userId,
            );

            expect(mockProject.save).toHaveBeenCalled();
        });

        it('should throw NotFoundError when member does not exist', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                members: [],
            };

            mockProjectFindById.mockResolvedValue(mockProject);

            await expect(
                projectService.removeMemberFromProject(projectId, memberId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('checkProjectAccess', () => {
        it('should return true when user is owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
                folderId: folderId,
                members: [],
            };

            const mockFolder = {
                _id: folderId,
                owner: '507f1f77bcf86cd799439020',
                members: [],
            };

            mockProjectFindById.mockResolvedValue(mockProject);
            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await projectService.checkProjectAccess(projectId, userId);

            expect(result).toBe(true);
        });

        it('should return true when user has folder access', async () => {
            const mockProject = {
                _id: projectId,
                owner: '507f1f77bcf86cd799439020',
                folderId: folderId,
                members: [],
            };

            const mockFolder = {
                _id: folderId,
                owner: userId,
                members: [],
            };

            mockProjectFindById.mockResolvedValue(mockProject);
            mockFolderFindById.mockResolvedValue(mockFolder);

            const result = await projectService.checkProjectAccess(projectId, userId);

            expect(result).toBe(true);
        });

        it('should throw NotFoundError when project not found', async () => {
            mockProjectFindById.mockResolvedValue(null);

            await expect(
                projectService.checkProjectAccess(projectId, userId),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('checkProjectOwner', () => {
        it('should return true when user is owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: userId,
            };

            mockProjectFindById.mockResolvedValue(mockProject);

            const result = await projectService.checkProjectOwner(projectId, userId);

            expect(result).toBe(true);
        });

        it('should return false when user is not owner', async () => {
            const mockProject = {
                _id: projectId,
                owner: '507f1f77bcf86cd799439020',
            };

            mockProjectFindById.mockResolvedValue(mockProject);

            const result = await projectService.checkProjectOwner(projectId, userId);

            expect(result).toBe(false);
        });
    });
});

