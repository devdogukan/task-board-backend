import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/services/project.service.js', () => ({
    checkProjectAccess: vi.fn(),
    checkProjectOwner: vi.fn(),
}));

vi.mock('#src/utils/response.util.js', () => ({
    default: {
        error: vi.fn().mockReturnValue({
            send: vi.fn(),
        }),
    },
}));

// Import after mocks
import { checkProjectAccess, checkProjectOwner } from '#src/middlewares/project.access.middleware.js';
import * as projectService from '#src/services/project.service.js';
import { BadRequestError } from '#src/utils/errors/index.js';
import ApiResponse from '#src/utils/response.util.js';

describe('Project Access Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            user: {
                _id: '507f1f77bcf86cd799439011',
            },
        };

        res = {};

        next = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
        projectService.checkProjectAccess.mockClear();
        projectService.checkProjectOwner.mockClear();
        ApiResponse.error.mockClear();
    });

    describe('checkProjectAccess', () => {
        it('should call next() when user has access as owner', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            projectService.checkProjectAccess.mockResolvedValue(true);

            await checkProjectAccess(req, res, next);

            expect(projectService.checkProjectAccess).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439012',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
            expect(ApiResponse.error).not.toHaveBeenCalled();
        });

        it('should call next() when user has access as member', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            projectService.checkProjectAccess.mockResolvedValue(true);

            await checkProjectAccess(req, res, next);

            expect(projectService.checkProjectAccess).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
        });

        it('should use projectId from params when id is not present', async () => {
            req.params.projectId = '507f1f77bcf86cd799439013';
            projectService.checkProjectAccess.mockResolvedValue(true);

            await checkProjectAccess(req, res, next);

            expect(projectService.checkProjectAccess).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439013',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
        });

        it('should return 403 error when user does not have access', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            projectService.checkProjectAccess.mockResolvedValue(false);

            const mockSend = vi.fn();
            ApiResponse.error.mockReturnValue({ send: mockSend });

            await checkProjectAccess(req, res, next);

            expect(projectService.checkProjectAccess).toHaveBeenCalled();
            expect(ApiResponse.error).toHaveBeenCalledWith(
                403,
                'You do not have access to this project',
            );
            expect(mockSend).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with BadRequestError when projectId is missing', async () => {
            req.params = {};

            await checkProjectAccess(req, res, next);

            expect(projectService.checkProjectAccess).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
            expect(next.mock.calls[0][0].message).toBe('Project ID is required');
        });

        it('should call next with error when service throws error', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            const serviceError = new Error('Service error');
            projectService.checkProjectAccess.mockRejectedValue(serviceError);

            await checkProjectAccess(req, res, next);

            expect(projectService.checkProjectAccess).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('checkProjectOwner', () => {
        it('should call next() when user is project owner', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            projectService.checkProjectOwner.mockResolvedValue(true);

            await checkProjectOwner(req, res, next);

            expect(projectService.checkProjectOwner).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439012',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
            expect(ApiResponse.error).not.toHaveBeenCalled();
        });

        it('should return 403 error when user is not project owner', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            projectService.checkProjectOwner.mockResolvedValue(false);

            const mockSend = vi.fn();
            ApiResponse.error.mockReturnValue({ send: mockSend });

            await checkProjectOwner(req, res, next);

            expect(projectService.checkProjectOwner).toHaveBeenCalled();
            expect(ApiResponse.error).toHaveBeenCalledWith(
                403,
                'Only project owner can perform this action',
            );
            expect(mockSend).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should use projectId from params when id is not present', async () => {
            req.params.projectId = '507f1f77bcf86cd799439013';
            projectService.checkProjectOwner.mockResolvedValue(true);

            await checkProjectOwner(req, res, next);

            expect(projectService.checkProjectOwner).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439013',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with BadRequestError when projectId is missing', async () => {
            req.params = {};

            await checkProjectOwner(req, res, next);

            expect(projectService.checkProjectOwner).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
            expect(next.mock.calls[0][0].message).toBe('Project ID is required');
        });

        it('should call next with error when service throws error', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            const serviceError = new Error('Service error');
            projectService.checkProjectOwner.mockRejectedValue(serviceError);

            await checkProjectOwner(req, res, next);

            expect(projectService.checkProjectOwner).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });
});

