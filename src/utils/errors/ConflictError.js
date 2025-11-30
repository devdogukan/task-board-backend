import AppError from './AppError.js';

class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(409, message, true);
    }
}

export default ConflictError;

