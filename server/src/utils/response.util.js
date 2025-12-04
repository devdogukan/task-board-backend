class ApiResponse {
    constructor(statusCode, message, data = null, errors = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.success = statusCode >= 200 && statusCode < 300;
    }

    static success(statusCode = 200, message = 'Success', data = {}) {
        return new ApiResponse(statusCode, message, data, null);
    }

    static error(
        statusCode = 500,
        message = 'Internal Server Error',
        errors = null,
    ) {
        return new ApiResponse(statusCode, message, null, errors);
    }

    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            ...(this.data && { data: this.data }),
            ...(this.errors && { errors: this.errors }),
        });
    }
}

export default ApiResponse;
