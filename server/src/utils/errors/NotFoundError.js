import AppError from './AppError.js';

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message, true);
    }
}

export default NotFoundError;

