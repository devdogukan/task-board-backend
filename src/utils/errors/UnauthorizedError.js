import AppError from './AppError.js';

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message, true);
    }
}

export default UnauthorizedError;

