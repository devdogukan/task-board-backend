import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules
vi.mock('#src/services/folder.service.js', () => ({
    checkFolderAccess: vi.fn(),
    checkFolderOwner: vi.fn(),
}));

vi.mock('#src/utils/response.util.js', () => ({
    default: {
        error: vi.fn().mockReturnValue({
            send: vi.fn(),
        }),
    },
}));

// Import after mocks
import { checkFolderAccess, checkFolderOwner } from '#src/middlewares/folder.access.middleware.js';
import * as folderService from '#src/services/folder.service.js';
import { BadRequestError } from '#src/utils/errors/index.js';
import ApiResponse from '#src/utils/response.util.js';

describe('Folder Access Middleware', () => {
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
        folderService.checkFolderAccess.mockClear();
        folderService.checkFolderOwner.mockClear();
        ApiResponse.error.mockClear();
    });

    describe('checkFolderAccess', () => {
        it('should call next() when user has access as owner', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            folderService.checkFolderAccess.mockResolvedValue(true);

            await checkFolderAccess(req, res, next);

            expect(folderService.checkFolderAccess).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439012',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
            expect(ApiResponse.error).not.toHaveBeenCalled();
        });

        it('should call next() when user has access as member', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            folderService.checkFolderAccess.mockResolvedValue(true);

            await checkFolderAccess(req, res, next);

            expect(folderService.checkFolderAccess).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
        });

        it('should use folderId from params when id is not present', async () => {
            req.params.folderId = '507f1f77bcf86cd799439013';
            folderService.checkFolderAccess.mockResolvedValue(true);

            await checkFolderAccess(req, res, next);

            expect(folderService.checkFolderAccess).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439013',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
        });

        it('should return 403 error when user does not have access', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            folderService.checkFolderAccess.mockResolvedValue(false);

            const mockSend = vi.fn();
            ApiResponse.error.mockReturnValue({ send: mockSend });

            await checkFolderAccess(req, res, next);

            expect(folderService.checkFolderAccess).toHaveBeenCalled();
            expect(ApiResponse.error).toHaveBeenCalledWith(
                403,
                'You do not have access to this folder',
            );
            expect(mockSend).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with BadRequestError when folderId is missing', async () => {
            req.params = {};

            await checkFolderAccess(req, res, next);

            expect(folderService.checkFolderAccess).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
            expect(next.mock.calls[0][0].message).toBe('Folder ID is required');
        });

        it('should call next with error when service throws error', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            const serviceError = new Error('Service error');
            folderService.checkFolderAccess.mockRejectedValue(serviceError);

            await checkFolderAccess(req, res, next);

            expect(folderService.checkFolderAccess).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });

    describe('checkFolderOwner', () => {
        it('should call next() when user is folder owner', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            folderService.checkFolderOwner.mockResolvedValue(true);

            await checkFolderOwner(req, res, next);

            expect(folderService.checkFolderOwner).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439012',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
            expect(ApiResponse.error).not.toHaveBeenCalled();
        });

        it('should return 403 error when user is not folder owner', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            folderService.checkFolderOwner.mockResolvedValue(false);

            const mockSend = vi.fn();
            ApiResponse.error.mockReturnValue({ send: mockSend });

            await checkFolderOwner(req, res, next);

            expect(folderService.checkFolderOwner).toHaveBeenCalled();
            expect(ApiResponse.error).toHaveBeenCalledWith(
                403,
                'Only folder owner can perform this action',
            );
            expect(mockSend).toHaveBeenCalledWith(res);
            expect(next).not.toHaveBeenCalled();
        });

        it('should use folderId from params when id is not present', async () => {
            req.params.folderId = '507f1f77bcf86cd799439013';
            folderService.checkFolderOwner.mockResolvedValue(true);

            await checkFolderOwner(req, res, next);

            expect(folderService.checkFolderOwner).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439013',
                '507f1f77bcf86cd799439011',
            );
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with BadRequestError when folderId is missing', async () => {
            req.params = {};

            await checkFolderOwner(req, res, next);

            expect(folderService.checkFolderOwner).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
            expect(next.mock.calls[0][0].message).toBe('Folder ID is required');
        });

        it('should call next with error when service throws error', async () => {
            req.params.id = '507f1f77bcf86cd799439012';
            const serviceError = new Error('Service error');
            folderService.checkFolderOwner.mockRejectedValue(serviceError);

            await checkFolderOwner(req, res, next);

            expect(folderService.checkFolderOwner).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(serviceError);
        });
    });
});

