import AppError from './AppError.js';

class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(400, message, true);
    }
}

export default BadRequestError;

